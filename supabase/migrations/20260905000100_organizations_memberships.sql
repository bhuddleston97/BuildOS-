-- Organizations and memberships for company onboarding and future workspace switching.

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 160),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_memberships (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'manager', 'member')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index if not exists organization_memberships_user_idx
  on public.organization_memberships (user_id, status);

create or replace function public.create_organization(organization_name text)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  created_organization public.organizations;
  caller_id uuid := auth.uid();
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;

  if char_length(trim(organization_name)) not between 2 and 160 then
    raise exception 'Company name must be between 2 and 160 characters';
  end if;

  insert into public.organizations (name, created_by)
  values (trim(organization_name), caller_id)
  returning * into created_organization;

  insert into public.organization_memberships (organization_id, user_id, role)
  values (created_organization.id, caller_id, 'owner');

  update public.users
  set organization_id = created_organization.id,
      role = 'owner'
  where id = caller_id;

  return created_organization;
end;
$$;

revoke all on function public.create_organization(text) from public;
grant execute on function public.create_organization(text) to authenticated;

create or replace function public.create_project_bundle(project_data jsonb, task_data jsonb default '[]'::jsonb)
returns public.projects
language plpgsql
security definer
set search_path = public
as $$
declare
  created_project public.projects;
  task_data_item jsonb;
  tenant_id uuid := public.current_organization_id();
begin
  if auth.uid() is null or tenant_id is null then
    raise exception 'A company-assigned authenticated user is required';
  end if;

  insert into public.projects (
    name, client, location, phase, budget, spent, progress, crew_count,
    status, organization_id
  )
  values (
    nullif(project_data->>'name', ''),
    nullif(project_data->>'client', ''),
    nullif(project_data->>'location', ''),
    nullif(project_data->>'phase', ''),
    coalesce(nullif(project_data->>'budget', '')::numeric, 0),
    coalesce(nullif(project_data->>'spent', '')::numeric, 0),
    coalesce(nullif(project_data->>'progress', '')::numeric, 0),
    coalesce(nullif(project_data->>'crew_count', '')::integer, 0),
    coalesce(nullif(project_data->>'status', ''), 'active'),
    tenant_id
  )
  returning * into created_project;

  for task_data_item in select value from jsonb_array_elements(task_data)
  loop
    insert into public.tasks (
      title, assigned_to, assigned_user_id, priority, due_date, description,
      status, progress_pct, project_id, organization_id
    )
    values (
      nullif(task_data_item->>'title', ''),
      nullif(task_data_item->>'assigned_to', ''),
      nullif(task_data_item->>'assigned_user_id', '')::uuid,
      coalesce(nullif(task_data_item->>'priority', ''), 'medium'),
      nullif(task_data_item->>'due_date', '')::date,
      nullif(task_data_item->>'description', ''),
      coalesce(nullif(task_data_item->>'status', ''), 'todo'),
      coalesce(nullif(task_data_item->>'progress_pct', '')::numeric, 0),
      created_project.id,
      tenant_id
    );
  end loop;

  return created_project;
end;
$$;

revoke all on function public.create_project_bundle(jsonb, jsonb) from public;
grant execute on function public.create_project_bundle(jsonb, jsonb) to authenticated;

alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;

drop policy if exists organizations_member_select on public.organizations;
create policy organizations_member_select on public.organizations
  for select to authenticated
  using (id = public.current_organization_id());

drop policy if exists memberships_same_organization_select on public.organization_memberships;
create policy memberships_same_organization_select on public.organization_memberships
  for select to authenticated
  using (organization_id = public.current_organization_id());
