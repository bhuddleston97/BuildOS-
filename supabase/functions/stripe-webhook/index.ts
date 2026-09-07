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

const ok = () => new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });

Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const signature = request.headers.get("stripe-signature") ?? "";
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secret) return new Response("Webhook not configured", { status: 503 });

  const rawBody = await request.text();
  const timestamp = signature.match(/(?:^|,)t=(\d+)/)?.[1];
  const signatureHash = signature.match(/(?:^|,)v1=([a-f0-9]+)/)?.[1];
  if (!timestamp || !signatureHash || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    return new Response("Invalid signature", { status: 400 });
  }
  const expected = await hmac(secret, `${timestamp}.${rawBody}`);
  if (!timingSafeEqual(expected, signatureHash)) return new Response("Invalid signature", { status: 400 });

  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const object = event.data?.object ?? {};
  const organizationId = (object.metadata as Record<string, string>)?.organization_id;

  if (!organizationId) {
    // No org metadata — log and acknowledge so Stripe doesn't retry
    console.warn("stripe-webhook: event has no organization_id in metadata", event.type, (object as { id?: string }).id);
    return ok();
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) {
    const sub = object as {
      id: string;
      customer: string;
      status: string;
      cancel_at_period_end: boolean;
      current_period_end?: number;
      items?: { data?: Array<{ price?: { id?: string; lookup_key?: string } }> };
    };

    const priceId = sub.items?.data?.[0]?.price?.id ?? "unknown";
    const lookupKey = sub.items?.data?.[0]?.price?.lookup_key ?? null;
    const periodEnd = sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null;

    // Sync billing_subscriptions table
    const { error: subError } = await admin.from("billing_subscriptions").upsert({
      organization_id: organizationId,
      stripe_subscription_id: sub.id,
      stripe_customer_id: sub.customer,
      stripe_price_id: priceId,
      status: sub.status ?? "canceled",
      current_period_end: periodEnd,
      cancel_at_period_end: Boolean(sub.cancel_at_period_end),
      updated_at: new Date().toISOString(),
    });

    if (subError) {
      console.error("stripe-webhook: billing_subscriptions upsert failed", subError);
      return new Response("Database error", { status: 500 });
    }

    // Sync organizations table — this is what the app reads
    const { error: orgError } = await admin.from("organizations").update({
      subscription_status: sub.status ?? "canceled",
      subscription_plan: lookupKey ?? priceId,
      stripe_subscription_id: sub.id,
      stripe_customer_id: sub.customer,
      subscription_period_end: periodEnd,
    }).eq("id", organizationId);

    if (orgError) {
      console.error("stripe-webhook: organizations update failed", orgError);
      return new Response("Database error", { status: 500 });
    }
  }

  return ok();
});
