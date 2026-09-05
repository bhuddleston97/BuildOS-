-- Close SECURITY DEFINER RPC authorization gaps.

create or replace function public.create_organization(organization_name text)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  created_organization public.organizations;
  caller_id uuid := auth.uid();
  clean_name text := trim(organization_name);
  generated_slug text;
  existing_organization uuid;
begin
  if caller_id is null then
    raise exception 'Authentication required';
  end if;

  select organization_id into existing_organization
  from public.users
  where id = caller_id;

  if existing_organization is not null then
    raise exception 'Your account already belongs to a company';
  end if;

  if char_length(clean_name) not between 2 and 160 then
    raise exception 'Company name must be between 2 and 160 characters';
  end if;

  generated_slug := trim(both '-' from regexp_replace(lower(clean_name), '[^a-z0-9]+', '-', 'g'))
    || '-' || left(gen_random_uuid()::text, 8);

  insert into public.organizations (name, slug)
  values (clean_name, generated_slug)
  returning * into created_organization;

  insert into public.organization_memberships (organization_id, user_id, role, status)
  values (created_organization.id, caller_id, 'owner', 'active');

  update public.users
  set organization_id = created_organization.id,
      role = 'owner',
      is_active = true
  where id = caller_id;

  return created_organization;
end;
$$;

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

  if public.current_workspace_role() not in ('owner', 'admin', 'manager') then
    raise exception 'Manager-level access is required to create a project';
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
      coalesce(nullif(task_data_item->>'progress_pct', '')::integer, 0),
      created_project.id,
      tenant_id
    );
  end loop;

  return created_project;
end;
$$;

revoke all on function public.create_organization(text) from public;
grant execute on function public.create_organization(text) to authenticated;
revoke all on function public.create_project_bundle(jsonb, jsonb) from public;
grant execute on function public.create_project_bundle(jsonb, jsonb) to authenticated;
