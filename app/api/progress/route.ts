import { NextResponse } from 'next/server';
import { runnerProgress } from '@/lib/server/progress';
import { currentRunner } from '@/lib/server/runner';

export const dynamic = 'force-dynamic';

/** The signed-in runner's own calendar and pouch. Never exposed for other runners. */
export async function GET() {
  const me = await currentRunner();
  if (!me) return NextResponse.json({ error: 'signed_out' }, { status: 401 });
  try {
    return NextResponse.json(await runnerProgress(me.id, me.timeZone));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'sync_failed' }, { status: 502 });
  }
}
