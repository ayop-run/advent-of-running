'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Avatar } from '@/components/PixelTree';
import { getFriends, getProgress, type Friend } from '@/lib/data';
import { BY_ID } from '@/lib/ornaments';
import { DOORS, monthName, type Progress } from '@/lib/calendar';

export default function GiftOpened() {
  const [p, setP] = useState<Progress | null>(null);
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [pick, setPick] = useState(0);
  useEffect(() => {
    getProgress().then((res) => 'progress' in res && setP(res.progress));
    getFriends().then(setFriends);
  }, []);

  if (!p) return <main className="screen no-nav"><p className="soft center mt24">Unwrapping…</p></main>;

  const o = p.pouch.length ? BY_ID[p.pouch[Math.min(pick, p.pouch.length - 1)]] : null;
  const opened = p.doors.filter((s) => s === 'opened').length;

  return (
    <main className="screen no-nav">
      <div className="topbar">
        <span className="small muted">
          {monthName(p.month)} {Math.min(Math.max(p.today, 1), DOORS)}{p.today >= 1 && p.today <= DOORS ? `, ${p.todayKm.toFixed(1)} km synced` : ''}
        </span>
        <Link href="/tree" className="textlink">Close</Link>
      </div>

      {o ? (
        <>
          <div className="center mt8" style={{ position: 'relative' }}>
            <img className="px" src="/ornaments/gift-box.png" alt="" width={72} height={72} style={{ opacity: .35, position: 'absolute', left: '50%', top: 130, transform: 'translateX(-50%)' }} />
            <img className="px" src={o.img} alt={o.name} width={176} height={176} style={{ position: 'relative', filter: 'drop-shadow(0 0 22px rgba(232,84,106,.6))' }} />
          </div>
          <p className={`center tier tier-${o.tier} mt16`}>{opened} of {DOORS} doors open, {o.tier} ornament</p>
          <h1 className="h1 center mt8">You unwrapped the {o.name}</h1>
          <p className="center soft mt8">Hang it on a friend&apos;s tree. It glows brighter than the free ones.</p>
          {p.pouch.length > 1 && (
            <div className="picker mt16">
              {p.pouch.map((id, k) => (
                <button key={`${id}-${k}`} type="button" className="pick" aria-pressed={k === pick} onClick={() => setPick(k)}>
                  <img className="px" src={BY_ID[id].img} alt="" />
                  <span className={`tier-${BY_ID[id].tier}`}>{BY_ID[id].name.replace('Advent Runner: ', '')}</span>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <img className="px" src="/ornaments/gift-box.png" alt="" width={120} height={120} style={{ alignSelf: 'center', marginTop: 24 }} />
          <h1 className="h1 center mt16">Nothing to unwrap yet</h1>
          <p className="center soft mt8">Run 1 km to open today&apos;s door and unwrap a special ornament.</p>
        </>
      )}

      {o && (
        <>
          <h2 className="h2 mt32">Give it to</h2>
          <div className="stack mt12" style={{ gap: 8 }}>
            {friends?.length === 0 && (
              <p className="small soft">
                No friends here yet. Runners show up once you hang an ornament on their tree or they hang one on yours. Share your tree from{' '}
                <Link href="/tree" className="textlink">My tree</Link>.
              </p>
            )}
            {friends?.map((f) => (
              <div key={f.nickname} className="panel quiet row" style={{ padding: 12 }}>
                <Avatar owner={{ name: f.displayName, avatarUrl: f.avatarUrl ?? undefined }} size={38} />
                <div className="grow">
                  <div style={{ fontWeight: 800 }}>{f.displayName}</div>
                  <div className="tiny muted">{f.note}</div>
                </div>
                <Link href={`/t/${f.nickname}/hang?o=${o.id}`} className="btn sm">Hang</Link>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="grow" />
      <Link href="/tree" className="btn ghost block mt24">{o ? 'Keep it for later' : 'Back to my tree'}</Link>
      {o && <p className="center tiny muted mt8">You&apos;re holding {p.pouch.length}. Any left on December 25 go on your own tree.</p>}
    </main>
  );
}
