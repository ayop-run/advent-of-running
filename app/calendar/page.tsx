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
import { DEMO_TODAY, DEMO_TODAY_GOAL_KM, DEMO_TODAY_KM, WEEKLY, doorOrnament, doorState, type DoorState } from '@/lib/calendar';

/** Only unwrapped doors reveal their ornament; everything else stays a surprise. */
const STATUS: Record<DoorState, (name: string, n: number) => string> = {
  opened: (name) => `You unwrapped the ${name}. Give it to a friend or keep it for your own tree.`,
  today: () => `Run ${DEMO_TODAY_GOAL_KM.toFixed(0)} km today to find out what's inside.`,
  missed: () => `You missed this one. A catch-up run can still open it.`,
  locked: (_, n) => `Opens on December ${n}. What's inside is a surprise.`,
};
const revealed = (n: number) => doorState(n) === 'opened';
const shownSprite = (n: number) => (revealed(n) ? doorOrnament(n) : 'gift-box');
const shownName = (n: number) => (revealed(n) ? BY_ID[doorOrnament(n)].name.replace('Advent Runner: ', '') : 'A wrapped surprise');
const STATE_LABEL: Record<DoorState, string> = { opened: 'Unwrapped', today: 'Today', missed: 'Missed', locked: 'Coming up' };

export default function Calendar() {
  const doors = Array.from({ length: 24 }, (_, i) => i + 1);
  const opened = doors.filter((n) => doorState(n) === 'opened').length;
  const [picked, setPicked] = useState(DEMO_TODAY);
  const { bump, of } = useBump();
  const pickedState = doorState(picked);

  const week = WEEKLY[1];

  return (
    <main className="screen">
      <div className="topbar">
        <div>
          <p className="brand-mark">Advent of Running</p>
          <h1 className="title">Calendar</h1>
        </div>
        <div className="topbar-end">
          <span className="pix" style={{ color: 'var(--gold)' }}>{opened}/24</span>
          <MusicButton />
        </div>
      </div>

      <p className="small soft">Every door hides a special ornament. Run that day to unwrap it and see what&apos;s inside.</p>

      <div className="doors mt12" role="group" aria-label="Advent doors">
        {doors.map((n) => {
          const s = doorState(n);
          return (
            <button
              key={n}
              type="button"
              className={`door ${s}`}
              aria-pressed={picked === n}
              aria-label={`Door ${n}, ${STATE_LABEL[s].toLowerCase()}${revealed(n) ? `: ${shownName(n)}` : ''}`}
              onClick={() => {
                setPicked(n);
                // unwrapped doors hop; wrapped ones jiggle like a present you can't open yet
                bump(n, s === 'opened' || s === 'today' ? 'play' : 'nope');
              }}
            >
              <span className="n">{n}</span>
              {(() => {
                const b = of(n, shownSprite(n));
                return (
                  <span key={b.k} className="bump">
                    <span className={b.anim}><Sprite id={shownSprite(n)} px={2} /></span>
                    {b.fx && <SpriteFx anim={b.fx} px={2} />}
                  </span>
                );
              })()}
            </button>
          );
        })}
      </div>

      <section className="panel quiet row mt12" aria-live="polite" style={{ alignItems: 'center' }}>
        <Sprite id={shownSprite(picked)} px={4} style={{ flexShrink: 0, opacity: pickedState === 'missed' ? 0.5 : 1 }} />
        <div className="grow">
          <p className="eyebrow">Door {picked} · {STATE_LABEL[pickedState]}</p>
          <h2 className="h2 mt4">{shownName(picked)}</h2>
          <p className="small soft mt4">{STATUS[pickedState](shownName(picked), picked)}</p>
        </div>
      </section>
      <p className="tiny muted mt8">Only you can see your calendar.</p>

      <section className="panel gold mt24" aria-labelledby="today-title">
        <div className="panel-head">
          <p className="eyebrow" style={{ color: 'var(--gold)' }}>Today · until 23:59</p>
          <span className="num" style={{ color: 'var(--gold)' }}>{DEMO_TODAY_KM.toFixed(1)} / {DEMO_TODAY_GOAL_KM.toFixed(1)} km</span>
        </div>
        <div className="row mt8">
          <Sprite id="gift-box" px={2} style={{ flexShrink: 0 }} />
          <h2 id="today-title" className="h2">Door {DEMO_TODAY}: run 1 km</h2>
        </div>
        <div className="mt12"><Meter value={DEMO_TODAY_KM} max={DEMO_TODAY_GOAL_KM} /></div>
        <p className="small soft mt8">
          {(DEMO_TODAY_GOAL_KM - DEMO_TODAY_KM).toFixed(1)} km to go to unwrap today&apos;s surprise. Outdoor, trail and treadmill runs count.
        </p>
        <Link href="/gift" className="textlink" style={{ fontSize: 14 }}>Try a demo unwrap <ChevronIcon /></Link>
      </section>

      <div className="panel hint small mt12">
        <span aria-hidden="true" className="pix" style={{ color: 'var(--frost)' }}>!</span>
        <span>You missed door 13. Run 2 km today to open doors 13 and 14 together. 1 catch-up left this week.</span>
      </div>

      <section className="panel mt24">
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <Sprite id="gift-box" px={4} style={{ flexShrink: 0 }} />
          <div className="grow">
            <p className="eyebrow">Week {week.week} challenge · ends today</p>
            <h2 className="h2 mt4">{week.title}</h2>
            <p className="small soft mt4">Finish it to win a rare ornament. It&apos;s a surprise until you do.</p>
          </div>
        </div>
        <div className="mt12"><Meter value={week.progress ?? 0} max={week.goal ?? 1} /></div>
        <p className="small muted mt8"><span className="num" style={{ color: 'var(--snow)' }}>{week.progress} of {week.goal} km</span> · next challenge starts December 15</p>
      </section>

      <BottomNav />
    </main>
  );
}
