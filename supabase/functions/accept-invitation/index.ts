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

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = request.headers.get("Authorization");
  const sessionToken = authHeader?.replace(/^Bearer\s+/i, "");
  if (!sessionToken) return json({ error: "Sign in before accepting an invitation" }, 401);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: { user }, error: authError } = await admin.auth.getUser(sessionToken);
  if (authError || !user?.email) return json({ error: "Invalid session" }, 401);

  const body = await request.json().catch(() => null);
  const rawToken = String(body?.token ?? "");
  if (!/^[a-f0-9]{64}$/.test(rawToken)) return json({ error: "Invalid invitation" }, 400);

  const { data: invitation } = await admin.from("organization_invitations")
    .select("id, organization_id, email, role, expires_at, accepted_at")
    .eq("token_hash", await hashToken(rawToken))
    .is("accepted_at", null)
    .maybeSingle();

  if (!invitation || new Date(invitation.expires_at) <= new Date()) return json({ error: "This invitation is invalid or expired" }, 400);
  if (invitation.email.toLowerCase() !== user.email.toLowerCase()) return json({ error: "Sign in with the invited email address" }, 403);

  const { data: profile } = await admin.from("users").select("organization_id").eq("id", user.id).maybeSingle();
  if (profile?.organization_id && profile.organization_id !== invitation.organization_id) return json({ error: "Your account already belongs to another company" }, 409);

  const { error: membershipError } = await admin.from("organization_memberships").upsert({
    organization_id: invitation.organization_id,
    user_id: user.id,
    role: invitation.role,
    status: "active",
  });
  if (membershipError) return json({ error: "Unable to add membership" }, 500);

  const { error: profileError } = await admin.from("users").update({ organization_id: invitation.organization_id, role: invitation.role, is_active: true }).eq("id", user.id);
  if (profileError) return json({ error: "Unable to update account membership" }, 500);

  const { error: acceptedError } = await admin.from("organization_invitations").update({ accepted_at: new Date().toISOString() }).eq("id", invitation.id).is("accepted_at", null);
  if (acceptedError) return json({ error: "Unable to finalize invitation" }, 500);

  return json({ message: "Invitation accepted", organizationId: invitation.organization_id });
});
