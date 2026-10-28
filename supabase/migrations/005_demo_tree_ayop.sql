-- One demo tree, "ayop", instead of the four seed trees. Run once in the SQL editor after 004_one_per_tree.sql.
-- Only seed runners (negative Strava IDs) are touched; deleting a runner deletes the ornaments on its tree.

update runners set nickname = 'ayop', display_name = 'AYOP' where nickname = 'mina' and strava_athlete_id < 0;
update ornaments_hung set from_name = 'AYOP' where from_name = 'Mina' and from_runner is null;

delete from runners where nickname in ('demo', 'jonas', 'aiko') and strava_athlete_id < 0;
