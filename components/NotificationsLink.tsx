'use client';

import Link from 'next/link';
import Sprite from '@/components/Sprite';
import { ChevronIcon } from '@/components/Icons';
import { useUnread } from '@/lib/notifications';

/** Me: the way to your notifications, with how many are new. */
export default function NotificationsLink() {
  const unread = useUnread();
  return (
    <Link href="/notifications" className="panel quiet row link-row">
      <Sprite id="bell-gold" px={2} />
      <span className="grow small" style={{ fontWeight: 700 }}>Notifications</span>
      {unread > 0 && <span className="unread" aria-label={`${unread} new`}>{unread > 9 ? '9+' : unread}</span>}
      <ChevronIcon />
    </Link>
  );
}
