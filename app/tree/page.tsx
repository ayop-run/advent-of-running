'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import Countdown, { CountdownTiles } from '@/components/Countdown';
import PixelTree from '@/components/PixelTree';
import { ChevronIcon, LockIcon, Meter } from '@/components/Icons';
import { MusicButton } from '@/components/MusicToggle';
import { DEMO_POUCH, getTree, type Hung, type Tree } from '@/lib/data';
import { BY_ID } from '@/lib/ornaments';

import { DEMO_TODAY, DEMO_TODAY_GOAL_KM, DEMO_TODAY_KM } from '@/lib/calendar';
import Sprite from '@/components/Sprite';
import SpriteFx from '@/components/SpriteFx';
import { animFor, animName } from '@/components/useBump';

export default function MyTree() {
  const [tree, setTree] = useState<Tree | null>(null);
  const [open, setOpen] = useState<Hung | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => setTree(getTree('demo')), []);
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
        <div>
          <p className="brand-mark">Advent of Running</p>
          <h1 className="title">My tree</h1>
        </div>
        <div className="topbar-end">
          <CountdownTiles />
          <MusicButton />
        </div>
      </div>

      {tree && (
        <>
          <PixelTree ornaments={tree.ornaments} owner={{ name: 'demo', isYou: true }} onSelect={setOpen} label={`Your tree with ${tree.ornaments.length} sealed ornaments`} />
          <p className="center small soft mt12">
            <strong style={{ color: 'var(--snow)' }}>{tree.ornaments.length} sealed ornaments</strong> from friends. Tap one to see who sent it.
          </p>
        </>
      )}

      <button className="btn block mt24" onClick={share}>Share my tree</button>

      <section className="panel gold mt16" aria-labelledby="door-title">
        <div className="panel-head">
          <p className="eyebrow" style={{ color: 'var(--gold)' }}>Today&apos;s door</p>
          <span className="num" style={{ color: 'var(--gold)' }}>{DEMO_TODAY_KM.toFixed(1)} / {DEMO_TODAY_GOAL_KM.toFixed(1)} km</span>
        </div>
        <div className="row mt8">
          <Sprite id="gift-box" px={4} style={{ flexShrink: 0 }} />
          <div className="grow">
            <h2 id="door-title" className="h2">Door {DEMO_TODAY}</h2>
            <p className="small soft mt4">Run {left.toFixed(1)} km more to unwrap today&apos;s surprise ornament.</p>
          </div>
        </div>
        <div className="mt12"><Meter value={DEMO_TODAY_KM} max={DEMO_TODAY_GOAL_KM} /></div>
        <div className="panel-head mt8">
          <span className="tiny muted">Only you see this</span>
          <Link href="/gift" className="textlink" style={{ fontSize: 14 }}>Try a demo unwrap <ChevronIcon /></Link>
        </div>
      </section>

      <Link href="/gift" className="panel quiet row mt12" style={{ color: 'var(--snow)', padding: '12px 16px' }}>
        <div className="row" style={{ gap: 4, flexShrink: 0 }}>
          {DEMO_POUCH.map((id) => <Sprite key={id} id={id} px={2} />)}
        </div>
        <span className="grow small" style={{ fontWeight: 700 }}>{DEMO_POUCH.length} ready to give</span>
        <span className="textlink" style={{ fontSize: 14 }}>Give <ChevronIcon /></span>
      </Link>

      {open && o && (
        <div className="scrim" onClick={() => setOpen(null)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-label={`Sealed ornament from ${open.from}`} onClick={(e) => e.stopPropagation()}>
            <div className="grab" />
            <div className="center">
              <span className="bump" style={{ width: 'fit-content', margin: '0 auto' }}>
                <span className={animFor(o.id)} style={{ display: 'block' }}><Sprite id={o.id} px={4} /></span>
                <SpriteFx anim={animName(o.id)} px={4} />
              </span>
              <h2 className="title mt12">From {open.from}</h2>
              <p className="small soft mt4">{o.name}</p>
              <p className="mt8"><span className="tag">Hint: {open.hint}</span></p>
            </div>
            <div className="panel hint row mt16">
              <LockIcon />
              <div>
                <strong>The message is sealed</strong>
                <div className="tiny soft"><Countdown prefix="It opens in" /></div>
              </div>
            </div>
            <Link href={`/t/${open.from.toLowerCase()}/hang`} className="btn block mt16">Hang one back</Link>
            <button className="btn ghost block mt8" onClick={() => setOpen(null)}>Close</button>
          </div>
        </div>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
      <BottomNav />
    </main>
  );
}
