import { NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { sessionRunnerId } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

/**
 * A tree and its sealed ornaments. Messages stay in the database, except the one the
 * signed-in runner hung themself (so they can read and edit it). `real` is false for the
 * seed trees, which signed-out visitors see as the browser demo instead.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ nickname: string }> }) {
  const nick = (await params).nickname.toLowerCase();
  const { data: owner } = await db()
    .from('runners')
    .select('id, nickname, display_name, avatar_url, strava_athlete_id')
    .eq('nickname', nick)
    .maybeSingle();
  if (!owner) return NextResponse.json({ tree: null, real: false });

  const me = await sessionRunnerId();
  const { data: rows } = await db()
    .from('ornaments_hung')
    .select('id, ornament_id, from_name, from_runner, hint, message, created_at')
    .eq('tree_owner', owner.id)
    .eq('hidden', false)
    .order('created_at');

  return NextResponse.json({
    real: owner.strava_athlete_id > 0,
    tree: {
      nickname: owner.nickname,
      displayName: owner.display_name,
      avatarUrl: owner.avatar_url,
      ornaments: (rows ?? []).map((r) => {
        const mine = !!me && r.from_runner === me;
        return {
          id: r.id,
          ornamentId: r.ornament_id,
          from: r.from_name,
          hint: r.hint,
          createdAt: r.created_at,
          mine,
          message: mine ? r.message : '',
        };
      }),
    },
  });
}
