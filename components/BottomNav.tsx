'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Nav icons share one 12×12 grid, drawn at 2px per pixel, in the link's text colour. */
const ICONS = {
  tree: 'M5 0h2v1H5zM5 1h2v1H5zM4 2h4v1H4zM3 3h6v1H3zM4 4h4v1H4zM2 5h8v1H2zM1 6h10v1H1zM3 7h6v1H3zM1 8h10v1H1zM0 9h12v1H0zM5 10h2v2H5z',
  calendar:
    'M3 1h1v1H3zM8 1h1v1H8zM1 2h10v10H1zM2 5h8v6H2zM3 6h1v1H3zM5 6h1v1H5zM7 6h1v1H7zM3 8h1v1H3zM5 8h1v1H5zM7 8h2v2H7z',
  me: 'M4 1h4v1h1v4H8v1H4V6H3V2h1zM2 8h8v1h1v3H1V9h1z',
} as const;

const TABS = [
  { href: '/tree', label: 'Tree', icon: ICONS.tree },
  { href: '/calendar', label: 'Calendar', icon: ICONS.calendar },
  { href: '/me', label: 'Me', icon: ICONS.me },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="nav" aria-label="Main">
      <div className="nav-inner">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} aria-current={path.startsWith(t.href) ? 'page' : undefined}>
            <svg width="24" height="24" viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true">
              <path d={t.icon} fill="currentColor" fillRule="evenodd" />
            </svg>
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
