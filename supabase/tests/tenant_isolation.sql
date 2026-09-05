-- Run against a staging database as a database owner using psql.
-- Replace the four placeholder UUIDs before running. The authenticated role is
-- required; running as postgres alone bypasses RLS and makes this test invalid.

begin;

-- Company A user and company B user must already exist in staging.
select set_config(
  'request.jwt.claims',
  '{"sub":"USER_A_UUID","role":"authenticated"}',
  true
);
set local role authenticated;

-- A user must never see B rows, even when explicitly filtering for B.
select count(*) as cross_company_projects
from public.projects
where organization_id::text = 'ORG_B_UUID';

select count(*) as cross_company_tasks
from public.tasks
where organization_id::text = 'ORG_B_UUID';

-- These writes must affect zero rows for a B record.
update public.projects
set name = name
where id = 'PROJECT_B_UUID';

update public.tasks
set title = title
where id = 'TASK_B_UUID';

-- A user must not be able to move a row into another company.
insert into public.projects (name, organization_id)
values ('RLS negative test', 'ORG_B_UUID');

rollback;

-- Expected results:
-- cross_company_projects = 0
-- cross_company_tasks = 0
-- cross-company updates affect 0 rows
-- cross-company insert fails with an RLS policy violation
-- Repeat this script with USER_B_UUID and swap the organization IDs.
