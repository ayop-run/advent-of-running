'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/tree', label: 'Tree', icon: '/ornaments/bauble-snow.png' },
  { href: '/calendar', label: 'Calendar', icon: '/ornaments/gift-box.png' },
  { href: '/me', label: 'Me', icon: '/ornaments/star-gold.png' },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="nav" aria-label="Main">
      <div className="nav-inner">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} aria-current={path.startsWith(t.href) ? 'page' : undefined}>
            <img className="px" src={t.icon} alt="" />
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
