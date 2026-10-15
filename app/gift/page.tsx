'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Avatar } from '@/components/PixelTree';
import Sprite from '@/components/Sprite';
import { DEMO_TODAY, doorOrnament } from '@/lib/calendar';
import { FRIENDS } from '@/lib/data';
import { BY_ID } from '@/lib/ornaments';

type Phase = 'wrapped' | 'opening' | 'open';

/** Sparkles fly out from the box in eight directions when it pops. */
const BURST = [
  [0, -56], [40, -40], [56, 0], [40, 40], [0, 56], [-40, 40], [-56, 0], [-40, -40],
] as const;

export default function GiftOpened() {
  const o = BY_ID[doorOrnament(DEMO_TODAY)];
  const [phase, setPhase] = useState<Phase>('wrapped');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const unwrap = () => {
    if (phase !== 'wrapped') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setPhase('open');
    setPhase('opening');
    timer.current = setTimeout(() => setPhase('open'), 900);
  };

  const open = phase === 'open';

  return (
    <main className="screen no-nav">
      <div className="topbar">
        <span className="badge">3.2 km synced</span>
        <Link href="/tree" className="textlink">Close</Link>
      </div>

      <div className={`showcase unwrap ${phase} mt8`}>
        {open ? (
          <>
            <Sprite id={o.id} px={4} label={o.name} className="reveal" />
            {BURST.map(([dx, dy], i) => (
              <i key={i} className="burst" style={{ '--dx': `${dx}px`, '--dy': `${dy}px` } as React.CSSProperties} />
            ))}
            <i className="glint" style={{ top: 24, right: 28 }} />
            <i className="glint" style={{ bottom: 30, left: 26, animationDelay: '-1.2s' }} />
          </>
        ) : (
          <Sprite id="gift-box" px={4} label="Wrapped gift" className="box" />
        )}
      </div>

      {open ? (
        <div className="fade-in">
          <p className="center eyebrow mt16" style={{ color: 'var(--gold)' }}>Door {DEMO_TODAY} of 24 · unwrapped</p>
          <h1 className="h1 center mt8">{o.name}</h1>
          <p className="center soft mt8">Hang it on a friend&apos;s tree with a sealed message.</p>

          <h2 className="h2 mt32">Give it to</h2>
          <div className="stack mt12" style={{ gap: 8 }}>
            {FRIENDS.map((f) => (
              <div key={f.nickname} className="panel quiet row" style={{ padding: '12px 12px 12px 14px' }}>
                <Avatar owner={{ name: f.name }} size={38} />
                <div className="grow">
                  <div style={{ fontWeight: 800 }}>{f.name}</div>
                  <div className="tiny muted">{f.note}</div>
                </div>
                <Link href={`/t/${f.nickname}/hang?o=${o.id}`} className="btn sm">Hang</Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <p className="center eyebrow mt16" style={{ color: 'var(--gold)' }}>Door {DEMO_TODAY} of 24 · you ran it!</p>
          <h1 className="h1 center mt8">Your gift is ready</h1>
          <p className="center soft mt8">Every door hides a special ornament. Open it to see which one you got.</p>
          <button className="btn block mt24" onClick={unwrap} aria-busy={phase === 'opening'}>
            {phase === 'opening' ? 'Unwrapping…' : 'Unwrap'}
          </button>
        </>
      )}

      <div className="grow" />
      {open && (
        <>
          <Link href="/tree" className="btn ghost block mt24">Keep it for later</Link>
          <p className="center tiny muted mt8">You&apos;re holding 2 of 3. Any left on December 25 go on your own tree.</p>
        </>
      )}
    </main>
  );
}
