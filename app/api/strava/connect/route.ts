import { randomBytes } from 'crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { cookieOptions } from '@/lib/server/session';
import { authorizeUrl } from '@/lib/server/strava';

/**
 * Step 1 of Strava login: send the runner to Strava's consent screen. Sign-up passes the
 * chosen tree name and time zone (?nick=&tz=), kept in a cookie until Strava sends them back.
 */
export function GET(req: NextRequest) {
  const state = randomBytes(16).toString('hex');
  const res = NextResponse.redirect(authorizeUrl(`${req.nextUrl.origin}/api/strava/callback`, state));
  res.cookies.set('aor_oauth_state', state, cookieOptions(600));
  const nick = req.nextUrl.searchParams.get('nick');
  const tz = req.nextUrl.searchParams.get('tz');
  if (nick || tz) res.cookies.set('aor_signup', JSON.stringify({ nick, tz }), cookieOptions(600));
  return res;
}
