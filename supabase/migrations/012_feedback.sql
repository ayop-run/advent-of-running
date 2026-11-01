-- Beta feedback from the app's feedback page. Read it in the Supabase table editor.
-- Run once in the SQL editor after 011_hang_dates_in_app.sql.
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  -- who sent it when signed in; kept if they delete their tree
  runner_id uuid references runners(id) on delete set null,
  message text not null check (char_length(message) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists feedback_created on feedback (created_at desc);
alter table feedback enable row level security;

notify pgrst, 'reload schema';
