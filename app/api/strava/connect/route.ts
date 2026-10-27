import { randomBytes } from 'crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { cookieOptions } from '@/lib/server/session';
import { authorizeUrl } from '@/lib/server/strava';

/** Step 1 of Strava login: send the runner to Strava's consent screen. */
export function GET(req: NextRequest) {
  const state = randomBytes(16).toString('hex');
  const res = NextResponse.redirect(authorizeUrl(`${req.nextUrl.origin}/api/strava/callback`, state));
  res.cookies.set('aor_oauth_state', state, cookieOptions(600));
  return res;
}
