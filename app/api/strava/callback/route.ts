import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { freeNickname } from '@/lib/server/runner';
import { cookieOptions, sessionCookie } from '@/lib/server/session';
import { exchangeCode, tokenColumns } from '@/lib/server/strava';

/** Step 2 of Strava login: Strava sends the runner back here with a one-time code. */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const fail = (reason: string) => {
    const res = NextResponse.redirect(new URL(`/?login=${reason}`, url.origin));
    res.cookies.set('aor_oauth_state', '', cookieOptions(0));
    return res;
  };

  const state = req.cookies.get('aor_oauth_state')?.value;
  if (!state || state !== url.searchParams.get('state')) return fail('expired');
  if (url.searchParams.get('error')) return fail('denied');
  if (!(url.searchParams.get('scope') ?? '').includes('activity:read')) return fail('scope');
  const code = url.searchParams.get('code');
  if (!code) return fail('denied');

  let token;
  try {
    token = await exchangeCode(code);
  } catch {
    return fail('strava');
  }
  const athlete = token.athlete!;
  const avatar = athlete.profile?.startsWith('http') ? athlete.profile : null;

  const { data: existing } = await db()
    .from('runners')
    .select('id, onboarded')
    .eq('strava_athlete_id', athlete.id)
    .maybeSingle();

  let id: string;
  let onboarded: boolean;
  if (existing) {
    const { error } = await db().from('runners').update({ ...tokenColumns(token), avatar_url: avatar }).eq('id', existing.id);
    if (error) return fail('db');
    id = existing.id;
    onboarded = existing.onboarded;
  } else {
    const { data, error } = await db()
      .from('runners')
      .insert({
        strava_athlete_id: athlete.id,
        nickname: await freeNickname(athlete.firstname),
        display_name: athlete.firstname || 'Runner',
        avatar_url: avatar,
        ...tokenColumns(token),
      })
      .select('id')
      .single();
    if (error || !data) return fail('db');
    id = data.id;
    onboarded = false;
  }

  const res = NextResponse.redirect(new URL(onboarded ? '/tree' : '/onboarding', url.origin));
  res.cookies.set(...sessionCookie(id));
  res.cookies.set('aor_oauth_state', '', cookieOptions(0));
  return res;
}
