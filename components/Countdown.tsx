'use client';

import { useEffect, useState } from 'react';
import { untilChristmas } from '@/lib/calendar';

/** Big pixel countdown to Dec 25, 00:00 in the viewer's time zone. */
export function CountdownTiles() {
  const [t, setT] = useState<ReturnType<typeof untilChristmas> | null>(null);
  useEffect(() => {
    setT(untilChristmas());
    const id = setInterval(() => setT(untilChristmas()), 30000);
    return () => clearInterval(id);
  }, []);
  const parts: [string, string][] = t
    ? [[String(t.d), 'days'], [String(t.h).padStart(2, '0'), 'hours'], [String(t.m).padStart(2, '0'), 'min']]
    : [['–', 'days'], ['–', 'hours'], ['–', 'min']];
  return (
    <div className="row" style={{ gap: 6 }} aria-label={t ? `Messages open in ${t.d} days ${t.h} hours` : undefined}>
      {parts.map(([v, l]) => (
        <div key={l} className="center" style={{ minWidth: 44 }}>
          <div className="pix" style={{ color: 'var(--gold)' }}>{v}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

export default function Countdown({ prefix = 'Messages open in' }: { prefix?: string }) {
  const [t, setT] = useState<ReturnType<typeof untilChristmas> | null>(null);
  useEffect(() => {
    setT(untilChristmas());
    const id = setInterval(() => setT(untilChristmas()), 30000);
    return () => clearInterval(id);
  }, []);
  if (!t) return <span>{prefix} …</span>;
  if (t.done) return <span>Messages are open</span>;
  return <span>{prefix} {t.d} days and {t.h} hours</span>;
}
