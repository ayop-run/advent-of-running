'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Remembers which pages of this app the tab has visited, so Back only goes back when the
 * previous page is ours. `history.length` can't tell: it also counts other sites and the
 * new-tab page.
 */
const KEY = 'aor:nav';
let popped = false;
let replacing = false;

const read = (): string[] => {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
};
const write = (stack: string[]) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(stack.slice(-50)));
  } catch {}
};

/** True when the page before this one in the tab's history is a page of this app. */
export const canGoBack = () => read().length > 1;

/** Call before a `replace` navigation, so the next page takes this one's place. */
export const willReplace = () => (replacing = true);

export default function NavHistory() {
  const path = usePathname();

  useEffect(() => {
    const onPop = () => (popped = true);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const stack = read();
    if (stack[stack.length - 1] === path) return; // reload
    if (replacing) stack[Math.max(0, stack.length - 1)] = path;
    else if (popped && stack[stack.length - 2] === path) stack.pop(); // browser or in-app back
    else stack.push(path);
    popped = replacing = false;
    write(stack);
  }, [path]);

  return null;
}
