'use client';

import { useEffect, useState } from 'react';
import { nicknameAvailable } from './me';
import type { NicknameCheck } from './nickname';

export type Availability = 'checking' | 'free' | 'taken' | 'error';

/** Checks the tree name against the server as it's typed; `confirm()` waits for a fresh answer. */
export function useAvailability(nick: string, formatOk: boolean) {
  const [state, setState] = useState<{ nick: string; avail: Availability } | null>(null);
  const ask = async (name: string) => {
    const free = await nicknameAvailable(name);
    const avail: Availability = free === null ? 'error' : free ? 'free' : 'taken';
    setState((s) => (s?.nick === name ? { nick: name, avail } : s));
    return avail;
  };
  useEffect(() => {
    if (!formatOk) return setState(null);
    setState({ nick, avail: 'checking' });
    const t = setTimeout(() => ask(nick), 350);
    return () => clearTimeout(t);
  }, [nick, formatOk]);
  const avail = state?.nick === nick ? state.avail : formatOk ? 'checking' : null;
  const confirm = () => {
    if (avail === 'free') return Promise.resolve<Availability>('free');
    setState({ nick, avail: 'checking' });
    return ask(nick);
  };
  return { avail, confirm };
}

export const AVAILABILITY: Record<Availability, (nick: string) => NicknameCheck> = {
  checking: () => ({ ok: false, message: 'Checking…' }),
  free: () => ({ ok: true, message: 'Looks good, it’s free' }),
  taken: (nick) => ({ ok: false, message: `“${nick}” is taken. Try another.` }),
  error: () => ({ ok: false, message: 'Couldn’t check this name. Please try again.' }),
};
