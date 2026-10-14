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
 * PROTOTYPE DATA LAYER
 * Everything lives in the browser (localStorage) so the prototype runs on Vercel
 * with no database. Phase 2 replaces these functions with Supabase queries;
 * the pages only call the functions below.
 */

let seq = 0;
function h(ornamentId: string, from: string, hint: Hint, message: string): Hung {
  seq += 1;
  return { id: `seed-${seq}`, ornamentId, from, hint, message, createdAt: '2026-12-10T08:00:00Z' };
}

const SEED: Record<string, Tree> = {
  demo: {
    nickname: 'demo',
    displayName: 'You',
    ornaments: [
      h('star-gold', 'Mina', 'Cheer', 'You got this. See you at the Sunday long run!'),
      h('fox', 'Jonas', 'Thanks', 'Thanks for pacing me in October. Merry Christmas!'),
      h('finish-medal', 'Aiko', 'Love', 'Proud of you for running through the dark mornings.'),
      h('penguin', 'Leo', 'Funny', 'Slipped on ice twice this week. Worth it.'),
      h('bauble-snow', 'Hana', 'Cheer', 'Keep the streak alive!'),
      h('snowflake', 'Tom', 'Love', 'Happy holidays from the Tuesday crew.'),
      h('sock', 'Ella', 'Funny', 'Warm feet, fast feet.'),
      h('hot-cocoa', 'Sam', 'Thanks', 'Cocoa after the run is on me.'),
      h('bauble-frost', 'Noah', 'Cheer', 'Run happy!'),
    ],
  },
  mina: {
    nickname: 'mina',
    displayName: 'Mina',
    ornaments: [
      h('reindeer', 'Jonas', 'Cheer', '...'),
      h('bauble-cranberry', 'Aiko', 'Love', '...'),
      h('snowflake', 'Leo', 'Thanks', '...'),
      h('santa-shoe', 'Tom', 'Cheer', '...'),
      h('bauble-snow', 'Ella', 'Funny', '...'),
    ],
  },
  jonas: {
    nickname: 'jonas',
    displayName: 'Jonas',
    ornaments: [h('stopwatch', 'Mina', 'Cheer', '...'), h('sock', 'Leo', 'Funny', '...')],
  },
};

const key = (nick: string) => `aor:tree:${nick}`;

export function getTree(nickname: string): Tree {
  const nick = nickname.toLowerCase();
  const base: Tree = SEED[nick] ?? {
    nickname: nick,
    displayName: nick.charAt(0).toUpperCase() + nick.slice(1),
    ornaments: [],
  };
  let extra: Hung[] = [];
  try {
    const raw = window.localStorage.getItem(key(nick));
    if (raw) extra = JSON.parse(raw);
  } catch {
    extra = [];
  }
  return { ...base, ornaments: [...base.ornaments, ...extra] };
}

export function hangOrnament(nickname: string, input: Omit<Hung, 'id' | 'createdAt'>): Hung {
  const item: Hung = { ...input, id: `local-${Date.now()}`, createdAt: new Date().toISOString() };
  try {
    const raw = window.localStorage.getItem(key(nickname.toLowerCase()));
    const list: Hung[] = raw ? JSON.parse(raw) : [];
    list.push(item);
    window.localStorage.setItem(key(nickname.toLowerCase()), JSON.stringify(list));
  } catch {
    /* storage unavailable: the ornament still shows on the done screen */
  }
  return item;
}

/** Ornaments the demo runner has earned and can give away (max 3). */
export const DEMO_POUCH = ['finish-medal', 'gingerbread-runner'];

export const FRIENDS = [
  { nickname: 'mina', name: 'Mina', note: 'Hung an ornament on your tree' },
  { nickname: 'jonas', name: 'Jonas', note: 'Visited your tree yesterday' },
  { nickname: 'aiko', name: 'Aiko', note: 'From your saved trees' },
];
