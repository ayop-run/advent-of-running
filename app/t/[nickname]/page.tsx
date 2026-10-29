'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import OrnamentSheet from '@/components/OrnamentSheet';
import PageHeader from '@/components/PageHeader';
import PixelTree from '@/components/PixelTree';
import Sk from '@/components/Skeleton';
import Sprite from '@/components/Sprite';
import { getTree, type Hung, type Tree } from '@/lib/data';
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
    getTree(nickname).then((t) => {
      setTree(t);
      setMine(t.ornaments.find((h) => h.mine) ?? null);
      if (t.exists) rememberVisit(nickname);
    }, console.error);
    isMember().then(setMember);
  }, [nickname]);

  return (
    <main className={`screen${member ? '' : ' no-nav'}`}>
      {/* members get a back arrow; guests from a shared link land here first, so no way back */}
      <PageHeader
        back={member ? '/friends' : undefined}
        title={
          tree ? (
            <h1 className="title loaded">{tree.exists ? `${tree.displayName}'s tree` : 'Tree not found'}</h1>
          ) : (
            <Sk w={150} h={22} />
          )
        }
      />

      {!tree && (
        <div aria-busy="true">
          <div style={{ display: 'grid', justifyItems: 'center', gap: 8 }}>
            <Sk w={220} h={14} />
            <Sk w={260} h={14} />
          </div>
          <div className="tree-stage tree-waiting">
            <PixelTree ornaments={[]} label="" decorative />
          </div>
        </div>
      )}

      {tree && !tree.exists && (
        <div className="center mt16 loaded">
          <h2 className="h2">No tree called “{nickname}”</h2>
          <p className="soft mt8">Check the spelling of the link, or ask your friend to send it again.</p>
        </div>
      )}

      {tree?.exists && (
        <>
          <p className="small soft center loaded">
            <strong style={{ color: 'var(--snow)' }}>
              {tree.ornaments.length === 0
                ? `Be the first to hang one for ${tree.displayName}.`
                : tree.ornaments.length === 1
                  ? '1 friend has hung an ornament.'
                  : `${tree.ornaments.length} friends have hung an ornament.`}
            </strong>
            <br />
            Every message stays hidden until Christmas morning.
          </p>
          <div className="tree-stage">
            <PixelTree
              ornaments={tree.ornaments}
              owner={{ name: tree.displayName, avatarUrl: tree.avatarUrl ?? undefined }}
              onSelect={setOpen}
              label={`${tree.displayName}'s tree with ${tree.ornaments.length} sealed ornaments. Tap one to take a look.`}
            />
          </div>
        </>
      )}
      <div className={`sticky-cta mt24${member ? ' above-nav' : ''}`}>
        {!tree?.exists ? null : mine ? (
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
