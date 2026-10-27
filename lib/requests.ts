'use client';

import * as demo from './demo/requests';
import { getMe } from './me';

/**
 * REQUESTS
 * Ask a friend to hang an ornament on your tree, and see who asked you. Phase 2 sends
 * these as in-app notifications; for now your sent requests live in the browser, and only
 * the demo has incoming ones.
 */

export const getAsked = demo.getAsked;
export const ask = demo.ask;

/** Friends waiting for you to hang one on their tree (gone once you have). */
export async function incomingRequests(): Promise<string[]> {
  return (await getMe()) ? [] : demo.incomingRequests();
}
