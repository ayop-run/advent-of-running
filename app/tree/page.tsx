'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import Countdown, { CountdownTiles } from '@/components/Countdown';
import PixelTree from '@/components/PixelTree';
import { LockIcon, Meter } from '@/components/Icons';
import { MusicButton } from '@/components/MusicToggle';
import { DEMO_POUCH, getTree, type Hung, type Tree } from '@/lib/data';
import { BY_ID } from '@/lib/ornaments';

const TIER_NOTE = {
  basic: 'Free ornament',
  special: 'Special ornament: they ran a daily door to unwrap it',
  rare: 'Rare ornament: they finished a weekly challenge to win it',
} as const;
import { DEMO_TODAY, DEMO_TODAY_GOAL_KM, DEMO_TODAY_KM } from '@/lib/calendar';

export default function MyTree() {
  const [tree, setTree] = useState<Tree | null>(null);
  const [open, setOpen] = useState<Hung | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    getTree('demo').then(setTree, console.error);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const share = async () => {
    const url = `${window.location.origin}/t/demo`;
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

  const left = Math.max(0, DEMO_TODAY_GOAL_KM - DEMO_TODAY_KM);
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
          <PixelTree ornaments={tree.ornaments} owner={{ name: 'demo', isYou: true }} onSelect={setOpen} label={`Your tree with ${tree.ornaments.length} sealed ornaments`} />
          <p className="center mt16" style={{ fontWeight: 700 }}>
            {tree.ornaments.length} ornaments from friends. Sparkling ones were earned by running. Tap one to see who sent it.
          </p>
        </>
      )}

      <button className="btn block mt24" onClick={share}>Share my tree</button>

      <section className="panel gold mt16" aria-labelledby="door-title">
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <img className="px" src="/ornaments/gift-box.png" alt="" width={56} height={56} />
          <div className="grow">
            <div className="row between">
              <h2 id="door-title" className="h2">Door {DEMO_TODAY}</h2>
              <span className="num" style={{ color: 'var(--gold)', fontSize: 18 }}>
                {DEMO_TODAY_KM.toFixed(1)} / {DEMO_TODAY_GOAL_KM.toFixed(1)} km
              </span>
            </div>
            <p className="small soft mt4">Run {left.toFixed(1)} km more to unwrap today&apos;s special ornament.</p>
          </div>
        </div>
        <div className="mt12"><Meter value={DEMO_TODAY_KM} max={DEMO_TODAY_GOAL_KM} /></div>
        <div className="row between mt12">
          <span className="tiny muted">Only you can see this. Synced from Strava 5 min ago.</span>
          <Link href="/gift" className="textlink" style={{ fontSize: 14 }}>Try the unwrap</Link>
        </div>
      </section>

      <Link href="/gift" className="panel quiet row mt12" style={{ color: 'var(--snow)' }}>
        <div className="row" style={{ gap: 4 }}>
          {DEMO_POUCH.map((id) => <img key={id} className="px" src={BY_ID[id].img} alt="" width={36} height={36} />)}
        </div>
        <span className="grow small" style={{ fontWeight: 700 }}>{DEMO_POUCH.length} ornaments ready to give</span>
        <span className="textlink" style={{ fontSize: 14 }}>Give one</span>
      </Link>

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
