import Link from 'next/link';
import { MusicButton } from '@/components/MusicToggle';
import PixelTree from '@/components/PixelTree';
import type { Hung } from '@/lib/data';

const PREVIEW: Hung[] = ['star-gold', 'fox', 'bauble-snow', 'penguin', 'hot-cocoa', 'sock', 'finish-medal', 'snowflake', 'reindeer', 'bauble-frost'].map(
  (ornamentId, i) => ({ id: `p${i}`, ornamentId, from: '', hint: 'Cheer', message: '', createdAt: '' }),
);

export default function Landing() {
  return (
    <main className="screen no-nav">
      <div className="topbar">
        <span className="brand">Advent of Running</span>
        <div className="topbar-end">
          <Link href="/tree" className="textlink">Log in</Link>
          <MusicButton />
        </div>
      </div>

      <PixelTree ornaments={PREVIEW} owner={{ name: 'You', isYou: true }} label="" decorative scale={4.5} />

      <h1 className="h1 center mt32" style={{ fontSize: 32 }}>Run all December.<br />Read your tree on Christmas.</h1>

      <p className="center soft mt12" style={{ maxWidth: 380, marginInline: 'auto' }}>
        Friends hang ornaments on your tree with a sealed message. Run each day of Advent to unwrap
        special ornaments you can hang on theirs.
      </p>

      <div className="grow" />

      <div className="stack mt24">
        {/* Phase 2: Strava's official "Connect with Strava" button + OAuth. */}
        <Link href="/onboarding" className="btn block">Start my tree with Strava</Link>
        <Link href="/t/mina" className="btn ghost block">See a friend&apos;s tree</Link>
      </div>
      <p className="center tiny muted mt16">Door 1 opens on December 1. This prototype uses demo data.</p>
    </main>
  );
}
