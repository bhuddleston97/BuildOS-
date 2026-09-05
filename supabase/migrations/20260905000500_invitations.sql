-- Secure, single-use invitations. Edge Functions are the only write path.

create table if not exists public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  email text not null check (char_length(trim(email)) between 3 and 320),
  role text not null default 'member' check (role in ('admin', 'manager', 'member')),
  token_hash text not null unique,
  invited_by uuid not null references auth.users(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists organization_invitations_lookup_idx
  on public.organization_invitations (organization_id, lower(email), expires_at)
  where accepted_at is null;

alter table public.organization_invitations enable row level security;
-- No client policies: invitation records are read and written only by Edge Functions.
