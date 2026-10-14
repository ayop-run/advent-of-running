-- Advent of Running · phase 2 database draft (Supabase / Postgres)
-- Not used by the prototype yet. Run in the Supabase SQL editor when wiring up the real backend.

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
