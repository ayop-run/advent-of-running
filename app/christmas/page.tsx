'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronIcon } from '@/components/Icons';
import { MusicButton } from '@/components/MusicToggle';
import Sprite from '@/components/Sprite';
import SpriteFx from '@/components/SpriteFx';
import { animFor, animName } from '@/components/useBump';
import { christmasPreview, type Hung } from '@/lib/data';
import { BY_ID } from '@/lib/ornaments';

const REACTIONS = ['Thank you', 'Made my day', 'Run together soon'];

export default function ChristmasUnlock() {
  const [list, setList] = useState<Hung[]>([]);
  const [i, setI] = useState(0);
  const [sent, setSent] = useState<Record<string, string>>({});
  const track = useRef<HTMLDivElement>(null);
  // a preview with the demo tree's messages; real ones open on December 25
  useEffect(() => setList(christmasPreview()), []);

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

  return (
    <main className="screen no-nav">
      <div className="topbar">
        <span className="small muted">Preview of December 25</span>
        <div className="topbar-end">
          <MusicButton />
          <Link href="/tree" className="textlink">Close</Link>
        </div>
      </div>
      <h1 className="h1 xl">Merry Christmas!</h1>
      <p className="soft mt8">{list.length} messages from friends are open. Swipe to read them.</p>

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

              <div className="grow" />
              <p className="small mt24" style={{ fontWeight: 800 }}>Send {h.from} a reply</p>
              <div className="row wrap mt8" style={{ gap: 8 }}>
                {REACTIONS.map((r) => (
                  <button key={r} className="pill" tabIndex={active ? 0 : -1} aria-pressed={sent[h.id] === r} onClick={() => setSent({ ...sent, [h.id]: r })}>{r}</button>
                ))}
              </div>
              <p className="tiny soft mt8" style={{ minHeight: '1.5em' }}>
                {sent[h.id] ? <>Sent. {h.from} will see your reply: &ldquo;{sent[h.id]}&rdquo;.</> : ' '}
              </p>
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
