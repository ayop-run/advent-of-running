import { DEMO_GIVEN, doorOrnament } from '../calendar';
import { getMe, isMember } from './me';
import { demoName, demoNick } from './names';
import type { Hint } from '../ornaments';

export type Hung = {
  id: string;
  ornamentId: string;
  from: string;
  hint: Hint;
  message: string;
  createdAt: string;
  /** hung by the runner using this browser: one per tree */
  mine?: boolean;
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
      h('snow-globe', 'AYOP', 'Cheer', 'You got this. See you at the Sunday long run!'),
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
  ayop: {
    nickname: 'ayop',
    displayName: 'AYOP',
    ornaments: [
      h('reindeer', 'Jonas', 'Cheer', 'Your Sunday long runs keep me going. Merry Christmas!'),
      h('bauble-cranberry', 'Aiko', 'Love', 'Thanks for always waiting for me at the turnaround.'),
      h('snowflake', 'Leo', 'Thanks', 'One day I will beat your 5K. Not this year, though.'),
      h('santa-shoe', 'Tom', 'Cheer', 'See you at the Christmas Eve fun run!'),
      h('bauble-snow', 'Ella', 'Funny', 'Hot cocoa after the next icy one? You are buying.'),
    ],
  },
  jonas: {
    nickname: 'jonas',
    displayName: 'Jonas',
    ornaments: [h('stopwatch', 'AYOP', 'Cheer', 'Fastest friend I know. Go get that PB!'), h('sock', 'Leo', 'Funny', 'Warm socks for cold miles.')],
  },
};

const key = (nick: string) => `aor:tree:${nick}`;

/** First names the demo tree's senders are drawn from, so the demo doesn't look like real people. */
const NAME_POOL = [
  'Ava', 'Ben', 'Chloe', 'Dario', 'Emil', 'Freya', 'Greta', 'Hugo', 'Ines', 'Jasper', 'Kira', 'Luca', 'Maya', 'Nico',
  'Olivia', 'Paul', 'Quinn', 'Rosa', 'Sofia', 'Theo', 'Uma', 'Vince', 'Wren', 'Xavi', 'Yara', 'Zoe', 'Ida', 'Felix',
];

/** Random, distinct sender names for the demo tree, kept for the whole visit so every page agrees. */
function demoNames(count: number): string[] {
  const k = 'aor:demo-names';
  try {
    const saved: string[] = JSON.parse(window.sessionStorage.getItem(k) ?? '[]');
    if (saved.length >= count) return saved;
  } catch {}
  const pool = [...NAME_POOL];
  const names = Array.from({ length: count }, () => pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  try {
    window.sessionStorage.setItem(k, JSON.stringify(names));
  } catch {}
  return names;
}

const myName = () => {
  const nick = getMe().nickname;
  return nick.charAt(0).toUpperCase() + nick.slice(1);
};

/** The demo runner's past door ornaments, shown on the trees of the friends who got them. */
function demoGiftsTo(nick: string): Hung[] {
  return Object.entries(DEMO_GIVEN)
    .filter(([, name]) => demoNick(name) === nick)
    .map(([n]) => ({
      id: `door-${n}`,
      ornamentId: doorOrnament(Number(n)),
      from: myName(),
      hint: 'Cheer' as Hint,
      message: `Door ${n} was for you, ${demoName(nick)}. Keep running!`,
      createdAt: `2026-12-${String(n).padStart(2, '0')}T08:00:00Z`,
      // the demo runner's gifts belong to the signed-in runner, not to guests
      mine: isMember(),
    }));
}

export function getTree(nickname: string): Tree {
  const nick = nickname.toLowerCase();
  let base: Tree = SEED[nick] ?? {
    nickname: nick,
    displayName: demoName(nick),
    ornaments: [],
  };
  if (nick === 'demo') {
    const names = demoNames(base.ornaments.length);
    base = { ...base, ornaments: base.ornaments.map((h, i) => ({ ...h, from: names[i] })) };
  }
  let extra: Hung[] = [];
  try {
    const raw = window.localStorage.getItem(key(nick));
    if (raw) extra = JSON.parse(raw);
  } catch {
    extra = [];
  }
  // edits you made to the demo door ornaments you gave
  let edits: Record<string, Partial<Hung>> = {};
  try {
    edits = JSON.parse(window.localStorage.getItem(editsKey(nick)) ?? '{}');
  } catch {
    edits = {};
  }
  const gifts = demoGiftsTo(nick).map((h) => ({ ...h, ...edits[h.id] }));
  return { ...base, ornaments: [...base.ornaments, ...gifts, ...extra] };
}

const editsKey = (nick: string) => `aor:edits:${nick}`;

export type HungEdit = Pick<Hung, 'message' | 'hint' | 'from'> & { ornamentId?: string };

/** Change the ornament you hung on this tree (open until hanging closes on Dec 24). */
export function editMyOrnament(nickname: string, patch: HungEdit): Hung | null {
  const nick = nickname.toLowerCase();
  const mine = myOrnamentOn(nick);
  if (!mine) return null;
  try {
    if (mine.id.startsWith('local-')) {
      const list: Hung[] = JSON.parse(window.localStorage.getItem(key(nick)) ?? '[]');
      window.localStorage.setItem(key(nick), JSON.stringify(list.map((h) => (h.id === mine.id ? { ...h, ...patch } : h))));
    } else {
      // demo door gifts aren't stored, so keep the edit alongside them
      const edits = JSON.parse(window.localStorage.getItem(editsKey(nick)) ?? '{}');
      edits[mine.id] = { ...edits[mine.id], ...patch };
      window.localStorage.setItem(editsKey(nick), JSON.stringify(edits));
    }
  } catch {
    /* storage unavailable */
  }
  return { ...mine, ...patch };
}

/** The ornament you hung on this tree, if any. Everyone gets one per tree. */
export function myOrnamentOn(nickname: string): Hung | null {
  return getTree(nickname).ornaments.find((h) => h.mine) ?? null;
}

export function hangOrnament(nickname: string, input: Omit<Hung, 'id' | 'createdAt' | 'mine'>): Hung {
  // one per tree: hanging again just returns the ornament already there
  const existing = myOrnamentOn(nickname);
  if (existing) return existing;
  const item: Hung = { ...input, id: `local-${Date.now()}`, createdAt: new Date().toISOString(), mine: true };
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
