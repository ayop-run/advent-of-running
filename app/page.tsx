import Link from 'next/link';
import { MusicButton } from '@/components/MusicToggle';
import PixelTree from '@/components/PixelTree';
import type { Hung } from '@/lib/data';

const PREVIEW: Hung[] = ['star-gold', 'fox', 'bauble-snow', 'penguin', 'hot-cocoa', 'sock', 'finish-medal', 'snowflake', 'reindeer', 'bauble-frost'].map(
  (ornamentId, i) => ({ id: `p${i}`, ornamentId, from: '', hint: 'Cheer', message: '', createdAt: '' }),
);

const LOGIN_ERROR: Record<string, string> = {
  denied: 'Strava login was cancelled.',
  scope: 'Please allow access to your activities, so your runs can open doors.',
  expired: 'The login took too long. Please try again.',
  strava: "Strava didn't respond. Please try again.",
  db: "Couldn't create your tree. Please try again.",
};

export default async function Landing({ searchParams }: { searchParams: Promise<{ login?: string }> }) {
  const { login } = await searchParams;
  return (
    <main className="screen no-nav">
      <div className="topbar">
        <span className="brand">Advent of Running</span>
        <div className="topbar-end">
          <a href="/api/strava/connect" className="textlink">Log in</a>
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
        {login && <p className="center small" role="alert">{LOGIN_ERROR[login] ?? LOGIN_ERROR.strava}</p>}
        <a href="/api/strava/connect" className="btn block">Start my tree with Strava</a>
        <Link href="/t/mina" className="btn ghost block">See a friend&apos;s tree</Link>
      </div>
      <p className="center tiny muted mt16">Door 1 opens on December 1. Log in with Strava to get your own tree.</p>
    </main>
  );
}
