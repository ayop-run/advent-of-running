'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import FollowButton from '@/components/FollowButton';
import PageHeader from '@/components/PageHeader';
import { Avatar } from '@/components/PixelTree';
import Sk from '@/components/Skeleton';
import Sprite from '@/components/Sprite';
import { setFollowing } from '@/lib/friends';
import { getNotifications, markAllRead, type Notification } from '@/lib/notifications';

/** "just now", "3 h ago", "2 d ago", then the date. */
function ago(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  if (min < 24 * 60) return `${Math.round(min / 60)} h ago`;
  if (min < 7 * 24 * 60) return `${Math.round(min / 1440)} d ago`;
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function Notifications() {
  // undefined while loading, null if it failed
  const [items, setItems] = useState<Notification[] | null | undefined>(undefined);
  useEffect(() => {
    getNotifications().then((list) => {
      setItems(list);
      // read once you've seen them; this visit still shows which ones are new
      if (list?.some((n) => !n.read)) markAllRead();
    });
  }, []);

  /** Follow back right away, and undo it if the server says no. */
  const followBack = async (n: Extract<Notification, { kind: 'followed' }>) => {
    const next = !n.following;
    const set = (following: boolean) => setItems((l) => l?.map((x) => (x.id === n.id ? { ...n, following } : x)));
    set(next);
    if (!(await setFollowing(n.who.nickname, next))) set(!next);
  };

  return (
    <main className="screen">
      <PageHeader back="/me" title="Notifications" />

      {items === undefined ? (
        <ul className="list" aria-busy="true">
          {[0, 1, 2].map((i) => <li key={i}><Sk h={66} /></li>)}
        </ul>
      ) : items === null ? (
        <p className="soft center mt24 loaded">Couldn&apos;t load your notifications. Please try again later.</p>
      ) : items.length === 0 ? (
        <section className="panel quiet center loaded">
          <Sprite id="bauble-snow" px={4} style={{ margin: '0 auto' }} />
          <p className="small soft mt12">
            Nothing yet. When friends follow you, ask you for an ornament or hang one on your tree,
            you&apos;ll see it here.
          </p>
        </section>
      ) : (
        <ul className="list loaded">
          {items.map((n) => (
            <li key={n.id} className={`panel row item notif${n.read ? '' : ' new'}`}>
              {n.kind === 'hung' ? (
                <>
                  <span className="notif-ornament"><Sprite id={n.ornamentId} px={2} /></span>
                  <div className="grow" style={{ minWidth: 0 }}>
                    <p className="small"><b>{n.initial}.</b> hung an ornament on your tree</p>
                    <p className="tiny muted mt4">Who it&apos;s from stays sealed until Christmas · {ago(n.createdAt)}</p>
                  </div>
                  <Link href="/tree" className="btn ghost sm">See</Link>
                </>
              ) : (
                <>
                  <Link href={`/t/${n.who.nickname}`} aria-label={`${n.who.name}'s tree`}>
                    <Avatar owner={{ name: n.who.name, avatarUrl: n.who.avatarUrl ?? undefined }} size={38} />
                  </Link>
                  <div className="grow" style={{ minWidth: 0 }}>
                    <p className="small">
                      <Link href={`/t/${n.who.nickname}`} className="notif-name">{n.who.name}</Link>{' '}
                      {n.kind === 'followed' ? 'started following your tree' : 'asked you to hang an ornament'}
                    </p>
                    <p className="tiny muted mt4">{ago(n.createdAt)}</p>
                  </div>
                  {n.kind === 'followed' ? (
                    <FollowButton following={n.following} onClick={() => followBack(n)} />
                  ) : n.given ? (
                    <span className="tag">Hung</span>
                  ) : (
                    <Link href={`/t/${n.who.nickname}/hang`} className="btn sm">Hang</Link>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <BottomNav />
    </main>
  );
}
