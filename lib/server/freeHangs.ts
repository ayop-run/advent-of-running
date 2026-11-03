import { freeStarters } from '@/lib/calendar';
import { db } from './db';

/** The runner's free starters they haven't hung yet this season (since `start`, YYYY-MM-DD). */
export async function startersLeft(runnerId: string, start: string): Promise<string[]> {
  const all = freeStarters(`${runnerId}:${start}`);
  const { data } = await db()
    .from('ornaments_hung')
    .select('ornament_id')
    .eq('from_runner', runnerId)
    .in('ornament_id', all)
    .gte('created_at', start);
  const hung = new Set((data ?? []).map((r) => r.ornament_id));
  return all.filter((id) => !hung.has(id));
}
