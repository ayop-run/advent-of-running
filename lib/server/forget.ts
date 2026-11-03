import { db } from './db';

/**
 * Deletes a runner and everything about them: their tree, synced runs, pouch, follows and
 * notifications go with the row (on delete cascade). Ornaments they hung on friends' trees
 * stay, signed with the name they wrote, but no longer point to them.
 */
export async function forgetRunner(runnerId: string) {
  return db().from('runners').delete().eq('id', runnerId);
}

/** Days we keep a runner's synced Strava summary after their last sync (Strava API Policy 6.2). */
export const KEEP_SYNCED_DAYS = 7;

/** Deletes synced Strava summaries (daily_progress) of runners who haven't synced for 7 days. */
export async function dropStaleRuns() {
  const cutoff = new Date(Date.now() - KEEP_SYNCED_DAYS * 86_400_000).toISOString();
  const { data: stale } = await db().from('runners').select('id').or(`last_synced_at.is.null,last_synced_at.lt."${cutoff}"`);
  const ids = (stale ?? []).map((r) => r.id);
  if (!ids.length) return 0;
  // next visit syncs again from Strava, so clearing the stamp too keeps the two in step
  await db().from('daily_progress').delete().in('runner_id', ids);
  await db().from('runners').update({ last_synced_at: null }).in('id', ids);
  return ids.length;
}
