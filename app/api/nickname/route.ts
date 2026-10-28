import { NextResponse, type NextRequest } from 'next/server';
import { checkNickname } from '@/lib/nickname';
import { db } from '@/lib/server/db';
import { sessionRunnerId } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

/** Sign-up: is this tree name free? The signed-in runner's own name counts as free. */
export async function GET(req: NextRequest) {
  const name = (req.nextUrl.searchParams.get('name') ?? '').trim().toLowerCase();
  if (!checkNickname(name).ok) return NextResponse.json({ available: false });
  const { data, error } = await db().from('runners').select('id').eq('nickname', name).maybeSingle();
  if (error) return NextResponse.json({ error: 'unknown' }, { status: 500 });
  const me = await sessionRunnerId();
  return NextResponse.json({ available: !data || data.id === me });
}
