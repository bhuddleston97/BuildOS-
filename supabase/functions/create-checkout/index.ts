import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_ORIGIN") ?? "null",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Authentication required" }, 401);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: { user }, error: authError } = await admin.auth.getUser(token);
  if (authError || !user) return json({ error: "Invalid session" }, 401);

  const { data: profile } = await admin.from("users").select("organization_id, role, is_active").eq("id", user.id).maybeSingle();
  if (!profile?.organization_id || profile.is_active === false || !["owner", "admin"].includes(profile.role)) return json({ error: "Owner or admin access is required" }, 403);

  const body = await request.json().catch(() => null);
  const plan = body?.plan === "professional" ? "professional" : body?.plan === "starter" ? "starter" : null;
  const interval = body?.interval === "year" ? "year" : "month";
  const priceId = plan && Deno.env.get(`STRIPE_${plan.toUpperCase()}_${interval.toUpperCase()}_PRICE_ID`);
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const appUrl = Deno.env.get("APP_URL");
  if (!priceId || !stripeKey || !appUrl) return json({ error: "Stripe checkout is not configured" }, 503);

  const { data: existing } = await admin.from("billing_customers").select("stripe_customer_id").eq("organization_id", profile.organization_id).maybeSingle();
  let customerId = existing?.stripe_customer_id;
  if (!customerId) {
    const customerResponse = await fetch("https://api.stripe.com/v1/customers", {
      method: "POST",
      headers: { Authorization: `Bearer ${stripeKey}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ email: user.email ?? "", "metadata[organization_id]": profile.organization_id }),
    });
    const customer = await customerResponse.json();
    if (!customerResponse.ok) return json({ error: "Unable to create Stripe customer" }, 502);
    customerId = customer.id;
    await admin.from("billing_customers").upsert({ organization_id: profile.organization_id, stripe_customer_id: customerId });
  }

  const checkoutResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${stripeKey}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      mode: "subscription",
      customer: customerId,
      success_url: `${appUrl}/app/settings?billing=success`,
      cancel_url: `${appUrl}/pricing?billing=cancelled`,
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      "subscription_data[metadata][organization_id]": profile.organization_id,
    }),
  });
  const checkout = await checkoutResponse.json();
  if (!checkoutResponse.ok) return json({ error: "Unable to create checkout session" }, 502);
  return json({ url: checkout.url });
});
