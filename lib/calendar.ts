import { BASIC } from './ornaments';

/**
 * Advent calendar rules, shared by the server (computing a runner's progress from synced
 * Strava runs) and the pages. Outdoor, trail and treadmill runs count; manual entries don't.
 *
 * Rules: every door opens with 1 km run that day. A missed door N can be caught up on a later
 * day by running N km in one go on top of that day's 1 km (missed door 6 → 6 km run, 7 km that
 * day), with no limit on catch-ups. Weeks 3–4: one run
 * together with a friend completes the week (two connected runners starting within ~15 min and
 * ~200 m of each other, each running at least 1 km). The ornament behind an opened door goes
 * straight to a friend's tree: run, unwrap, give.
 *
 * The calendar runs in December. For testing, NEXT_PUBLIC_ADVENT_MONTH moves it to another
 * month (1–12) or to the current month ("current"); "Christmas" is then the 25th of that month.
 */
export const DOORS = 24;
export const DAILY_GOAL_KM = 1;

export type DoorState = 'opened' | 'missed' | 'today' | 'locked';

/** The special ornament behind each daily door, cycling through the Advent runners. */
const DOOR_ORNAMENTS = ['fox', 'penguin', 'reindeer', 'gingerbread-runner', 'running-shoe', 'finish-medal', 'stopwatch', 'santa-shoe'];
export const doorOrnament = (n: number) => DOOR_ORNAMENTS[(n + 1) % DOOR_ORNAMENTS.length];

export const WEEKLY = [
  { week: 1, from: 1, to: 7, title: 'Run 3 times', reward: 'snow-globe', goal: 3, unit: 'runs' },
  { week: 2, from: 8, to: 14, title: 'Run 10 km this week', reward: 'bell-gold', goal: 10, unit: 'km' },
  { week: 3, from: 15, to: 21, title: 'Run together with a friend', reward: 'snow-globe', goal: 1, unit: 'runs together' },
  { week: 4, from: 22, to: 24, title: 'Run together with a friend', reward: 'bell-gold', goal: 1, unit: 'runs together' },
] as const;

export type Week = (typeof WEEKLY)[number];

const TEST_MONTH = process.env.NEXT_PUBLIC_ADVENT_MONTH;

/** Month (1–12) the calendar runs in, given today's month. */
export function adventMonth(currentMonth: number) {
  if (TEST_MONTH === 'current') return currentMonth;
  const m = Number(TEST_MONTH);
  return m >= 1 && m <= 12 ? m : 12;
}

export const monthName = (month: number, style: 'long' | 'short' = 'long') =>
  new Date(2000, month - 1, 1).toLocaleString('en', { month: style });

/** One day of synced runs. */
export type DayRuns = { day: number; km: number; runs: number; longestKm: number };

/** An earned ornament that hasn't been given yet. */
export type Unwrapped = { ornamentId: string; door: number | null };

export type Progress = {
  year: number;
  month: number;
  /** Day of the advent month in the runner's time zone; 0 before the month, 99 after it. */
  today: number;
  /** Index 0 is door 1. */
  doors: DoorState[];
  /** Doors opened by a catch-up run: door → day of that run. */
  caughtUp: Record<number, number>;
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
  year: number,
  month: number,
): Omit<Progress, 'given' | 'unwrapped' | 'found' | 'syncedAt'> {
  const byDay = new Map(days.map((d) => [d.day, d]));
  const km = (d: number) => byDay.get(d)?.km ?? 0;

  const doors: DoorState[] = Array.from({ length: DOORS }, (_, i) => {
    const n = i + 1;
    if (n > today) return 'locked';
    if (km(n) >= DAILY_GOAL_KM) return 'opened';
    return n === today ? 'today' : 'missed';
  });

  // Catch-ups: a day's longest run opens the highest earlier missed door it covers, as long as
  // the day also has its own 1 km on top (missed door N needs N km more than the daily goal).
  const caughtUp: Record<number, number> = {};
  for (const d of [...days].sort((a, b) => a.day - b.day)) {
    for (let n = Math.min(d.day - 1, DOORS); n >= 1; n--) {
      if (doors[n - 1] === 'missed' && d.longestKm >= n && d.km >= n + DAILY_GOAL_KM) {
        doors[n - 1] = 'opened';
        caughtUp[n] = d.day;
        break;
      }
    }
  }

  const weekProgress = (w: Week) => {
    const inWeek = days.filter((d) => d.day >= w.from && d.day <= w.to);
    if (w.unit === 'runs') return inWeek.reduce((s, d) => s + d.runs, 0);
    if (w.unit === 'km') return Math.round(inWeek.reduce((s, d) => s + d.km, 0) * 10) / 10;
    return 0;
  };
  const weeksDone = WEEKLY.filter((w) => w.from <= today && weekProgress(w) >= w.goal).map((w) => w.week);
  const current = WEEKLY.find((w) => today >= w.from && today <= w.to);

  return {
    year,
    month,
    today,
    doors,
    caughtUp,
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
export const DEMO_MISSED = [5, 9, 13];

/**
 * Who the demo runner gave each unwrapped door's ornament to. Earned ornaments go
 * straight to a friend's tree: finish the run, unwrap, give.
 */
export const DEMO_GIVEN: Record<number, string> = {
  1: 'Mina', 2: 'Jonas', 3: 'Aiko', 4: 'Leo', 6: 'Hana', 7: 'Yuki', 8: 'Ben', 10: 'Kai', 11: 'Lena', 12: 'Rio',
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
  for (let n = 1; n <= DOORS; n++) if (doorState(n) === 'opened') found.add(doorOrnament(n));
  found.add(WEEKLY[0].reward); // week 1 is done
  return found;
}

export function demoProgress(): Progress {
  const days: DayRuns[] = Array.from({ length: DEMO_TODAY - 1 }, (_, i) => i + 1)
    .filter((d) => !DEMO_MISSED.includes(d))
    .map((day) => ({ day, km: day >= 8 ? 1.2 : 3, runs: 1, longestKm: day >= 8 ? 1.2 : 3 }));
  days.push({ day: DEMO_TODAY, km: DEMO_TODAY_KM, runs: 1, longestKm: DEMO_TODAY_KM });
  return {
    ...computeProgress(days, DEMO_TODAY, 2026, 12),
    given: DEMO_GIVEN,
    // the demo lets you try unwrapping today's door before finishing the run
    unwrapped: [{ ornamentId: doorOrnament(DEMO_TODAY), door: DEMO_TODAY }],
    found: [...demoFound(BASIC.map((o) => o.id))],
    syncedAt: null,
  };
}

/** Time until the 25th of the advent month, 00:00 in the viewer's local time zone. */
export function untilChristmas(now = new Date()) {
  const month = adventMonth(now.getMonth() + 1) - 1;
  let year = now.getFullYear();
  // In test mode ("current") the month never rolls over, so the countdown stays at zero after the 25th.
  if (TEST_MONTH !== 'current' && now > new Date(year, month, 26)) year += 1;
  const ms = Math.max(0, new Date(year, month, 25).getTime() - now.getTime());
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return { d, h, m, done: ms === 0 };
}
