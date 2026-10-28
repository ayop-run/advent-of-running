'use client';

import { demoProgress, type Progress } from './calendar';
import * as demo from './demo/data';
import { treeExists as demoTreeExists } from './demo/friends';
import { DEMO_NICKNAME, getMe } from './me';
import type { Hint } from './ornaments';

/**
 * DATA LAYER
 * Real trees live in Supabase and come through the app's /api routes (app/api, lib/server).
 * Messages never reach the browser, except your own. Signed-out visitors on trees that
 * aren't real (the seed trees, or names nobody has) get the browser demo (lib/demo), so the
 * prototype stays clickable without a Strava account. Pages only call the functions below.
 */

export type Hung = {
  id: string;
  ornamentId: string;
  from: string;
  hint: Hint;
  /** empty until Christmas, except on the ornament you hung yourself */
  message: string;
  createdAt: string;
  /** hung by you: one per tree */
  mine?: boolean;
};

export type Tree = {
  nickname: string;
  displayName: string;
  avatarUrl?: string | null;
  ornaments: Hung[];
  /** false when no runner has this tree name */
  exists: boolean;
};

/** Where a tree's data comes from for this visitor. */
type Source = { kind: 'server'; tree: Tree } | { kind: 'demo' };

async function source(nickname: string): Promise<Source> {
  const nick = nickname.toLowerCase();
  const [me, res] = await Promise.all([getMe(), fetch(`/api/tree/${encodeURIComponent(nick)}`, { cache: 'no-store' })]);
  const body = res.ok ? await res.json() : { tree: null, real: false };
  // signed out, trees play as the browser demo; names it doesn't know don't exist
  if (!me && !body.real && (body.tree || demoTreeExists(nick, DEMO_NICKNAME, false))) return { kind: 'demo' };
  if (!body.tree) {
    return { kind: 'server', tree: { nickname: nick, displayName: nick.charAt(0).toUpperCase() + nick.slice(1), ornaments: [], exists: false } };
  }
  return { kind: 'server', tree: { ...body.tree, exists: true, ornaments: withGuestOrnaments(nick, body.tree.ornaments) } };
}

export async function getTree(nickname: string): Promise<Tree> {
  const s = await source(nickname);
  return s.kind === 'demo' ? { ...demo.getTree(nickname), exists: true } : s.tree;
}

/* Ornaments a guest (no account) hung on real trees, remembered in their browser. */

type GuestHung = { tree: string; id: string; editToken: string; ornamentId: string; from: string; hint: Hint; message: string };
const GUEST_KEY = 'aor:guest-hung';

function guestHung(): GuestHung[] {
  try {
    return JSON.parse(window.localStorage.getItem(GUEST_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveGuestHung(list: GuestHung[]) {
  try {
    window.localStorage.setItem(GUEST_KEY, JSON.stringify(list));
  } catch {
    /* storage blocked */
  }
}

/** Mark the guest's own ornament on a tree and show their own words on it. */
function withGuestOrnaments(nick: string, ornaments: Hung[]): Hung[] {
  const own = new Map(guestHung().filter((g) => g.tree === nick).map((g) => [g.id, g]));
  return ornaments.map((h) => {
    const g = own.get(h.id);
    return g ? { ...h, mine: true, message: g.message, from: g.from, hint: g.hint, ornamentId: g.ornamentId } : h;
  });
}

/** The ornament you hung on this tree, if any. Everyone gets one per tree. */
export async function myOrnamentOn(nickname: string): Promise<Hung | null> {
  return (await getTree(nickname)).ornaments.find((h) => h.mine) ?? null;
}

export type HangError = 'tree_not_found' | 'sign_in_required' | 'hanging_closed' | 'not_earned' | 'not_yours' | 'invalid' | 'unknown';

export type HangInput = Pick<Hung, 'ornamentId' | 'from' | 'hint' | 'message'>;

/** Hang an ornament. One per tree: hanging again returns the one already there. */
export async function hangOrnament(nickname: string, input: HangInput): Promise<{ id: string } | { error: HangError }> {
  const nick = nickname.toLowerCase();
  if ((await source(nick)).kind === 'demo') return { id: demo.hangOrnament(nick, input).id };
  try {
    const res = await fetch('/api/hang', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: nick, ...input }),
    });
    const body = await res.json();
    if (!res.ok) return { error: body.error ?? 'unknown' };
    if (body.editToken) saveGuestHung([...guestHung().filter((g) => g.tree !== nick), { tree: nick, id: body.id, editToken: body.editToken, ...input }]);
    return { id: body.id };
  } catch {
    return { error: 'unknown' };
  }
}

export type HungEdit = Pick<Hung, 'message' | 'hint' | 'from'> & { ornamentId: string };

/** Change the ornament you hung on this tree (open until hanging closes on Dec 24). */
export async function editMyOrnament(nickname: string, patch: HungEdit): Promise<{ id: string } | { error: HangError }> {
  const nick = nickname.toLowerCase();
  if ((await source(nick)).kind === 'demo') {
    const h = demo.editMyOrnament(nick, patch);
    return h ? { id: h.id } : { error: 'not_yours' };
  }
  const guest = guestHung().find((g) => g.tree === nick);
  try {
    const res = await fetch('/api/hang', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: nick, ...patch, id: guest?.id, editToken: guest?.editToken }),
    });
    const body = await res.json();
    if (!res.ok) return { error: body.error ?? 'unknown' };
    if (guest) saveGuestHung(guestHung().map((g) => (g.id === guest.id ? { ...g, ...patch } : g)));
    return { id: body.id };
  } catch {
    return { error: 'unknown' };
  }
}

/**
 * Your calendar: doors, km per day, and the ornaments you unwrapped, synced from Strava
 * (at most every 10 minutes). Only you can see it. Signed out: the demo calendar.
 */
export async function getProgress(): Promise<{ progress: Progress; demo: boolean } | { error: 'sync_failed' }> {
  if (!(await getMe())) return { progress: demoProgress(), demo: true };
  try {
    const res = await fetch('/api/progress', { cache: 'no-store' });
    if (!res.ok) return { error: 'sync_failed' };
    return { progress: await res.json(), demo: false };
  } catch {
    return { error: 'sync_failed' };
  }
}

/** The demo tree with its messages, for the Christmas morning preview. */
export const christmasPreview = () => demo.getTree(DEMO_NICKNAME).ornaments;
