import type { Me } from '@/lib/me';
import { checkNickname, cleanNickname } from '@/lib/nickname';
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

/** A free tree name based on the runner's first name: "mina", then "mina-2", … */
export async function freeNickname(firstName: string, wanted?: string) {
  if (wanted && checkNickname(wanted).ok) {
    const { data } = await db().from('runners').select('id').eq('nickname', wanted).maybeSingle();
    if (!data) return wanted;
  }
  let base = cleanNickname(firstName.normalize('NFKD')).replace(/^-+|-+$/g, '').slice(0, 16);
  if (!checkNickname(base).ok) base = 'runner';
  const { data } = await db().from('runners').select('nickname').like('nickname', `${base}%`);
  const taken = new Set((data ?? []).map((r) => r.nickname));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
