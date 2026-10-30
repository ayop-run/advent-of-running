'use client';

import * as demo from './demo/requests';
import { demoName } from './demo/names';
import { getMe } from './me';
import { getNotifications } from './notifications';

/**
 * REQUESTS
 * Ask a friend to hang an ornament on your tree; they get a notification. Incoming requests
 * are the "asked" notifications from friends whose tree you haven't hung on yet.
 * Signed out: the demo's, kept in the browser.
 */

export type FriendRequest = { nickname: string; name: string; avatarUrl?: string | null };

/** Tree names of the friends you asked. */
export async function getAsked(): Promise<string[]> {
  if (!(await getMe())) return demo.getAsked();
  try {
    const res = await fetch('/api/requests', { cache: 'no-store' });
    return res.ok ? (await res.json()).asked : [];
  } catch {
    return [];
  }
}

/** Sends the request. False if it couldn't be sent. */
export async function ask(nickname: string): Promise<boolean> {
  if (!(await getMe())) {
    demo.ask(nickname);
    return true;
  }
  try {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Friends waiting for you to hang one on their tree (gone once you have). */
export async function incomingRequests(): Promise<FriendRequest[]> {
  if (!(await getMe())) return demo.incomingRequests().map((nickname) => ({ nickname, name: demoName(nickname) }));
  const list = await getNotifications();
  return (list ?? []).flatMap((n) => (n.kind === 'asked' && !n.given ? [n.who] : []));
}
