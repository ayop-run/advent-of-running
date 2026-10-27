'use client';

import * as demo from './demo/friends';
import { DEMO_NICKNAME, getMe, nicknameTaken } from './me';

/**
 * FRIENDS
 * Your friends are everyone you're connected to through ornaments: people who hung one on
 * your tree, people you gave one to, and trees you visited. The first two come from the
 * server; visited trees are remembered in the browser. Signed out: the demo's friends.
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
};

export const getVisited = demo.getVisited;
export const rememberVisit = demo.rememberVisit;
export const friendNote = demo.friendNote;

/** Everyone you're connected to, people you swap with the most first. */
export async function getFriends(): Promise<Friend[]> {
  const me = await getMe();
  if (!me) return demo.getFriends(DEMO_NICKNAME);

  let friends: Friend[] = [];
  try {
    const res = await fetch('/api/friends', { cache: 'no-store' });
    if (res.ok) friends = (await res.json()).friends;
  } catch {
    /* offline: visited trees only */
  }
  const byNick = new Map(friends.map((f) => [f.nickname, f]));
  for (const nick of getVisited()) {
    if (nick === me.nickname) continue;
    const f = byNick.get(nick);
    if (f) f.visited = true;
    else byNick.set(nick, { nickname: nick, name: nick.charAt(0).toUpperCase() + nick.slice(1), hung: 0, given: 0, visited: true });
  }
  return [...byNick.values()].sort((a, b) => b.hung + b.given - (a.hung + a.given) || a.name.localeCompare(b.name));
}

/** You can hang one ornament on each friend's tree. Trees not in your list are checked when you hang. */
export const canGiveTo = (nickname: string, friends: Friend[]) =>
  !friends.some((f) => f.nickname === nickname.toLowerCase() && f.given > 0);

/** Whether a tree with this name exists: a real one, or (signed out) one of the demo's. */
export async function treeExists(nick: string) {
  if (await nicknameTaken(nick)) return true;
  return !(await getMe()) && demo.treeExists(nick, DEMO_NICKNAME);
}
