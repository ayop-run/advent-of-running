import type { Notification } from '@/lib/notifications';
import { db } from './db';
import { notify } from './notify';

type Who = { id: string; nickname: string; display_name: string; avatar_url: string | null; official: boolean };

/**
 * Your latest notifications, newest first. A hung ornament shows only the sender's initial and
 * the ornament: who sent it stays a surprise until Christmas, like on the tree.
 */
export async function listNotifications(me: string): Promise<{ items: Notification[]; unread: number }> {
  const { data: rows, error } = await db()
    .from('notifications')
    .select('id, kind, actor, hung_id, created_at, read_at')
    .eq('recipient', me)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  if (!rows?.length) return { items: [], unread: 0 };

  const actors = [...new Set(rows.map((r) => r.actor as string))];
  const hungIds = rows.map((r) => r.hung_id).filter(Boolean) as string[];
  const [{ data: who }, { data: hung }, { data: follows }, { data: gave }] = await Promise.all([
    db().from('runners').select('id, nickname, display_name, avatar_url, official').in('id', actors),
    hungIds.length ? db().from('ornaments_hung').select('id, from_name, ornament_id').in('id', hungIds) : Promise.resolve({ data: [] }),
    db().from('follows').select('followee').eq('follower', me).in('followee', actors),
    db().from('ornaments_hung').select('tree_owner').eq('from_runner', me).in('tree_owner', actors),
  ]);
  const byId = new Map(((who ?? []) as Who[]).map((w) => [w.id, w]));
  const hungById = new Map((hung ?? []).map((h) => [h.id as string, h as { from_name: string; ornament_id: string }]));
  const following = new Set((follows ?? []).map((f) => f.followee as string));
  const given = new Set((gave ?? []).map((g) => g.tree_owner as string));

  const items: Notification[] = [];
  for (const r of rows) {
    const base = { id: r.id as string, createdAt: r.created_at as string, read: Boolean(r.read_at) };
    if (r.kind === 'hung') {
      const h = hungById.get(r.hung_id as string);
      if (!h) continue; // the ornament was removed
      items.push({ ...base, kind: 'hung', initial: h.from_name.trim().charAt(0).toUpperCase() || '?', ornamentId: h.ornament_id });
      continue;
    }
    const w = byId.get(r.actor as string);
    if (!w) continue;
    const person = { nickname: w.nickname, name: w.display_name, avatarUrl: w.avatar_url, official: w.official };
    if (r.kind === 'followed') items.push({ ...base, kind: 'followed', who: person, following: following.has(w.id) });
    else items.push({ ...base, kind: 'asked', who: person, given: given.has(w.id) });
  }
  return { items, unread: rows.filter((r) => !r.read_at).length };
}

export async function unreadCount(me: string) {
  const { count, error } = await db().from('notifications').select('id', { count: 'exact', head: true }).eq('recipient', me).is('read_at', null);
  if (error) throw error;
  return count ?? 0;
}

export async function markAllRead(me: string) {
  const { error } = await db().from('notifications').update({ read_at: new Date().toISOString() }).eq('recipient', me).is('read_at', null);
  if (error) throw error;
}

/** Ask a friend to hang an ornament on your tree: once per friend, and not if they already did. */
export async function askToHang(me: string, friend: string): Promise<'asked' | 'already_hung'> {
  const { data } = await db().from('ornaments_hung').select('id').eq('tree_owner', me).eq('from_runner', friend).maybeSingle();
  if (data) return 'already_hung';
  await notify(friend, me, 'asked');
  return 'asked';
}

/** Tree names of the friends you asked, so the button shows "Asked". */
export async function askedByMe(me: string): Promise<string[]> {
  const { data, error } = await db().from('notifications').select('recipient').eq('actor', me).eq('kind', 'asked');
  if (error) throw error;
  const ids = (data ?? []).map((r) => r.recipient as string);
  if (!ids.length) return [];
  const { data: who } = await db().from('runners').select('nickname').in('id', ids);
  return (who ?? []).map((w) => w.nickname as string);
}
