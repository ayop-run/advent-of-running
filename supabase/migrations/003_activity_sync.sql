-- Activity sync from Strava. Run once in the SQL editor after 002_strava_login.sql.

-- Synced on demand when the runner opens the app (at most every 10 minutes).
alter table runners add column last_synced_at timestamptz;

-- Per day: number of counted runs and the longest single run (catch-ups need "N km in one go").
alter table daily_progress add column runs integer not null default 0;
alter table daily_progress add column longest_km numeric(6,2) not null default 0;

-- What earned the ornament ('door-5', 'week-1'), so re-syncing never awards it twice.
alter table pouch add column source text;
alter table pouch add constraint pouch_runner_source_key unique (runner_id, source);
