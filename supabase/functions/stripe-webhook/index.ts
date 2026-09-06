import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
  return [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}

Deno.serve(async request => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const signature = request.headers.get("stripe-signature") ?? "";
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secret) return new Response("Webhook not configured", { status: 503 });

  const rawBody = await request.text();
  const timestamp = signature.match(/(?:^|,)t=(\d+)/)?.[1];
  const signatureHash = signature.match(/(?:^|,)v1=([a-f0-9]+)/)?.[1];
  if (!timestamp || !signatureHash || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return new Response("Invalid signature", { status: 400 });
  const expected = await hmac(secret, `${timestamp}.${rawBody}`);
  if (!timingSafeEqual(expected, signatureHash)) return new Response("Invalid signature", { status: 400 });

  const event = JSON.parse(rawBody);
  const object = event.data?.object ?? {};
  const organizationId = object.metadata?.organization_id;
  if (!organizationId) return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { autoRefreshToken: false, persistSession: false } });
  if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) {
    await admin.from("billing_subscriptions").upsert({
      organization_id: organizationId,
      stripe_subscription_id: object.id,
      stripe_customer_id: object.customer,
      stripe_price_id: object.items?.data?.[0]?.price?.id ?? "unknown",
      status: object.status ?? "canceled",
      current_period_end: object.current_period_end ? new Date(object.current_period_end * 1000).toISOString() : null,
      cancel_at_period_end: Boolean(object.cancel_at_period_end),
      updated_at: new Date().toISOString(),
    });
    await admin.from("organizations").update({ subscription_status: object.status ?? "canceled", subscription_plan: object.items?.data?.[0]?.price?.lookup_key ?? "stripe" }).eq("id", organizationId);
  }

  return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
});
