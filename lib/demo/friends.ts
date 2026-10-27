import { DEMO_GIVEN } from '../calendar';
import { getTree, myOrnamentOn } from './data';
import { DEMO_NICKNAME } from './me';

/**
 * PROTOTYPE FRIENDS
 * Your friends are everyone you're connected to through ornaments: people who hung one on
 * your tree, people you gave one to, and trees you visited. Phase 2 reads these from the
 * database; trees you visit are remembered in the browser for now.
 */

export type Friend = {
  nickname: string;
  name: string;
  /** ornaments they hung on your tree */
  hung: number;
  /** ornaments you gave them */
  given: number;
  visited: boolean;
};

const VISITED_KEY = 'aor:visited';
/** Trees that exist in the demo besides your friends'. */
const DEMO_TREES = ['mina', 'jonas', 'aiko', 'leo', 'hana', 'tom', 'ella', 'sam', 'noah', 'yuki', 'ben', 'kai', 'lena', 'rio', 'momo', 'zara'];

const display = (nick: string) => nick.charAt(0).toUpperCase() + nick.slice(1);

export function getVisited(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(VISITED_KEY) ?? '[]');
  } catch {
    return [];
  }
}

/** Remember a tree you looked at, most recent first. */
export function rememberVisit(nickname: string) {
  const nick = nickname.toLowerCase();
  try {
    const list = [nick, ...getVisited().filter((n) => n !== nick)].slice(0, 20);
    window.localStorage.setItem(VISITED_KEY, JSON.stringify(list));
  } catch {
    /* storage blocked */
  }
}

/** Everyone you're connected to, people you swap with the most first. */
export function getFriends(me: string): Friend[] {
  const byNick = new Map<string, Friend>();
  const get = (nick: string) => {
    const key = nick.toLowerCase();
    if (!byNick.has(key)) byNick.set(key, { nickname: key, name: display(key), hung: 0, given: 0, visited: false });
    return byNick.get(key)!;
  };
  for (const h of getTree(DEMO_NICKNAME).ornaments) get(h.from).hung += 1;
  for (const name of Object.values(DEMO_GIVEN)) get(name).given += 1;
  for (const nick of getVisited()) {
    const f = get(nick);
    f.visited = true;
    // ornaments you hung while visiting (not from a door) count as given too
    if (!f.given && myOrnamentOn(nick)) f.given = 1;
  }
  byNick.delete(me.toLowerCase());
  return [...byNick.values()].sort((a, b) => b.hung + b.given - (a.hung + a.given) || a.name.localeCompare(b.name));
}

/** One short line about how you know each other. */
export function friendNote(f: Friend, { showGiven = true } = {}) {
  const bits: string[] = [];
  if (f.hung) bits.push(f.hung > 1 ? `Hung ${f.hung} on your tree` : 'Hung one on your tree');
  if (f.given && showGiven) bits.push('Has yours');
  if (!bits.length && f.visited) bits.push('You visited their tree');
  return bits.join(' · ');
}

/** You can hang one ornament on each friend's tree: not one you gave from a door, nor one you hung. */
export const canGiveTo = (nickname: string) => {
  const nick = nickname.toLowerCase();
  return !Object.values(DEMO_GIVEN).some((n) => n.toLowerCase() === nick) && !myOrnamentOn(nick);
};

/** Whether a tree with this name exists (in the demo: friends and a few known trees). */
export function treeExists(nick: string, me: string) {
  const n = nick.toLowerCase();
  return n === me.toLowerCase() || DEMO_TREES.includes(n) || getFriends(me).some((f) => f.nickname === n);
}
