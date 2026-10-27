'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { ChevronIcon } from '@/components/Icons';
import { MusicButton } from '@/components/MusicToggle';
import Sprite from '@/components/Sprite';
import { stravaLoginUrl } from '@/lib/me';

const LOGIN_ERROR: Record<string, string> = {
  denied: 'Strava login was cancelled.',
  scope: 'Please allow access to your activities, so your runs can open doors.',
  expired: 'The login took too long. Please try again.',
  strava: 'Strava didn’t respond. Please try again.',
  db: 'Couldn’t open your tree. Please try again.',
};

export default function LogIn() {
  return (
    <Suspense>
      <LogInInner />
    </Suspense>
  );
}

function LogInInner() {
  const error = useSearchParams().get('error');
  const [connecting, setConnecting] = useState(false);

  // the Strava account is the login; new runners finish sign-up after it
  const logIn = () => {
    setConnecting(true);
    window.location.href = stravaLoginUrl();
  };

  return (
    <main className="screen no-nav">
      <div className="topbar">
        <Link href="/" className="textlink"><ChevronIcon dir="left" /> Back</Link>
        <MusicButton />
      </div>

      <div className="center mt24">
        <div className="showcase">
          <Sprite id="star-gold" px={4} />
          <i className="glint" style={{ top: 26, right: 30 }} />
        </div>
        <p className="brand-mark mt16">Advent of Running</p>
        <h1 className="title mt4">Welcome back</h1>
        <p className="soft mt8">Log in with the Strava account you signed up with.</p>
      </div>

      {/* Phase 2: replace with Strava's official "Connect with Strava" button artwork. */}
      <button className="btn block strava mt32" onClick={logIn} aria-busy={connecting}>
        {connecting ? 'Logging in…' : 'Log in with Strava'}
      </button>
      {error && <p className="center small mt8" role="alert">{LOGIN_ERROR[error] ?? LOGIN_ERROR.strava}</p>}

      <div className="grow" />
      <p className="center small soft mt24">
        New here? <Link href="/signup" style={{ fontWeight: 800 }}>Sign up</Link>
      </p>
    </main>
  );
}
