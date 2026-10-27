import { NextResponse } from 'next/server';
import { friendsOf } from '@/lib/server/progress';
import { currentRunner } from '@/lib/server/runner';

export const dynamic = 'force-dynamic';

/** Runners the signed-in runner swapped ornaments with (names and tree links only). */
export async function GET() {
  const me = await currentRunner();
  if (!me) return NextResponse.json({ error: 'signed_out' }, { status: 401 });
  return NextResponse.json({ friends: await friendsOf(me.id) });
}
