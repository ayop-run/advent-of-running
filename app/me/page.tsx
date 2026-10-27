import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { MusicButton } from '@/components/MusicToggle';
import MeProfile from '@/components/MeProfile';
import LogOutButton from '@/components/LogOutButton';
import MeSettings from '@/components/MeSettings';
import MeStats from '@/components/MeStats';
import DisconnectButton from '@/components/DisconnectButton';
import Sprite from '@/components/Sprite';
import { ChevronIcon } from '@/components/Icons';

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

      <MeStats />

      <div className="stack mt12" style={{ gap: 8 }}>
        {[
          { href: '/friends', sprite: 'bauble-snow', label: 'Friends and requests' },
          { href: '/ornaments', sprite: 'snow-globe', label: 'All ornaments' },
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
      <DisconnectButton />

      <BottomNav />
    </main>
  );
}
