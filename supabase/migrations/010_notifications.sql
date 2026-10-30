-- In-app notifications: someone followed you, asked you to hang an ornament, or hung one on
-- your tree. Run once in the SQL editor after 009_ayop_empty_tree.sql.
-- One row per recipient, actor and kind: following twice or asking twice never repeats it.
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient uuid not null references runners(id) on delete cascade,
  actor uuid not null references runners(id) on delete cascade,
  kind text not null check (kind in ('followed', 'asked', 'hung')),
  -- for 'hung': the ornament, so its message stays where it is (sealed) and only the initial shows
  hung_id uuid references ornaments_hung(id) on delete cascade,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  unique (recipient, actor, kind),
  check (recipient <> actor)
);
create index if not exists notifications_recipient on notifications (recipient, created_at desc);
alter table notifications enable row level security;

-- hang_ornament still reads runners.hang_policy: keep that column (don't drop it)
alter table runners add column if not exists hang_policy text not null default 'anyone';

notify pgrst, 'reload schema';
