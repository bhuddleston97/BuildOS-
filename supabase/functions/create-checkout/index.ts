import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Authentication required" }, 401);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data: { user }, error: authError } = await admin.auth.getUser(token);
  if (authError || !user) return json({ error: "Invalid session" }, 401);

  // Load profile — may not have an org yet for brand-new signups
  const { data: profile } = await admin
    .from("users")
    .select("organization_id, role, is_active, full_name")
    .eq("id", user.id)
    .maybeSingle();

  // Block deactivated accounts
  if (profile?.is_active === false) return json({ error: "Account is inactive" }, 403);

  // Resolve or create organization for this user
  let organizationId: string = profile?.organization_id;
  if (!organizationId) {
    // First-time user — create an org and assign them as owner
    const orgName = profile?.full_name
      ? `${profile.full_name}'s Organization`
      : user.email?.split("@")[1] ?? "My Organization";

    const { data: newOrg, error: orgError } = await admin
      .from("organizations")
      .insert({ name: orgName, subscription_status: "trialing" })
      .select("id")
      .single();

    if (orgError || !newOrg) {
      console.error("Failed to create organization:", orgError);
      return json({ error: "Failed to set up your account" }, 500);
    }

    organizationId = newOrg.id;

    await admin
      .from("users")
      .update({ organization_id: organizationId, role: "owner" })
      .eq("id", user.id);
  } else if (!["owner", "admin"].includes(profile?.role ?? "")) {
    // Existing user in an org but not an owner/admin
    return json({ error: "Owner or admin access is required" }, 403);
  }

  // Parse and validate request body
  const body = await request.json().catch(() => null);
  const plan = body?.plan === "professional" ? "professional"
    : body?.plan === "starter" ? "starter"
    : null;
  if (!plan) return json({ error: "Invalid plan" }, 400);
  const interval = body?.interval === "year" ? "year" : "month";

  const priceId = Deno.env.get(`STRIPE_${plan.toUpperCase()}_${interval.toUpperCase()}_PRICE_ID`);
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const appUrl = Deno.env.get("APP_URL");
  if (!priceId || !stripeKey || !appUrl) {
    return json({ error: "Stripe checkout is not configured" }, 503);
  }

  // Get or create Stripe customer for this org
  const { data: existing } = await admin
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("organization_id", organizationId)
    .maybeSingle();

  let customerId = existing?.stripe_customer_id;
  if (!customerId) {
    const customerResponse = await fetch("https://api.stripe.com/v1/customers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        email: user.email ?? "",
        "metadata[organization_id]": organizationId,
        "metadata[user_id]": user.id,
      }),
    });
    const customer = await customerResponse.json();
    if (!customerResponse.ok) {
      console.error("Stripe customer error:", customer);
      return json({ error: "Unable to create Stripe customer" }, 502);
    }
    customerId = customer.id;
    await admin
      .from("billing_customers")
      .upsert({ organization_id: organizationId, stripe_customer_id: customerId });
  }

  // Create Stripe Checkout session with 14-day trial
  const checkoutResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      mode: "subscription",
      customer: customerId,
      success_url: `${appUrl}/app?checkout=success`,
      cancel_url: `${appUrl}/pricing`,
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      "subscription_data[trial_period_days]": "14",
      "subscription_data[metadata][organization_id]": organizationId,
      "subscription_data[metadata][user_id]": user.id,
    }),
  });
  const checkout = await checkoutResponse.json();
  if (!checkoutResponse.ok) {
    console.error("Stripe checkout error:", checkout);
    return json({ error: "Unable to create checkout session" }, 502);
  }

  return json({ url: checkout.url });
});
