'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronIcon } from '@/components/Icons';
import { MusicButton } from '@/components/MusicToggle';
import Sprite from '@/components/Sprite';
import { checkNickname, cleanNickname, saveMe } from '@/lib/me';

const STEPS = ['Tree name', 'Strava', 'Finish'] as const;

export default function SignUp() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [nick, setNick] = useState('');
  const [touched, setTouched] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [tz, setTz] = useState('');
  const nameInput = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setTz(Intl.DateTimeFormat().resolvedOptions().timeZone), []);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const check = checkNickname(nick);
  const showCheck = touched || nick.length >= 3;

  const connectStrava = () => {
    // Phase 2: redirect to Strava OAuth (scope read,activity:read) and come back here.
    setConnecting(true);
    timer.current = setTimeout(() => {
      setConnecting(false);
      setStep(2);
    }, 900);
  };

  return (
    <main className="screen no-nav">
      <div className="topbar">
        {step === 0 ? (
          <Link href="/" className="textlink"><ChevronIcon dir="left" /> Back</Link>
        ) : (
          <button type="button" className="textlink" style={{ background: 'none', border: 0, padding: 0, color: 'var(--gold)' }} onClick={() => setStep(step - 1)}>
            <ChevronIcon dir="left" /> Back
          </button>
        )}
        <MusicButton />
      </div>

      <p className="brand-mark">Advent of Running</p>
      <h1 className="title">Sign up</h1>

      <ol className="stepper mt16" aria-label={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}>
        {STEPS.map((s, i) => (
          <li key={s} className={i < step ? 'done' : i === step ? 'now' : ''} aria-current={i === step ? 'step' : undefined}>
            <i />
            <span>{s}</span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <form
          className="stack mt24 fade-in"
          style={{ gap: 20 }}
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (!check.ok) return nameInput.current?.focus();
            setStep(1);
          }}
        >
          <div className="row">
            <Sprite id="star-gold" px={4} style={{ flexShrink: 0 }} />
            <div>
              <h2 className="h2">Name your tree</h2>
              <p className="small soft mt4">This is your username. Friends use it to find your tree.</p>
            </div>
          </div>

          <label className="field">
            Tree name
            <div className="input-prefix">
              <span aria-hidden="true">/t/</span>
              <input
                ref={nameInput}
                className="input"
                value={nick}
                autoFocus
                autoCapitalize="none"
                autoComplete="username"
                spellCheck={false}
                placeholder="yourname"
                maxLength={20}
                aria-invalid={showCheck && !check.ok}
                aria-describedby="nick-help"
                onChange={(e) => setNick(cleanNickname(e.target.value))}
                onBlur={() => setTouched(true)}
              />
            </div>
            <span id="nick-help" className={`help${showCheck ? (check.ok ? ' ok' : ' bad') : ''}`} aria-live="polite">
              {showCheck ? check.message : 'Lowercase letters, numbers and dashes. 3–20 characters.'}
            </span>
          </label>

          <div className="panel quiet row" style={{ padding: '12px 16px' }}>
            <Sprite id="gift-box" px={2} style={{ flexShrink: 0 }} />
            <p className="small soft">
              Your link: <strong style={{ color: 'var(--snow)' }}>advent-of-running.vercel.app/t/{nick || 'yourname'}</strong>
            </p>
          </div>

          <button className="btn block" type="submit">Continue</button>
          <p className="center small soft">
            Already have a tree? <Link href="/login" style={{ fontWeight: 800 }}>Log in</Link>
          </p>
        </form>
      )}

      {step === 1 && (
        <div className="stack mt24 fade-in" style={{ gap: 16 }}>
          <div className="row">
            <Sprite id="running-shoe" px={4} style={{ flexShrink: 0 }} />
            <div>
              <h2 className="h2">Connect Strava</h2>
              <p className="small soft mt4">Your runs open the Advent doors, so we need to see them.</p>
            </div>
          </div>

          <ul className="panel quiet flush" style={{ listStyle: 'none', margin: 0 }}>
            {[
              ['We read', 'Your runs from December 1 to 24: distance and date.'],
              ['Friends see', 'Only the ornaments on your tree. Never your runs.'],
              ['You can leave', 'Disconnect any time. It deletes everything.'],
            ].map(([k, v]) => (
              <li key={k} className="list-row small" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '12px 0' }}>
                <span style={{ fontWeight: 800 }}>{k}</span>
                <span className="soft" style={{ fontWeight: 500 }}>{v}</span>
              </li>
            ))}
          </ul>

          {/* Phase 2: replace with Strava's official "Connect with Strava" button artwork. */}
          <button className="btn block strava" onClick={connectStrava} aria-busy={connecting}>
            {connecting ? 'Connecting…' : 'Connect with Strava'}
          </button>
          <p className="center tiny muted">Demo: no Strava account needed. Tapping connects a pretend account.</p>
        </div>
      )}

      {step === 2 && (
        <form
          className="stack mt24 fade-in"
          style={{ gap: 20 }}
          onSubmit={(e) => {
            e.preventDefault();
            saveMe({ nickname: nick, signedIn: true });
            router.push('/tree');
          }}
        >
          <div className="row">
            <Sprite id="bauble-snow" px={4} style={{ flexShrink: 0 }} />
            <div>
              <h2 className="h2">Almost there</h2>
              <p className="mt4"><span className="badge">Strava connected</span></p>
            </div>
          </div>

          <div className="field">
            Time zone
            <div className="panel quiet row between" style={{ padding: 14 }}>
              <span>{tz || 'Detecting…'}</span>
            </div>
            <span className="help">Your messages open at midnight on December 25 in this time zone.</span>
          </div>

          <button className="btn block" type="submit">Create my tree</button>
        </form>
      )}
    </main>
  );
}
