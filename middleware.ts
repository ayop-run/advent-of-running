import { NextResponse, type NextRequest } from 'next/server';

/**
 * Before launch, production shows only the coming-soon page: set COMING_SOON=1 on Vercel's
 * Production environment. Staging (Preview) leaves it unset and runs the full app.
 */
const OPEN = ['/coming-soon', '/api/launch', '/favicon.svg', '/privacy', '/strava/powered-by-strava.svg'];

export function middleware(req: NextRequest) {
  if (process.env.COMING_SOON !== '1') return NextResponse.next();
  const path = req.nextUrl.pathname;
  if (OPEN.includes(path)) return NextResponse.next();
  if (path.startsWith('/api/')) return NextResponse.json({ error: 'coming_soon' }, { status: 503 });
  // every page shows the coming-soon door, keeping the address the visitor typed
  return NextResponse.rewrite(new URL('/coming-soon', req.url));
}

export const config = {
  // skip Next's own files (scripts, styles, fonts, images)
  matcher: ['/((?!_next/).*)'],
};
