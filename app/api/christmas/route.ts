import { NextResponse } from 'next/server';
import { treeIsOpen } from '@/lib/server/christmas';
import { db } from '@/lib/server/db';
import { currentRunner } from '@/lib/server/runner';

export const dynamic = 'force-dynamic';

/**
 * Your own tree on Christmas morning: every sender's name and message.
 * Before Christmas (in your time zone) only how many are waiting; messages stay in the database.
 */
export async function GET() {
  const me = await currentRunner();
  if (!me) return NextResponse.json({ error: 'signed_out' }, { status: 401 });
  const open = treeIsOpen(me.timeZone);
  const { data: rows, error } = await db()
    .from('ornaments_hung')
    .select('id, ornament_id, from_name, hint, message, created_at')
    .eq('tree_owner', me.id)
    .eq('hidden', false)
    .order('created_at');
  if (error) return NextResponse.json({ error: 'unknown' }, { status: 500 });
  if (!open) return NextResponse.json({ open: false, count: rows.length, ornaments: [] });
  return NextResponse.json({
    open: true,
    count: rows.length,
    ornaments: rows.map((r) => ({
      id: r.id,
      ornamentId: r.ornament_id,
      from: r.from_name,
      hint: r.hint,
      message: r.message,
      createdAt: r.created_at,
    })),
  });
}
