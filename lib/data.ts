import { supabase } from './supabase';
import type { Hint } from './ornaments';

export type Hung = {
  id: string;
  ornamentId: string;
  from: string;
  hint: Hint;
  message: string;
  createdAt: string;
};

export type Tree = {
  nickname: string;
  displayName: string;
  ornaments: Hung[];
};

/**
 * DATA LAYER
 * Trees and hung ornaments come from Supabase through the `get_tree` and `hang_ornament`
 * functions (supabase/schema.sql). Messages never leave the database here: public trees
 * only get sealed ornaments. Pages only call the functions below.
 */

/** Sealed ornaments carry an empty message. Unknown nicknames get an empty tree. */
export async function getTree(nickname: string): Promise<Tree> {
  const nick = nickname.toLowerCase();
  const { data, error } = await supabase().rpc('get_tree', { nick });
  if (error) throw error;
  if (!data) {
    return { nickname: nick, displayName: nick.charAt(0).toUpperCase() + nick.slice(1), ornaments: [] };
  }
  const tree = data as Omit<Tree, 'ornaments'> & { ornaments: Omit<Hung, 'message'>[] };
  return { ...tree, ornaments: tree.ornaments.map((o) => ({ ...o, message: '' })) };
}

export type HangError = 'tree_not_found' | 'sign_in_required' | 'hanging_closed' | 'unknown';

export async function hangOrnament(
  nickname: string,
  input: Omit<Hung, 'id' | 'createdAt'> & { email?: string },
): Promise<{ id: string } | { error: HangError }> {
  const { data, error } = await supabase().rpc('hang_ornament', {
    nick: nickname.toLowerCase(),
    ornament_id: input.ornamentId,
    from_name: input.from,
    hint: input.hint,
    message: input.message,
    from_email: input.email || null,
  });
  if (error) {
    const known: HangError[] = ['tree_not_found', 'sign_in_required', 'hanging_closed'];
    return { error: known.find((k) => error.message.includes(k)) ?? 'unknown' };
  }
  return { id: data as string };
}

/**
 * Preview data for /christmas only. Reading real messages needs owner sign-in plus the
 * Dec 25 check on the server, which arrives with Strava login.
 */
let seq = 0;
function h(ornamentId: string, from: string, hint: Hint, message: string): Hung {
  seq += 1;
  return { id: `preview-${seq}`, ornamentId, from, hint, message, createdAt: '2026-12-10T08:00:00Z' };
}

export const CHRISTMAS_PREVIEW: Hung[] = [
  h('star-gold', 'Mina', 'Cheer', 'You got this. See you at the Sunday long run!'),
  h('fox', 'Jonas', 'Thanks', 'Thanks for pacing me in October. Merry Christmas!'),
  h('finish-medal', 'Aiko', 'Love', 'Proud of you for running through the dark mornings.'),
  h('penguin', 'Leo', 'Funny', 'Slipped on ice twice this week. Worth it.'),
  h('bauble-snow', 'Hana', 'Cheer', 'Keep the streak alive!'),
  h('snowflake', 'Tom', 'Love', 'Happy holidays from the Tuesday crew.'),
  h('sock', 'Ella', 'Funny', 'Warm feet, fast feet.'),
  h('hot-cocoa', 'Sam', 'Thanks', 'Cocoa after the run is on me.'),
  h('bauble-frost', 'Noah', 'Cheer', 'Run happy!'),
];

/** Ornaments the demo runner has earned and can give away (max 3). */
export const DEMO_POUCH = ['finish-medal', 'gingerbread-runner'];

export const FRIENDS = [
  { nickname: 'mina', name: 'Mina', note: 'Hung an ornament on your tree' },
  { nickname: 'jonas', name: 'Jonas', note: 'Visited your tree yesterday' },
  { nickname: 'aiko', name: 'Aiko', note: 'From your saved trees' },
];
