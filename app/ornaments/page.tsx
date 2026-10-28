'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import BackLink from '@/components/BackLink';
import { MusicButton } from '@/components/MusicToggle';
import Sprite from '@/components/Sprite';
import SpriteFx from '@/components/SpriteFx';
import { animFor, animName, useBump } from '@/components/useBump';
import { HOW_TO_GET, ORNAMENTS, type Ornament, type Tier } from '@/lib/ornaments';

const SECTIONS: { tier: Tier; title: string; note: string }[] = [
  { tier: 'basic', title: 'Free ornaments', note: 'Anyone can hang these on a friend’s tree.' },
  { tier: 'special', title: 'Daily doors', note: 'Run on a day of Advent to unwrap one.' },
  { tier: 'rare', title: 'Weekly prizes', note: 'Finish a weekly challenge to win one.' },
];

const shortName = (o: Ornament) => o.name.replace('Advent Runner: ', '');
const count = (tier: Tier) => ORNAMENTS.filter((o) => o.tier === tier).length;

/** Every ornament in the game, as an introduction: tap one to see it move and how to get it. */
export default function OrnamentDirectory() {
  const [picked, setPicked] = useState<Ornament | null>(null);
  const { bump, of } = useBump();
  useEffect(() => {
    if (!picked) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPicked(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [picked]);

  return (
    <main className="screen no-nav">
      <div className="topbar">
        <BackLink fallback="/me" />
        <MusicButton />
      </div>

      <p className="brand-mark">Advent of Running</p>
      <h1 className="title">Ornaments</h1>

      <section className="panel gold mt16">
        <div className="panel-head">
          <p className="eyebrow" style={{ color: 'var(--gold)' }}>The collection</p>
          <span className="pix" style={{ color: 'var(--gold)' }}>{ORNAMENTS.length}</span>
        </div>
        <p className="small soft mt8">
          {count('basic')} free ornaments to hang for friends, {count('special')} behind the daily doors and{' '}
          {count('rare')} rare prizes. Tap any of them to see it move.
        </p>
      </section>

      {SECTIONS.map((s) => {
        const items = ORNAMENTS.filter((o) => o.tier === s.tier);
        return (
          <section key={s.tier} className="mt32" aria-labelledby={`sec-${s.tier}`}>
            <div className="panel-head">
              <h2 id={`sec-${s.tier}`} className="h2">{s.title}</h2>
              <span className="num muted">{items.length}</span>
            </div>
            <p className="small soft mt4">{s.note}</p>
            <ul className="dir-grid mt12">
              {items.map((o) => {
                const b = of(o.id, o.id);
                return (
                  <li key={o.id}>
                    <button
                      type="button"
                      className="dir-card"
                      aria-haspopup="dialog"
                      aria-label={shortName(o)}
                      onClick={() => {
                        bump(o.id);
                        setPicked(o);
                      }}
                    >
                      <span key={b.k} className="bump">
                        <span className={b.anim}><Sprite id={o.id} px={4} /></span>
                        {b.fx && <SpriteFx anim={b.fx} px={4} />}
                      </span>
                      <span className="dir-name">{shortName(o)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {picked && (
        <div className="scrim" onClick={() => setPicked(null)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-label={shortName(picked)} onClick={(e) => e.stopPropagation()}>
            <div className="grab" />
            <div className="showcase">
              <span className="bump">
                <span className={animFor(picked.id)} style={{ display: 'block' }}><Sprite id={picked.id} px={4} /></span>
                <SpriteFx anim={animName(picked.id)} px={4} />
              </span>
            </div>
            <div className="center mt16">
              <p className="eyebrow">{HOW_TO_GET[picked.tier]}</p>
              <h2 className="title mt4">{shortName(picked)}</h2>
              <p className="small soft mt8">{picked.blurb}</p>
            </div>

            {picked.tier === 'basic' && (
              <Link href={`/t/ayop/hang?o=${picked.id}`} className="btn block mt16">Hang it on a friend&apos;s tree</Link>
            )}
            <button className="btn ghost block mt8" onClick={() => setPicked(null)}>Close</button>
          </div>
        </div>
      )}
    </main>
  );
}
