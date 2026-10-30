-- Following friends' trees. Run once in the SQL editor after 006_launch_signups.sql,
-- on staging first, then on production.
-- One-way and without approval: trees are already public to anyone with the link.
-- Only the app's server (secret key) reads or writes it: row-level security is on, with no policies.

create table if not exists follows (
  follower uuid not null references runners(id) on delete cascade,
  followee uuid not null references runners(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower, followee),
  check (follower <> followee)
);

-- "who follows me" (the primary key already covers "who do I follow")
create index if not exists follows_followee_idx on follows (followee);

alter table follows enable row level security;
