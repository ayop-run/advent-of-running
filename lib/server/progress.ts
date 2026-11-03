import { DOORS, WEEKLY, adventDate, adventDay, adventStart, computeProgress, doorOrnaments, todayIn, type DayRuns, type Progress } from '@/lib/calendar';
import { BASIC } from '@/lib/ornaments';
import { db } from './db';
import { accessToken, fetchActivities, isCountedRun } from './strava';

const SYNC_EVERY_MS = 10 * 60_000;

/**
 * The runner's Advent calendar. Pulls their runs from Strava first if the last
 * sync is older than 10 minutes, then stores km per day and awards ornaments to the pouch.
 * Only ever returned to the runner themself (Strava terms).
 */
export async function runnerProgress(runnerId: string, timeZone: string): Promise<Progress> {
  const date = todayIn(timeZone);
  const start = adventStart(date);
  const n = adventDay(date, start);
  const today = n < 1 ? 0 : n > DOORS ? 99 : n;
  const first = start;
  const last = adventDate(start, DOORS);

  const { data: runner } = await db().from('runners').select('last_synced_at').eq('id', runnerId).single();
  let syncedAt: string | null = runner?.last_synced_at ?? null;
  const stale = !syncedAt || Date.now() - new Date(syncedAt).getTime() > SYNC_EVERY_MS;

  if (today > 0 && stale) {
    const token = await accessToken(runnerId);
    if (token) {
      // A day of slack on both sides covers every time zone; start_date_local decides the day.
      const after = Date.parse(`${first}T00:00:00Z`) / 1000 - 86400;
      const before = Date.parse(`${last}T00:00:00Z`) / 1000 + 2 * 86400;
      const activities = await fetchActivities(token, after, before);

      const days = new Map<number, DayRuns>();
      for (const a of activities.filter(isCountedRun)) {
        const date = a.start_date_local.slice(0, 10);
        if (date < first || date > last) continue;
        const day = adventDay(date, start);
        const km = a.distance / 1000;
        const d = days.get(day) ?? { day, km: 0, runs: 0, longestKm: 0 };
        days.set(day, { day, km: d.km + km, runs: d.runs + 1, longestKm: Math.max(d.longestKm, km) });
      }

      // Replace the season's rows, so deleted or edited runs drop out too.
      await db().from('daily_progress').delete().eq('runner_id', runnerId).gte('day', first).lte('day', last);
      if (days.size) {
        await db()
          .from('daily_progress')
          .insert(
            [...days.values()].map((d) => ({
              runner_id: runnerId,
              day: adventDate(start, d.day),
              km: d.km.toFixed(2),
              runs: d.runs,
              longest_km: d.longestKm.toFixed(2),
            })),
          );
      }
      syncedAt = new Date().toISOString();
      await db().from('runners').update({ last_synced_at: syncedAt }).eq('id', runnerId);
    }
  }

  const { data: rows } = await db()
    .from('daily_progress')
    .select('day, km, runs, longest_km')
    .eq('runner_id', runnerId)
    .gte('day', first)
    .lte('day', last);
  const days: DayRuns[] = (rows ?? []).map((r) => ({
    day: adventDay(String(r.day).slice(0, 10), start),
    km: Number(r.km),
    runs: r.runs,
    longestKm: Number(r.longest_km),
  }));
  const progress = computeProgress(days, today, start);
  const ornaments = doorOrnaments(`${runnerId}:${start}`);

  // Award ornaments for opened doors and finished weeks. `source` makes this idempotent.
  const earned = [
    ...progress.doors.flatMap((s, i) => (s === 'opened' ? [{ source: `door-${i + 1}`, ornament_id: ornaments[i], day: i + 1 }] : [])),
    ...WEEKLY.filter((w) => progress.weeksDone.includes(w.week)).map((w) => ({ source: `week-${w.week}`, ornament_id: w.reward, day: w.to })),
  ];
  if (earned.length) {
    await db()
      .from('pouch')
      .upsert(
        earned.map((e) => ({
          runner_id: runnerId,
          ornament_id: e.ornament_id,
          source: `${start}:${e.source}`,
          earned_on: adventDate(start, Math.min(e.day, DOORS)),
        })),
        { onConflict: 'runner_id,source', ignoreDuplicates: true },
      );
  }
  const { data: pouch } = await db()
    .from('pouch')
    .select('ornament_id, source, used, hung:hung_id(tree:tree_owner(display_name))')
    .eq('runner_id', runnerId)
    .order('earned_on', { ascending: false });

  const prefix = `${start}:door-`;
  const doorOf = (source: string | null) => (source?.startsWith(prefix) ? Number(source.slice(prefix.length)) : null);
  const given: Record<number, string> = {};
  for (const p of pouch ?? []) {
    const door = doorOf(p.source);
    // embedded rows come back as an object (one-to-one) even though the types say array
    const hung = p.hung as unknown as { tree: { display_name: string } | null } | null;
    if (door && p.used && hung?.tree) given[door] = hung.tree.display_name;
  }

  return {
    ...progress,
    ornaments,
    given,
    unwrapped: (pouch ?? []).filter((p) => !p.used).map((p) => ({ ornamentId: p.ornament_id, door: doorOf(p.source) })),
    found: [...new Set([...BASIC.map((o) => o.id), ...(pouch ?? []).map((p) => p.ornament_id)])],
    syncedAt,
  };
}
