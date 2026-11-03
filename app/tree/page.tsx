'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { CountdownTiles } from '@/components/Countdown';
import OrnamentSheet from '@/components/OrnamentSheet';
import PictureSheet from '@/components/PictureSheet';
import PixelTree, { Avatar } from '@/components/PixelTree';
import { CameraIcon, ChevronIcon, ShareIcon } from '@/components/Icons';
import LettersBadge from '@/components/LettersBadge';
import PageHeader from '@/components/PageHeader';
import Tip from '@/components/Tip';
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
        <Tip label="Photo booth">
          <Link href="/tree/photo" className="icon-btn" aria-label="Photo booth">
            <CameraIcon />
          </Link>
        </Tip>
        <Tip label="Share my tree">
          <button type="button" className="icon-btn" onClick={() => setPicture(true)} aria-label="Share my tree" disabled={!tree}>
            <ShareIcon />
          </button>
        </Tip>
      </PageHeader>

      <div className="countdown-strip">
        <span className="eyebrow">Messages open in</span>
        <CountdownTiles />
      </div>

      {/* the count of sealed letters on your tree, same badge as on a friend's tree */}
      <div className="mt16">
        {tree ? <LettersBadge count={tree.ornaments.length} empty="No letters yet. Ask a friend!" /> : <div className="center"><Sk w={64} h={36} style={{ display: 'inline-block' }} /></div>}
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
              {tree.ornaments.length === 0 && (
                <>
                  <br />
                  Each one hides a note from a friend.
                </>
              )}
            </p>
            <p className="center mt4"><Link href="/friends" className="textlink" style={{ fontSize: 14 }}>Ask friends to hang one <ChevronIcon /></Link></p>
          </div>
        ) : (
          <div className="mt12" style={{ display: 'grid', justifyItems: 'center', gap: 8 }}>
            <Sk w={230} h={14} />
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

      <BottomNav />
    </main>
  );
}
