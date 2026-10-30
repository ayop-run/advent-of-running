-- Official accounts: trees run by Advent of Running itself, not connected to Strava. They show
-- up in search with an "Official" badge so people can follow them. Run once in the SQL editor
-- after 007_follows.sql, on staging first, then on production.

alter table runners add column if not exists official boolean not null default false;

-- AYOP, the demo tree, becomes the official account
update runners
set display_name = 'AYOP | At Your Own Pace', official = true, onboarded = true
where nickname = 'ayop' and strava_athlete_id < 0;
