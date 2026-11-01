import { NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { sessionRunnerId } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

/** Body `{ message }`: beta feedback, signed in or not. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  // bots fill in every field, people never see this one
  if (body?.website) return NextResponse.json({ ok: true });
  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  if (!message || message.length > 1000) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const { error } = await db().from('feedback').insert({ runner_id: await sessionRunnerId(), message });
  if (error) {
    console.error('feedback', error.message);
    return NextResponse.json({ error: 'unknown' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
