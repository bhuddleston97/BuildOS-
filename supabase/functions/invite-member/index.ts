import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_ORIGIN") ?? "null",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function hashToken(token: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function createToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Authentication required" }, 401);

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: { user }, error: authError } = await admin.auth.getUser(token);
  if (authError || !user) return json({ error: "Invalid session" }, 401);

  const { data: profile } = await admin.from("users").select("organization_id, role, is_active").eq("id", user.id).maybeSingle();
  if (!profile?.organization_id || profile.is_active === false || !["owner", "admin", "manager"].includes(profile.role)) {
    return json({ error: "Manager-level access is required" }, 403);
  }

  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const role = String(body?.role ?? "member");
  if (!/^\S+@\S+\.\S+$/.test(email) || !["admin", "manager", "member"].includes(role)) {
    return json({ error: "A valid email and role are required" }, 400);
  }

  const from = Deno.env.get("RESEND_FROM");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!from || !resendKey) return json({ error: "Email provider is not configured" }, 503);

  const { data: existing } = await admin.from("users").select("id").eq("organization_id", profile.organization_id).ilike("email", email).maybeSingle();
  if (existing) return json({ error: "This person is already a member" }, 409);

  const rawToken = createToken();
  const { error: insertError } = await admin.from("organization_invitations").insert({
    organization_id: profile.organization_id,
    email,
    role,
    token_hash: await hashToken(rawToken),
    invited_by: user.id,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });
  if (insertError) return json({ error: "Unable to create invitation" }, 500);

  const appUrl = (Deno.env.get("APP_URL") ?? url).replace(/\/$/, "");
  const inviteUrl = `${appUrl}/invite?token=${encodeURIComponent(rawToken)}`;
  const organization = await admin.from("organizations").select("name").eq("id", profile.organization_id).maybeSingle();
  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `You are invited to ${organization.data?.name ?? "a BuildOS workspace"}`,
      text: `You have been invited to join ${organization.data?.name ?? "a BuildOS workspace"} on BuildOS. Open this link within 7 days: ${inviteUrl}`,
    }),
  });

  if (!emailResponse.ok) return json({ error: "Invitation created but email delivery failed" }, 502);
  return json({ message: "Invitation sent" });
});
