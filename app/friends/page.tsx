'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import BackLink from '@/components/BackLink';
import BottomNav from '@/components/BottomNav';
import { MusicButton } from '@/components/MusicToggle';
import { Avatar } from '@/components/PixelTree';
import Sprite from '@/components/Sprite';
import { canGiveTo, friendNote, getFriends, treeExists, type Friend } from '@/lib/friends';
import { DEMO_NICKNAME, getMe, myNickname } from '@/lib/me';
import { cleanNickname } from '@/lib/nickname';
import { BY_ID } from '@/lib/ornaments';
import { ask, getAsked, incomingRequests } from '@/lib/requests';

function FriendsInner() {
  // ?give=<ornament> turns the list into "who gets it?" after an unwrap
  const give = useSearchParams().get('give');
  const giving = give && BY_ID[give] ? BY_ID[give] : null;

  const [me, setMe] = useState(DEMO_NICKNAME);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [q, setQ] = useState('');
  const [toast, setToast] = useState('');
  const [asked, setAsked] = useState<string[]>([]);
  const [incoming, setIncoming] = useState<string[]>([]);
  useEffect(() => {
    getMe().then((m) => setMe(myNickname(m)));
    getFriends().then(setFriends);
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

  const query = cleanNickname(q);
  const matched = query ? friends.filter((f) => f.nickname.includes(query)) : friends;
  // when giving, friends you can still give to come first
  const shown = giving ? [...matched].sort((a, b) => Number(canGiveTo(b.nickname, friends)) - Number(canGiveTo(a.nickname, friends))) : matched;
  const blocked = (nick: string) => Boolean(giving) && !canGiveTo(nick, friends);
  const exact = query.length >= 3 && !friends.some((f) => f.nickname === query) && query !== me ? query : null;
  const [exactExists, setExactExists] = useState(false);
  useEffect(() => {
    setExactExists(false);
    if (!exact) return;
    let live = true;
    const t = setTimeout(() => treeExists(exact).then((yes) => live && setExactExists(yes)), 250);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [exact]);
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
      <div className="topbar">
        <BackLink fallback={giving ? '/gift' : '/me'} />
        <MusicButton />
      </div>
      <p className="brand-mark">Advent of Running</p>
      <h1 className="title">{giving ? 'Give it to…' : 'Friends'}</h1>

      {giving && (
        <div className="panel gold row">
          <Sprite id={giving.id} px={2} style={{ flexShrink: 0 }} />
          <p className="small soft">Pick who gets your <strong style={{ color: 'var(--snow)' }}>{giving.name.replace('Advent Runner: ', '')}</strong>. You can give one ornament to each friend&apos;s tree.</p>
        </div>
      )}

      <label className="field mt16">
        <span className="sr-only">Find a tree by name</span>
        <div className="input-prefix">
          <span aria-hidden="true">/t/</span>
          <input
            className="input"
            type="search"
            value={q}
            placeholder="Find a tree by name"
            autoCapitalize="none"
            spellCheck={false}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </label>

      {exact && (
        <div className="panel quiet row mt12 fade-in" style={{ padding: '12px 14px' }}>
          {exactExists ? (
            <>
              <Avatar owner={{ name: exact }} size={38} />
              <div className="grow">
                <div style={{ fontWeight: 800 }}>{exact.charAt(0).toUpperCase() + exact.slice(1)}&apos;s tree</div>
                <div className="tiny muted">/t/{exact}</div>
              </div>
              {blocked(exact) ? <span className="tag">Has yours</span> : <Link href={visitHref(exact)} className="btn sm">{action}</Link>}
            </>
          ) : (
            <>
              <Sprite id="gift-box" px={2} style={{ flexShrink: 0, filter: 'grayscale(1)', opacity: 0.6 }} />
              <p className="small soft grow">No tree called <strong style={{ color: 'var(--snow)' }}>“{exact}”</strong> yet. Check the spelling, or invite them below.</p>
            </>
          )}
        </div>
      )}

      {!giving && !query && incoming.length > 0 && (
        <section className="mt24" aria-labelledby="requests">
          <div className="panel-head">
            <h2 id="requests" className="h2">Requests</h2>
            <span className="num" style={{ color: 'var(--gold)' }}>{incoming.length}</span>
          </div>
          <ul className="stack mt12" style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', gap: 8 }}>
            {incoming.map((nick) => {
              const who = nick.charAt(0).toUpperCase() + nick.slice(1);
              return (
                <li key={nick} className="panel gold row" style={{ padding: '10px 12px 10px 12px' }}>
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

      {(!query || shown.length > 0) && (
      <div className="panel-head mt24">
        <h2 className="h2">Your friends</h2>
        <span className="num muted">{shown.length}</span>
      </div>
      )}
      {!query && <p className="small soft mt4">People who hung ornaments on your tree, people you gave to, and trees you visited.</p>}

      <ul className="stack mt12" style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', gap: 8 }}>
        {shown.map((f) => (
          <li key={f.nickname} className="panel quiet row" style={{ padding: '12px 12px 12px 14px' }}>
            <Avatar owner={{ name: f.name }} size={38} />
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
        {shown.length === 0 && !exact && query && <li className="small soft">No friends match “{query}”. Type their full tree name to find them.</li>}
      </ul>

      <section className="panel quiet mt24" style={{ padding: '14px 16px' }}>
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
