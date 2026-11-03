-- The title of each day's longest run (e.g. "Own Pace Monday"), for the distance chart's
-- tooltip. Shown only to the runner, like the rest of their calendar.
alter table daily_progress add column if not exists title text check (char_length(title) <= 100);
