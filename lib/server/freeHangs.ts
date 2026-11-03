import { BASIC, FREE_HANGS } from '@/lib/ornaments';
import { db } from './db';

const BASIC_IDS = BASIC.map((o) => o.id);

/** Free starter ornaments the runner can still hang this season (since `start`, YYYY-MM-DD). */
export async function freeLeft(runnerId: string, start: string): Promise<number> {
  const { count } = await db()
    .from('ornaments_hung')
    .select('id', { count: 'exact', head: true })
    .eq('from_runner', runnerId)
    .in('ornament_id', BASIC_IDS)
    .gte('created_at', start);
  return Math.max(0, FREE_HANGS - (count ?? 0));
}
