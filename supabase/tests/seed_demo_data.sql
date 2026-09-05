-- Idempotent demo data for the supplied test organization.
-- Safe to rerun: records use fixed IDs and ON CONFLICT DO NOTHING.

begin;

insert into public.projects (
  id, name, client, location, phase, budget, spent, progress, crew_count,
  status, description, organization_id
) values
  ('a1000000-0000-0000-0000-000000000001', '[DEMO] Harbor Point Office', 'Northstar Properties', 'Seattle, WA', 'Framing', 1850000, 742500, 42, 18, 'active', 'Demo project for tenant and workflow validation.', '5c596eb6-2eb8-47a9-b5d2-c05bb6f6044f'),
  ('a1000000-0000-0000-0000-000000000002', '[DEMO] Cedar Ridge Homes', 'Cedar Ridge Development', 'Tacoma, WA', 'Foundation', 920000, 184000, 20, 11, 'at_risk', 'Demo project for schedule and budget validation.', '5c596eb6-2eb8-47a9-b5d2-c05bb6f6044f')
on conflict (id) do nothing;

insert into public.tasks (
  id, title, project_id, assigned_to, assigned_user_id, priority, status,
  due_date, description, progress_pct, organization_id
) values
  ('a2000000-0000-0000-0000-000000000001', '[DEMO] Complete level 3 framing inspection', 'a1000000-0000-0000-0000-000000000001', 'Demo Owner', 'f42eb155-9b07-423d-88f7-4fcfe2d380d6', 'high', 'in_progress', '2026-09-12', 'Coordinate inspection and upload the signed report.', 65, '5c596eb6-2eb8-47a9-b5d2-c05bb6f6044f'),
  ('a2000000-0000-0000-0000-000000000002', '[DEMO] Confirm window delivery date', 'a1000000-0000-0000-0000-000000000001', 'Demo Owner', 'f42eb155-9b07-423d-88f7-4fcfe2d380d6', 'medium', 'todo', '2026-09-15', 'Confirm delivery window with the supplier.', 0, '5c596eb6-2eb8-47a9-b5d2-c05bb6f6044f'),
  ('a2000000-0000-0000-0000-000000000003', '[DEMO] Resolve footing inspection delay', 'a1000000-0000-0000-0000-000000000002', 'Demo Owner', 'f42eb155-9b07-423d-88f7-4fcfe2d380d6', 'critical', 'in_progress', '2026-09-09', 'Resolve the inspection issue before the next concrete pour.', 30, '5c596eb6-2eb8-47a9-b5d2-c05bb6f6044f')
on conflict (id) do nothing;

insert into public.schedule_items (
  id, project_id, title, description, planned_start, planned_end, status,
  organization_id
) values
  ('a3000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', '[DEMO] Framing inspection', 'Level 3 framing and connection inspection.', '2026-09-10', '2026-09-12', 'upcoming', '5c596eb6-2eb8-47a9-b5d2-c05bb6f6044f'),
  ('a3000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', '[DEMO] Window installation', 'Begin window installation after delivery.', '2026-09-16', '2026-09-23', 'planned', '5c596eb6-2eb8-47a9-b5d2-c05bb6f6044f')
on conflict (id) do nothing;

insert into public.field_reports (
  id, project_id, submitted_by, report_date, weather, work_performed, issues,
  crew_count, hours_worked, safety_incidents, organization_id
) values
  ('a4000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Demo Owner', '2026-09-05', 'Clear, 68F', 'Framing advanced on levels 2 and 3. Material staging completed.', 'One delayed delivery requires schedule confirmation.', 18, 144, 0, '5c596eb6-2eb8-47a9-b5d2-c05bb6f6044f')
on conflict (id) do nothing;

insert into public.vendors (
  id, name, trade, contact_name, email, phone, license_number,
  insurance_expiry, compliance_status, rating, organization_id
) values
  ('a5000000-0000-0000-0000-000000000001', '[DEMO] Summit Windows Supply', 'Windows and glazing', 'Morgan Lee', 'demo@summit-windows.example', '555-010-0142', 'DEMO-WIN-001', '2027-06-30', 'compliant', 4, '5c596eb6-2eb8-47a9-b5d2-c05bb6f6044f')
on conflict (id) do nothing;

insert into public.subcontractors (
  id, name, trade, contact_name, email, phone, license_number,
  insurance_expiry, compliance_status, w9_on_file, organization_id
) values
  ('a6000000-0000-0000-0000-000000000001', '[DEMO] Apex Framing Crew', 'Framing', 'Jordan Kim', 'demo@apex-framing.example', '555-010-0177', 'DEMO-FRM-001', '2027-04-30', 'compliant', true, '5c596eb6-2eb8-47a9-b5d2-c05bb6f6044f')
on conflict (id) do nothing;

insert into public.change_orders (
  id, project_id, title, description, requested_by, cost_impact,
  schedule_impact_days, status, submitted_date, organization_id
) values
  ('a7000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', '[DEMO] Upgrade lobby glazing', 'Client requested upgraded glazing at the main entrance.', 'Demo Owner', 28500, 3, 'pending', '2026-09-04', '5c596eb6-2eb8-47a9-b5d2-c05bb6f6044f')
on conflict (id) do nothing;

insert into public.notifications (
  id, user_id, type, title, message, severity, read, link, organization_id
) values
  ('a8000000-0000-0000-0000-000000000001', 'f42eb155-9b07-423d-88f7-4fcfe2d380d6', 'demo', '[DEMO] Tenant test data loaded', 'Demo projects and workflow records are ready for review.', 'info', false, '/app/projects', '5c596eb6-2eb8-47a9-b5d2-c05bb6f6044f')
on conflict (id) do nothing;

commit;
