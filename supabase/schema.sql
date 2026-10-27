-- Advent of Running · phase 2 database draft (Supabase / Postgres)
-- Run once in the Supabase SQL editor, then supabase/seed.sql for the demo trees.

create table runners (
  id uuid primary key default gen_random_uuid(),
  strava_athlete_id bigint unique not null,
  nickname text unique not null check (nickname ~ '^[a-z0-9-]{2,30}$'),
  display_name text not null,
  avatar_url text,
  time_zone text not null default 'UTC',
  hang_policy text not null default 'anyone' check (hang_policy in ('anyone', 'signed_in')),
  email text,
  email_opt_in boolean not null default false,
  -- Strava tokens: store encrypted, delete on deauthorization webhook
  strava_access_token text,
  strava_refresh_token text,
  strava_expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- Only the facts a door needs; raw Strava activity data is never shown to other users.
create table daily_progress (
  runner_id uuid references runners(id) on delete cascade,
  day date not null,
  km numeric(6,2) not null default 0,
  door_opened boolean not null default false,
  opened_by_catch_up boolean not null default false,
  primary key (runner_id, day)
);

create table pouch (
  id uuid primary key default gen_random_uuid(),
  runner_id uuid references runners(id) on delete cascade,
  ornament_id text not null,          -- catalog ID, e.g. SPC-01
  earned_on date not null,
  used boolean not null default false
);

create table ornaments_hung (
  id uuid primary key default gen_random_uuid(),
  tree_owner uuid references runners(id) on delete cascade,
  ornament_id text not null,
  from_runner uuid references runners(id) on delete set null,  -- null for guests
  from_name text not null check (char_length(from_name) <= 30),
  from_email text,                    -- optional, guests only, for the "read" email
  hint text not null check (hint in ('Cheer', 'Thanks', 'Funny', 'Love')),
  message text not null check (char_length(message) <= 200),
  reaction text,                      -- set by the owner on/after Dec 25
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index on ornaments_hung (tree_owner);

-- Messages are sealed until Dec 25 in the owner's time zone: only expose them through a
-- server route that checks the date, never via a public select policy on `message`.
alter table ornaments_hung enable row level security;
alter table runners enable row level security;
alter table daily_progress enable row level security;
alter table pouch enable row level security;

-- ---------------------------------------------------------------------------
-- Public access. The browser uses the publishable key (role `anon`) and never touches
-- the tables directly: it only calls the two functions below, which expose exactly
-- what a public tree may show (no activity data, no messages, no emails).
-- ---------------------------------------------------------------------------

revoke all on runners, daily_progress, pouch, ornaments_hung from anon, authenticated;

-- A tree: owner name + sealed ornaments (no message, no sender email). Null if unknown.
create or replace function get_tree(nick text)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'nickname', r.nickname,
    'displayName', r.display_name,
    'ornaments', coalesce((
      select json_agg(json_build_object(
        'id', o.id,
        'ornamentId', o.ornament_id,
        'from', o.from_name,
        'hint', o.hint,
        'createdAt', o.created_at
      ) order by o.created_at)
      from ornaments_hung o
      where o.tree_owner = r.id and not o.hidden
    ), '[]'::json)
  )
  from runners r
  where r.nickname = lower(nick);
$$;

-- Hang an ornament. Closes Dec 24 23:59 in the owner's time zone.
create or replace function hang_ornament(
  nick text, ornament_id text, from_name text, hint text, message text, from_email text default null
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
  if owner.hang_policy = 'signed_in' and auth.uid() is null then
    raise exception 'sign_in_required' using errcode = '42501';
  end if;
  local_day := (now() at time zone owner.time_zone)::date;
  if extract(month from local_day) = 12 and extract(day from local_day) >= 25 then
    raise exception 'hanging_closed' using errcode = '42501';
  end if;

  insert into ornaments_hung (tree_owner, ornament_id, from_name, from_email, hint, message)
  values (owner.id, ornament_id, trim(from_name), nullif(trim(from_email), ''), hint, trim(message))
  returning id into new_id;
  return new_id;
end;
$$;

revoke all on function get_tree(text), hang_ornament(text, text, text, text, text, text) from public;
grant execute on function get_tree(text), hang_ornament(text, text, text, text, text, text) to anon, authenticated;
