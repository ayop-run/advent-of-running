-- AYOP is the official account, not a demo: clear the seed ornaments left on its tree from 005.
-- Run once in the SQL editor after 008_official_ayop.sql.
delete from ornaments_hung
where tree_owner = (select id from runners where nickname = 'ayop' and official)
  and from_runner is null;

notify pgrst, 'reload schema';
