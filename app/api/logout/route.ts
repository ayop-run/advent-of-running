import { NextResponse } from 'next/server';
import { clearedSessionCookie } from '@/lib/server/session';

export function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(...clearedSessionCookie());
  return res;
}
