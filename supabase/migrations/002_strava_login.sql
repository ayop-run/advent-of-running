-- Strava login. Run once in the SQL editor after schema.sql and seed.sql.

-- New runners first pick a nickname; until then they are sent to /onboarding.
alter table runners add column onboarded boolean not null default false;
update runners set onboarded = true where strava_athlete_id < 0;  -- seed runners

-- Hanging now goes through the app's /api/hang route (server, secret key), which knows
-- who is signed in. The browser can no longer call this function directly.
drop function hang_ornament(text, text, text, text, text, text);

create function hang_ornament(
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
  local_day date;
  new_id uuid;
begin
  select * into owner from runners where nickname = lower(nick);
  if not found then
    raise exception 'tree_not_found' using errcode = 'P0002';
  end if;
  if owner.hang_policy = 'signed_in' and from_runner is null then
    raise exception 'sign_in_required' using errcode = '42501';
  end if;
  local_day := (now() at time zone owner.time_zone)::date;
  if extract(month from local_day) = 12 and extract(day from local_day) >= 25 then
    raise exception 'hanging_closed' using errcode = '42501';
  end if;

  insert into ornaments_hung (tree_owner, ornament_id, from_runner, from_name, from_email, hint, message)
  values (owner.id, ornament_id, from_runner, trim(from_name), nullif(trim(from_email), ''), hint, trim(message))
  returning id into new_id;
  return new_id;
end;
$$;

revoke all on function hang_ornament(text, text, text, text, text, text, uuid) from public, anon, authenticated;
grant execute on function hang_ornament(text, text, text, text, text, text, uuid) to service_role;
