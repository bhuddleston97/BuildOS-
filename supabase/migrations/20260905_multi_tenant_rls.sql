-- Multi-tenant isolation for the authenticated application.
-- Apply this migration in Supabase SQL Editor or through Supabase migrations.

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.users
  where id = auth.uid()
    and is_active is distinct from false
  limit 1;
$$;

revoke all on function public.current_organization_id() from public;
grant execute on function public.current_organization_id() to authenticated;

alter table public.users add column if not exists organization_id uuid;
alter table public.projects add column if not exists organization_id uuid;
alter table public.tasks add column if not exists organization_id uuid;
alter table public.task_updates add column if not exists organization_id uuid;
alter table public.notifications add column if not exists organization_id uuid;
alter table public.field_reports add column if not exists organization_id uuid;
alter table public.schedule_items add column if not exists organization_id uuid;
alter table public.change_orders add column if not exists organization_id uuid;
alter table public.vendors add column if not exists organization_id uuid;
alter table public.subcontractors add column if not exists organization_id uuid;

create index if not exists users_organization_id_idx on public.users (organization_id);
create index if not exists projects_organization_id_idx on public.projects (organization_id);
create index if not exists tasks_organization_id_idx on public.tasks (organization_id);
create index if not exists task_updates_organization_id_idx on public.task_updates (organization_id);
create index if not exists notifications_organization_id_idx on public.notifications (organization_id);
create index if not exists field_reports_organization_id_idx on public.field_reports (organization_id);
create index if not exists schedule_items_organization_id_idx on public.schedule_items (organization_id);
create index if not exists change_orders_organization_id_idx on public.change_orders (organization_id);
create index if not exists vendors_organization_id_idx on public.vendors (organization_id);
create index if not exists subcontractors_organization_id_idx on public.subcontractors (organization_id);

alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.task_updates enable row level security;
alter table public.notifications enable row level security;
alter table public.field_reports enable row level security;
alter table public.schedule_items enable row level security;
alter table public.change_orders enable row level security;
alter table public.vendors enable row level security;
alter table public.subcontractors enable row level security;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'users', 'projects', 'tasks', 'task_updates', 'notifications',
        'field_reports', 'schedule_items', 'change_orders', 'vendors',
        'subcontractors'
      )
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end $$;

drop policy if exists users_same_organization_select on public.users;
drop policy if exists users_own_profile_update on public.users;
drop policy if exists projects_same_organization on public.projects;
drop policy if exists tasks_same_organization on public.tasks;
drop policy if exists task_updates_same_organization on public.task_updates;
drop policy if exists notifications_same_organization on public.notifications;
drop policy if exists field_reports_same_organization on public.field_reports;
drop policy if exists schedule_items_same_organization on public.schedule_items;
drop policy if exists change_orders_same_organization on public.change_orders;
drop policy if exists vendors_same_organization on public.vendors;
drop policy if exists subcontractors_same_organization on public.subcontractors;

create policy users_same_organization_select on public.users
  for select to authenticated
  using (organization_id = public.current_organization_id());

create policy users_own_profile_update on public.users
  for update to authenticated
  using (id = auth.uid() and organization_id = public.current_organization_id())
  with check (id = auth.uid() and organization_id = public.current_organization_id());

create policy projects_same_organization on public.projects
  for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy tasks_same_organization on public.tasks
  for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy task_updates_same_organization on public.task_updates
  for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy notifications_same_organization on public.notifications
  for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy field_reports_same_organization on public.field_reports
  for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy schedule_items_same_organization on public.schedule_items
  for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy change_orders_same_organization on public.change_orders
  for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy vendors_same_organization on public.vendors
  for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy subcontractors_same_organization on public.subcontractors
  for all to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());
