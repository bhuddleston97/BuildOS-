-- Align company onboarding with the existing organizations schema.

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
begin
  if caller_id is null then
    raise exception 'Authentication required';
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
  values (created_organization.id, caller_id, 'owner', 'active')
  on conflict (organization_id, user_id) do update
    set role = 'owner', status = 'active';

  update public.users
  set organization_id = created_organization.id,
      role = 'owner',
      is_active = true
  where id = caller_id;

  return created_organization;
end;
$$;

revoke all on function public.create_organization(text) from public;
grant execute on function public.create_organization(text) to authenticated;
