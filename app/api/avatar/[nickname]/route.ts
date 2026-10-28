import { NextResponse } from 'next/server';
import { db } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

/**
 * A runner's Strava profile photo, served from this site. Strava's image host sends no CORS
 * headers, so the tree pictures (drawn on a canvas) can only use it through here.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ nickname: string }> }) {
  const nick = (await params).nickname.toLowerCase();
  const { data } = await db().from('runners').select('avatar_url').eq('nickname', nick).maybeSingle();
  const url = data?.avatar_url;
  if (!url?.startsWith('https://')) return new NextResponse(null, { status: 404 });

  const res = await fetch(url, { cache: 'no-store' }).catch(() => null);
  const type = res?.headers.get('content-type') ?? '';
  if (!res?.ok || !type.startsWith('image/')) return new NextResponse(null, { status: 404 });
  return new NextResponse(res.body, {
    headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=3600' },
  });
}
