'use client';

import { useEffect, useState } from 'react';
import * as demo from './demo/me';

/**
 * ACCOUNT
 * Signed in = a Strava login session (server cookie). Signed out, the app runs as the browser
 * demo (lib/demo), so it stays clickable without a Strava account.
 */

/** The signed-in runner's own profile. Only returned to that runner. */
export type Me = {
  nickname: string;
  displayName: string;
  avatarUrl: string | null;
  timeZone: string;
  hangPolicy: 'anyone' | 'signed_in';
  emailOptIn: boolean;
  /** False until the runner finished sign-up (confirmed tree name and time zone). */
  onboarded: boolean;
};

export const DEMO_NICKNAME = demo.DEMO_NICKNAME;

let cached: Promise<Me | null> | null = null;

/** The signed-in runner, or null when signed out. Fetched once per visit. */
export function getMe(): Promise<Me | null> {
  cached ??= fetch('/api/me', { cache: 'no-store' })
    .then((res) => (res.ok ? res.json() : { runner: null }))
    .then((body) => body.runner as Me | null)
    .catch(() => null);
  return cached;
}

/** After logging in, out or changing the profile. */
export function refreshMe() {
  cached = null;
  return getMe();
}

/** `undefined` while loading, `null` when signed out. */
export function useMe() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  useEffect(() => {
    getMe().then(setMe);
  }, []);
  return me;
}

/** Whose tree "My tree" shows: yours, or the demo's when signed out. */
export const myNickname = (me: Me | null | undefined) => me?.nickname ?? DEMO_NICKNAME;

export const displayName = (nick: string) => nick.charAt(0).toUpperCase() + nick.slice(1);

export const markInApp = demo.markInApp;
export const isLoggedOut = demo.isLoggedOut;

/** A member using the app (signed in, or browsing the demo from inside it), not a guest from a shared link. */
export async function isMember() {
  return Boolean(await getMe()) || demo.isMember();
}

/** Ends the session; logging in again with Strava returns to the same tree. */
export async function logOut() {
  await fetch('/api/logout', { method: 'POST' });
  demo.logOut();
  cached = Promise.resolve(null);
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
    if (!res.ok) return { error: (await res.json()).error ?? 'unknown' };
    await refreshMe();
    return { ok: true };
  } catch {
    return { error: 'unknown' };
  }
}

/** Revokes Strava access and deletes the runner with their tree, ornaments and runs. */
export async function deleteAccount(): Promise<boolean> {
  const res = await fetch('/api/me', { method: 'DELETE' });
  if (res.ok) cached = Promise.resolve(null);
  return res.ok;
}

/** Strava login. Sign-up passes the chosen tree name and time zone along. */
export const stravaLoginUrl = (signup?: { nick: string; tz: string }) =>
  signup ? `/api/strava/connect?${new URLSearchParams(signup)}` : '/api/strava/connect';

/** Sign-up: whether this tree name is free (your own counts as free), or null if it couldn't be checked. */
export async function nicknameAvailable(nick: string): Promise<boolean | null> {
  try {
    const res = await fetch(`/api/nickname?${new URLSearchParams({ name: nick })}`, { cache: 'no-store' });
    return res.ok ? (await res.json()).available === true : null;
  } catch {
    return null;
  }
}

/** Whether another runner already has this tree name. */
export async function nicknameTaken(nick: string) {
  try {
    const res = await fetch(`/api/tree/${encodeURIComponent(nick)}`, { cache: 'no-store' });
    return res.ok && (await res.json()).tree !== null;
  } catch {
    return false;
  }
}
