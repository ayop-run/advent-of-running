'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { ChevronIcon, Meter, TapIcon } from '@/components/Icons';
import PageHeader from '@/components/PageHeader';
import Sprite from '@/components/Sprite';
import Sk from '@/components/Skeleton';
import SpriteFx from '@/components/SpriteFx';
import { useBump } from '@/components/useBump';
import { getProgress } from '@/lib/data';
import { stravaLoginUrl } from '@/lib/me';
import { BY_ID } from '@/lib/ornaments';
import { DAILY_GOAL_KM, DOORS, WEEKLY, doorOrnament, monthName, type DoorState, type Progress } from '@/lib/calendar';

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
        <PageHeader title="Calendar" />
        {failed ? (
          <p className="soft center mt24 loaded">Couldn’t sync with Strava. Please try again later.</p>
        ) : (
          // the calendar's shape while Strava syncs, so nothing jumps when it arrives
          <div aria-busy="true" aria-label="Syncing your runs">
            <Sk h={168} />
            <div className="panel-head mt32"><Sk w={150} h={22} /><Sk w={56} h={14} /></div>
            <Sk h={236} className="mt12" />
            <Sk h={46} className="mt16" />
            {[1, 2].map((w) => (
              <div key={w} className="mt16">
                <Sk w={140} h={14} />
                <div className="doors mt8">{Array.from({ length: 7 }, (_, i) => <Sk key={i} h="auto" />)}</div>
              </div>
            ))}
            <p className="tiny muted center mt12">Syncing your runs from Strava…</p>
          </div>
        )}
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
        if (p.caughtUp[n]) {
          const by = p.caughtUp[n];
          return `${ran}Caught up on ${month} ${by} with a ${km(by)} km day (${n} km extra on top of ${DAILY_GOAL_KM} km). ${p.given[n] ? `You gave it to ${p.given[n]}.` : 'Give it to a friend.'}`;
        }
        return `${ran}${p.given[n] ? `You gave it to ${p.given[n]}. It hangs on their tree until Christmas.` : 'Unwrapped. Give it to a friend.'}`;
      case 'today':
        return `${ran}Finish today’s run to unwrap it and give it to a friend.`;
      case 'missed':
        return `${ran}Not enough that day. To still unwrap it, run ${n} km in one go on top of a day’s ${DAILY_GOAL_KM} km.`;
      default:
        return `Opens on ${month} ${n}.`;
    }
  };

  const given = Object.keys(p.given).length;
  const running = p.today >= 1 && p.today <= DOORS;
  const left = Math.max(0, DAILY_GOAL_KM - p.todayKm);
  const ready = p.unwrapped.length > 0;
  const week = p.week;

  // distance stats: runs and walks together, rounded like the doors
  const kmOver = (from: number, to: number) => Math.round(p.km.slice(from - 1, to).reduce((s, k) => s + k, 0) * 10) / 10;
  const total = kmOver(1, DOORS);
  const daysRun = p.km.filter((k) => k > 0).length;
  const best = p.km.reduce((b, k, i) => (k > p.km[b] ? i : b), 0) + 1;
  const thisWeek = WEEKLY.find((w) => p.today >= w.from && p.today <= w.to);
  const stats = [
    ...(running ? [{ label: 'Today', value: `${p.todayKm.toFixed(1)} km` }] : []),
    ...(thisWeek ? [{ label: `Week ${thisWeek.week}`, value: `${kmOver(thisWeek.from, thisWeek.to).toFixed(1)} km` }] : []),
    { label: total > 0 ? `Best · ${month.slice(0, 3)} ${best}` : 'Best day', value: total > 0 ? `${km(best).toFixed(1)} km` : '–' },
  ];
  // bar heights: the best day fills the chart, but never less than twice the daily goal
  const top = Math.max(DAILY_GOAL_KM * 2, ...p.km);
  const bar = (n: number) => (n > p.today ? 'future' : n === p.today ? 'today' : km(n) >= DAILY_GOAL_KM ? 'met' : 'short');

  const doorButton = (n: number) => {
    const s = state(n);
    const b = of(n, shownSprite(n));
    return (
      <button
        key={n}
        type="button"
        className={`door ${s}${p.caughtUp[n] ? ' caught-up' : ''}`}
        aria-pressed={picked === n}
        aria-label={`Door ${n}, ${STATE_LABEL[s].toLowerCase()}${p.caughtUp[n] ? `, caught up on day ${p.caughtUp[n]}` : km(n) > 0 ? `, ${km(n)} km` : ''}${revealed(n) ? `: ${shownName(n)}` : ''}`}
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
        {p.caughtUp[n] ? (
          <span className="km caught">↺ day {p.caughtUp[n]}</span>
        ) : (
          km(n) > 0 && <span className="km">{km(n)} km</span>
        )}
      </button>
    );
  };

  return (
    <main className="screen">
      <PageHeader title="Calendar" />

      <div className="loaded">
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

        {/* 2. the Advent doors, one row per bonus week */}
        <div className="panel-head mt32">
          <h2 className="h2">Your Advent</h2>
          <span className="num muted">{given} given</span>
        </div>

        <section className="panel quiet mt12 dist" aria-labelledby="distance">
          <div className="panel-head">
            <p id="distance" className="eyebrow">Distance</p>
            <span className="tiny muted">{daysRun} {daysRun === 1 ? 'day' : 'days'} on the move</span>
          </div>
          <p className="mt8 dist-total">
            <b>{total.toFixed(1)}</b>
            <span className="small soft">km in {month}</span>
          </p>
          <div
            className="bars mt12"
            style={{ '--goal': `${(DAILY_GOAL_KM / top) * 100}%` } as React.CSSProperties}
            role="img"
            aria-label={`Daily distance: ${total.toFixed(1)} km over ${daysRun} days, best ${km(best)} km on ${month} ${best}.`}
          >
            {doors.map((n) => (
              <i key={n} className={bar(n)} style={{ height: km(n) > 0 ? `${Math.max(8, (km(n) / top) * 100)}%` : undefined }} />
            ))}
          </div>
          <div className="bars-axis mt4" aria-hidden="true">
            <span>{month.slice(0, 3)} 1</span>
            <span className="goal-key">{DAILY_GOAL_KM} km a day</span>
            <span>{month.slice(0, 3)} {DOORS}</span>
          </div>
          <div className="dist-row mt12">
            {stats.map((st) => (
              <div key={st.label}>
                <b>{st.value}</b>
                <span>{st.label}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="panel hint row note mt16">
          <TapIcon />
          <p className="small"><strong>Tap a door</strong> <span className="soft">to see how far you ran that day and who got its ornament.</span></p>
        </div>
        {WEEKLY.map((w) => {
          const days = doors.filter((n) => n >= w.from && n <= w.to);
          const started = p.today >= w.from;
          return (
            <section key={w.week} className="mt16" aria-label={`Week ${w.week}`}>
              <div className="week-head">
                <span className="eyebrow">Week {w.week} <span className="week-dates">· {month.slice(0, 3)} {w.from}–{w.to}</span></span>
                <span className="week-km">
                  {p.weeksDone.includes(w.week) && <span className="week-won">Bonus won</span>}
                  {started ? `${kmOver(w.from, w.to).toFixed(1)} km` : ''}
                </span>
              </div>
              <div className="doors mt8" role="group" aria-label={`Doors ${w.from} to ${w.to}`}>
                {days.map(doorButton)}
              </div>
              {picked !== null && picked >= w.from && picked <= w.to && (
                <div className="panel quiet row mt8 fade-in" aria-live="polite">
                  <Sprite id={shownSprite(picked)} px={4} style={{ flexShrink: 0, opacity: state(picked) === 'missed' ? 0.5 : 1 }} />
                  <div className="grow">
                    <p className="eyebrow">Door {picked} · {p.caughtUp[picked] ? `Caught up on day ${p.caughtUp[picked]}` : STATE_LABEL[state(picked)]}</p>
                    <h2 className="h2 mt4">{shownName(picked)}</h2>
                    <p className="small soft mt4">{doorStory(picked)}</p>
                  </div>
                </div>
              )}
            </section>
          );
        })}
        <ul className="legend mt12" aria-label="Door colours">
          <li><i className="opened" />Unwrapped</li>
          <li><i className="today" />Today</li>
          <li><i className="missed" />Missed</li>
          <li><i className="locked" />Coming up</li>
        </ul>
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
          <section className="panel quiet section">
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

      </div>

      <BottomNav />
    </main>
  );
}
