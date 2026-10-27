'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DOORS } from '@/lib/calendar';
import { getProgress } from '@/lib/data';
import { getFriends } from '@/lib/friends';

/** Ornaments given, days run and friends, from your calendar (or the demo's). */
export default function MeStats() {
  const [stats, setStats] = useState<{ label: string; value: string; href?: string }[] | null>(null);
  useEffect(() => {
    Promise.all([getProgress(), getFriends()]).then(([res, friends]) => {
      if (!('progress' in res)) return;
      const p = res.progress;
      const daysSoFar = Math.min(Math.max(p.today - (p.doors[p.today - 1] === 'today' ? 1 : 0), 0), DOORS);
      setStats([
        { label: 'Ornaments given', value: `${Object.keys(p.given).length}`, href: '/me/given' },
        { label: 'Days run', value: `${p.doors.filter((s) => s === 'opened').length}/${daysSoFar}` },
        { label: 'Friends', value: `${friends.length}` },
      ]);
    });
  }, []);

  return (
    <div className="steps mt16" aria-busy={!stats}>
      {(stats ?? []).map((s) => {
        const body = (<><b>{s.value}</b><span>{s.label}</span></>);
        return s.href
          ? <Link key={s.label} href={s.href} className="step link">{body}</Link>
          : <div key={s.label} className="step">{body}</div>;
      })}
    </div>
  );
}
