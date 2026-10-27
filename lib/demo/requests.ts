import { canGiveTo } from './friends';

/**
 * PROTOTYPE REQUESTS
 * Ask a friend to hang an ornament on your tree, and see who asked you. Phase 2 sends
 * these as in-app notifications; for now your sent requests live in the browser.
 */

const ASKED_KEY = 'aor:asked';

/** Friends who asked you in the demo. */
const DEMO_INCOMING = ['tom', 'sam'];

export function getAsked(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(ASKED_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function ask(nickname: string) {
  const nick = nickname.toLowerCase();
  try {
    window.localStorage.setItem(ASKED_KEY, JSON.stringify([...new Set([...getAsked(), nick])]));
  } catch {
    /* storage blocked */
  }
}

/** Friends waiting for you to hang one on their tree (gone once you have). */
export const incomingRequests = () => DEMO_INCOMING.filter((nick) => canGiveTo(nick));
