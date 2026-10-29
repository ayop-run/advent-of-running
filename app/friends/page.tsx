'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { Avatar } from '@/components/PixelTree';
import Sk from '@/components/Skeleton';
import Sprite from '@/components/Sprite';
import { canGiveTo, friendNote, getFriends, type Friend } from '@/lib/friends';
import { DEMO_NICKNAME, getMe, myNickname } from '@/lib/me';
import { BY_ID } from '@/lib/ornaments';
import { ask, getAsked, incomingRequests } from '@/lib/requests';

function FriendsInner() {
  // ?give=<ornament> turns the list into "who gets it?" after an unwrap
  const give = useSearchParams().get('give');
  const giving = give && BY_ID[give] ? BY_ID[give] : null;

  const [me, setMe] = useState(DEMO_NICKNAME);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [asked, setAsked] = useState<string[]>([]);
  const [incoming, setIncoming] = useState<string[]>([]);
  useEffect(() => {
    getMe().then((m) => setMe(myNickname(m)));
    getFriends().then((list) => {
      setFriends(list);
      setLoading(false);
    });
    setAsked(getAsked());
    incomingRequests().then(setIncoming);
  }, []);
  const askFriend = (f: Friend) => {
    // Phase 2: sends an in-app notification
    ask(f.nickname);
    setAsked(getAsked());
    setToast(`Asked ${f.name} to hang one on your tree`);
  };
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  // when giving, friends you can still give to come first
  const shown = giving ? [...friends].sort((a, b) => Number(canGiveTo(b.nickname, friends)) - Number(canGiveTo(a.nickname, friends))) : friends;
  const blocked = (nick: string) => Boolean(giving) && !canGiveTo(nick, friends);
  const visitHref = (nick: string) => (giving ? `/t/${nick}/hang?o=${giving.id}` : `/t/${nick}`);
  const action = giving ? 'Give' : 'Visit';

  const share = async () => {
    const url = `${window.location.origin}/t/${me}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Hang an ornament on my tree', url });
      else {
        await navigator.clipboard.writeText(url);
        setToast('Link copied');
      }
    } catch {
      /* share sheet dismissed */
    }
  };

  return (
    <main className="screen">
      <PageHeader back={giving ? '/gift' : '/me'} title={giving ? 'Give it to…' : 'Friends'} />

      {giving ? (
        <div className="panel gold row">
          <Sprite id={giving.id} px={2} style={{ flexShrink: 0 }} />
          <p className="small soft">Pick who gets your <strong style={{ color: 'var(--snow)' }}>{giving.name.replace('Advent Runner: ', '')}</strong>. You can give one ornament to each friend&apos;s tree.</p>
        </div>
      ) : (
        <p className="small soft">Everyone on Advent of Running. People you swap ornaments with come first.</p>
      )}

      {!giving && incoming.length > 0 && (
        <section className="section" aria-labelledby="requests">
          <div className="panel-head section-head">
            <h2 id="requests" className="h2">Requests</h2>
            <span className="num" style={{ color: 'var(--gold)' }}>{incoming.length}</span>
          </div>
          <ul className="list">
            {incoming.map((nick) => {
              const who = nick.charAt(0).toUpperCase() + nick.slice(1);
              return (
                <li key={nick} className="panel gold row item">
                  <Avatar owner={{ name: who }} size={38} />
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800 }}>{who}</div>
                    <div className="tiny muted">Asked you to hang an ornament</div>
                  </div>
                  <Link href={`/t/${nick}/hang`} className="btn sm">Hang</Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {!giving && incoming.length > 0 && (
        <div className="panel-head section">
          <h2 className="h2">Runners</h2>
          <span className="num muted">{shown.length}</span>
        </div>
      )}

      <ul className="list mt12" aria-busy={loading}>
        {loading && [0, 1, 2, 3].map((i) => (
          <li key={i} className="panel quiet row item">
            <Sk w={38} h={38} />
            <div className="grow"><Sk w="45%" h={14} /><Sk w="70%" h={12} className="mt8" /></div>
            <Sk w={64} h={36} />
          </li>
        ))}
        {shown.map((f) => (
          <li key={f.nickname} className="panel quiet row item loaded">
            <Avatar owner={{ name: f.name, avatarUrl: f.avatarUrl ?? undefined }} size={38} />
            <div className="grow" style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800 }}>{f.name}</div>
              <div className="tiny muted">{friendNote(f, { showGiven: !giving })}</div>
              {!giving && f.hung === 0 && (asked.includes(f.nickname) ? (
                <span className="ask-done">Asked ✓</span>
              ) : (
                <button type="button" className="ask-link" onClick={() => askFriend(f)}>Ask to hang one</button>
              ))}
            </div>
            {blocked(f.nickname) ? <span className="tag">Has yours</span> : <Link href={visitHref(f.nickname)} className="btn sm">{action}</Link>}
          </li>
        ))}
        {!loading && shown.length === 0 && <li className="small soft loaded">Nobody else is here yet. Invite your running friends below.</li>}
      </ul>

      <section className="panel quiet section">
        <div className="row">
          <Sprite id="bauble-snow" px={2} style={{ flexShrink: 0 }} />
          <div className="grow">
            <p style={{ fontWeight: 800 }}>Invite a friend</p>
            <p className="tiny muted">Send your link. They can hang an ornament without signing up.</p>
          </div>
        </div>
        <button className="btn ghost block mt12" onClick={share}>Share my tree</button>
      </section>

      {toast && <div className="toast" role="status">{toast}</div>}
      <BottomNav />
    </main>
  );
}

export default function Friends() {
  return (
    <Suspense>
      <FriendsInner />
    </Suspense>
  );
}
