import Link from 'next/link';
import { PoweredByStrava, StravaLogin } from '@/components/Strava';
import { MusicButton } from '@/components/MusicToggle';
import PixelTree from '@/components/PixelTree';
import Sprite from '@/components/Sprite';
import type { Hung } from '@/lib/data';
import { LOGIN_ERROR, stravaLoginUrl } from '@/lib/login';

const STEPS = [
  { n: 1, sprite: 'bauble-snow', text: 'Friends hang sealed messages' },
  { n: 2, sprite: 'running-shoe', text: 'Run daily to unwrap ornaments' },
  { n: 3, sprite: 'gift-box', text: 'Open them all on Christmas' },
];

const PREVIEW_NAMES = ['Kira', 'Theo', 'Maya', 'Felix', 'Rosa', 'Hugo', 'Ines', 'Luca', 'Greta', 'Ben'];
const PREVIEW: Hung[] = ['snow-globe', 'fox', 'bauble-snow', 'penguin', 'hot-cocoa', 'sock', 'finish-medal', 'snowflake', 'reindeer', 'bauble-frost'].map(
  (ornamentId, i) => ({ id: `p${i}`, ornamentId, from: PREVIEW_NAMES[i], hint: 'Cheer', message: '', createdAt: '' }),
);

export default async function Landing({ searchParams }: { searchParams: Promise<{ login_error?: string }> }) {
  // a Strava login that came back without logging in
  const { login_error: error } = await searchParams;
  return (
    <main className="screen no-nav">
      <div className="topbar">
        <span className="brand">Advent of Running</span>
        <div className="topbar-end">
          <a href={stravaLoginUrl()} className="textlink">Log in</a>
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

      <div style={{ flex: '0 1 48px' }} />

      <div className="stack mt24">
        <Link href="/signup" className="btn block">Sign up</Link>
        <StravaLogin href={stravaLoginUrl()} />
      </div>
      {error && <p className="center small mt8" role="alert">{LOGIN_ERROR[error] ?? LOGIN_ERROR.strava}</p>}
      <p className="center tiny muted mt12">
        <Link href="/t/ayop" style={{ fontWeight: 800 }}>Visit AYOP&apos;s tree</Link> · <Link href="/about" style={{ fontWeight: 800 }}>How it works</Link> · <Link href="/ornaments" style={{ fontWeight: 800 }}>Ornaments</Link> · <Link href="/privacy" style={{ fontWeight: 800 }}>Privacy</Link>
      </p>
      <p className="center mt16"><PoweredByStrava /></p>
    </main>
  );
}
