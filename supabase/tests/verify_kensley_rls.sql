begin;
select set_config('request.jwt.claims', '{"sub":"1eb80208-e459-4f62-97b8-269983fc7ffb","role":"authenticated"}', true);
set local role authenticated;

select count(*) as visible_other_company_projects
from public.projects
where organization_id = '5c596eb6-2eb8-47a9-b5d2-c05bb6f6044f';

update public.projects
set name = name
where organization_id = '5c596eb6-2eb8-47a9-b5d2-c05bb6f6044f';

rollback;
