import { ORNAMENTS } from './ornaments';

/**
 * Advent calendar rules, shared by the server (computing a runner's progress from synced
 * Strava runs) and the pages. Outdoor, trail and treadmill runs count; manual entries don't.
 *
 * Rules: every door opens with 1 km run that day. A missed door N can be caught up later
 * by running N km in one go (door 13 → 13 km), with no limit on catch-ups. Weeks 3–4: one run
 * together with a friend completes the week (two connected runners starting within ~15 min and
 * ~200 m of each other, each running at least 1 km).
 *
 * The calendar runs in December. For testing, NEXT_PUBLIC_ADVENT_MONTH moves it to another
 * month (1–12) or to the current month ("current"); "Christmas" is then the 25th of that month.
 */
export const DOORS = 24;
export const DAILY_GOAL_KM = 1;

export type DoorState = 'opened' | 'missed' | 'today' | 'locked';

export const WEEKLY = [
  { week: 1, from: 1, to: 7, title: 'Run 3 times', reward: 'star-gold', goal: 3, unit: 'runs' },
  { week: 2, from: 8, to: 14, title: 'Run 10 km this week', reward: 'bell-gold', goal: 10, unit: 'km' },
  { week: 3, from: 15, to: 21, title: 'Run together with a friend', reward: 'star-gold', goal: 1, unit: 'runs together' },
  { week: 4, from: 22, to: 24, title: 'Run together with a friend', reward: 'bell-gold', goal: 1, unit: 'runs together' },
] as const;

export type Week = (typeof WEEKLY)[number];

const SPECIALS = ORNAMENTS.filter((o) => o.tier === 'special').map((o) => o.id);

/** The special ornament behind door n. */
export const doorOrnament = (n: number) => SPECIALS[(n - 1) % SPECIALS.length];

const TEST_MONTH = process.env.NEXT_PUBLIC_ADVENT_MONTH;

/** Month (1–12) the calendar runs in, given today's month. */
export function adventMonth(currentMonth: number) {
  if (TEST_MONTH === 'current') return currentMonth;
  const m = Number(TEST_MONTH);
  return m >= 1 && m <= 12 ? m : 12;
}

export const monthName = (month: number, style: 'long' | 'short' = 'long') =>
  new Date(2000, month - 1, 1).toLocaleString('en', { month: style });

export const weekRange = (w: Week, month: number) => `${monthName(month, 'short')} ${w.from}–${w.to}`;

/** One day of synced runs. */
export type DayRuns = { day: number; km: number; runs: number; longestKm: number };

export type Progress = {
  year: number;
  month: number;
  /** Day of the advent month in the runner's time zone; 0 before the month, 99 after it. */
  today: number;
  /** Index 0 is door 1. */
  doors: DoorState[];
  /** Doors opened by a catch-up run. */
  caughtUp: number[];
  /** Km run on each day of the month, index 0 is day 1. */
  km: number[];
  todayKm: number;
  /** The current week's challenge, or null outside days 1–24. */
  week: (Week & { progress: number; done: boolean }) | null;
  /** Weeks whose challenge is done (they earn the rare ornament). */
  weeksDone: number[];
  /** Earned ornaments not given away yet. */
  pouch: string[];
  /** ISO time of the last Strava sync; null for demo data. */
  syncedAt: string | null;
};

/** Doors and challenges from a month of runs. Weeks 3–4 (running together) are not tracked yet. */
export function computeProgress(days: DayRuns[], today: number, year: number, month: number): Omit<Progress, 'pouch' | 'syncedAt'> {
  const byDay = new Map(days.map((d) => [d.day, d]));
  const km = (d: number) => byDay.get(d)?.km ?? 0;

  const doors: DoorState[] = Array.from({ length: DOORS }, (_, i) => {
    const n = i + 1;
    if (n > today) return 'locked';
    if (km(n) >= DAILY_GOAL_KM) return 'opened';
    return n === today ? 'today' : 'missed';
  });

  // Catch-ups: each day's longest run opens the highest earlier missed door it covers.
  const caughtUp: number[] = [];
  for (const d of [...days].sort((a, b) => a.day - b.day)) {
    for (let n = Math.min(d.day - 1, DOORS); n >= 1; n--) {
      if (doors[n - 1] === 'missed' && d.longestKm >= n) {
        doors[n - 1] = 'opened';
        caughtUp.push(n);
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

/** Clickable demo state for signed-out visitors: December 14 with doors 5, 9 and 13 missed. */
export function demoProgress(): Progress {
  const days: DayRuns[] = Array.from({ length: 13 }, (_, i) => i + 1)
    .filter((d) => ![5, 9, 13].includes(d))
    .map((day) => ({ day, km: day >= 8 ? 1.5 : 3, runs: 1, longestKm: day >= 8 ? 1.5 : 3 }));
  days.push({ day: 14, km: 0.6, runs: 1, longestKm: 0.6 });
  return { ...computeProgress(days, 14, 2026, 12), pouch: ['finish-medal', 'gingerbread-runner'], syncedAt: null };
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
