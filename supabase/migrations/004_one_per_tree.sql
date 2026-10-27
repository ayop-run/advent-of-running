-- Rules from the redesign on main. Run once in the SQL editor after 003_activity_sync.sql.

-- Everyone can hang one ornament on each tree (signed-in runners; guests are limited in the browser).
-- Keep only the first ornament per runner and tree before adding the rule.
delete from ornaments_hung o
using ornaments_hung older
where o.from_runner is not null
  and o.tree_owner = older.tree_owner
  and o.from_runner = older.from_runner
  and (older.created_at, older.id) < (o.created_at, o.id);
create unique index ornaments_hung_one_per_tree on ornaments_hung (tree_owner, from_runner) where from_runner is not null;

-- Door ornaments go straight to a friend's tree: remember which ornament each one became.
alter table pouch add column hung_id uuid references ornaments_hung(id) on delete set null;

-- The redesigned catalogue has no "star-gold"; its place went to the snow globe.
update ornaments_hung set ornament_id = 'snow-globe' where ornament_id = 'star-gold';
update pouch set ornament_id = 'snow-globe' where ornament_id = 'star-gold';

-- Door ornaments follow the catalogue on main now; drop ungiven ones awarded with the old
-- numbering, so the next sync awards the right ornament for each door.
delete from pouch where not used;
