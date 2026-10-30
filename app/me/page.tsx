import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import MeProfile from '@/components/MeProfile';
import LogOutButton from '@/components/LogOutButton';
import MeSettings from '@/components/MeSettings';
import MeStats from '@/components/MeStats';
import ChristmasLink from '@/components/ChristmasLink';
import NotificationsLink from '@/components/NotificationsLink';
import DisconnectButton from '@/components/DisconnectButton';
import Sprite from '@/components/Sprite';
import { ChevronIcon } from '@/components/Icons';

export default function Me() {
  return (
    <main className="screen">
      <PageHeader title="Me" />

      <MeProfile />

      <MeStats />

      <div className="list mt12">
        <NotificationsLink />
        {[
          { href: '/friends', sprite: 'bauble-snow', label: 'Friends and requests' },
          { href: '/ornaments', sprite: 'snow-globe', label: 'All ornaments' },
          { href: '/about', sprite: 'star-gold', label: 'How it works' },
          { href: '/privacy', sprite: 'lock', label: 'Privacy' },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="panel quiet row link-row">
            <Sprite id={l.sprite} px={2} />
            <span className="grow small" style={{ fontWeight: 700 }}>{l.label}</span>
            <ChevronIcon />
          </Link>
        ))}
        <ChristmasLink />
      </div>

      <section className="section">
        <h2 className="h2 section-head">Settings</h2>
        <MeSettings />
      </section>

      <div className="section">
        <LogOutButton />
        <DisconnectButton />
      </div>

      <BottomNav />
    </main>
  );
}
