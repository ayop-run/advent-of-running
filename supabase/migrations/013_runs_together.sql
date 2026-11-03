-- Weeks 3–4 ("Run together with a friend"): group runs per day, from Strava's athlete_count.
-- Strava groups activities recorded together; we only keep how many, never who with.
alter table daily_progress add column if not exists together int not null default 0;
