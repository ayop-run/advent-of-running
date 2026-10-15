import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { MusicButton } from '@/components/MusicToggle';
import { Avatar } from '@/components/PixelTree';
import { DEMO_POUCH } from '@/lib/data';
import { BY_ID } from '@/lib/ornaments';
import Sprite from '@/components/Sprite';
import { ChevronIcon } from '@/components/Icons';

const STATS = [
  { label: 'Swapped with', value: '14' },
  { label: 'Saved trees', value: '3' },
  { label: 'Collection', value: '10/100' },
];

const SETTINGS = [
  { label: 'Who can hang', value: 'Anyone with link' },
  { label: 'Email notifications', value: 'On' },
  { label: 'Time zone', value: 'Automatic' },
];

export default function Me() {
  const slots = [...DEMO_POUCH, null];
  return (
    <main className="screen">
      <div className="topbar">
        <div>
          <p className="brand-mark">Advent of Running</p>
          <h1 className="title">Me</h1>
        </div>
        <MusicButton />
      </div>

      <div className="row">
        <Avatar owner={{ name: 'demo' }} size={48} />
        <div className="grow">
          <p className="h2">demo</p>
          <p className="mt4"><span className="badge">Strava connected</span></p>
        </div>
      </div>

      <section className="panel gold mt16">
        <div className="row between">
          <h2 className="h2">Ornaments to give</h2>
          <span className="pix" style={{ color: 'var(--gold)' }}>{DEMO_POUCH.length}/3</span>
        </div>
        <div className="picker mt12">
          {slots.map((id, k) =>
            id ? (
              <div key={id} className="pick">
                <Sprite id={id} px={2} />
                <span>{BY_ID[id].name}</span>
              </div>
            ) : (
              <div key={`empty-${k}`} className="pick empty">Run to fill</div>
            ),
          )}
        </div>
        <p className="small soft mt12">Give them by December 24. Any you keep go on your own tree.</p>
        <Link href="/gift" className="btn block mt16">Give one</Link>
      </section>

      <div className="steps mt12">
        {STATS.map((s) => (
          <div key={s.label} className="step">
            <b>{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="stack mt12" style={{ gap: 8 }}>
        {[
          { href: '/ornaments', sprite: 'snow-globe', label: 'Ornament directory' },
          { href: '/christmas', sprite: 'gift-box', label: 'Preview Christmas morning' },
          { href: '/about', sprite: 'star-gold', label: 'About Advent of Running' },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="panel quiet row" style={{ color: 'var(--snow)', padding: '12px 16px' }}>
            <Sprite id={l.sprite} px={2} />
            <span className="grow small" style={{ fontWeight: 700 }}>{l.label}</span>
            <ChevronIcon />
          </Link>
        ))}
      </div>

      <h2 className="h2 mt32">Settings</h2>
      <div className="panel quiet flush mt12">
        {SETTINGS.map((s) => (
          <div key={s.label} className="list-row small"><span>{s.label}</span><span className="value small">{s.value}</span></div>
        ))}
      </div>

      <button className="btn red block mt24">Disconnect Strava</button>
      <p className="center tiny muted mt8">Deletes your tree, ornaments and synced runs.</p>

      <BottomNav />
    </main>
  );
}
