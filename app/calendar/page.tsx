'use client';

import Link from 'next/link';
import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { ChevronIcon, Meter } from '@/components/Icons';
import { MusicButton } from '@/components/MusicToggle';
import Sprite from '@/components/Sprite';
import SpriteFx from '@/components/SpriteFx';
import { useBump } from '@/components/useBump';
import { BY_ID } from '@/lib/ornaments';
import { DEMO_GIVEN, DEMO_TODAY, DEMO_TODAY_GOAL_KM, DEMO_TODAY_KM, WEEKLY, doorOrnament, doorState, type DoorState } from '@/lib/calendar';

const STATE_LABEL: Record<DoorState, string> = { opened: 'Given', today: 'Today', missed: 'Missed', locked: 'Coming up' };

/** Only unwrapped doors reveal their ornament; everything else stays a surprise. */
const revealed = (n: number) => doorState(n) === 'opened';
const shownSprite = (n: number) => (revealed(n) ? doorOrnament(n) : 'gift-box');
const shownName = (n: number) => (revealed(n) ? BY_ID[doorOrnament(n)].name.replace('Advent Runner: ', '') : 'A wrapped surprise');

function doorStory(n: number) {
  const s = doorState(n);
  if (s === 'opened') return DEMO_GIVEN[n] ? `You gave it to ${DEMO_GIVEN[n]}. It hangs on their tree until Christmas.` : 'Unwrapped. Give it to a friend.';
  if (s === 'today') return 'Finish today’s run to unwrap it and give it to a friend.';
  if (s === 'missed') return 'No run that day, so this one stays wrapped.';
  return `Opens on December ${n}.`;
}

export default function Calendar() {
  const doors = Array.from({ length: 24 }, (_, i) => i + 1);
  const given = doors.filter((n) => doorState(n) === 'opened').length;
  const [picked, setPicked] = useState<number | null>(null);
  const { bump, of } = useBump();
  const left = Math.max(0, DEMO_TODAY_GOAL_KM - DEMO_TODAY_KM);
  const done = left === 0;
  const week = WEEKLY[1];

  return (
    <main className="screen">
      <div className="topbar">
        <div>
          <p className="brand-mark">Advent of Running</p>
          <h1 className="title">Calendar</h1>
        </div>
        <MusicButton />
      </div>

      {/* 1. today's mission: run → unwrap → give */}
      <section className="panel gold" aria-labelledby="mission">
        <div className="panel-head">
          <p className="eyebrow" style={{ color: 'var(--gold)' }}>Today&apos;s mission</p>
          <span className="num" style={{ color: 'var(--gold)' }}>{DEMO_TODAY_KM.toFixed(1)} / {DEMO_TODAY_GOAL_KM.toFixed(1)} km</span>
        </div>
        <div className="row mt8">
          <Sprite id="gift-box" px={4} style={{ flexShrink: 0 }} />
          <div className="grow">
            <h2 id="mission" className="h2">Run {DEMO_TODAY_GOAL_KM.toFixed(0)} km</h2>
            <p className="small soft mt4">By 23:59. Door {DEMO_TODAY} opens when you finish, then give the ornament inside to a friend.</p>
          </div>
        </div>
        <div className="mt12"><Meter value={DEMO_TODAY_KM} max={DEMO_TODAY_GOAL_KM} /></div>
        {done ? (
          <Link href="/gift" className="btn block mt12">Unwrap and give</Link>
        ) : (
          <div className="panel-head mt8">
            <span className="small soft"><strong style={{ color: 'var(--snow)' }}>{left.toFixed(1)} km</strong> to go</span>
            <Link href="/gift" className="textlink" style={{ fontSize: 14 }}>Try a demo unwrap <ChevronIcon /></Link>
          </div>
        )}
      </section>

      {/* 2. the Advent doors */}
      <div className="panel-head mt32">
        <h2 className="h2">Your Advent</h2>
        <span className="num muted">{given} given</span>
      </div>
      <p className="small soft mt4">Tap a door to see which ornament you gave, and to whom.</p>

      <div className="doors mt12" role="group" aria-label="Advent doors">
        {doors.map((n) => {
          const s = doorState(n);
          const b = of(n, shownSprite(n));
          return (
            <button
              key={n}
              type="button"
              className={`door ${s}`}
              aria-pressed={picked === n}
              aria-label={`Door ${n}, ${STATE_LABEL[s].toLowerCase()}${revealed(n) ? `: ${shownName(n)}` : ''}`}
              onClick={() => {
                setPicked(n);
                // unwrapped doors play their ornament's animation; wrapped ones just jiggle
                bump(n, s === 'opened' || s === 'today' ? 'play' : 'nope');
              }}
            >
              <span className="n">{n}</span>
              <span key={b.k} className="bump">
                <span className={b.anim}><Sprite id={shownSprite(n)} px={2} /></span>
                {b.fx && <SpriteFx anim={b.fx} px={2} />}
              </span>
            </button>
          );
        })}
      </div>

      {picked && (
        <section className="panel quiet row mt12 fade-in" aria-live="polite">
          <Sprite id={shownSprite(picked)} px={4} style={{ flexShrink: 0, opacity: doorState(picked) === 'missed' ? 0.5 : 1 }} />
          <div className="grow">
            <p className="eyebrow">Door {picked} · {STATE_LABEL[doorState(picked)]}</p>
            <h2 className="h2 mt4">{shownName(picked)}</h2>
            <p className="small soft mt4">{doorStory(picked)}</p>
          </div>
        </section>
      )}
      <p className="tiny muted mt8">Only you can see your calendar.</p>

      {/* 3. a small weekly bonus */}
      <section className="panel quiet mt24" style={{ padding: '14px 16px' }}>
        <div className="panel-head">
          <p className="eyebrow">Weekly bonus</p>
          <span className="num muted">{week.progress} / {week.goal} km</span>
        </div>
        <div className="row mt8" style={{ alignItems: 'center' }}>
          {/* the prize's shadow: a hint of its shape, revealed when you win it */}
          <span className="prize-shadow" aria-hidden="true">
            <span className="silhouette"><Sprite id={week.reward} px={2} /></span>
            <span className="dir-q pix">?</span>
          </span>
          <div className="grow">
            <p className="small" style={{ fontWeight: 800 }}>{week.title} to win this rare ornament</p>
            <p className="tiny muted mt4">What it is stays a surprise until you do. Ends tonight.</p>
          </div>
        </div>
        <div className="mt8"><Meter value={week.progress ?? 0} max={week.goal ?? 1} /></div>
      </section>

      <BottomNav />
    </main>
  );
}
