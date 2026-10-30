'use client';

import { useEffect, useState } from 'react';
import { demoName } from './demo/names';
import { incomingRequests as demoIncoming } from './demo/requests';
import { getMe } from './me';

/**
 * NOTIFICATIONS
 * Someone followed you, asked you to hang an ornament, or hung one on your tree. In-app only.
 * A hung ornament shows only the sender's initial: names stay a surprise until Christmas.
 */

type Person = { nickname: string; name: string; avatarUrl?: string | null; official?: boolean };
type Base = { id: string; createdAt: string; read: boolean };

export type Notification =
  | (Base & { kind: 'followed'; who: Person; following: boolean })
  | (Base & { kind: 'asked'; who: Person; given: boolean })
  | (Base & { kind: 'hung'; initial: string; ornamentId: string });

/** Signed out: the demo's two requests, already read. Null if loading failed. */
export async function getNotifications(): Promise<Notification[] | null> {
  if (!(await getMe())) {
    const now = Date.now();
    return demoIncoming().map((nick, i) => ({
      id: `demo-${nick}`,
      kind: 'asked' as const,
      createdAt: new Date(now - (i + 1) * 3 * 3600_000).toISOString(),
      read: true,
      who: { nickname: nick, name: demoName(nick) },
      given: false,
    }));
  }
  try {
    const res = await fetch('/api/notifications', { cache: 'no-store' });
    return res.ok ? (await res.json()).items : null;
  } catch {
    return null;
  }
}

const UNREAD_EVENT = 'aor:unread';

/** Marks everything read and clears the dots. */
export async function markAllRead() {
  if (!(await getMe())) return;
  await fetch('/api/notifications', { method: 'POST' }).catch(() => null);
  window.dispatchEvent(new CustomEvent(UNREAD_EVENT, { detail: 0 }));
}

/** How many notifications are unread (0 signed out); updates when they're marked read. */
export function useUnread() {
  const [n, setN] = useState(0);
  useEffect(() => {
    let live = true;
    // marking read wins over a count that was still on its way
    let marked = false;
    getMe().then(async (me) => {
      if (!me) return;
      const res = await fetch('/api/notifications?count=1', { cache: 'no-store' }).catch(() => null);
      if (live && !marked && res?.ok) setN((await res.json()).unread ?? 0);
    });
    const on = (e: Event) => {
      marked = true;
      setN((e as CustomEvent<number>).detail);
    };
    window.addEventListener(UNREAD_EVENT, on);
    return () => {
      live = false;
      window.removeEventListener(UNREAD_EVENT, on);
    };
  }, []);
  return n;
}
