import { NextResponse } from 'next/server';
import { db } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validTimeZone = (tz: unknown): tz is string => {
  if (typeof tz !== 'string' || !tz) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

/**
 * Coming-soon page: remember an email for the launch news. Always answers { ok: true } for a
 * valid address, whether it was new or already on the list, so the list can't be probed.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  // bots fill in every field, people never see this one
  if (body?.website) return NextResponse.json({ ok: true });
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !EMAIL.test(email)) return NextResponse.json({ error: 'invalid_email' }, { status: 400 });

  const { error } = await db()
    .from('launch_signups')
    .upsert({ email, time_zone: validTimeZone(body.timeZone) ? body.timeZone : 'UTC' }, { onConflict: 'email', ignoreDuplicates: true });
  if (error) return NextResponse.json({ error: 'unknown' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
