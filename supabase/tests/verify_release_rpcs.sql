begin;
select set_config('request.jwt.claims', '{"sub":"1eb80208-e459-4f62-97b8-269983fc7ffb","role":"authenticated"}', true);
set local role authenticated;

select public.current_workspace_role() as workspace_role;

select (public.create_project_bundle(
  '{"name":"[TEST ROLLBACK] Project","client":"Test Client","location":"Test City","phase":"Planning","budget":"1","spent":"0","progress":"0","crew_count":"0","status":"active"}'::jsonb,
  '[]'::jsonb
)).name as created_project;

rollback;

begin;
select set_config('request.jwt.claims', '{"sub":"1eb80208-e459-4f62-97b8-269983fc7ffb","role":"authenticated"}', true);
set local role authenticated;

do $$
begin
  begin
    perform public.create_organization('[TEST SHOULD FAIL]');
    raise exception 'Organization guard failed: existing user created a second company';
  exception
    when others then
      if sqlerrm = 'Organization guard failed: existing user created a second company' then
        raise;
      end if;
  end;
end;
$$;

rollback;
