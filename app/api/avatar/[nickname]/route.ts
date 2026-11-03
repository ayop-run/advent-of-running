import { NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { sessionRunnerId } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

/**
 * A runner's Strava profile photo, served from this site. Strava's image host sends no CORS
 * headers, so the tree pictures (drawn on a canvas) can only use it through here. Only the
 * runner themself gets it (Strava API Policy 2.3), and official accounts' logos to everyone.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ nickname: string }> }) {
  const nick = (await params).nickname.toLowerCase();
  const { data } = await db().from('runners').select('id, avatar_url, strava_athlete_id').eq('nickname', nick).maybeSingle();
  const mine = !!data && data.id === (await sessionRunnerId());
  if (!data || (!mine && data.strava_athlete_id > 0)) return new NextResponse(null, { status: 404 });
  const url = data.avatar_url;
  if (!url?.startsWith('https://')) return new NextResponse(null, { status: 404 });

  const res = await fetch(url, { cache: 'no-store' }).catch(() => null);
  const type = res?.headers.get('content-type') ?? '';
  if (!res?.ok || !type.startsWith('image/')) return new NextResponse(null, { status: 404 });
  return new NextResponse(res.body, {
    headers: { 'Content-Type': type, 'Cache-Control': mine ? 'private, max-age=3600' : 'public, max-age=3600' },
  });
}
