import { BASIC, ORNAMENTS } from './ornaments';

/**
 * Advent calendar rules, shared by the server (computing a runner's progress from synced
 * Strava runs) and the pages. Runs (outdoor, trail, treadmill), walks and hikes all count as
 * runs; manual entries don't.
 *
 * Rules: a door opens only with 1 km run on its own day; a missed door stays wrapped (no
 * catching up later). Week 1 counts days with 1 km, week 2 the week's km. Weeks 3–4: one run
 * together with a friend completes the week (two connected runners starting within ~15 min and
 * ~200 m of each other, each running at least 1 km). The ornament behind an opened door goes
 * straight to a friend's tree: run, unwrap, give.
 *
 * Advent starts on December 1. For testing, NEXT_PUBLIC_ADVENT_START (YYYY-MM-DD) moves the
 * start to any day; every date follows from it: door N is start + N − 1 days, and "Christmas"
 * (letters open, hanging closes) is day 25.
 */
export const DOORS = 24;
export const DAILY_GOAL_KM = 1;

export type DoorState = 'opened' | 'missed' | 'today' | 'locked';

/** Special ornaments that can hide behind a daily door. */
const DOOR_POOL = ORNAMENTS.filter((o) => o.tier === 'special').map((o) => o.id);

/**
 * The ornament behind each door (index 0 is door 1) for one runner and season: the special
 * ornaments shuffled with `seed` (runner id and start date), so friends get different ones and
 * no door repeats within a season. Always the same for the same seed, so today's door can show
 * its ornament's silhouette before it's earned.
 */
export function doorOrnaments(seed: string): string[] {
  // FNV-1a hash of the seed, then mulberry32 for the shuffle
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const rand = () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pool = [...DOOR_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return Array.from({ length: DOORS }, (_, i) => pool[i % pool.length]);
}

export const WEEKLY = [
  { week: 1, from: 1, to: 7, title: 'Run 1 km on 3 days', reward: 'snow-globe', goal: 3, unit: 'days' },
  { week: 2, from: 8, to: 14, title: 'Run 10 km this week', reward: 'bell-gold', goal: 10, unit: 'km' },
  { week: 3, from: 15, to: 21, title: 'Run together with a friend', reward: 'snow-globe', goal: 1, unit: 'runs together' },
  { week: 4, from: 22, to: 24, title: 'Run together with a friend', reward: 'bell-gold', goal: 1, unit: 'runs together' },
] as const;

export type Week = (typeof WEEKLY)[number];

/* ---------------------------------------------------------------------------
 * The season: every date is a day number counted from the start date.
 * Dates are plain 'YYYY-MM-DD' strings in the runner's own time zone.
 * ------------------------------------------------------------------------- */

const START = process.env.NEXT_PUBLIC_ADVENT_START;
/** Day 25: letters open, hanging closes. */
export const CHRISTMAS_DAY = DOORS + 1;
const DAY_MS = 86_400_000;
const utc = (date: string) => Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)));

/** Today's date in a time zone (the viewer's own when left out). */
export function todayIn(timeZone?: string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date());
}

/** First day of the season `date` belongs to: December 1, or NEXT_PUBLIC_ADVENT_START. */
export function adventStart(date = todayIn()) {
  if (START && /^\d{4}-\d{2}-\d{2}$/.test(START)) return START;
  // until June, last December's season still counts (its letters stay open through spring)
  const [y, m] = date.split('-').map(Number);
  return `${m < 6 ? y - 1 : y}-12-01`;
}

/** Which day of Advent `date` is: 1 on the start date, 25 is Christmas, 0 or less before. */
export function adventDay(date: string, start = adventStart(date)) {
  return Math.round((utc(date) - utc(start)) / DAY_MS) + 1;
}

/** The date of day n. */
export function adventDate(start: string, n: number) {
  return new Date(utc(start) + (n - 1) * DAY_MS).toISOString().slice(0, 10);
}

/** "Dec 1" (short) or "December 1" (long) for day n. */
export function dayLabel(start: string, n: number, style: 'short' | 'long' = 'short') {
  return new Date(utc(adventDate(start, n))).toLocaleDateString('en', { month: style, day: 'numeric', timeZone: 'UTC' });
}

/** "Dec 1–7", or "Nov 29–Dec 5" across months. */
export function rangeLabel(start: string, from: number, to: number) {
  const a = dayLabel(start, from);
  const b = dayLabel(start, to);
  return a.split(' ')[0] === b.split(' ')[0] ? `${a}–${b.split(' ')[1]}` : `${a}–${b}`;
}

/** "December 25" for this season, in the viewer's time zone. */
export const christmasLabel = (style: 'short' | 'long' = 'long') => dayLabel(adventStart(), CHRISTMAS_DAY, style);
/** "December 24", the last door and the last day to hang an ornament. */
export const lastDayLabel = (style: 'short' | 'long' = 'long') => dayLabel(adventStart(), DOORS, style);

/** Days 1–25, when doors and runs count by local date (so the time zone is locked). */
export const duringAdvent = (timeZone: string) => {
  const d = adventDay(todayIn(timeZone));
  return d >= 1 && d <= CHRISTMAS_DAY;
};

/** One day of synced runs. */
export type DayRuns = { day: number; km: number; runs: number; longestKm: number };

/** An earned ornament that hasn't been given yet. */
export type Unwrapped = { ornamentId: string; door: number | null };

export type Progress = {
  /** The season's first day, 'YYYY-MM-DD'; door n is `adventDate(start, n)`. */
  start: string;
  /** Day of Advent in the runner's time zone; 0 before the start, 99 after door 24. */
  today: number;
  /** Index 0 is door 1. */
  doors: DoorState[];
  /** The ornament behind each door for this runner; index 0 is door 1. */
  ornaments: string[];
  /** Km run on each day, index 0 is day 1. */
  km: number[];
  todayKm: number;
  /** The current week's challenge, or null outside days 1–24. */
  week: (Week & { progress: number; done: boolean }) | null;
  /** Weeks whose challenge is done (they earn the rare ornament). */
  weeksDone: number[];
  /** Door number → name of the friend its ornament went to. */
  given: Record<number, string>;
  /** Earned ornaments waiting to be given, newest first. */
  unwrapped: Unwrapped[];
  /** Every ornament the runner has found: free ones plus everything earned. */
  found: string[];
  /** ISO time of the last Strava sync; null for demo data. */
  syncedAt: string | null;
};

/** Doors and challenges from a month of runs. Weeks 3–4 (running together) are not tracked yet. */
export function computeProgress(
  days: DayRuns[],
  today: number,
  start: string,
): Omit<Progress, 'given' | 'unwrapped' | 'found' | 'syncedAt' | 'ornaments'> {
  const byDay = new Map(days.map((d) => [d.day, d]));
  const km = (d: number) => byDay.get(d)?.km ?? 0;

  const doors: DoorState[] = Array.from({ length: DOORS }, (_, i) => {
    const n = i + 1;
    if (n > today) return 'locked';
    if (km(n) >= DAILY_GOAL_KM) return 'opened';
    return n === today ? 'today' : 'missed';
  });

  const weekProgress = (w: Week) => {
    const inWeek = days.filter((d) => d.day >= w.from && d.day <= w.to);
    // only days that did the daily mission count, so a short jog can't win the prize
    if (w.unit === 'days') return inWeek.filter((d) => d.km >= DAILY_GOAL_KM).length;
    if (w.unit === 'km') return Math.round(inWeek.reduce((s, d) => s + d.km, 0) * 10) / 10;
    return 0;
  };
  const weeksDone = WEEKLY.filter((w) => w.from <= today && weekProgress(w) >= w.goal).map((w) => w.week);
  const current = WEEKLY.find((w) => today >= w.from && today <= w.to);

  return {
    start,
    today,
    doors,
    km: Array.from({ length: DOORS }, (_, i) => Math.round(km(i + 1) * 10) / 10),
    todayKm: Math.round(km(today) * 10) / 10,
    week: current ? { ...current, progress: weekProgress(current), done: weeksDone.includes(current.week) } : null,
    weeksDone,
  };
}

/* ---------------------------------------------------------------------------
 * Demo calendar for signed-out visitors: December 14, doors 5, 9 and 13 missed.
 * ------------------------------------------------------------------------- */

export const DEMO_TODAY = 14;
/** The demo runner's door ornaments. */
export const DEMO_ORNAMENTS = doorOrnaments('demo');
export const DEMO_MISSED = [5, 9, 13];

/**
 * Who the demo runner gave each unwrapped door's ornament to. Earned ornaments go
 * straight to a friend's tree: finish the run, unwrap, give.
 */
export const DEMO_GIVEN: Record<number, string> = {
  1: 'AYOP', 2: 'Jonas', 3: 'Aiko', 4: 'Leo', 6: 'Hana', 7: 'Yuki', 8: 'Ben', 10: 'Kai', 11: 'Lena', 12: 'Rio',
};
export const DEMO_TODAY_KM = 0.6;

export function doorState(n: number): DoorState {
  if (n === DEMO_TODAY) return 'today';
  if (n > DEMO_TODAY) return 'locked';
  return DEMO_MISSED.includes(n) ? 'missed' : 'opened';
}

/**
 * Ornaments the demo runner has found so far: free ones, every door they opened and
 * the weekly prizes they won. Anything else stays a mystery in the directory.
 */
export function demoFound(extra: string[] = []): Set<string> {
  const found = new Set<string>(extra);
  for (let n = 1; n <= DOORS; n++) if (doorState(n) === 'opened') found.add(DEMO_ORNAMENTS[n - 1]);
  found.add(WEEKLY[0].reward); // week 1 is done
  return found;
}

export function demoProgress(): Progress {
  const days: DayRuns[] = Array.from({ length: DEMO_TODAY - 1 }, (_, i) => i + 1)
    .filter((d) => !DEMO_MISSED.includes(d))
    .map((day) => ({ day, km: day >= 8 ? 1.2 : 3, runs: 1, longestKm: day >= 8 ? 1.2 : 3 }));
  days.push({ day: DEMO_TODAY, km: DEMO_TODAY_KM, runs: 1, longestKm: DEMO_TODAY_KM });
  return {
    ...computeProgress(days, DEMO_TODAY, adventStart()),
    ornaments: DEMO_ORNAMENTS,
    given: DEMO_GIVEN,
    // the demo lets you try unwrapping today's door before finishing the run
    unwrapped: [{ ornamentId: DEMO_ORNAMENTS[DEMO_TODAY - 1], door: DEMO_TODAY }],
    found: [...demoFound(BASIC.map((o) => o.id))],
    syncedAt: null,
  };
}

/** Whether a tree's messages are open: from 00:00 on day 25, in the owner's time zone (`date`). */
export function christmasOpen(date: string) {
  return adventDay(date) >= CHRISTMAS_DAY;
}

/** Time until 00:00 on day 25 in the viewer's local time zone. */
export function untilChristmas(now = new Date()) {
  const [y, m, d] = adventDate(adventStart(), CHRISTMAS_DAY).split('-').map(Number);
  const ms = Math.max(0, new Date(y, m - 1, d).getTime() - now.getTime());
  const days = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const min = Math.floor((ms % 3600000) / 60000);
  return { d: days, h, m: min, done: ms === 0 };
}
