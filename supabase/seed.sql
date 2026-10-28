-- The demo tree for the prototype. Run after schema.sql. A fake negative Strava ID marks a seed runner.

insert into runners (strava_athlete_id, nickname, display_name, time_zone) values
  (-2, 'ayop', 'AYOP', 'Europe/Berlin');

insert into ornaments_hung (tree_owner, ornament_id, from_name, hint, message, created_at)
select r.id, v.ornament_id, v.from_name, v.hint, v.message, '2026-12-10T08:00:00Z'
from (values
  ('ayop', 'reindeer', 'Jonas', 'Cheer', '...'),
  ('ayop', 'bauble-cranberry', 'Aiko', 'Love', '...'),
  ('ayop', 'snowflake', 'Leo', 'Thanks', '...'),
  ('ayop', 'santa-shoe', 'Tom', 'Cheer', '...'),
  ('ayop', 'bauble-snow', 'Ella', 'Funny', '...')
) as v(nick, ornament_id, from_name, hint, message)
join runners r on r.nickname = v.nick;
