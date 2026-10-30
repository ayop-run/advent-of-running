'use client';

import * as demo from './demo/friends';
import { DEMO_NICKNAME, getMe, nicknameTaken } from './me';

/**
 * FRIENDS
 * The trees you follow, plus everyone you swapped ornaments with (they hung one on your tree,
 * or you on theirs). Search finds other runners by name or tree name to follow. Following is
 * one-way and needs no approval: trees are public to anyone with the link anyway.
 * Signed out: the demo's friends, with follows kept in the browser.
 */

export type Friend = {
  nickname: string;
  name: string;
  avatarUrl?: string | null;
  /** ornaments they hung on your tree */
  hung: number;
  /** ornaments you gave them (one per tree) */
  given: number;
  visited: boolean;
  /** you follow their tree */
  following: boolean;
  /** run by Advent of Running itself (AYOP), not a Strava runner */
  official?: boolean;
};

export const getVisited = demo.getVisited;
export const rememberVisit = demo.rememberVisit;
export const friendNote = demo.friendNote;

/** Trees you follow and people you swapped with; people you swap with the most first. */
export async function getFriends(): Promise<Friend[]> {
  const me = await getMe();
  if (!me) return demo.getFriends(DEMO_NICKNAME);

  let friends: Friend[] = [];
  try {
    const res = await fetch('/api/friends', { cache: 'no-store' });
    if (res.ok) friends = (await res.json()).friends;
  } catch {
    /* offline: an empty list */
  }
  return friends.sort((a, b) => b.hung + b.given - (a.hung + a.given) || a.name.localeCompare(b.name));
}

/** Runners whose name or tree name contains `query` (2+ characters). Null if the search failed. */
export async function searchRunners(query: string): Promise<Friend[] | null> {
  if (query.trim().length < 2) return [];
  if (!(await getMe())) return demo.searchRunners(query, DEMO_NICKNAME);
  try {
    const res = await fetch(`/api/friends?${new URLSearchParams({ q: query.trim() })}`, { cache: 'no-store' });
    return res.ok ? (await res.json()).results : null;
  } catch {
    return null;
  }
}

/** Follow or unfollow a friend's tree. Returns whether it worked. */
export async function setFollowing(nickname: string, follow: boolean): Promise<boolean> {
  if (!(await getMe())) {
    demo.setFollowing(nickname, follow);
    return true;
  }
  try {
    const res = await fetch('/api/follow', {
      method: follow ? 'POST' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Whether you follow this tree. */
export async function isFollowing(nickname: string) {
  const nick = nickname.toLowerCase();
  return (await getFriends()).some((f) => f.nickname === nick && f.following);
}

/** You can hang one ornament on each friend's tree. Trees not in your list are checked when you hang. */
export const canGiveTo = (nickname: string, friends: Friend[]) =>
  !friends.some((f) => f.nickname === nickname.toLowerCase() && f.given > 0);

/** Whether a tree with this name exists: a real one, or (signed out) one of the demo's. */
export async function treeExists(nick: string) {
  if (await nicknameTaken(nick)) return true;
  return !(await getMe()) && demo.treeExists(nick, DEMO_NICKNAME);
}
