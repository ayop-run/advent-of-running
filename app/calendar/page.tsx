'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { Meter } from '@/components/Icons';
import { MusicButton } from '@/components/MusicToggle';
import { getProgress } from '@/lib/data';
import { BY_ID } from '@/lib/ornaments';
import { DAILY_GOAL_KM, DOORS, WEEKLY, monthName, type Progress } from '@/lib/calendar';

export default function Calendar() {
  const [p, setP] = useState<Progress | null>(null);
  const [demo, setDemo] = useState(false);
  const [failed, setFailed] = useState(false);
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
        <div className="topbar"><h1 className="title">Calendar</h1><MusicButton /></div>
        <p className="soft center mt24">{failed ? "Couldn't sync with Strava. Please try again later." : 'Syncing your runs…'}</p>
        <BottomNav />
      </main>
    );
  }

  const opened = p.doors.filter((s) => s === 'opened').length;
  const missed = p.doors.flatMap((s, i) => (s === 'missed' ? [i + 1] : []));
  const month = monthName(p.month);
  const nextWeek = p.week ? WEEKLY.find((w) => w.week === p.week!.week + 1) : null;
  const reward = p.week ? BY_ID[p.week.reward] : null;

  return (
    <main className="screen">
      <div className="topbar">
        <h1 className="title">Calendar</h1>
        <div className="topbar-end">
          <span className="num" style={{ color: 'var(--gold)', fontSize: 18 }}>{opened}/{DOORS} open</span>
          <MusicButton />
        </div>
      </div>

      <div className="doors" role="list" aria-label="Advent doors">
        {p.doors.map((s, i) => (
          <div key={i} role="listitem" className={`door ${s}`} aria-label={`Door ${i + 1}, ${s}${p.km[i] ? `, ${p.km[i]} km` : ''}${p.caughtUp.includes(i + 1) ? ', caught up' : ''}`}>
            {i + 1}
            {p.km[i] > 0 && <span className="km">{p.km[i]} km</span>}
          </div>
        ))}
      </div>
      <div className="legend mt12" style={{ justifyContent: 'flex-start' }}>
        <span><i style={{ background: 'var(--cranberry)' }} />Opened</span>
        <span style={{ color: 'var(--gold)' }}><i style={{ boxShadow: 'inset 0 0 0 2px var(--gold)' }} />Today</span>
        <span className="muted"><i style={{ boxShadow: 'inset 0 0 0 1px #7d8db3' }} />Missed</span>
        <span className="muted" style={{ marginLeft: 'auto', fontWeight: 500 }}>Only you see this</span>
      </div>
      {p.caughtUp.length > 0 && (
        <p className="tiny muted mt8">Caught up later with a long run: door {p.caughtUp.sort((a, b) => a - b).join(', ')}.</p>
      )}

      {p.today === 0 && <div className="panel hint small mt24">Door 1 opens on {month} 1.</div>}
      {p.today > DOORS && <div className="panel hint small mt24">Advent is over. You opened {opened} of {DOORS} doors.</div>}

      {p.today >= 1 && p.today <= DOORS && (
        <section className="panel gold mt24">
          <div className="row between">
            <h2 className="h2">Door {p.today}: run {DAILY_GOAL_KM} km</h2>
            <span className="small muted">{p.doors[p.today - 1] === 'opened' ? 'Opened' : 'until 23:59'}</span>
          </div>
          <div className="mt12"><Meter value={Math.min(p.todayKm, DAILY_GOAL_KM)} max={DAILY_GOAL_KM} /></div>
          <p className="small soft mt8">
            <span className="num" style={{ color: 'var(--gold)' }}>{p.todayKm.toFixed(1)} km</span> so far. Outdoor, trail and treadmill runs count; manual entries don&apos;t.
          </p>
        </section>
      )}

      {missed.length > 0 && p.today <= DOORS && (
        <div className="panel hint small mt12">
          {missed.length === 1 ? `You missed door ${missed[0]}.` : `You missed doors ${missed.join(', ')}.`} Run {missed[missed.length - 1]} km in one go to open door {missed[missed.length - 1]}
          {missed.length > 1 ? `, or ${missed[0]} km for door ${missed[0]}` : ''}.
        </div>
      )}

      {p.week && reward && (
        <section className="panel mt24">
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <img className="px" src={reward.img} alt="" width={64} height={64} style={{ filter: 'drop-shadow(0 0 10px rgba(255,201,74,.8))' }} />
            <div className="grow">
              <p className="tier tier-rare">Week {p.week.week} challenge{p.today === p.week.to ? ', ends today' : `, until ${month} ${p.week.to}`}</p>
              <h2 className="h2 mt4">{p.week.title}</h2>
              <p className="small soft mt4">{p.week.done ? `Done! The rare ${reward.name} is in your pouch.` : `Finish it to win the rare ${reward.name}.`}</p>
            </div>
          </div>
          {p.week.unit === 'runs together' ? (
            <p className="small muted mt12">Runs together are counted once your friends are connected. Coming soon.</p>
          ) : (
            <>
              <div className="mt12"><Meter value={Math.min(p.week.progress, p.week.goal)} max={p.week.goal} /></div>
              <p className="small muted mt8">
                <span className="num" style={{ color: 'var(--snow)' }}>{p.week.progress} of {p.week.goal} {p.week.unit}</span>.
                {nextWeek && ` The next challenge starts ${month} ${nextWeek.from}.`}
              </p>
            </>
          )}
        </section>
      )}

      {demo ? (
        <a href="/api/strava/connect" className="btn block mt24">Log in with Strava to use your runs</a>
      ) : (
        p.syncedAt && <p className="center tiny muted mt16">Synced from Strava {new Date(p.syncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.</p>
      )}
      {p.pouch.length > 0 && <Link href="/gift" className="btn ghost block mt12">Give your ornaments</Link>}
      <BottomNav />
    </main>
  );
}
