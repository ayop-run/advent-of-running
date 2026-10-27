import { NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { sessionRunnerId } from '@/lib/server/session';
import { BY_ID, HINTS } from '@/lib/ornaments';

/** Hang an ornament. Signed-in runners are recorded as the sender (needed for "signed-in only" trees). */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const str = (v: unknown, max: number) => typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max;
  if (!b || !str(b.nickname, 30) || !str(b.ornamentId, 40) || !str(b.from, 30) || !str(b.message, 200) || !HINTS.includes(b.hint)) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const ornament = BY_ID[b.ornamentId];
  if (!ornament) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const runnerId = await sessionRunnerId();

  // Special and rare ornaments must come from the sender's pouch (earned by running).
  let pouchId: string | null = null;
  if (ornament.tier !== 'basic') {
    if (!runnerId) return NextResponse.json({ error: 'not_earned' }, { status: 403 });
    const { data: slot } = await db()
      .from('pouch')
      .select('id')
      .eq('runner_id', runnerId)
      .eq('ornament_id', ornament.id)
      .eq('used', false)
      .limit(1)
      .maybeSingle();
    if (!slot) return NextResponse.json({ error: 'not_earned' }, { status: 403 });
    pouchId = slot.id;
  }

  const { data, error } = await db().rpc('hang_ornament', {
    nick: b.nickname,
    ornament_id: b.ornamentId,
    from_name: b.from,
    hint: b.hint,
    message: b.message,
    from_email: typeof b.email === 'string' && b.email.length <= 200 ? b.email : null,
    from_runner: runnerId,
  });
  if (error) {
    const known = ['tree_not_found', 'sign_in_required', 'hanging_closed'].find((k) => error.message.includes(k));
    return NextResponse.json({ error: known ?? 'unknown' }, { status: known ? 403 : 500 });
  }
  if (pouchId) await db().from('pouch').update({ used: true }).eq('id', pouchId);
  return NextResponse.json({ id: data });
}
