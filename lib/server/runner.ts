import type { Me } from '@/lib/data';
import { db } from './db';
import { sessionRunnerId } from './session';

/** The signed-in runner's own profile, or null when signed out. */
export async function currentRunner(): Promise<(Me & { id: string }) | null> {
  const id = await sessionRunnerId();
  if (!id) return null;
  const { data } = await db()
    .from('runners')
    .select('id, nickname, display_name, avatar_url, time_zone, hang_policy, email_opt_in, onboarded')
    .eq('id', id)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    nickname: data.nickname,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    timeZone: data.time_zone,
    hangPolicy: data.hang_policy,
    emailOptIn: data.email_opt_in,
    onboarded: data.onboarded,
  };
}

export const NICKNAME = /^[a-z0-9-]{2,30}$/;

/** A free nickname based on the runner's first name: "mina", then "mina-2", … */
export async function freeNickname(firstName: string) {
  let base = firstName.toLowerCase().normalize('NFKD').replace(/[^a-z0-9-]/g, '').slice(0, 24);
  if (base.length < 2) base = 'runner';
  const { data } = await db().from('runners').select('nickname').like('nickname', `${base}%`);
  const taken = new Set((data ?? []).map((r) => r.nickname));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
