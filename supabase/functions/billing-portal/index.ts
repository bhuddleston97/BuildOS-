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

  const { data: profile } = await admin
    .from("users")
    .select("organization_id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.organization_id) return json({ error: "No organization found" }, 404);
  if (!["owner", "admin"].includes(profile?.role ?? "")) return json({ error: "Owner or admin access required" }, 403);

  const { data: billing } = await admin
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("organization_id", profile.organization_id)
    .maybeSingle();

  if (!billing?.stripe_customer_id) return json({ error: "No billing account found" }, 404);

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const appUrl = Deno.env.get("APP_URL");
  if (!stripeKey || !appUrl) return json({ error: "Billing portal not configured" }, 503);

  const portalResponse = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      customer: billing.stripe_customer_id,
      return_url: `${appUrl}/app/settings`,
    }),
  });

  const portal = await portalResponse.json();
  if (!portalResponse.ok) {
    console.error("Stripe portal error:", portal);
    return json({ error: "Unable to open billing portal" }, 502);
  }

  return json({ url: portal.url });
});
