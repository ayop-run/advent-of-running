/** Tree names: lowercase letters, numbers and dashes, 3–20 characters. Shared by pages and server. */

/** Names that would clash with pages or confuse people. */
const RESERVED = new Set(['admin', 'api', 'about', 'calendar', 'christmas', 'demo', 'friends', 'gift', 'login', 'me', 'notifications', 'ornaments', 'privacy', 'signup', 'tree']);

export const cleanNickname = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20);

export type NicknameCheck = { ok: boolean; message: string };

/** Format check only; whether the name is free is checked by the server when saving. */
export function checkNickname(nick: string): NicknameCheck {
  if (nick.length === 0) return { ok: false, message: 'Pick a name for your tree.' };
  if (nick.length < 3) return { ok: false, message: 'Use at least 3 characters.' };
  if (nick.length > 20 || cleanNickname(nick) !== nick) return { ok: false, message: 'Use lowercase letters, numbers and dashes.' };
  if (nick.startsWith('-') || nick.endsWith('-')) return { ok: false, message: 'It can’t start or end with a dash.' };
  if (RESERVED.has(nick)) return { ok: false, message: `“${nick}” is taken. Try another.` };
  return { ok: true, message: 'Looks good' };
}
