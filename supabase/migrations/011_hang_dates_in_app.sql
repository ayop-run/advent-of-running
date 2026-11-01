-- Hanging closes on day 25 of Advent, which the app now works out from its start date
-- (NEXT_PUBLIC_ADVENT_START, December 1 by default). The app checks it before calling this, so
-- the function no longer has December 25 written into it. It also stops reading hang_policy:
-- every hang now needs a signed-in runner with an earned ornament (checked by the app).
-- Run once in the SQL editor after 010_notifications.sql.
create or replace function hang_ornament(
  nick text, ornament_id text, from_name text, hint text, message text,
  from_email text default null, from_runner uuid default null
)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  owner runners%rowtype;
  new_id uuid;
begin
  select * into owner from runners where nickname = lower(nick);
  if not found then
    raise exception 'tree_not_found' using errcode = 'P0002';
  end if;
  if from_runner is null then
    raise exception 'sign_in_required' using errcode = '42501';
  end if;

  insert into ornaments_hung (tree_owner, ornament_id, from_runner, from_name, from_email, hint, message)
  values (owner.id, ornament_id, from_runner, trim(from_name), nullif(trim(from_email), ''), hint, trim(message))
  returning id into new_id;
  return new_id;
end;
$$;
revoke all on function hang_ornament(text, text, text, text, text, text, uuid) from public, anon, authenticated;
grant execute on function hang_ornament(text, text, text, text, text, text, uuid) to service_role;

notify pgrst, 'reload schema';
