'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { ChevronIcon, Meter } from '@/components/Icons';
import { MusicButton } from '@/components/MusicToggle';
import Sprite from '@/components/Sprite';
import SpriteFx from '@/components/SpriteFx';
import { useBump } from '@/components/useBump';
import { getProgress } from '@/lib/data';
import { stravaLoginUrl } from '@/lib/me';
import { BY_ID } from '@/lib/ornaments';
import { DAILY_GOAL_KM, DOORS, doorOrnament, monthName, type DoorState, type Progress } from '@/lib/calendar';

const STATE_LABEL: Record<DoorState, string> = { opened: 'Unwrapped', today: 'Today', missed: 'Missed', locked: 'Coming up' };

export default function Calendar() {
  const [p, setP] = useState<Progress | null>(null);
  const [demo, setDemo] = useState(false);
  const [failed, setFailed] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const { bump, of } = useBump();
  useEffect(() => {
    getProgress().then((res) => {
      if ('error' in res) return setFailed(true);
      setP(res.progress);
      setDemo(res.demo);
    });
  }, []);

  if (!p) {
    return (
      <main className="screen">
        <div className="topbar">
          <div>
            <p className="brand-mark">Advent of Running</p>
            <h1 className="title">Calendar</h1>
          </div>
          <MusicButton />
        </div>
        <p className="soft center mt24">{failed ? 'Couldn’t sync with Strava. Please try again later.' : 'Syncing your runs…'}</p>
        <BottomNav />
      </main>
    );
  }

  const month = monthName(p.month);
  const doors = Array.from({ length: DOORS }, (_, i) => i + 1);
  const state = (n: number) => p.doors[n - 1];
  // only unwrapped doors reveal their ornament; everything else stays a surprise
  const revealed = (n: number) => state(n) === 'opened';
  const shownSprite = (n: number) => (revealed(n) ? doorOrnament(n) : 'gift-box');
  const shownName = (n: number) => (revealed(n) ? BY_ID[doorOrnament(n)].name.replace('Advent Runner: ', '') : 'A wrapped surprise');
  const km = (n: number) => p.km[n - 1];

  const doorStory = (n: number) => {
    const ran = km(n) > 0 ? `You ran ${km(n)} km that day. ` : '';
    switch (state(n)) {
      case 'opened':
        if (p.caughtUp.includes(n)) return `${ran}Unwrapped later with a ${n} km catch-up run. ${p.given[n] ? `You gave it to ${p.given[n]}.` : 'Give it to a friend.'}`;
        return `${ran}${p.given[n] ? `You gave it to ${p.given[n]}. It hangs on their tree until Christmas.` : 'Unwrapped. Give it to a friend.'}`;
      case 'today':
        return `${ran}Finish today’s run to unwrap it and give it to a friend.`;
      case 'missed':
        return `${ran}Not enough that day. Run ${n} km in one go to still unwrap it.`;
      default:
        return `Opens on ${month} ${n}.`;
    }
  };

  const given = Object.keys(p.given).length;
  const running = p.today >= 1 && p.today <= DOORS;
  const left = Math.max(0, DAILY_GOAL_KM - p.todayKm);
  const ready = p.unwrapped.length > 0;
  const week = p.week;

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
      {running ? (
        <section className="panel gold" aria-labelledby="mission">
          <div className="panel-head">
            <p className="eyebrow" style={{ color: 'var(--gold)' }}>Today&apos;s mission</p>
            <span className="num" style={{ color: 'var(--gold)' }}>{p.todayKm.toFixed(1)} / {DAILY_GOAL_KM.toFixed(1)} km</span>
          </div>
          <div className="row mt8">
            <Sprite id="gift-box" px={4} style={{ flexShrink: 0 }} />
            <div className="grow">
              <h2 id="mission" className="h2">Run {DAILY_GOAL_KM.toFixed(0)} km</h2>
              <p className="small soft mt4">By 23:59. Door {p.today} opens when you finish, then give the ornament inside to a friend.</p>
            </div>
          </div>
          <div className="mt12"><Meter value={Math.min(p.todayKm, DAILY_GOAL_KM)} max={DAILY_GOAL_KM} /></div>
          {ready ? (
            <Link href="/gift" className="btn block mt12">{demo ? 'Try a demo unwrap' : 'Unwrap and give'}</Link>
          ) : (
            <div className="panel-head mt8">
              <span className="small soft"><strong style={{ color: 'var(--snow)' }}>{left.toFixed(1)} km</strong> to go</span>
            </div>
          )}
        </section>
      ) : (
        <section className="panel gold">
          <p className="eyebrow" style={{ color: 'var(--gold)' }}>{p.today === 0 ? 'Coming soon' : 'Advent is over'}</p>
          <p className="small soft mt8">
            {p.today === 0 ? `Door 1 opens on ${month} 1.` : `You unwrapped ${p.doors.filter((s) => s === 'opened').length} of ${DOORS} doors.`}
          </p>
          {ready && <Link href="/gift" className="btn block mt12">Give your unwrapped ornaments</Link>}
        </section>
      )}

      {/* 2. the Advent doors */}
      <div className="panel-head mt32">
        <h2 className="h2">Your Advent</h2>
        <span className="num muted">{given} given</span>
      </div>
      <p className="small soft mt4">Tap a door to see how far you ran, and who got its ornament.</p>

      <div className="doors mt12" role="group" aria-label="Advent doors">
        {doors.map((n) => {
          const s = state(n);
          const b = of(n, shownSprite(n));
          return (
            <button
              key={n}
              type="button"
              className={`door ${s}`}
              aria-pressed={picked === n}
              aria-label={`Door ${n}, ${STATE_LABEL[s].toLowerCase()}${km(n) > 0 ? `, ${km(n)} km` : ''}${revealed(n) ? `: ${shownName(n)}` : ''}`}
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
              {km(n) > 0 && <span className="km">{km(n)} km</span>}
            </button>
          );
        })}
      </div>

      {picked && (
        <section className="panel quiet row mt12 fade-in" aria-live="polite">
          <Sprite id={shownSprite(picked)} px={4} style={{ flexShrink: 0, opacity: state(picked) === 'missed' ? 0.5 : 1 }} />
          <div className="grow">
            <p className="eyebrow">Door {picked} · {STATE_LABEL[state(picked)]}</p>
            <h2 className="h2 mt4">{shownName(picked)}</h2>
            <p className="small soft mt4">{doorStory(picked)}</p>
          </div>
        </section>
      )}
      <p className="tiny muted mt8">
        Only you can see your calendar.{' '}
        {demo ? (
          <>This is the demo. <a href={stravaLoginUrl()} className="textlink" style={{ fontSize: 13 }}>Log in with Strava <ChevronIcon /></a></>
        ) : p.syncedAt ? (
          `Synced from Strava at ${new Date(p.syncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
        ) : null}
      </p>

      {/* 3. a small weekly bonus */}
      {week && (
        <section className="panel quiet mt24" style={{ padding: '14px 16px' }}>
          <div className="panel-head">
            <p className="eyebrow">Weekly bonus</p>
            {week.unit !== 'runs together' && <span className="num muted">{week.progress} / {week.goal} {week.unit}</span>}
          </div>
          <div className="row mt8" style={{ alignItems: 'center' }}>
            {week.done ? (
              <Sprite id={week.reward} px={2} style={{ flexShrink: 0 }} />
            ) : (
              // the prize's shadow: a hint of its shape, revealed when you win it
              <span className="prize-shadow" aria-hidden="true">
                <span className="silhouette"><Sprite id={week.reward} px={2} /></span>
                <span className="dir-q pix">?</span>
              </span>
            )}
            <div className="grow">
              <p className="small" style={{ fontWeight: 800 }}>
                {week.done ? `You won the ${BY_ID[week.reward].name}!` : `${week.title} to win this rare ornament`}
              </p>
              <p className="tiny muted mt4">
                {week.unit === 'runs together'
                  ? 'Runs together are counted soon.'
                  : week.done
                    ? 'Give it to a friend like your door ornaments.'
                    : `What it is stays a surprise until you do. Ends ${p.today === week.to ? 'tonight' : `${month} ${week.to}`}.`}
              </p>
            </div>
          </div>
          {week.unit !== 'runs together' && <div className="mt8"><Meter value={Math.min(week.progress, week.goal)} max={week.goal} /></div>}
        </section>
      )}

      <BottomNav />
    </main>
  );
}
