import { NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { editToken, sessionRunnerId, validEditToken } from '@/lib/server/session';
import { BY_ID, HINTS } from '@/lib/ornaments';

const str = (v: unknown, max: number) => typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max;

/** Name, message and hint as sent by the hang form. */
function validBody(b: Record<string, unknown> | null) {
  return !!b && str(b.nickname, 30) && typeof b.ornamentId === 'string' && !!BY_ID[b.ornamentId] && str(b.from, 30) && str(b.message, 200) && HINTS.includes(b.hint as never);
}

async function treeOwner(nickname: string) {
  const { data } = await db().from('runners').select('id, time_zone').eq('nickname', nickname.toLowerCase()).maybeSingle();
  return data;
}

/** Hanging and editing close at the end of December 24 in the owner's time zone. */
function closed(timeZone: string) {
  const [, month, day] = new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date()).split('-').map(Number);
  return month === 12 && day >= 25;
}

/**
 * Hang an ornament. One per tree: a signed-in runner who already hung one gets that one back.
 * Special and rare ornaments must be earned (an unwrapped door or weekly prize, not given yet).
 * Guests get an edit token for their own ornament.
 */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!validBody(b)) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const ornament = BY_ID[b.ornamentId];
  const runnerId = await sessionRunnerId();
  const owner = await treeOwner(b.nickname);
  if (!owner) return NextResponse.json({ error: 'tree_not_found' }, { status: 404 });

  if (runnerId) {
    const { data: existing } = await db()
      .from('ornaments_hung')
      .select('id')
      .eq('tree_owner', owner.id)
      .eq('from_runner', runnerId)
      .maybeSingle();
    if (existing) return NextResponse.json({ id: existing.id, existing: true });
  }

  let pouchId: string | null = null;
  if (ornament.tier !== 'basic') {
    if (!runnerId) return NextResponse.json({ error: 'not_earned' }, { status: 403 });
    const { data: slot } = await db()
      .from('pouch')
      .select('id')
      .eq('runner_id', runnerId)
      .eq('ornament_id', ornament.id)
      .eq('used', false)
      .order('earned_on')
      .limit(1)
      .maybeSingle();
    if (!slot) return NextResponse.json({ error: 'not_earned' }, { status: 403 });
    pouchId = slot.id;
  }

  const { data, error } = await db().rpc('hang_ornament', {
    nick: b.nickname,
    ornament_id: ornament.id,
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
  if (pouchId) await db().from('pouch').update({ used: true, hung_id: data }).eq('id', pouchId);
  return NextResponse.json({ id: data, editToken: runnerId ? undefined : editToken(data) });
}

/** Edit your ornament on a tree until hanging closes. An earned ornament stays; free ones can be swapped. */
export async function PATCH(req: Request) {
  const b = await req.json().catch(() => null);
  if (!validBody(b)) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const owner = await treeOwner(b.nickname);
  if (!owner) return NextResponse.json({ error: 'tree_not_found' }, { status: 404 });
  if (closed(owner.time_zone)) return NextResponse.json({ error: 'hanging_closed' }, { status: 403 });

  const runnerId = await sessionRunnerId();
  const query = db().from('ornaments_hung').select('id, ornament_id').eq('tree_owner', owner.id);
  const { data: mine } = runnerId
    ? await query.eq('from_runner', runnerId).maybeSingle()
    : typeof b.id === 'string' && validEditToken(b.id, b.editToken)
      ? await query.eq('id', b.id).maybeSingle()
      : { data: null };
  if (!mine) return NextResponse.json({ error: 'not_yours' }, { status: 403 });

  const earned = BY_ID[mine.ornament_id]?.tier !== 'basic';
  if (earned ? b.ornamentId !== mine.ornament_id : BY_ID[b.ornamentId].tier !== 'basic') {
    return NextResponse.json({ error: 'not_earned' }, { status: 403 });
  }
  const { error } = await db()
    .from('ornaments_hung')
    .update({ ornament_id: b.ornamentId, from_name: b.from.trim(), hint: b.hint, message: b.message.trim() })
    .eq('id', mine.id);
  if (error) return NextResponse.json({ error: 'unknown' }, { status: 500 });
  return NextResponse.json({ id: mine.id });
}
