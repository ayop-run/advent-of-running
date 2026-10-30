import { NextResponse } from 'next/server';
import { runnerByNickname } from '@/lib/server/friends';
import { askedByMe, askToHang } from '@/lib/server/notifications';
import { currentRunner } from '@/lib/server/runner';

export const dynamic = 'force-dynamic';

/** Tree names of the friends you asked to hang an ornament on your tree. */
export async function GET() {
  const me = await currentRunner();
  if (!me) return NextResponse.json({ error: 'signed_out' }, { status: 401 });
  try {
    return NextResponse.json({ asked: await askedByMe(me.id) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'unknown' }, { status: 500 });
  }
}

/** Body `{ nickname }`: ask that friend to hang an ornament on your tree. They get a notification. */
export async function POST(req: Request) {
  const me = await currentRunner();
  if (!me) return NextResponse.json({ error: 'signed_out' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const nickname = typeof body?.nickname === 'string' ? body.nickname.trim().toLowerCase() : '';
  const friend = nickname ? await runnerByNickname(nickname) : null;
  if (!friend) return NextResponse.json({ error: 'tree_not_found' }, { status: 404 });
  if (friend === me.id) return NextResponse.json({ error: 'own_tree' }, { status: 400 });
  return NextResponse.json({ result: await askToHang(me.id, friend) });
}
