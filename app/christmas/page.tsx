'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CountdownTiles } from '@/components/Countdown';
import { ChevronIcon, LetterIcon } from '@/components/Icons';
import { MusicButton } from '@/components/MusicToggle';
import Sk from '@/components/Skeleton';
import Sprite from '@/components/Sprite';
import SpriteFx from '@/components/SpriteFx';
import { animFor, animName } from '@/components/useBump';
import { adventMonth, monthName } from '@/lib/calendar';
import { getChristmas, type Christmas } from '@/lib/data';
import { BY_ID } from '@/lib/ornaments';

export default function ChristmasUnlock() {
  // signed out: the demo's letters as a preview; signed in: yours, sealed until the 25th
  const [data, setData] = useState<Christmas | null>(null);
  const [i, setI] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const load = useCallback(() => {
    setData(null);
    getChristmas().then(setData);
  }, []);
  useEffect(load, [load]);
  const list = data?.kind === 'preview' || data?.kind === 'open' ? data.ornaments : [];
  const day = `${monthName(adventMonth(new Date().getMonth() + 1))} 25`;

  /** Scroll the carousel to message n (swiping and the buttons share one scroll position). */
  const go = useCallback(
    (n: number) => {
      const el = track.current;
      const slide = el?.children[Math.max(0, Math.min(list.length - 1, n))] as HTMLElement | undefined;
      if (!el || !slide) return;
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollTo({ left: slide.offsetLeft, behavior: smooth ? 'smooth' : 'auto' });
    },
    [list.length],
  );

  // which card is showing, from the scroll position (works for swipe, keys and buttons alike)
  const onScroll = () => {
    const el = track.current;
    const first = el?.children[0] as HTMLElement | undefined;
    if (!el || !first) return;
    const step = first.offsetWidth + 12; // card width + gap
    setI(Math.round(el.scrollLeft / step));
  };

  // ← → move between messages, Home/End jump; ignored while typing
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target instanceof Element ? e.target : null;
      if (t?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight') go(i + 1);
      else if (e.key === 'ArrowLeft') go(i - 1);
      else if (e.key === 'Home') go(0);
      else if (e.key === 'End') go(list.length - 1);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, i, list.length]);

  const label = !data ? '' : data.kind === 'preview' ? `Preview of ${day}` : data.kind === 'open' ? day : `Sealed until ${day}`;
  const topbar = (
    <div className="topbar">
      <span className="small muted">{label}</span>
      <div className="topbar-end">
        <MusicButton />
        <Link href="/tree" className="textlink">Close</Link>
      </div>
    </div>
  );

  if (!data) {
    return (
      <main className="screen no-nav" aria-busy="true">
        {topbar}
        <Sk w={240} h={40} />
        <Sk w="80%" h={16} className="mt8" />
        <Sk h={260} className="mt24" />
      </main>
    );
  }

  if (data.kind === 'error') {
    return (
      <main className="screen no-nav">
        {topbar}
        <h1 className="h1">Your letters</h1>
        <p className="soft mt8">Couldn&apos;t load your letters right now.</p>
        <button className="btn block mt24" onClick={load}>Try again</button>
      </main>
    );
  }

  if (data.kind === 'sealed') {
    const n = data.count;
    return (
      <main className="screen no-nav loaded">
        {topbar}
        <section className="panel center sealed">
          <LetterIcon px={6} />
          <h1 className="h1 mt16">{n === 0 ? 'No letters yet' : `${n} ${n === 1 ? 'letter' : 'letters'} waiting`}</h1>
          <p className="soft mt8">
            {n === 0
              ? 'Share your tree so friends can hang an ornament with a letter for you.'
              : `Sealed until ${day}. Names and messages open at midnight.`}
          </p>
          <div className="row mt24" style={{ justifyContent: 'center' }}><CountdownTiles /></div>
        </section>
        <Link href="/tree" className="btn block section">{n === 0 ? 'Share your tree' : 'See your tree'}</Link>
      </main>
    );
  }

  if (list.length === 0) {
    return (
      <main className="screen no-nav loaded">
        {topbar}
        <h1 className="h1 xl">Merry Christmas!</h1>
        <p className="soft mt8">No letters on your tree this year. Next Advent, share your tree early.</p>
        <Link href="/tree" className="btn block section">See your tree</Link>
      </main>
    );
  }

  return (
    <main className="screen no-nav loaded">
      {topbar}
      <h1 className="h1 xl">Merry Christmas!</h1>
      <p className="soft mt8">{list.length} {list.length === 1 ? 'letter' : 'letters'} from friends {list.length === 1 ? 'is' : 'are'} open. Swipe to read them.</p>

      <div
        ref={track}
        className="carousel mt24"
        onScroll={onScroll}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Messages from friends. Use the left and right arrow keys to move between them."
      >
        {list.map((h, n) => {
          const o = BY_ID[h.ornamentId];
          const active = n === i;
          return (
            <section
              key={h.id}
              className="panel slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`${n + 1} of ${list.length}: from ${h.from}`}
              aria-hidden={!active}
            >
              <div className="row">
                {/* the ornament plays its own animation when its card comes into view */}
                <span key={active ? `on-${n}` : `off-${n}`} className="bump" style={{ flexShrink: 0 }}>
                  <span className={active ? animFor(h.ornamentId) : undefined}><Sprite id={h.ornamentId} px={4} /></span>
                  {active && <SpriteFx anim={animName(h.ornamentId)} px={4} />}
                </span>
                <div className="grow" style={{ minWidth: 0 }}>
                  <p className="eyebrow">{o?.name.replace('Advent Runner: ', '')}</p>
                  <h2 className="h2 mt4">From {h.from}</h2>
                </div>
              </div>
              <p className="mt16" style={{ fontSize: 20, lineHeight: 1.45, fontWeight: 700 }}>&ldquo;{h.message}&rdquo;</p>
            </section>
          );
        })}
      </div>

      <div className="row mt16" style={{ justifyContent: 'center', gap: 12 }}>
        <button className="icon-btn" onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous message"><ChevronIcon dir="left" /></button>
        <div className="dots" role="group" aria-label="Choose a message">
          {list.map((h, n) => (
            <button key={h.id} type="button" className="dot" aria-current={n === i ? 'true' : undefined} aria-label={`Message ${n + 1}, from ${h.from}`} onClick={() => go(n)} />
          ))}
        </div>
        <button className="icon-btn" onClick={() => go(i + 1)} disabled={i >= list.length - 1} aria-label="Next message"><ChevronIcon /></button>
      </div>
      <p className="center tiny muted mt8" aria-live="polite">{list.length ? `${i + 1} of ${list.length}` : ''} · swipe or use ← →</p>

      <div className="grow" />
      <p className="center tiny muted mt24">Your 2026 running recap arrives here in phase 2.</p>
    </main>
  );
}
