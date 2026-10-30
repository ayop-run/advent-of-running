'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Avatar } from '@/components/PixelTree';
import Sk from '@/components/Skeleton';
import Sprite from '@/components/Sprite';
import { DOORS, type Progress } from '@/lib/calendar';
import { getProgress } from '@/lib/data';
import { ChevronIcon } from '@/components/Icons';
import { canGiveTo, friendNote, getFriends, type Friend } from '@/lib/friends';
import { BY_ID } from '@/lib/ornaments';

type Phase = 'wrapped' | 'opening' | 'open';

/** Sparkles fly out from the box in eight directions when it pops. */
const BURST = [
  [0, -56], [40, -40], [56, 0], [40, 40], [0, 56], [-40, 40], [-56, 0], [-40, -40],
] as const;

export default function GiftOpened() {
  const [p, setP] = useState<Progress | null>(null);
  const [phase, setPhase] = useState<Phase>('wrapped');
  const [friends, setFriends] = useState<Friend[]>([]);
  useEffect(() => {
    getProgress().then((res) => 'progress' in res && setP(res.progress));
    // one per tree, so suggest friends who don't have one of yours yet
    getFriends().then((all) => setFriends(all.filter((f) => canGiveTo(f.nickname, all)).slice(0, 4)));
  }, []);
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
  // the newest ornament you earned and haven't given yet
  const gift = p?.unwrapped[0];
  const o = gift ? BY_ID[gift.ornamentId] : null;
  const label = gift?.door ? `Door ${gift.door} of ${DOORS}` : 'Weekly prize';

  if (!p) {
    return (
      <main className="screen no-nav" aria-busy="true">
        <div className="topbar"><Sk w={96} h={26} /><Sk w={44} h={18} /></div>
        <div className="showcase mt8 tree-waiting"><Sprite id="gift-box" px={4} /></div>
        <div className="mt16" style={{ display: 'grid', justifyItems: 'center', gap: 10 }}>
          <Sk w={200} h={24} />
          <Sk w={260} h={14} />
          <Sk w={220} h={14} />
        </div>
        <Sk h={56} className="mt24" />
      </main>
    );
  }
  if (!o) {
    return (
      <main className="screen no-nav">
        <div className="topbar">
          <span className="badge">{p.todayKm.toFixed(1)} km today</span>
          <Link href="/tree" className="textlink">Close</Link>
        </div>
        <div className="showcase mt8"><Sprite id="gift-box" px={4} label="Wrapped gift" /></div>
        <h1 className="h1 center mt16">Nothing to unwrap yet</h1>
        <p className="center soft mt8">Run 1 km to open today&apos;s door. The ornament inside is yours to give to a friend.</p>
        <Link href="/calendar" className="btn block mt24">Open the calendar</Link>
      </main>
    );
  }

  return (
    <main className="screen no-nav">
      <div className="topbar">
        <span className="badge">{p.todayKm.toFixed(1)} km today</span>
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
          <p className="center eyebrow mt16" style={{ color: 'var(--gold)' }}>{label} · unwrapped</p>
          <h1 className="h1 center mt8">{o.name}</h1>
          <p className="center soft mt8">Now give it away: pick a friend and hang it on their tree with a sealed message.</p>

          <h2 className="h2 mt32">Give it to</h2>
          <p className="small soft mt4">Friends who don&apos;t have one of yours yet.</p>
          {friends.length === 0 && <p className="small soft mt12">Everyone on your list has one already. Find someone new below.</p>}
          <div className="stack mt12" style={{ gap: 8 }}>
            {friends.map((f) => (
              <div key={f.nickname} className="panel quiet row item">
                <Avatar owner={{ name: f.name, avatarUrl: f.avatarUrl ?? undefined }} size={38} />
                <div className="grow" style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800 }}>{f.name}</div>
                  <div className="tiny muted">{friendNote(f)}</div>
                </div>
                <Link href={`/t/${f.nickname}/hang?o=${o.id}`} className="btn sm">Give</Link>
              </div>
            ))}
          </div>
          <Link href={`/friends?give=${o.id}`} className="panel quiet row link-row mt8">
            <span className="grow small" style={{ fontWeight: 700 }}>Someone else? See all runners</span>
            <ChevronIcon />
          </Link>
        </div>
      ) : (
        <>
          <p className="center eyebrow mt16" style={{ color: 'var(--gold)' }}>{label} · you ran it!</p>
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
