-- Launch news sign-ups from the coming-soon page. Run once in the SQL editor after 005_demo_tree_ayop.sql.
-- Only the app's server (secret key) reads or writes it: row-level security is on, with no policies.

create table launch_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email) and length(email) <= 254),
  -- so the launch email can go out at midnight on December 1 in each person's time zone
  time_zone text not null default 'UTC',
  source text not null default 'coming-soon',
  created_at timestamptz not null default now(),
  -- set once the launch email has been sent; null means still to send
  notified_at timestamptz
);

alter table launch_signups enable row level security;
