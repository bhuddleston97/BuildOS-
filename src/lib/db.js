import { supabase } from "./supabase.js";

async function getTenantContext() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be signed in to access workspace data.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile?.organization_id) {
    throw new Error("Your account is not assigned to a company.");
  }

  return { organizationId: profile.organization_id };
}

function normalizePayload(payload) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      const nullable =
        key === "id" ||
        key.endsWith("_id") ||
        key.endsWith("_date") ||
        key.endsWith("_expiry") ||
        key === "planned_start" ||
        key === "planned_end";

      return [key, nullable && value === "" ? null : value];
    })
  );
}

function applySort(query, sort) {
  if (!sort) return query;

  const ascending = !sort.startsWith("-");
  const column = ascending ? sort : sort.slice(1);

  return query.order(column, { ascending });
}

export async function listRows(table, { page = 1, perPage = 100, sort, eq = {}, signal } = {}) {
  const { organizationId } = await getTenantContext();
  const start = (page - 1) * perPage;
  const end = start + perPage - 1;
  let query = supabase.from(table).select("*").eq("organization_id", organizationId);

  for (const [column, value] of Object.entries(eq)) {
    if (column === "organization_id") continue;
    query = query.eq(column, value);
  }

  query = applySort(query, sort).range(start, end);

  if (signal) {
    query = query.abortSignal(signal);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createRow(table, payload) {
  const { organizationId } = await getTenantContext();
  if (payload.organization_id && payload.organization_id !== organizationId) {
    throw new Error("You cannot create data for another company.");
  }

  const { data, error } = await supabase
    .from(table)
    .insert(normalizePayload({ ...payload, organization_id: organizationId }))
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateRow(table, id, payload) {
  const { organizationId } = await getTenantContext();
  if (payload.organization_id && payload.organization_id !== organizationId) {
    throw new Error("You cannot modify data for another company.");
  }

  const { data, error } = await supabase
    .from(table)
    .update(normalizePayload({ ...payload, organization_id: undefined }))
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
