import { NextResponse } from 'next/server';
import { dropStaleRuns } from '@/lib/server/forget';

export const dynamic = 'force-dynamic';

/** Daily (vercel.json): forget synced runs older than 7 days. Vercel sends CRON_SECRET. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'forbidden' }, { status: 401 });
  }
  const runners = await dropStaleRuns();
  return NextResponse.json({ ok: true, runners });
}
