import { NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { adventMonth } from '@/lib/calendar';
import { checkNickname } from '@/lib/nickname';
import { localDate } from '@/lib/server/progress';
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

/** Days 1–25 of Advent in this time zone, when doors and runs are counted by local date. */
function duringAdvent(timeZone: string) {
  const { month, day } = localDate(timeZone);
  return month === adventMonth(month) && day <= 25;
}

/**
 * Sign-up and Me settings: tree name, time zone, email opt-in. The time zone is locked during
 * Advent, since moving it would shift which day each run counts for.
 */
export async function PATCH(req: Request) {
  const me = await currentRunner();
  if (!me) return NextResponse.json({ error: 'signed_out' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const nickname = typeof body?.nickname === 'string' ? body.nickname.trim().toLowerCase() : '';
  if (
    !checkNickname(nickname).ok ||
    !validTimeZone(body.timeZone) ||
    typeof body.emailOptIn !== 'boolean'
  ) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  if (me.onboarded && body.timeZone !== me.timeZone && (duringAdvent(me.timeZone) || duringAdvent(body.timeZone))) {
    return NextResponse.json({ error: 'timezone_locked' }, { status: 409 });
  }
  const { error } = await db()
    .from('runners')
    .update({ nickname, time_zone: body.timeZone, email_opt_in: body.emailOptIn, onboarded: true })
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
