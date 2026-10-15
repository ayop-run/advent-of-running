import Link from 'next/link';
import { MusicButton } from '@/components/MusicToggle';
import PixelTree from '@/components/PixelTree';
import Sprite from '@/components/Sprite';
import type { Hung } from '@/lib/data';

const STEPS = [
  { n: 1, sprite: 'bauble-snow', text: 'Friends hang sealed messages' },
  { n: 2, sprite: 'running-shoe', text: 'Run daily to unwrap ornaments' },
  { n: 3, sprite: 'gift-box', text: 'Open them all on Christmas' },
];

const PREVIEW: Hung[] = ['snow-globe', 'fox', 'bauble-snow', 'penguin', 'hot-cocoa', 'sock', 'finish-medal', 'snowflake', 'reindeer', 'bauble-frost'].map(
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

      <PixelTree ornaments={PREVIEW} owner={{ name: 'You', isYou: true }} label="" decorative />

      <h1 className="h1 center mt24">Run all December.<br />Read your tree on Christmas.</h1>

      <ol className="steps mt16" style={{ listStyle: 'none', padding: 0, margin: '16px 0 0' }}>
        {STEPS.map((s) => (
          <li key={s.n} className="step">
            <Sprite id={s.sprite} px={2} />
            <span>{s.text}</span>
          </li>
        ))}
      </ol>

      <div className="grow" />

      <div className="stack mt24">
        {/* Phase 2: Strava's official "Connect with Strava" button + OAuth. */}
        <Link href="/onboarding" className="btn block">Start with Strava</Link>
        <Link href="/t/mina" className="btn ghost block">See a friend&apos;s tree</Link>
      </div>
      <p className="center tiny muted mt12">
        Door 1 opens December 1 · <Link href="/about" style={{ fontWeight: 800 }}>How it works</Link> · <Link href="/ornaments" style={{ fontWeight: 800 }}>Ornaments</Link>
      </p>
    </main>
  );
}
