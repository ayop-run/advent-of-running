import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

/**
 * Login session: a signed, httpOnly cookie holding the runner ID and an expiry.
 * Strava is not a Supabase Auth provider, so the app signs its own cookie.
 */
const NAME = 'aor_session';
const MAX_AGE = 60 * 60 * 24 * 60; // 60 days

export const sign = (value: string) => createHmac('sha256', process.env.SESSION_SECRET!).update(value).digest('base64url');

export const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge,
});

/** [name, value, options] for `response.cookies.set(...)`. */
export function sessionCookie(runnerId: string) {
  const value = `${runnerId}.${Math.floor(Date.now() / 1000) + MAX_AGE}`;
  return [NAME, `${value}.${sign(value)}`, cookieOptions(MAX_AGE)] as const;
}

export const clearedSessionCookie = () => [NAME, '', cookieOptions(0)] as const;

/** Runner ID of the signed-in runner, or null. */
export async function sessionRunnerId(): Promise<string | null> {
  const raw = (await cookies()).get(NAME)?.value;
  if (!raw) return null;
  const cut = raw.lastIndexOf('.');
  const value = raw.slice(0, cut);
  const given = Buffer.from(raw.slice(cut + 1));
  const expected = Buffer.from(sign(value));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  const [id, exp] = value.split('.');
  return Number(exp) > Date.now() / 1000 ? id : null;
}

/** Lets a guest (no account) edit the ornament they hung: kept in their browser, checked here. */
export const editToken = (hungId: string) => sign(`hung:${hungId}`);

export function validEditToken(hungId: string, token: unknown) {
  if (typeof token !== 'string') return false;
  const a = Buffer.from(token);
  const b = Buffer.from(editToken(hungId));
  return a.length === b.length && timingSafeEqual(a, b);
}
