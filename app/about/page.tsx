import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronIcon } from '@/components/Icons';
import PageHeader from '@/components/PageHeader';
import Sprite from '@/components/Sprite';

export const metadata: Metadata = { title: 'About' };

const STEPS = [
  {
    sprite: 'star-gold',
    title: 'Get a tree',
    text: 'Connect Strava and you get your own pixel tree with a link to share.',
  },
  {
    sprite: 'bauble-snow',
    title: 'Friends hang ornaments',
    text: 'Runner friends hang ornaments they earned on your tree, each with a message. Every message stays sealed.',
  },
  {
    sprite: 'gift-box',
    title: 'Run to unwrap',
    text: 'Each day of Advent has a door. Run that day to unwrap a special ornament, then hang it on a friend’s tree.',
  },
  {
    sprite: 'lock',
    title: 'Read it all on Christmas',
    text: 'At midnight on December 25 your tree opens and you can read every message.',
  },
];

const RULES = [
  ['What counts', 'Runs, walks and hikes synced from Strava, outdoors or on a treadmill. Manual entries don’t.'],
  ['Daily doors', '1 km opens the day’s door. Doors close at 23:59 in your time zone.'],
  ['Weekly challenges', 'Finish a week’s goal to win a rare ornament. What it is stays a surprise.'],
  ['Giving', 'Every ornament you hang comes from a run: unwrap it, then give it to a friend. It goes on their tree right away.'],
  ['One per tree', 'You can hang one ornament on each friend’s tree, so spread them around.'],
  ['Missed days', 'No run, no ornament that day. The door stays wrapped.'],
];

export default function About() {
  return (
    <main className="screen no-nav">
      <PageHeader back="/" title="About" />

      <div className="center">
        <Sprite id="star-gold" px={4} style={{ margin: '0 auto' }} />
        <p className="soft mt12">
          A cozy running challenge for December. Friends fill your tree with sealed messages, and you
          run every day of Advent to unwrap ornaments of your own.
        </p>
      </div>

      <h2 className="h2 mt32">How it works</h2>
      <ol className="stack mt12" style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', gap: 8 }}>
        {STEPS.map((s, i) => (
          <li key={s.title} className="panel quiet row" style={{ alignItems: 'flex-start' }}>
            <Sprite id={s.sprite} px={2} style={{ flexShrink: 0 }} />
            <div className="grow">
              <p className="eyebrow">Step {i + 1}</p>
              <p style={{ fontWeight: 800 }} className="mt4">{s.title}</p>
              <p className="small soft mt4">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="h2 mt32">The rules</h2>
      <div className="panel quiet flush mt12">
        {RULES.map(([k, v]) => (
          <div key={k} className="list-row small" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 2, padding: '12px 0', justifyContent: 'center' }}>
            <span style={{ fontWeight: 800 }}>{k}</span>
            <span className="soft" style={{ fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>

      <h2 className="h2 mt32">Your runs stay private</h2>
      <div className="panel hint small mt12">
        <Sprite id="lock" px={2} style={{ flexShrink: 0 }} />
        <span>
          Friends only ever see ornaments. Your distances, doors and calendar are visible to you alone.
          Deleting your tree (on Me) also disconnects Strava and removes every synced run.
        </span>
      </div>

      <h2 className="h2 mt32">Behind Advent of Running</h2>
      <div className="panel quiet small soft mt12 stack" style={{ gap: 10 }}>
        <p>
          Advent of Running is made by Sujin. It was inspired by{' '}
          <a href="https://colormytree.me/" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 800 }}>Color My Tree</a>,
          where friends decorate your tree with messages, and turns that idea into a running challenge
          for December.
        </p>
        <p>
          Friends from AYOP (At Your Own Pace) tested it along the way and added many of its ideas.
        </p>
        <p>
          Most of it was built with Claude Code, Anthropic&apos;s AI coding tool. Questions or ideas? Say hi on Instagram:{' '}
          <a href="https://www.instagram.com/sujinleeme/" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 800 }}>@sujinleeme</a>.
        </p>
      </div>

      <Link href="/ornaments" className="panel quiet row link-row section">
        <Sprite id="snow-globe" px={2} />
        <span className="grow small" style={{ fontWeight: 700 }}>Browse the ornament directory</span>
        <ChevronIcon />
      </Link>

      <Link href="/signup" className="btn block mt24">Sign up</Link>

      <p className="center tiny muted mt24">
        Pixel art drawn in code · “Jingle Bells” (J. L. Pierpont, 1857, public domain) played as chiptune
      </p>
    </main>
  );
}
