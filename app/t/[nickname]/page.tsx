'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import BackLink from '@/components/BackLink';
import BottomNav from '@/components/BottomNav';
import OrnamentSheet from '@/components/OrnamentSheet';
import { MusicButton } from '@/components/MusicToggle';
import PixelTree from '@/components/PixelTree';
import Sprite from '@/components/Sprite';
import { getTree, myOrnamentOn, type Hung, type Tree } from '@/lib/data';
import { BY_ID } from '@/lib/ornaments';
import { rememberVisit } from '@/lib/friends';
import { isMember } from '@/lib/me';

export default function FriendTree() {
  const { nickname } = useParams<{ nickname: string }>();
  const [tree, setTree] = useState<Tree | null>(null);
  // members browsing friends get the app's nav; guests from a shared link get a simple page
  const [member, setMember] = useState(false);
  const [mine, setMine] = useState<Hung | null>(null);
  const [open, setOpen] = useState<Hung | null>(null);
  const saved = useSearchParams().get('saved') === '1';
  const [toast, setToast] = useState('');
  useEffect(() => {
    if (!saved) return;
    setToast('Saved. Your message is updated.');
    const id = setTimeout(() => setToast(''), 2400);
    return () => clearTimeout(id);
  }, [saved]);
  useEffect(() => {
    setTree(getTree(nickname));
    setMine(myOrnamentOn(nickname));
    setMember(isMember());
    rememberVisit(nickname);
  }, [nickname]);

  return (
    <main className={`screen${member ? '' : ' no-nav'}`}>
      <div className="topbar">
        {member ? <BackLink fallback="/friends" /> : <Link href="/" className="brand">Advent of Running</Link>}
        <MusicButton />
      </div>

      {tree && (
        <>
          <h1 className="title center mt8">
            {tree.ornaments.length === 0 ? `Be the first on ${tree.displayName}'s tree` : `${tree.ornaments.length} sealed ornaments so far`}
          </h1>
          <p className="small muted center mt4">Every message stays hidden until Christmas morning.</p>
          <div className="tree-stage">
            <PixelTree
              ornaments={tree.ornaments}
              owner={{ name: tree.displayName }}
              onSelect={setOpen}
              label={`${tree.displayName}'s tree with ${tree.ornaments.length} sealed ornaments. Tap one to take a look.`}
            />
          </div>
        </>
      )}
      <div className={`sticky-cta mt24${member ? ' above-nav' : ''}`}>
        {mine ? (
          <div className="panel gold row">
            <Sprite id={mine.ornamentId} px={2} style={{ flexShrink: 0 }} />
            <div className="grow">
              <p style={{ fontWeight: 800 }}>You hung the {BY_ID[mine.ornamentId]?.name.replace('Advent Runner: ', '')}</p>
              <p className="tiny muted">One per tree. Sealed until Christmas.</p>
            </div>
            <Link href={`/t/${nickname}/hang?edit=1`} className="textlink" style={{ fontSize: 14 }}>Edit</Link>
          </div>
        ) : (
          <>
            <Link href={`/t/${nickname}/hang`} className="btn block">Hang an ornament</Link>
            <p className="center tiny muted mt8">You can hang one. Only {tree?.displayName ?? 'they'} can read it, on December 25.</p>
          </>
        )}
        {!member && (
          <p className="center tiny mt4"><Link href="/signup" className="textlink" style={{ fontSize: 13, minHeight: 32 }}>Get a tree of your own</Link></p>
        )}
      </div>

      {open && tree && <OrnamentSheet hung={open} ownerName={tree.displayName} isOwner={false} onClose={() => setOpen(null)} />}

      {toast && <div className="toast" role="status">{toast}</div>}
      {member && <BottomNav />}
    </main>
  );
}
