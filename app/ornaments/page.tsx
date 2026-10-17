'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import BackLink from '@/components/BackLink';
import { Meter } from '@/components/Icons';
import { MusicButton } from '@/components/MusicToggle';
import Sprite from '@/components/Sprite';
import SpriteFx from '@/components/SpriteFx';
import { animFor, animName } from '@/components/useBump';
import { DEMO_GIVEN, WEEKLY, doorOrnament, doorState } from '@/lib/calendar';
import { getTree, type Hung } from '@/lib/data';
import { HOW_TO_GET, ORNAMENTS, type Ornament, type Tier } from '@/lib/ornaments';

const SECTIONS: { tier: Tier; title: string; note: string }[] = [
  { tier: 'basic', title: 'Free ornaments', note: 'Anyone can hang these on a friend’s tree.' },
  { tier: 'special', title: 'Daily doors', note: 'Run on a day of Advent to unwrap one.' },
  { tier: 'rare', title: 'Weekly prizes', note: 'Finish a weekly challenge to win one.' },
];

const shortName = (o: Ornament) => o.name.replace('Advent Runner: ', '');
const list = (xs: (string | number)[]) =>
  xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;

/** Where the demo runner met each ornament: on their tree, behind a door they gave away, or as a prize. */
function useSources(tree: Hung[]) {
  return useMemo(() => {
    const from: Record<string, string[]> = {};
    for (const h of tree) (from[h.ornamentId] ??= []).push(h.from);
    const doors: Record<string, number[]> = {};
    for (let n = 1; n <= 24; n++) if (doorState(n) === 'opened') (doors[doorOrnament(n)] ??= []).push(n);
    const weeks: Record<string, number[]> = {};
    (weeks[WEEKLY[0].reward] ??= []).push(WEEKLY[0].week); // week 1 is done
    const found = new Set([...Object.keys(from), ...Object.keys(doors), ...Object.keys(weeks)]);
    return { from, doors, weeks, found };
  }, [tree]);
}

export default function OrnamentDirectory() {
  const [tree, setTree] = useState<Hung[]>([]);
  const [picked, setPicked] = useState<Ornament | null>(null);
  useEffect(() => setTree(getTree('demo').ornaments), []);
  useEffect(() => {
    if (!picked) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPicked(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [picked]);

  const src = useSources(tree);
  // Free ornaments are always known; earned ones stay a secret until you find them.
  const isKnown = (o: Ornament) => o.tier === 'basic' || src.found.has(o.id);
  const knownCount = ORNAMENTS.filter(isKnown).length;

  const story = (o: Ornament) => {
    const lines: string[] = [];
    if (src.from[o.id]) lines.push(`On your tree from ${list(src.from[o.id])}`);
    for (const n of src.doors[o.id] ?? []) lines.push(`Door ${n}: you gave it to ${DEMO_GIVEN[n] ?? 'a friend'}`);
    if (src.weeks[o.id]) lines.push(`Won in week ${list(src.weeks[o.id])}`);
    return lines;
  };
  const canGive = (o: Ornament) => o.tier === 'basic';

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
          <p className="eyebrow" style={{ color: 'var(--gold)' }}>Your collection</p>
          <span className="pix" style={{ color: 'var(--gold)' }}>{knownCount}/{ORNAMENTS.length}</span>
        </div>
        <div className="mt8"><Meter value={knownCount} max={ORNAMENTS.length} /></div>
        <p className="small soft mt8">
          {ORNAMENTS.length - knownCount === 0
            ? 'You found every ornament. Merry Christmas!'
            : `${ORNAMENTS.length - knownCount} still hidden. Keep running to find them.`}
        </p>
      </section>

      {SECTIONS.map((s) => {
        const items = ORNAMENTS.filter((o) => o.tier === s.tier);
        const got = items.filter(isKnown).length;
        return (
          <section key={s.tier} className="mt32" aria-labelledby={`sec-${s.tier}`}>
            <div className="panel-head">
              <h2 id={`sec-${s.tier}`} className="h2">{s.title}</h2>
              <span className="num muted">{got}/{items.length}</span>
            </div>
            <p className="small soft mt4">{s.note}</p>
            <ul className="dir-grid mt12">
              {items.map((o) => {
                const known = isKnown(o);
                const onTree = src.from[o.id]?.length ?? 0;
                return (
                  <li key={o.id}>
                    <button
                      type="button"
                      className={`dir-card${known ? '' : ' mystery'}`}
                      aria-haspopup="dialog"
                      aria-label={known ? `${shortName(o)}${onTree ? `, ${onTree} on your tree` : ''}` : `Hidden ornament. ${HOW_TO_GET[o.tier]}`}
                      onClick={() => setPicked(o)}
                    >
                      {onTree > 1 && <span className="dir-count" aria-hidden="true">×{onTree}</span>}
                      <span className="dir-art">
                        <Sprite id={o.id} px={4} />
                        {!known && <span className="dir-q pix" aria-hidden="true">?</span>}
                      </span>
                      <span className="dir-name">{known ? shortName(o) : 'Hidden'}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {ORNAMENTS.some((o) => (src.from[o.id]?.length ?? 0) > 1) && (
        <p className="center tiny muted mt24">×2 means two friends hung that ornament on your tree.</p>
      )}

      {picked && (
        <div className="scrim" onClick={() => setPicked(null)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-label={isKnown(picked) ? shortName(picked) : 'Hidden ornament'} onClick={(e) => e.stopPropagation()}>
            <div className="grab" />
            <div className="showcase">
              <span className="bump">
                <span className={isKnown(picked) ? animFor(picked.id) : 'anim-nope silhouette'} style={{ display: 'block' }}><Sprite id={picked.id} px={4} /></span>
                {isKnown(picked) && <SpriteFx anim={animName(picked.id)} px={4} />}
              </span>
              {!isKnown(picked) && <span className="dir-q pix" aria-hidden="true">?</span>}
            </div>
            <div className="center mt16">
              <p className="eyebrow">{HOW_TO_GET[picked.tier]}</p>
              <h2 className="title mt4">{isKnown(picked) ? shortName(picked) : 'Still hidden'}</h2>
              <p className="small soft mt8">
                {isKnown(picked)
                  ? picked.blurb
                  : picked.tier === 'rare'
                    ? 'Finish a weekly challenge to find out what it is.'
                    : 'Keep opening your daily doors. It could be behind any of them.'}
              </p>
            </div>

            {isKnown(picked) && story(picked).length > 0 && (
              <ul className="panel quiet flush mt16" style={{ listStyle: 'none', margin: '16px 0 0' }}>
                {story(picked).map((line) => (
                  <li key={line} className="list-row small" style={{ minHeight: 44 }}>{line}</li>
                ))}
              </ul>
            )}

            {isKnown(picked) && canGive(picked) && (
              <Link href={`/t/mina/hang?o=${picked.id}`} className="btn block mt16">Hang it on a friend&apos;s tree</Link>
            )}
            <button className="btn ghost block mt8" onClick={() => setPicked(null)}>Close</button>
          </div>
        </div>
      )}
    </main>
  );
}
