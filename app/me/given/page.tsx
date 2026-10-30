'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Sprite from '@/components/Sprite';
import Sk from '@/components/Skeleton';
import SpriteFx from '@/components/SpriteFx';
import { useBump } from '@/components/useBump';
import { doorOrnament } from '@/lib/calendar';
import { getProgress } from '@/lib/data';
import { BY_ID } from '@/lib/ornaments';

type Given = { door: number; to: string; o: (typeof BY_ID)[string] };
const shortName = (name: string) => name.replace('Advent Runner: ', '');

export default function OrnamentsGiven() {
  const { bump, of } = useBump();
  // each door you unwrapped, the ornament behind it and the friend it went to
  const [GIVEN, setGiven] = useState<Given[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getProgress().then((res) => {
      setLoading(false);
      if (!('progress' in res)) return;
      setGiven(Object.entries(res.progress.given).map(([n, to]) => ({ door: Number(n), to, o: BY_ID[doorOrnament(Number(n))] })));
    });
  }, []);
  const friends = new Set(GIVEN.map((g) => g.to)).size;

  return (
    <main className="screen no-nav">
      <PageHeader back="/me" title="Ornaments given" />
      {loading ? (
        <div aria-busy="true">
          <Sk h={14} />
          <Sk w="70%" h={14} className="mt8" />
          <div className="dir-grid mt16">{[0, 1, 2, 3, 4, 5].map((i) => <Sk key={i} h={132} />)}</div>
        </div>
      ) : (
        <div className="loaded">
          <p className="small soft">
            You unwrapped {GIVEN.length} doors and hung each ornament on a friend&apos;s tree, {friends} friends in all.
          </p>

          {GIVEN.length === 0 ? (
            <section className="panel quiet mt16 center">
              <p className="small soft">Run on a day of Advent to unwrap your first ornament, then give it to a friend.</p>
              <Link href="/calendar" className="btn block mt16">Open the calendar</Link>
            </section>
          ) : (
            <ul className="dir-grid mt16">
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
        </div>
      )}

      <Link href="/ornaments" className="panel quiet row link-row section">
        <Sprite id="snow-globe" px={2} />
        <span className="grow small" style={{ fontWeight: 700 }}>See every ornament</span>
      </Link>
    </main>
  );
}
