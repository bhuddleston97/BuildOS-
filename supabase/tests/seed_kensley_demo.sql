-- Idempotent demo data for kensleys construruction.
-- Resolves the tenant from the authenticated profile; safe to rerun.

do $$
declare
  tenant_id uuid;
  owner_id uuid;
  project_id uuid := 'b1000000-0000-0000-0000-000000000001';
  second_project_id uuid := 'b1000000-0000-0000-0000-000000000002';
begin
  select u.organization_id, u.id into tenant_id, owner_id
  from public.users u
  join auth.users au on au.id = u.id
  where lower(au.email) = 'kensleysparkman28@gmail.com';

  if tenant_id is null then
    raise exception 'kensleysparkman28@gmail.com has no organization';
  end if;

  insert into public.projects (id, name, client, location, phase, budget, spent, progress, crew_count, status, description, organization_id)
  values
    (project_id, '[DEMO] Kensleys Medical Office', 'Pinecrest Health Group', 'Charlotte, NC', 'Framing', 1280000, 512000, 40, 14, 'active', 'Demo project for Kensleys Construction tenant testing.', tenant_id),
    (second_project_id, '[DEMO] Kensleys Riverwalk Retail', 'Riverwalk Partners', 'Raleigh, NC', 'Foundation', 760000, 190000, 25, 9, 'at_risk', 'Demo project for budget and schedule testing.', tenant_id)
  on conflict (id) do nothing;

  insert into public.tasks (id, title, project_id, assigned_to, assigned_user_id, priority, status, due_date, description, progress_pct, organization_id)
  values
    ('b2000000-0000-0000-0000-000000000001', '[DEMO] Complete framing inspection', project_id, 'Kensley Sparkman', owner_id, 'high', 'in_progress', '2026-09-14', 'Upload signed inspection report.', 60, tenant_id),
    ('b2000000-0000-0000-0000-000000000002', '[DEMO] Confirm HVAC rough-in date', project_id, 'Kensley Sparkman', owner_id, 'medium', 'todo', '2026-09-18', 'Confirm delivery and crew availability.', 0, tenant_id),
    ('b2000000-0000-0000-0000-000000000003', '[DEMO] Resolve footing inspection issue', second_project_id, 'Kensley Sparkman', owner_id, 'critical', 'in_progress', '2026-09-11', 'Resolve inspection issue before concrete pour.', 30, tenant_id)
  on conflict (id) do nothing;

  insert into public.schedule_items (id, project_id, title, description, planned_start, planned_end, status, organization_id)
  values
    ('b3000000-0000-0000-0000-000000000001', project_id, '[DEMO] Framing inspection', 'Level 2 and 3 inspection.', '2026-09-12', '2026-09-14', 'upcoming', tenant_id),
    ('b3000000-0000-0000-0000-000000000002', second_project_id, '[DEMO] Concrete footing pour', 'Pour after inspection approval.', '2026-09-16', '2026-09-18', 'planned', tenant_id)
  on conflict (id) do nothing;

  insert into public.field_reports (id, project_id, submitted_by, report_date, weather, work_performed, issues, crew_count, hours_worked, safety_incidents, organization_id)
  values ('b4000000-0000-0000-0000-000000000001', project_id, 'Kensley Sparkman', '2026-09-05', 'Clear, 74F', 'Framing advanced on the east wing.', 'HVAC rough-in date needs confirmation.', 14, 112, 0, tenant_id)
  on conflict (id) do nothing;

  insert into public.vendors (id, name, trade, contact_name, email, phone, license_number, insurance_expiry, compliance_status, rating, organization_id)
  values ('b5000000-0000-0000-0000-000000000001', '[DEMO] Carolina HVAC Supply', 'HVAC supply', 'Alex Morgan', 'demo@carolina-hvac.example', '555-010-0211', 'DEMO-HVAC-001', '2027-07-31', 'compliant', 5, tenant_id)
  on conflict (id) do nothing;

  insert into public.change_orders (id, project_id, title, description, requested_by, cost_impact, schedule_impact_days, status, submitted_date, organization_id)
  values ('b6000000-0000-0000-0000-000000000001', project_id, '[DEMO] Upgrade lobby lighting', 'Client requested upgraded fixtures.', 'Kensley Sparkman', 14800, 2, 'pending', '2026-09-04', tenant_id)
  on conflict (id) do nothing;

  insert into public.notifications (id, user_id, type, title, message, severity, read, link, organization_id)
  values ('b7000000-0000-0000-0000-000000000001', owner_id, 'demo', '[DEMO] Kensleys data loaded', 'Demo projects and workflow records are ready.', 'info', false, '/app/projects', tenant_id)
  on conflict (id) do nothing;
end;
$$;
