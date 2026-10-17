'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Avatar } from '@/components/PixelTree';
import Sprite from '@/components/Sprite';
import { DEMO_TODAY, doorOrnament } from '@/lib/calendar';
import { ChevronIcon } from '@/components/Icons';
import { canGiveTo, friendNote, getFriends, type Friend } from '@/lib/friends';
import { getMe } from '@/lib/me';
import { BY_ID } from '@/lib/ornaments';

type Phase = 'wrapped' | 'opening' | 'open';

/** Sparkles fly out from the box in eight directions when it pops. */
const BURST = [
  [0, -56], [40, -40], [56, 0], [40, 40], [0, 56], [-40, 40], [-56, 0], [-40, -40],
] as const;

export default function GiftOpened() {
  const o = BY_ID[doorOrnament(DEMO_TODAY)];
  const [phase, setPhase] = useState<Phase>('wrapped');
  const [friends, setFriends] = useState<Friend[]>([]);
  // one per tree, so suggest friends who don't have one of yours yet
  useEffect(() => setFriends(getFriends(getMe().nickname).filter((f) => canGiveTo(f.nickname)).slice(0, 4)), []);
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
          <p className="center soft mt8">Now give it away: pick a friend and hang it on their tree with a sealed message.</p>

          <h2 className="h2 mt32">Give it to</h2>
          <p className="small soft mt4">Friends who don&apos;t have one of yours yet.</p>
          {friends.length === 0 && <p className="small soft mt12">Everyone on your list has one already. Find someone new below.</p>}
          <div className="stack mt12" style={{ gap: 8 }}>
            {friends.map((f) => (
              <div key={f.nickname} className="panel quiet row" style={{ padding: '12px 12px 12px 14px' }}>
                <Avatar owner={{ name: f.name }} size={38} />
                <div className="grow" style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800 }}>{f.name}</div>
                  <div className="tiny muted">{friendNote(f)}</div>
                </div>
                <Link href={`/t/${f.nickname}/hang?o=${o.id}`} className="btn sm">Give</Link>
              </div>
            ))}
          </div>
          <Link href={`/friends?give=${o.id}`} className="panel quiet row mt8" style={{ color: 'var(--snow)', padding: '12px 16px' }}>
            <span className="grow small" style={{ fontWeight: 700 }}>Someone else? Find a tree by name</span>
            <ChevronIcon />
          </Link>
        </div>
      ) : (
        <>
          <p className="center eyebrow mt16" style={{ color: 'var(--gold)' }}>Door {DEMO_TODAY} of 24 · you ran it!</p>
          <h1 className="h1 center mt8">Your gift is ready</h1>
          <p className="center soft mt8">Open today&apos;s door to see which ornament you get, then give it to a friend.</p>
          <button className="btn block mt24" onClick={unwrap} aria-busy={phase === 'opening'}>
            {phase === 'opening' ? 'Unwrapping…' : 'Unwrap'}
          </button>
        </>
      )}

      <div className="grow" />
      {open && <p className="center tiny muted mt24">Your friend sees it on their tree right away. Your message stays sealed until Christmas.</p>}
    </main>
  );
}
