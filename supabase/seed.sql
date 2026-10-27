-- Demo trees for the prototype. Run after schema.sql. Fake negative Strava IDs mark seed runners.

insert into runners (strava_athlete_id, nickname, display_name, time_zone) values
  (-1, 'demo', 'You', 'Europe/Berlin'),
  (-2, 'mina', 'Mina', 'Europe/Berlin'),
  (-3, 'jonas', 'Jonas', 'Europe/Berlin'),
  (-4, 'aiko', 'Aiko', 'Asia/Tokyo');

insert into ornaments_hung (tree_owner, ornament_id, from_name, hint, message, created_at)
select r.id, v.ornament_id, v.from_name, v.hint, v.message, '2026-12-10T08:00:00Z'
from (values
  ('demo', 'snow-globe', 'Mina', 'Cheer', 'You got this. See you at the Sunday long run!'),
  ('demo', 'fox', 'Jonas', 'Thanks', 'Thanks for pacing me in October. Merry Christmas!'),
  ('demo', 'finish-medal', 'Aiko', 'Love', 'Proud of you for running through the dark mornings.'),
  ('demo', 'penguin', 'Leo', 'Funny', 'Slipped on ice twice this week. Worth it.'),
  ('demo', 'bauble-snow', 'Hana', 'Cheer', 'Keep the streak alive!'),
  ('demo', 'snowflake', 'Tom', 'Love', 'Happy holidays from the Tuesday crew.'),
  ('demo', 'sock', 'Ella', 'Funny', 'Warm feet, fast feet.'),
  ('demo', 'hot-cocoa', 'Sam', 'Thanks', 'Cocoa after the run is on me.'),
  ('demo', 'bauble-frost', 'Noah', 'Cheer', 'Run happy!'),
  ('mina', 'reindeer', 'Jonas', 'Cheer', '...'),
  ('mina', 'bauble-cranberry', 'Aiko', 'Love', '...'),
  ('mina', 'snowflake', 'Leo', 'Thanks', '...'),
  ('mina', 'santa-shoe', 'Tom', 'Cheer', '...'),
  ('mina', 'bauble-snow', 'Ella', 'Funny', '...'),
  ('jonas', 'stopwatch', 'Mina', 'Cheer', '...'),
  ('jonas', 'sock', 'Leo', 'Funny', '...')
) as v(nick, ornament_id, from_name, hint, message)
join runners r on r.nickname = v.nick;
