begin;
select set_config('request.jwt.claims', '{"sub":"1eb80208-e459-4f62-97b8-269983fc7ffb","role":"authenticated"}', true);
set local role authenticated;

do $$
begin
  begin
    insert into public.projects (name, organization_id)
    values ('[TEST SHOULD FAIL]', '5c596eb6-2eb8-47a9-b5d2-c05bb6f6044f');
    raise exception 'RLS insert test failed: cross-tenant insert was accepted';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

rollback;
