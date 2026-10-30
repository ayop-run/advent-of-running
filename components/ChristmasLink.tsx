'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Sprite from '@/components/Sprite';
import { ChevronIcon } from '@/components/Icons';
import { adventMonth, christmasOpen, monthName } from '@/lib/calendar';
import { getMe } from '@/lib/me';

const LABEL = 'Open your letters';

/** Me: the way to your Christmas letters, locked until the 25th in your time zone. */
export default function ChristmasLink() {
  // null until we know; locked meanwhile so it never flashes open
  const [open, setOpen] = useState<boolean | null>(null);
  useEffect(() => {
    getMe().then((me) => {
      const tz = me?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
      const [, month, day] = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date()).split('-').map(Number);
      setOpen(christmasOpen({ month, day }));
    });
  }, []);

  if (open) {
    return (
      <Link href="/christmas" className="panel quiet row link-row">
        <Sprite id="gift-box" px={2} />
        <span className="grow small" style={{ fontWeight: 700 }}>{LABEL}</span>
        <ChevronIcon />
      </Link>
    );
  }
  const opens = `Opens ${monthName(adventMonth(new Date().getMonth() + 1), 'short')} 25`;
  return (
    <div className="panel quiet row link-row locked" aria-disabled="true">
      <Sprite id="gift-box" px={2} />
      <span className="grow small" style={{ fontWeight: 700 }}>{LABEL}</span>
      <span className="tiny muted">{opens}</span>
    </div>
  );
}
