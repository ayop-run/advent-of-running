'use client';

import Link from 'next/link';
import BackLink from '@/components/BackLink';
import { MusicButton } from '@/components/MusicToggle';
import Sprite from '@/components/Sprite';
import SpriteFx from '@/components/SpriteFx';
import { useBump } from '@/components/useBump';
import { DEMO_GIVEN, doorOrnament } from '@/lib/calendar';
import { BY_ID } from '@/lib/ornaments';

/** Each door the demo runner unwrapped, the ornament behind it and the friend it went to. */
const GIVEN = Object.entries(DEMO_GIVEN).map(([n, to]) => ({ door: Number(n), to, o: BY_ID[doorOrnament(Number(n))] }));
const shortName = (name: string) => name.replace('Advent Runner: ', '');

export default function OrnamentsGiven() {
  const { bump, of } = useBump();
  const friends = new Set(GIVEN.map((g) => g.to)).size;

  return (
    <main className="screen no-nav">
      <div className="topbar">
        <BackLink fallback="/me" />
        <MusicButton />
      </div>

      <p className="brand-mark">Advent of Running</p>
      <h1 className="title">Ornaments given</h1>
      <p className="small soft mt8">
        You unwrapped {GIVEN.length} doors and hung each ornament on a friend&apos;s tree, {friends} friends in all.
      </p>

      {GIVEN.length === 0 ? (
        <section className="panel quiet mt24 center">
          <p className="small soft">Run on a day of Advent to unwrap your first ornament, then give it to a friend.</p>
          <Link href="/calendar" className="btn block mt16">Open the calendar</Link>
        </section>
      ) : (
        <ul className="dir-grid mt24">
          {GIVEN.map((g) => {
            const b = of(g.door, g.o.id);
            return (
              <li key={g.door}>
                <button
                  type="button"
                  className="dir-card"
                  aria-label={`Door ${g.door}: ${shortName(g.o.name)}, given to ${g.to}`}
                  onClick={() => bump(g.door)}
                >
                  <span key={b.k} className="bump">
                    <span className={b.anim}><Sprite id={g.o.id} px={4} /></span>
                    {b.fx && <SpriteFx anim={b.fx} px={4} />}
                  </span>
                  <span className="dir-name">{shortName(g.o.name)}</span>
                  <span className="tiny muted">Door {g.door} · to {g.to}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Link href="/ornaments" className="panel quiet row mt24" style={{ color: 'var(--snow)', padding: '12px 16px' }}>
        <Sprite id="snow-globe" px={2} />
        <span className="grow small" style={{ fontWeight: 700 }}>See every ornament</span>
      </Link>
    </main>
  );
}
