'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import Countdown, { CountdownTiles } from '@/components/Countdown';
import PixelTree from '@/components/PixelTree';
import { LockIcon, Meter } from '@/components/Icons';
import { MusicButton } from '@/components/MusicToggle';
import { getMe, getProgress, getTree, type Hung, type Tree } from '@/lib/data';
import { BY_ID } from '@/lib/ornaments';

const TIER_NOTE = {
  basic: 'Free ornament',
  special: 'Special ornament: they ran a daily door to unwrap it',
  rare: 'Rare ornament: they finished a weekly challenge to win it',
} as const;
import { DAILY_GOAL_KM, DOORS, type Progress } from '@/lib/calendar';

export default function MyTree() {
  const [tree, setTree] = useState<Tree | null>(null);
  const [open, setOpen] = useState<Hung | null>(null);
  const [toast, setToast] = useState('');

  const [signedIn, setSignedIn] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);

  // Signed out: the demo tree, so the prototype stays clickable without a Strava account.
  useEffect(() => {
    getMe()
      .then((me) => {
        setSignedIn(!!me);
        return getTree(me?.nickname ?? 'demo');
      })
      .then(setTree, console.error);
    getProgress().then((res) => 'progress' in res && setProgress(res.progress));
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const share = async () => {
    const url = `${window.location.origin}/t/${tree?.nickname ?? 'demo'}`;
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

  const left = progress ? Math.max(0, DAILY_GOAL_KM - progress.todayKm) : 0;
  const pouch = progress?.pouch ?? [];
  const doorOpen = progress && progress.today >= 1 && progress.today <= DOORS;
  const syncedMin = progress?.syncedAt ? Math.round((Date.now() - new Date(progress.syncedAt).getTime()) / 60000) : null;
  const o = open ? BY_ID[open.ornamentId] : null;

  return (
    <main className="screen">
      <div className="topbar">
        <h1 className="title">My tree</h1>
        <div className="topbar-end">
          <CountdownTiles />
          <MusicButton />
        </div>
      </div>

      {tree && (
        <>
          <PixelTree ornaments={tree.ornaments} owner={{ name: tree.displayName, isYou: true }} onSelect={setOpen} label={`Your tree with ${tree.ornaments.length} sealed ornaments`} />
          <p className="center mt16" style={{ fontWeight: 700 }}>
            {tree.ornaments.length === 0
              ? 'No ornaments yet. Share your tree so friends can hang one.'
              : `${tree.ornaments.length} ornaments from friends. Sparkling ones were earned by running. Tap one to see who sent it.`}
          </p>
          {!signedIn && (
            <p className="center tiny muted mt8">
              This is a demo tree. <a href="/api/strava/connect" className="textlink">Log in with Strava</a> to get yours.
            </p>
          )}
        </>
      )}

      <button className="btn block mt24" onClick={share}>Share my tree</button>

      {doorOpen && (
        <section className="panel gold mt16" aria-labelledby="door-title">
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <img className="px" src="/ornaments/gift-box.png" alt="" width={56} height={56} />
            <div className="grow">
              <div className="row between">
                <h2 id="door-title" className="h2">Door {progress.today}</h2>
                <span className="num" style={{ color: 'var(--gold)', fontSize: 18 }}>
                  {progress.todayKm.toFixed(1)} / {DAILY_GOAL_KM.toFixed(1)} km
                </span>
              </div>
              <p className="small soft mt4">
                {left > 0 ? `Run ${left.toFixed(1)} km more to unwrap today's special ornament.` : "Today's door is open. Well run!"}
              </p>
            </div>
          </div>
          <div className="mt12"><Meter value={Math.min(progress.todayKm, DAILY_GOAL_KM)} max={DAILY_GOAL_KM} /></div>
          <div className="row between mt12">
            <span className="tiny muted">
              Only you can see this.{' '}
              {syncedMin === null ? 'Demo data.' : syncedMin < 1 ? 'Synced from Strava just now.' : `Synced from Strava ${syncedMin} min ago.`}
            </span>
            <Link href="/calendar" className="textlink" style={{ fontSize: 14 }}>Calendar</Link>
          </div>
        </section>
      )}

      {pouch.length > 0 && (
        <Link href="/gift" className="panel quiet row mt12" style={{ color: 'var(--snow)' }}>
          <div className="row" style={{ gap: 4 }}>
            {pouch.slice(0, 3).map((id, k) => <img key={`${id}-${k}`} className="px" src={BY_ID[id].img} alt="" width={36} height={36} />)}
          </div>
          <span className="grow small" style={{ fontWeight: 700 }}>{pouch.length} {pouch.length === 1 ? 'ornament' : 'ornaments'} ready to give</span>
          <span className="textlink" style={{ fontSize: 14 }}>Give one</span>
        </Link>
      )}

      {open && o && (
        <div className="scrim" onClick={() => setOpen(null)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-label={`Sealed ornament from ${open.from}`} onClick={(e) => e.stopPropagation()}>
            <div className="grab" />
            <div className="center">
              <img className="px" src={o.img} alt="" width={112} height={112} />
              <p className={`tier tier-${o.tier} mt8`}>{TIER_NOTE[o.tier]}</p>
              <h2 className="title mt4">From {open.from}</h2>
              <p className="small soft mt4">{o.name}. Their hint: {open.hint.toLowerCase()}.</p>
            </div>
            <div className="panel hint row mt16">
              <LockIcon />
              <div>
                <strong>The message is sealed</strong>
                <div className="tiny soft"><Countdown prefix="It opens in" /></div>
              </div>
            </div>
            <Link href={`/t/${open.from.toLowerCase()}/hang`} className="btn block mt16">Hang one on {open.from}&apos;s tree</Link>
            <button className="btn ghost block mt8" onClick={() => setOpen(null)}>Close</button>
          </div>
        </div>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
      <BottomNav />
    </main>
  );
}
