/**
 * PROTOTYPE ACCOUNT
 * The signed-in runner, kept in the browser so sign-up and log-in work without a backend.
 * Phase 2 replaces this with a real session from Strava OAuth.
 */

const KEY = 'aor:me';
export const DEMO_NICKNAME = 'demo';

/** Tree names already in use in the demo. */
const TAKEN = new Set(['mina', 'jonas', 'aiko', 'demo', 'admin', 'tree', 'about', 'login', 'signup']);

/** `signedIn: false` after logging out; the tree and name are kept for the next log-in. */
export type Me = { nickname: string; signedIn?: boolean };

export function getMe(): Me {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Me;
  } catch {
    /* storage blocked */
  }
  return { nickname: DEMO_NICKNAME };
}

export function saveMe(me: Me) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(me));
  } catch {
    /* storage blocked: the demo still works with the default name */
  }
}

const IN_APP = 'aor:in-app';

/** Remember (for this tab) that the runner is using the app, not just visiting a shared link. */
export function markInApp() {
  try {
    window.sessionStorage.setItem(IN_APP, '1');
  } catch {
    /* storage blocked */
  }
}

/** Logged out on purpose (as opposed to never having signed up, which the demo allows). */
export const isLoggedOut = () => getMe().signedIn === false;

/** A member using the app: signed up, logged in, or browsing from inside the app. */
export function isMember() {
  if (isLoggedOut()) return false;
  try {
    return window.localStorage.getItem(KEY) !== null || window.sessionStorage.getItem(IN_APP) === '1';
  } catch {
    return false;
  }
}

/** Sign out but keep the tree and name, so logging back in returns to them. */
export function logOut() {
  saveMe({ ...getMe(), signedIn: false });
  try {
    window.sessionStorage.removeItem(IN_APP);
  } catch {
    /* storage blocked */
  }
}

/** Lowercase letters, numbers and dashes, 3–20 characters. */
export const cleanNickname = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20);

export type NicknameCheck = { ok: boolean; message: string };

export function checkNickname(nick: string): NicknameCheck {
  if (nick.length === 0) return { ok: false, message: 'Pick a name for your tree.' };
  if (nick.length < 3) return { ok: false, message: 'Use at least 3 characters.' };
  if (nick.startsWith('-') || nick.endsWith('-')) return { ok: false, message: 'It can’t start or end with a dash.' };
  if (TAKEN.has(nick)) return { ok: false, message: `“${nick}” is taken. Try another.` };
  return { ok: true, message: 'Available' };
}
