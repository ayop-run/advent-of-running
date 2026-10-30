import { NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { runnerByNickname } from '@/lib/server/friends';
import { notify } from '@/lib/server/notify';
import { currentRunner } from '@/lib/server/runner';

export const dynamic = 'force-dynamic';

/** Body `{ nickname }`: the tree to follow or unfollow. */
async function target(req: Request) {
  const body = await req.json().catch(() => null);
  const nickname = typeof body?.nickname === 'string' ? body.nickname.trim().toLowerCase() : '';
  return nickname ? runnerByNickname(nickname) : null;
}

/** Follow a friend's tree. Following again is fine. */
export async function POST(req: Request) {
  const me = await currentRunner();
  if (!me) return NextResponse.json({ error: 'signed_out' }, { status: 401 });
  const id = await target(req);
  if (!id) return NextResponse.json({ error: 'tree_not_found' }, { status: 404 });
  if (id === me.id) return NextResponse.json({ error: 'own_tree' }, { status: 400 });
  const { error } = await db().from('follows').upsert({ follower: me.id, followee: id }, { onConflict: 'follower,followee', ignoreDuplicates: true });
  if (error) return NextResponse.json({ error: 'unknown' }, { status: 500 });
  await notify(id, me.id, 'followed');
  return NextResponse.json({ following: true });
}

/** Stop following. Unfollowing someone you don't follow is fine. */
export async function DELETE(req: Request) {
  const me = await currentRunner();
  if (!me) return NextResponse.json({ error: 'signed_out' }, { status: 401 });
  const id = await target(req);
  if (!id) return NextResponse.json({ error: 'tree_not_found' }, { status: 404 });
  const { error } = await db().from('follows').delete().eq('follower', me.id).eq('followee', id);
  if (error) return NextResponse.json({ error: 'unknown' }, { status: 500 });
  return NextResponse.json({ following: false });
}
