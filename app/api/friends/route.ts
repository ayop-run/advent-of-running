import { NextResponse, type NextRequest } from 'next/server';
import { friendsOf, searchRunners } from '@/lib/server/friends';
import { currentRunner } from '@/lib/server/runner';

export const dynamic = 'force-dynamic';

/**
 * The signed-in runner's friends (people they follow or swapped ornaments with), or with
 * `?q=` the runners whose name or tree name matches. Names and tree links only.
 */
export async function GET(req: NextRequest) {
  const me = await currentRunner();
  if (!me) return NextResponse.json({ error: 'signed_out' }, { status: 401 });
  const q = req.nextUrl.searchParams.get('q');
  try {
    if (q !== null) return NextResponse.json({ results: await searchRunners(me.id, q.slice(0, 40)) });
    return NextResponse.json({ friends: await friendsOf(me.id) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'unknown' }, { status: 500 });
  }
}
