'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronIcon } from '@/components/Icons';
import { MusicButton } from '@/components/MusicToggle';
import Sprite from '@/components/Sprite';
import { getMe, saveMe } from '@/lib/me';

export default function LogIn() {
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const logIn = () => {
    // Phase 2: Strava OAuth; the Strava account is the login.
    setConnecting(true);
    saveMe({ ...getMe(), signedIn: true });
    timer.current = setTimeout(() => router.push('/tree'), 700);
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
      <p className="center tiny muted mt8">Demo: no Strava account needed. Tapping logs in to a pretend account.</p>

      <div className="grow" />
      <p className="center small soft mt24">
        New here? <Link href="/signup" style={{ fontWeight: 800 }}>Sign up</Link>
      </p>
    </main>
  );
}
