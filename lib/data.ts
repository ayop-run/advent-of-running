import { demoProgress, type Progress } from './calendar';
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
 * Trees come from Supabase through the `get_tree` function (supabase/schema.sql); messages
 * never reach the browser, public trees only get sealed ornaments. Anything that needs the
 * signed-in runner or the secret key goes through the app's /api routes (app/api, lib/server).
 * Pages only call the functions below.
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

export type HangError = 'tree_not_found' | 'sign_in_required' | 'hanging_closed' | 'not_earned' | 'invalid' | 'unknown';

/** Goes through /api/hang so a signed-in sender is recorded. */
export async function hangOrnament(
  nickname: string,
  input: Omit<Hung, 'id' | 'createdAt'> & { email?: string },
): Promise<{ id: string } | { error: HangError }> {
  try {
    const res = await fetch('/api/hang', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: nickname.toLowerCase(), ...input }),
    });
    const body = await res.json();
    return res.ok ? { id: body.id } : { error: body.error ?? 'unknown' };
  } catch {
    return { error: 'unknown' };
  }
}

/** The signed-in runner's own profile. Only returned to that runner. */
export type Me = {
  nickname: string;
  displayName: string;
  avatarUrl: string | null;
  timeZone: string;
  hangPolicy: 'anyone' | 'signed_in';
  emailOptIn: boolean;
  /** False until the runner has picked a nickname in /onboarding. */
  onboarded: boolean;
};

/** Null when signed out. Log in by sending the browser to /api/strava/connect. */
export async function getMe(): Promise<Me | null> {
  try {
    const res = await fetch('/api/me', { cache: 'no-store' });
    return res.ok ? (await res.json()).runner : null;
  } catch {
    return null;
  }
}

export type ProfileError = 'nickname_taken' | 'invalid' | 'signed_out' | 'unknown';

export async function saveProfile(
  profile: Pick<Me, 'nickname' | 'timeZone' | 'hangPolicy' | 'emailOptIn'>,
): Promise<{ ok: true } | { error: ProfileError }> {
  try {
    const res = await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return res.ok ? { ok: true } : { error: (await res.json()).error ?? 'unknown' };
  } catch {
    return { error: 'unknown' };
  }
}

export async function logOut() {
  await fetch('/api/logout', { method: 'POST' });
}

/**
 * The signed-in runner's calendar and pouch, synced from Strava (at most every 10 minutes).
 * Signed out: demo data, with `demo: true`.
 */
export async function getProgress(): Promise<{ progress: Progress; demo: boolean } | { error: 'sync_failed' }> {
  try {
    const res = await fetch('/api/progress', { cache: 'no-store' });
    if (res.status === 401) return { progress: demoProgress(), demo: true };
    if (!res.ok) return { error: 'sync_failed' };
    return { progress: await res.json(), demo: false };
  } catch {
    return { error: 'sync_failed' };
  }
}

export type Friend = { nickname: string; displayName: string; avatarUrl: string | null; note: string };

/** Runners you swapped ornaments with. Signed out: the demo friends. */
export async function getFriends(): Promise<Friend[]> {
  try {
    const res = await fetch('/api/friends', { cache: 'no-store' });
    if (res.status === 401) return FRIENDS.map((f) => ({ nickname: f.nickname, displayName: f.name, avatarUrl: null, note: f.note }));
    return res.ok ? (await res.json()).friends : [];
  } catch {
    return [];
  }
}

/** Revokes Strava access and deletes the runner with their tree. */
export async function deleteAccount(): Promise<boolean> {
  const res = await fetch('/api/me', { method: 'DELETE' });
  return res.ok;
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

/** Demo friends for signed-out visitors. */
const FRIENDS = [
  { nickname: 'mina', name: 'Mina', note: 'Hung an ornament on your tree' },
  { nickname: 'jonas', name: 'Jonas', note: 'Visited your tree yesterday' },
  { nickname: 'aiko', name: 'Aiko', note: 'From your saved trees' },
];
