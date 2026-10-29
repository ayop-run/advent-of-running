'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Sk from '@/components/Skeleton';
import { DOORS } from '@/lib/calendar';
import { getProgress } from '@/lib/data';
import { getFriends } from '@/lib/friends';

const TILES = [
  { label: 'Ornaments given', href: '/me/given' },
  { label: 'Days run' },
  { label: 'Friends' },
];

/** Ornaments given, days run and friends, from your calendar (or the demo's). */
export default function MeStats() {
  // one value per tile; null while loading
  const [values, setValues] = useState<string[] | null>(null);
  useEffect(() => {
    Promise.all([getProgress(), getFriends()]).then(([res, friends]) => {
      if (!('progress' in res)) return setValues(['–', '–', `${friends.length}`]);
      const p = res.progress;
      const daysSoFar = Math.min(Math.max(p.today - (p.doors[p.today - 1] === 'today' ? 1 : 0), 0), DOORS);
      setValues([`${Object.keys(p.given).length}`, `${p.doors.filter((s) => s === 'opened').length}/${daysSoFar}`, `${friends.length}`]);
    });
  }, []);

  // the labels show right away and only the numbers wait, so the tiles never change height
  return (
    <div className="steps mt12" aria-busy={!values}>
      {TILES.map((t, i) => {
        const body = (
          <>
            {values ? <b className="loaded">{values[i]}</b> : <b><Sk inline w="1.6em" h="1em" style={{ verticalAlign: 'top' }} /></b>}
            <span>{t.label}</span>
          </>
        );
        return t.href && values
          ? <Link key={t.label} href={t.href} className="step link">{body}</Link>
          : <div key={t.label} className={`step${t.href ? ' link' : ''}`}>{body}</div>;
      })}
    </div>
  );
}
