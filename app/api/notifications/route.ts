import { NextResponse, type NextRequest } from 'next/server';
import { listNotifications, markAllRead, unreadCount } from '@/lib/server/notifications';
import { currentRunner } from '@/lib/server/runner';

export const dynamic = 'force-dynamic';

/** Your notifications and how many are unread; `?count=1` for just the count (the nav dot). */
export async function GET(req: NextRequest) {
  const me = await currentRunner();
  if (!me) return NextResponse.json({ error: 'signed_out' }, { status: 401 });
  try {
    if (req.nextUrl.searchParams.get('count')) return NextResponse.json({ unread: await unreadCount(me.id) });
    return NextResponse.json(await listNotifications(me.id));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'unknown' }, { status: 500 });
  }
}

/** Marks every notification read (opening the page). */
export async function POST() {
  const me = await currentRunner();
  if (!me) return NextResponse.json({ error: 'signed_out' }, { status: 401 });
  try {
    await markAllRead(me.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'unknown' }, { status: 500 });
  }
}
