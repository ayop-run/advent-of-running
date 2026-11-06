import type { Friend } from '@/lib/friends';
import { db } from './db';

const PUBLIC = 'id, nickname, display_name, avatar_url, strava_athlete_id, official';
type Row = { id: string; nickname: string; display_name: string; avatar_url: string | null; strava_athlete_id: number; official: boolean };

/** Runners who finished sign-up; the filter below drops seed trees (negative Strava ids) that aren't official. */
const runners = () => db().from('runners').select(PUBLIC).eq('onboarded', true);
/** Real runners (signed up with Strava) and official accounts like AYOP, never the other seed trees. */
const visible = (r: Row) => r.strava_athlete_id > 0 || r.official;

/**
 * Your friends: everyone you follow, plus everyone you swapped ornaments with (they hung one
 * on your tree, or you on theirs). Names and tree links only, never runs.
 */
export async function friendsOf(runnerId: string): Promise<Friend[]> {
  const [{ data: follows }, { data: toMe }, { data: fromMe }] = await Promise.all([
    db().from('follows').select('followee').eq('follower', runnerId),
    db().from('ornaments_hung').select('from_runner, ornament_id').eq('tree_owner', runnerId).not('from_runner', 'is', null),
    db().from('ornaments_hung').select('tree_owner, ornament_id').eq('from_runner', runnerId),
  ]);
  const following = new Set((follows ?? []).map((f) => f.followee as string));
  // which ornaments each friend hung on your tree, and which one you hung on theirs
  const theirs = new Map<string, string[]>();
  for (const r of toMe ?? []) theirs.set(r.from_runner as string, [...(theirs.get(r.from_runner as string) ?? []), r.ornament_id as string]);
  const mine = new Map((fromMe ?? []).map((r) => [r.tree_owner as string, r.ornament_id as string]));

  const ids = [...new Set([...following, ...theirs.keys(), ...mine.keys()])].filter((id) => id !== runnerId);
  if (!ids.length) return [];
  const { data, error } = await runners().in('id', ids);
  if (error) throw error;
  return ((data ?? []) as Row[]).filter(visible).map((r) => toFriend(r, { following: following.has(r.id), theirs: theirs.get(r.id) ?? [], mine: mine.get(r.id) ?? null }));
}

/** Runners whose name or tree name contains `query` (at least 2 characters), up to 20. */
export async function searchRunners(runnerId: string, query: string): Promise<Friend[]> {
  // PostgREST filter syntax uses , ( ) and ilike uses % _ \, so those can't come from the user
  const term = query.trim().toLowerCase().replace(/[,()%_\\*"']/g, ' ').replace(/\s+/g, ' ').trim();
  if (term.length < 2) return [];
  // a database error must not look like "nobody found"
  const { data, error } = await runners()
    .neq('id', runnerId)
    // quoted, so a search with a space ("sujin lee") stays one value
    .or(`nickname.ilike."%${term}%",display_name.ilike."%${term}%"`)
    .order('display_name')
    .limit(25);
  if (error) throw error;
  const list = ((data ?? []) as Row[]).filter(visible).slice(0, 20);
  if (!list.length) return [];
  const { data: follows } = await db().from('follows').select('followee').eq('follower', runnerId).in('followee', list.map((r) => r.id));
  const following = new Set((follows ?? []).map((f) => f.followee as string));
  return list.map((r) => toFriend(r, { following: following.has(r.id), theirs: [], mine: null }));
}

/** The runner behind a tree name, if they're a real runner or an official account. */
export async function runnerByNickname(nickname: string): Promise<string | null> {
  const { data, error } = await runners().eq('nickname', nickname.toLowerCase()).maybeSingle();
  if (error) throw error;
  const row = data as Row | null;
  return row && visible(row) ? row.id : null;
}

function toFriend(r: Row, c: { following: boolean; theirs: string[]; mine: string | null }): Friend {
  // others' Strava photos are never shown (Strava API Policy 2.3); official logos are
  return { nickname: r.nickname, name: r.display_name, avatarUrl: r.strava_athlete_id > 0 ? null : r.avatar_url, hung: c.theirs.length, given: c.mine ? 1 : 0, theirs: c.theirs, mine: c.mine, visited: false, following: c.following, official: r.official };
}
