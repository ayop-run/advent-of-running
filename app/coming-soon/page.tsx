'use client';

import { useEffect, useState } from 'react';
import { MusicButton } from '@/components/MusicToggle';
import Sprite from '@/components/Sprite';

/** Launch: December 1, 00:00 in the visitor's own time zone, when door 1 opens. */
function untilLaunch(now = new Date()) {
  const ms = Math.max(0, new Date(now.getFullYear(), 11, 1).getTime() - now.getTime());
  return {
    d: Math.floor(ms / 86400000),
    h: Math.floor((ms % 86400000) / 3600000),
    m: Math.floor((ms % 3600000) / 60000),
    s: Math.floor((ms % 60000) / 1000),
    done: ms === 0,
  };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Mini stars around the door, in door pixels: [x, y, delay]. */
const GLINTS: [number, number, number][] = [[-6, 10, 0], [50, 4, 0.8], [-4, 44, 1.6], [52, 38, 0.4]];

/** What production shows until launch: door 1 with a countdown, and a sign-up for the launch email. */
export default function ComingSoon() {
  const [t, setT] = useState<ReturnType<typeof untilLaunch> | null>(null);
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const valid = EMAIL.test(email.trim());

  useEffect(() => {
    setT(untilLaunch());
    const id = setInterval(() => setT(untilLaunch()), 1000);
    return () => clearInterval(id);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || state === 'sending') return;
    setState('sending');
    try {
      const res = await fetch('/api/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, website }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  };

  const parts: [string, string][] = t
    ? [[String(t.d), 'days'], [String(t.h).padStart(2, '0'), 'hours'], [String(t.m).padStart(2, '0'), 'min'], [String(t.s).padStart(2, '0'), 'sec']]
    : [['–', 'days'], ['–', 'hours'], ['–', 'min'], ['–', 'sec']];

  return (
    <main className="screen no-nav">
      <div className="topbar">
        <span className="brand">Advent of Running</span>
        <MusicButton />
      </div>

      <div className="center mt24">
        <div className="launch-door" aria-hidden="true">
          <span className="plaque">1</span>
          <span className="panel-line top" />
          <span className="panel-line bottom" />
          <span className="lock"><Sprite id="lock" px={3} /></span>
          {GLINTS.map(([x, y, d], i) => (
            <i key={i} className="topper-glint" style={{ left: x * 4, top: y * 4, '--u': '4px', animationDelay: `${d}s` } as React.CSSProperties} />
          ))}
        </div>

        <p className="eyebrow mt24" style={{ color: 'var(--gold)' }}>Coming December 1</p>
        <h1 className="title mt4">{t?.done ? 'Door 1 is opening' : 'Door 1 opens in'}</h1>
        <div className="launch-countdown mt16" role="timer" aria-label={t ? `${t.d} days, ${t.h} hours and ${t.m} minutes until launch` : undefined}>
          {parts.map(([v, l]) => (
            <div key={l} className="tile">
              <span className="pix">{v}</span>
              <span className="unit">{l}</span>
            </div>
          ))}
        </div>
        <p className="soft mt16">
          Run every day of Advent to unwrap pixel ornaments. Friends hang sealed messages on your tree, and you read them all on Christmas morning.
        </p>
      </div>

      <section className="panel gold mt24" aria-labelledby="launch-news">
        {state === 'done' ? (
          <div className="row" role="status">
            <Sprite id="gift-box" px={3} style={{ flexShrink: 0 }} />
            <div>
              <h2 id="launch-news" className="h2">You’re on the list</h2>
              <p className="small soft mt4">We’ll email <strong style={{ color: 'var(--snow)' }}>{email.trim()}</strong> when door 1 opens.</p>
            </div>
          </div>
        ) : (
          <form className="stack" style={{ gap: 12 }} onSubmit={submit} noValidate>
            <div>
              <h2 id="launch-news" className="h2">Get the launch news</h2>
              <p className="small soft mt4">One email when Advent of Running opens. No spam.</p>
            </div>
            <label className="field">
              <span className="sr-only">Email</span>
              <input
                className="input"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                maxLength={254}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === 'error') setState('idle');
                }}
              />
            </label>
            {/* bots fill this in; people never see it */}
            <input className="sr-only" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
            {state === 'error' && <p className="small" role="alert" style={{ color: '#ff9aa8' }}>Couldn’t save your email. Please try again.</p>}
            <button className="btn block" type="submit" disabled={!valid} aria-busy={state === 'sending'}>
              {state === 'sending' ? 'Saving…' : 'Notify me'}
            </button>
          </form>
        )}
      </section>
      <p className="center tiny muted mt16">We only use your email to tell you we&apos;re open. <a href="/privacy" style={{ fontWeight: 800 }}>Privacy</a></p>
    </main>
  );
}
