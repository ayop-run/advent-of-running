import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { MusicButton } from '@/components/MusicToggle';
import MeProfile from '@/components/MeProfile';
import LogOutButton from '@/components/LogOutButton';
import MeSettings from '@/components/MeSettings';
import { DEMO_GIVEN, DEMO_TODAY } from '@/lib/calendar';
import Sprite from '@/components/Sprite';
import { ChevronIcon } from '@/components/Icons';

const given = Object.keys(DEMO_GIVEN).length;
const daysSoFar = DEMO_TODAY - 1;
const friends = new Set(Object.values(DEMO_GIVEN)).size;

const STATS = [
  { label: 'Ornaments given', value: `${given}` },
  { label: 'Days run', value: `${given}/${daysSoFar}` },
  { label: 'Friends', value: `${friends}` },
];

export default function Me() {
  return (
    <main className="screen">
      <div className="topbar">
        <div>
          <p className="brand-mark">Advent of Running</p>
          <h1 className="title">Me</h1>
        </div>
        <MusicButton />
      </div>

      <MeProfile />

      <div className="steps mt16">
        {STATS.map((s) => (
          <div key={s.label} className="step">
            <b>{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="stack mt12" style={{ gap: 8 }}>
        {[
          { href: '/friends', sprite: 'bauble-snow', label: 'Friends and requests' },
          { href: '/ornaments', sprite: 'snow-globe', label: 'Ornament directory' },
          { href: '/christmas', sprite: 'gift-box', label: 'Preview Christmas morning' },
          { href: '/about', sprite: 'star-gold', label: 'How it works' },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="panel quiet row" style={{ color: 'var(--snow)', padding: '12px 16px' }}>
            <Sprite id={l.sprite} px={2} />
            <span className="grow small" style={{ fontWeight: 700 }}>{l.label}</span>
            <ChevronIcon />
          </Link>
        ))}
      </div>

      <h2 className="h2 mt32">Settings</h2>
      <MeSettings />

      <div className="mt24"><LogOutButton /></div>
      <button className="btn red block mt12">Disconnect Strava</button>
      <p className="center tiny muted mt8">Deletes your tree, ornaments and synced runs.</p>

      <BottomNav />
    </main>
  );
}
