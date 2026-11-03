-- Which data notice the runner has seen and accepted (Strava API Policy 7.2: tell runners and
-- ask again when what we collect changes). 1 = run titles and group runs, and the name on the
-- tree chosen by the runner instead of their Strava name and photo.
alter table runners add column if not exists data_notice smallint not null default 0;
