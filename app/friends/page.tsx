'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import FollowButton from '@/components/FollowButton';
import { SearchIcon } from '@/components/Icons';
import PageHeader from '@/components/PageHeader';
import { Avatar } from '@/components/PixelTree';
import Sk from '@/components/Skeleton';
import Sprite from '@/components/Sprite';
import { canGiveTo, friendNote, getFriends, searchRunners, setFollowing, type Friend } from '@/lib/friends';
import { DEMO_NICKNAME, getMe, myNickname } from '@/lib/me';
import { BY_ID } from '@/lib/ornaments';
import { ask, getAsked, incomingRequests, type FriendRequest } from '@/lib/requests';

/** Search results: undefined while there's no search, null when it failed. */
type Results = Friend[] | null | undefined;

function FriendsInner() {
  // ?give=<ornament> turns the list into "who gets it?" after an unwrap
  const give = useSearchParams().get('give');
  const giving = give && BY_ID[give] ? BY_ID[give] : null;

  const [me, setMe] = useState(DEMO_NICKNAME);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Results>(undefined);
  const [toast, setToast] = useState('');
  const [asked, setAsked] = useState<string[]>([]);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  useEffect(() => {
    getMe().then((m) => setMe(myNickname(m)));
    getFriends().then((list) => {
      setFriends(list);
      setLoading(false);
    });
    getAsked().then(setAsked);
    incomingRequests().then(setIncoming);
  }, []);

  // search as you type, once there are 2 letters
  const searching = query.trim().length >= 2;
  useEffect(() => {
    if (!searching) return setResults(undefined);
    let live = true;
    setResults(undefined);
    const id = setTimeout(() => searchRunners(query).then((r) => live && setResults(r)), 300);
    return () => {
      live = false;
      clearTimeout(id);
    };
  }, [query, searching]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  /** Sends a notification to the friend; shows "Asked" right away and undoes it if sending failed. */
  const askFriend = async (f: Friend) => {
    setAsked((a) => [...a, f.nickname]);
    if (await ask(f.nickname)) return setToast(`Asked ${f.name} to hang one on your tree`);
    setAsked((a) => a.filter((n) => n !== f.nickname));
    setToast('Couldn’t send. Please try again.');
  };

  /** Follow or unfollow right away, and undo it if the server says no. */
  const toggleFollow = async (f: Friend) => {
    const follow = !f.following;
    const apply = (on: boolean) => {
      const update = (x: Friend) => (x.nickname === f.nickname ? { ...x, following: on } : x);
      setResults((r) => r?.map(update));
      setFriends((list) => {
        // following someone from search adds them to your friends
        if (on && !list.some((x) => x.nickname === f.nickname)) return [...list, { ...f, following: true }];
        return list.map(update);
      });
    };
    apply(follow);
    if (await setFollowing(f.nickname, follow)) setToast(follow ? `Following ${f.name}’s tree` : `Unfollowed ${f.name}`);
    else {
      apply(!follow);
      setToast('Couldn’t update. Please try again.');
    }
  };

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

  const following = friends.filter((f) => f.following);
  // people you swapped ornaments with but don't follow yet
  const swapped = friends.filter((f) => !f.following);
  // when giving, friends you can still give to come first
  const giveOrder = (list: Friend[]) => [...list].sort((a, b) => Number(canGiveTo(b.nickname, friends)) - Number(canGiveTo(a.nickname, friends)));

  const row = (f: Friend) => (
    <FriendRow
      key={f.nickname}
      f={f}
      giving={giving?.id ?? null}
      canGive={canGiveTo(f.nickname, friends)}
      asked={asked.includes(f.nickname)}
      onAsk={() => askFriend(f)}
      onFollow={() => toggleFollow(f)}
    />
  );

  return (
    <main className="screen">
      <PageHeader back={giving ? '/gift' : '/me'} title={giving ? 'Give it to…' : 'Friends'} />

      {giving ? (
        <div className="panel gold row">
          <Sprite id={giving.id} px={2} style={{ flexShrink: 0 }} />
          <p className="small soft">Pick who gets your <strong style={{ color: 'var(--snow)' }}>{giving.name.replace('Advent Runner: ', '')}</strong>. You can give one ornament to each friend&apos;s tree.</p>
        </div>
      ) : (
        <p className="small soft">Follow your running friends&apos; trees, and hang an ornament on each.</p>
      )}

      <div className="search mt12" role="search">
        <span aria-hidden="true"><SearchIcon /></span>
        <input
          className="input"
          type="search"
          inputMode="search"
          autoComplete="off"
          placeholder="Search by name or tree name"
          aria-label="Search runners"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {searching ? (
        <section className="section" aria-labelledby="results" aria-busy={results === undefined}>
          <h2 id="results" className="h2 section-head">Results</h2>
          {results === undefined ? (
            <ul className="list"><RowSkeleton /><RowSkeleton /></ul>
          ) : results === null ? (
            <p className="small soft">Couldn&apos;t search right now. Please try again.</p>
          ) : results.length === 0 ? (
            <p className="small soft">No runner called “{query.trim()}” yet. Invite them with your tree link below.</p>
          ) : (
            <ul className="list">{(giving ? giveOrder(results) : results).map(row)}</ul>
          )}
        </section>
      ) : (
        <>
          {!giving && incoming.length > 0 && (
            <section className="section" aria-labelledby="requests">
              <div className="panel-head section-head">
                <h2 id="requests" className="h2">Requests</h2>
                <span className="num" style={{ color: 'var(--gold)' }}>{incoming.length}</span>
              </div>
              <ul className="list">
                {incoming.map((r) => (
                  <li key={r.nickname} className="panel gold row item">
                    <Avatar owner={{ name: r.name, avatarUrl: r.avatarUrl ?? undefined }} size={38} />
                    <div className="grow" style={{ minWidth: 0 }}>
                      <div className="friend-name" style={{ fontWeight: 800 }}>{r.name}</div>
                      <div className="tiny muted">Asked you to hang an ornament</div>
                    </div>
                    <Link href={`/t/${r.nickname}/hang`} className="btn sm">Hang</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="section" aria-labelledby="following" aria-busy={loading}>
            <div className="panel-head section-head">
              <h2 id="following" className="h2">Following</h2>
              {!loading && <span className="num muted loaded">{following.length}</span>}
            </div>
            {loading ? (
              <ul className="list"><RowSkeleton /><RowSkeleton /><RowSkeleton /></ul>
            ) : following.length > 0 ? (
              <ul className="list">{(giving ? giveOrder(following) : following).map(row)}</ul>
            ) : (
              <p className="small soft loaded">You don&apos;t follow any trees yet. Search above to find a friend.</p>
            )}
          </section>

          {!loading && swapped.length > 0 && (
            <section className="section loaded" aria-labelledby="swapped">
              <div className="section-head">
                <h2 id="swapped" className="h2">You swapped ornaments</h2>
              </div>
              <p className="small soft lead">Follow them to find their trees here.</p>
              <ul className="list">{(giving ? giveOrder(swapped) : swapped).map(row)}</ul>
            </section>
          )}
        </>
      )}

      <section className="panel quiet section">
        <div className="row">
          <Sprite id="bauble-snow" px={2} style={{ flexShrink: 0 }} />
          <div className="grow">
            <p style={{ fontWeight: 800 }}>Invite a friend</p>
            <p className="tiny muted">Send your link. They can see your tree and join to run with you.</p>
          </div>
        </div>
        <button className="btn ghost block mt12" onClick={share}>Share my tree</button>
      </section>

      {toast && <div className="toast" role="status">{toast}</div>}
      <BottomNav />
    </main>
  );
}

/** One runner: avatar and name open their tree; the button follows, or gives when giving. */
function FriendRow({ f, giving, canGive, asked, onAsk, onFollow }: {
  f: Friend;
  giving: string | null;
  canGive: boolean;
  asked: boolean;
  onAsk?: () => void;
  onFollow: () => void;
}) {
  const note = friendNote(f, { showGiven: !giving });
  return (
    <li className="panel quiet row item loaded">
      <Link href={`/t/${f.nickname}`} className="friend-link" aria-label={`${f.name}'s tree`}>
        <Avatar owner={{ name: f.name, avatarUrl: f.avatarUrl ?? undefined }} size={38} />
      </Link>
      <div className="grow" style={{ minWidth: 0 }}>
        <div className="friend-title">
          <Link href={`/t/${f.nickname}`} className="friend-name">{f.name}</Link>
          {f.official && <span className="badge official">Official</span>}
        </div>
        <div className="tiny muted">{note || `/t/${f.nickname}`}</div>
        {!giving && onAsk && f.following && f.hung === 0 && (asked ? (
          <span className="ask-done">Asked ✓</span>
        ) : (
          <button type="button" className="ask-link" onClick={onAsk}>Ask to hang one</button>
        ))}
      </div>
      {giving ? (
        canGive ? <Link href={`/t/${f.nickname}/hang?o=${giving}`} className="btn sm">Give</Link> : <span className="tag">Has yours</span>
      ) : (
        <FollowButton following={f.following} onClick={onFollow} />
      )}
    </li>
  );
}

function RowSkeleton() {
  return (
    <li className="panel quiet row item">
      <Sk w={38} h={38} />
      <div className="grow"><Sk w="45%" h={14} /><Sk w="70%" h={12} className="mt8" /></div>
      <Sk w={78} h={44} />
    </li>
  );
}

export default function Friends() {
  return (
    <Suspense>
      <FriendsInner />
    </Suspense>
  );
}
