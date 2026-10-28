'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { CountdownTiles } from '@/components/Countdown';
import OrnamentSheet from '@/components/OrnamentSheet';
import PictureSheet from '@/components/PictureSheet';
import PixelTree, { Avatar } from '@/components/PixelTree';
import { CameraIcon, ChevronIcon, ShareIcon } from '@/components/Icons';
import { MusicButton } from '@/components/MusicToggle';
import { avatarSrc } from '@/lib/avatar';
import { getTree, type Hung, type Tree } from '@/lib/data';
import { myNickname, useMe } from '@/lib/me';


export default function MyTree() {
  const [tree, setTree] = useState<Tree | null>(null);
  const [open, setOpen] = useState<Hung | null>(null);
  const [toast, setToast] = useState('');
  const [picture, setPicture] = useState(false);

  // signed out, the demo tree stands in for your own
  const account = useMe();
  const me = myNickname(account);
  const displayName = account?.displayName ?? me.charAt(0).toUpperCase() + me.slice(1);
  const owner = { name: displayName, avatarUrl: account?.avatarUrl ?? undefined };
  useEffect(() => {
    if (account === undefined) return;
    getTree(myNickname(account)).then(setTree, console.error);
  }, [account]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(id);
  }, [toast]);

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
        <div>
          <p className="brand-mark">Advent of Running</p>
          <div className="row" style={{ gap: 6, minWidth: 0 }}>
            <Avatar owner={owner} size={24} />
            <h1 className="title clip">{displayName}&apos;s tree</h1>
          </div>
        </div>
        <div className="topbar-end">
          <button type="button" className="icon-btn" onClick={() => setPicture(true)} aria-label="Picture of my tree" title="Picture of my tree" disabled={!tree}>
            <CameraIcon />
          </button>
          <button type="button" className="icon-btn" onClick={share} aria-label="Share my tree" title="Share my tree">
            <ShareIcon />
          </button>
          <MusicButton />
        </div>
      </div>

      <div className="countdown-strip">
        <span className="eyebrow">Messages open in</span>
        <CountdownTiles />
      </div>

      {tree && (
        <div className="tree-stage">
          <PixelTree ornaments={tree.ornaments} owner={owner} onSelect={setOpen} label={`Your tree with ${tree.ornaments.length} sealed ornaments`} />
          <p className="center small soft mt12">
            <strong style={{ color: 'var(--snow)' }}>{tree.ornaments.length} sealed ornaments</strong> from friends. Names and messages unlock on Christmas.
          </p>
          <p className="center mt4"><Link href="/friends" className="textlink" style={{ fontSize: 14 }}>Ask friends to hang one <ChevronIcon /></Link></p>
        </div>
      )}

      {open && (
        <OrnamentSheet
          hung={open}
          ownerName={displayName}
          isOwner
          onClose={() => setOpen(null)}
        />
      )}

      {picture && tree && (
        <PictureSheet ornaments={tree.ornaments} ownerName={displayName} avatar={avatarSrc(me, account?.avatarUrl)} link={`${window.location.origin}/t/${me}`} onClose={() => setPicture(false)} />
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
      <BottomNav />
    </main>
  );
}
