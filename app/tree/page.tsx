'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { CountdownTiles } from '@/components/Countdown';
import OrnamentSheet from '@/components/OrnamentSheet';
import PictureSheet from '@/components/PictureSheet';
import PixelTree, { Avatar } from '@/components/PixelTree';
import { CameraIcon, ChevronIcon, ShareIcon } from '@/components/Icons';
import PageHeader from '@/components/PageHeader';
import TreeTitle from '@/components/TreeTitle';
import Sk from '@/components/Skeleton';
import { useTreeScale } from '@/components/useTreeScale';
import { avatarSrc } from '@/lib/avatar';
import { getTree, type Hung, type Tree } from '@/lib/data';
import { myNickname, useMe } from '@/lib/me';


export default function MyTree() {
  const scale = useTreeScale();
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
      <PageHeader
        title={
          // until we know who you are, a placeholder: never a flash of someone else's name
          account === undefined ? (
            <div className="row" style={{ gap: 6, height: 28 }} aria-busy="true">
              <Sk w={24} h={24} />
              <Sk w={150} h={20} />
            </div>
          ) : (
            <div className="row loaded" style={{ gap: 6, minWidth: 0 }}>
              <Avatar owner={owner} size={24} />
              <TreeTitle name={displayName} />
            </div>
          )
        }
      >
        <button type="button" className="icon-btn" onClick={() => setPicture(true)} aria-label="Picture of my tree" title="Picture of my tree" disabled={!tree}>
          <CameraIcon />
        </button>
        <button type="button" className="icon-btn" onClick={share} aria-label="Share my tree" title="Share my tree">
          <ShareIcon />
        </button>
      </PageHeader>

      <div className="countdown-strip">
        <span className="eyebrow">Messages open in</span>
        <CountdownTiles />
      </div>

      {/* the tree stands in place, dimmed, while its ornaments load */}
      <div className="tree-stage" aria-busy={!tree}>
        <div className={tree ? undefined : 'tree-waiting'} style={account === undefined ? { paddingBottom: 30 } : undefined}>
          <PixelTree
            ornaments={tree?.ornaments ?? []}
            owner={account === undefined ? undefined : owner}
            onSelect={setOpen}
            label={`Your tree with ${tree?.ornaments.length ?? 0} sealed ornaments`}
            decorative={!tree}
            scale={scale}
          />
        </div>
        {tree ? (
          <div className="loaded">
            {/* everyone hangs one ornament per tree, so ornaments are friends */}
            <p className="center small soft mt12">
              <strong style={{ color: 'var(--snow)' }}>
                {tree.ornaments.length === 0
                  ? 'Your tree is waiting for its first ornament.'
                  : tree.ornaments.length === 1
                    ? 'A friend hung a little wish on your tree.'
                    : `${tree.ornaments.length} friends are thinking of you.`}
              </strong>
              <br />
              {tree.ornaments.length === 0 ? 'Each one hides a note from a friend.' : 'Their names and notes stay wrapped.'}
              <br />
              Opens on Christmas morning.
            </p>
            <p className="center mt4"><Link href="/friends" className="textlink" style={{ fontSize: 14 }}>Ask friends to hang one <ChevronIcon /></Link></p>
          </div>
        ) : (
          <div className="mt12" style={{ display: 'grid', justifyItems: 'center', gap: 8 }}>
            <Sk w={230} h={14} />
            <Sk w={210} h={12} />
            <Sk w={170} h={12} />
            <Sk w={150} h={14} className="mt4" />
          </div>
        )}
      </div>

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
