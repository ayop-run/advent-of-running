import { NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { checkNickname } from '@/lib/nickname';
import { currentRunner } from '@/lib/server/runner';
import { clearedSessionCookie } from '@/lib/server/session';
import { accessToken, deauthorize } from '@/lib/server/strava';

export const dynamic = 'force-dynamic';

/** The signed-in runner's profile, or { runner: null }. */
export async function GET() {
  const me = await currentRunner();
  if (!me) return NextResponse.json({ runner: null });
  const { id: _id, ...runner } = me;
  return NextResponse.json({ runner });
}

const validTimeZone = (tz: unknown) => {
  if (typeof tz !== 'string') return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

/** Onboarding / settings: nickname, time zone, who can hang, email opt-in. */
export async function PATCH(req: Request) {
  const me = await currentRunner();
  if (!me) return NextResponse.json({ error: 'signed_out' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const nickname = typeof body?.nickname === 'string' ? body.nickname.trim().toLowerCase() : '';
  if (
    !checkNickname(nickname).ok ||
    !validTimeZone(body.timeZone) ||
    !['anyone', 'signed_in'].includes(body.hangPolicy) ||
    typeof body.emailOptIn !== 'boolean'
  ) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const { error } = await db()
    .from('runners')
    .update({ nickname, time_zone: body.timeZone, hang_policy: body.hangPolicy, email_opt_in: body.emailOptIn, onboarded: true })
    .eq('id', me.id);
  if (error?.code === '23505') return NextResponse.json({ error: 'nickname_taken' }, { status: 409 });
  if (error) return NextResponse.json({ error: 'unknown' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** "Disconnect Strava and delete my data": revoke Strava access, delete the runner, sign out. */
export async function DELETE() {
  const me = await currentRunner();
  if (!me) return NextResponse.json({ error: 'signed_out' }, { status: 401 });
  try {
    const token = await accessToken(me.id);
    if (token) await deauthorize(token);
  } catch {
    /* access already revoked on Strava: delete anyway */
  }
  const { error } = await db().from('runners').delete().eq('id', me.id);
  if (error) return NextResponse.json({ error: 'unknown' }, { status: 500 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(...clearedSessionCookie());
  return res;
}
