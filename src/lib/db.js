import { supabase } from "./supabase.js";

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
  const start = (page - 1) * perPage;
  const end = start + perPage - 1;
  let query = supabase.from(table).select("*");

  for (const [column, value] of Object.entries(eq)) {
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
  const { data, error } = await supabase
    .from(table)
    .insert(normalizePayload(payload))
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateRow(table, id, payload) {
  const { data, error } = await supabase
    .from(table)
    .update(normalizePayload(payload))
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
