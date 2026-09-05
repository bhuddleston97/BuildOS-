begin;
select set_config('request.jwt.claims', '{"sub":"1eb80208-e459-4f62-97b8-269983fc7ffb","role":"authenticated"}', true);
set local role authenticated;
select (public.create_organization('[TEST ROLLBACK] Kensleys Construction')).name as created_name;
rollback;
