/**
 * Demo calendar state. In phase 2 this comes from the runner's synced Strava activities
 * (outdoor, trail and treadmill runs; manual entries don't count).
 */
export const DEMO_TODAY = 14;
export const DEMO_MISSED = [5, 9, 13];
export const DEMO_TODAY_KM = 0.6;
export const DEMO_TODAY_GOAL_KM = 1.0;

export type DoorState = 'opened' | 'missed' | 'today' | 'locked';

export function doorState(n: number): DoorState {
  if (n === DEMO_TODAY) return 'today';
  if (n > DEMO_TODAY) return 'locked';
  return DEMO_MISSED.includes(n) ? 'missed' : 'opened';
}

export const WEEKLY = [
  { week: 1, range: 'Dec 1–7', title: 'Run 3 times', reward: 'star-gold' },
  { week: 2, range: 'Dec 8–14', title: 'Run 10 km this week', reward: 'bell-gold', progress: 7.4, goal: 10 },
  { week: 3, range: 'Dec 15–21', title: '[Week 3 challenge]', reward: 'star-gold' },
  { week: 4, range: 'Dec 22–24', title: '[Week 4 challenge]', reward: 'bell-gold' },
];

/** Time until Dec 25, 00:00 in the viewer's local time zone. */
export function untilChristmas(now = new Date()) {
  let year = now.getFullYear();
  let target = new Date(year, 11, 25, 0, 0, 0);
  if (now > new Date(year, 11, 26)) {
    year += 1;
    target = new Date(year, 11, 25, 0, 0, 0);
  }
  const ms = Math.max(0, target.getTime() - now.getTime());
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return { d, h, m, done: ms === 0 };
}
