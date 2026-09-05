-- Role-aware authorization layered on top of organization isolation.

create or replace function public.current_workspace_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.users
  where id = auth.uid()
    and organization_id = public.current_organization_id()
    and is_active is distinct from false
  limit 1;
$$;

revoke all on function public.current_workspace_role() from public;
grant execute on function public.current_workspace_role() to authenticated;

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
    execute format('drop policy if exists %I on %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);
  end loop;
end $$;

create policy users_same_organization_select on public.users
  for select to authenticated
  using (organization_id = public.current_organization_id());

create policy users_own_profile_update on public.users
  for update to authenticated
  using (id = auth.uid() and organization_id = public.current_organization_id())
  with check (id = auth.uid() and organization_id = public.current_organization_id());

create policy projects_same_organization_select on public.projects
  for select to authenticated using (organization_id = public.current_organization_id());
create policy projects_manager_write on public.projects
  for insert to authenticated
  with check (organization_id = public.current_organization_id() and public.current_workspace_role() in ('owner', 'admin', 'manager'));
create policy projects_manager_update on public.projects
  for update to authenticated
  using (organization_id = public.current_organization_id() and public.current_workspace_role() in ('owner', 'admin', 'manager'))
  with check (organization_id = public.current_organization_id());
create policy projects_admin_delete on public.projects
  for delete to authenticated
  using (organization_id = public.current_organization_id() and public.current_workspace_role() in ('owner', 'admin'));

create policy tasks_same_organization_select on public.tasks
  for select to authenticated using (organization_id = public.current_organization_id());
create policy tasks_manager_insert on public.tasks
  for insert to authenticated
  with check (organization_id = public.current_organization_id() and public.current_workspace_role() in ('owner', 'admin', 'manager'));
create policy tasks_member_update on public.tasks
  for update to authenticated
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());
create policy tasks_admin_delete on public.tasks
  for delete to authenticated
  using (organization_id = public.current_organization_id() and public.current_workspace_role() in ('owner', 'admin'));

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

create policy schedule_items_manager_access on public.schedule_items
  for all to authenticated
  using (organization_id = public.current_organization_id() and public.current_workspace_role() in ('owner', 'admin', 'manager'))
  with check (organization_id = public.current_organization_id() and public.current_workspace_role() in ('owner', 'admin', 'manager'));

create policy change_orders_manager_access on public.change_orders
  for all to authenticated
  using (organization_id = public.current_organization_id() and public.current_workspace_role() in ('owner', 'admin', 'manager'))
  with check (organization_id = public.current_organization_id() and public.current_workspace_role() in ('owner', 'admin', 'manager'));

create policy vendors_manager_access on public.vendors
  for all to authenticated
  using (organization_id = public.current_organization_id() and public.current_workspace_role() in ('owner', 'admin', 'manager'))
  with check (organization_id = public.current_organization_id() and public.current_workspace_role() in ('owner', 'admin', 'manager'));

create policy subcontractors_manager_access on public.subcontractors
  for all to authenticated
  using (organization_id = public.current_organization_id() and public.current_workspace_role() in ('owner', 'admin', 'manager'))
  with check (organization_id = public.current_organization_id() and public.current_workspace_role() in ('owner', 'admin', 'manager'));
