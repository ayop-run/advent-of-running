'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import OrnamentSheet from '@/components/OrnamentSheet';
import FollowButton from '@/components/FollowButton';
import { LetterIcon } from '@/components/Icons';
import PageHeader from '@/components/PageHeader';
import TreeTitle from '@/components/TreeTitle';
import PixelTree from '@/components/PixelTree';
import Sk from '@/components/Skeleton';
import Sprite from '@/components/Sprite';
import { useTreeScale } from '@/components/useTreeScale';
import { getTree, type Hung, type Tree } from '@/lib/data';
import { BY_ID } from '@/lib/ornaments';
import { isFollowing, rememberVisit, setFollowing } from '@/lib/friends';
import { getMe, isMember, myNickname } from '@/lib/me';

export default function FriendTree() {
  const { nickname } = useParams<{ nickname: string }>();
  const scale = useTreeScale();
  const [tree, setTree] = useState<Tree | null>(null);
  // members browsing friends get the app's nav; guests from a shared link get a simple page
  const [member, setMember] = useState(false);
  const [mine, setMine] = useState<Hung | null>(null);
  const [open, setOpen] = useState<Hung | null>(null);
  // null until we know; never shown on your own tree or to guests
  const [following, setFollowingState] = useState<boolean | null>(null);
  const [letterTip, setLetterTip] = useState(false);
  useEffect(() => {
    if (!letterTip) return;
    const id = setTimeout(() => setLetterTip(false), 3200);
    return () => clearTimeout(id);
  }, [letterTip]);
  const saved = useSearchParams().get('saved') === '1';
  const [toast, setToast] = useState('');
  useEffect(() => {
    if (saved) setToast('Saved. Your message is updated.');
  }, [saved]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 2400);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    getTree(nickname).then((t) => {
      setTree(t);
      setMine(t.ornaments.find((h) => h.mine) ?? null);
      if (t.exists) rememberVisit(nickname);
    }, console.error);
    isMember().then(setMember);
    getMe().then(async (me) => {
      if (myNickname(me) === nickname.toLowerCase()) return;
      setFollowingState(await isFollowing(nickname));
    });
  }, [nickname]);

  const toggleFollow = async () => {
    if (following === null || !tree) return;
    const next = !following;
    setFollowingState(next);
    if (await setFollowing(nickname, next)) setToast(next ? `Following ${tree.displayName}’s tree` : `Unfollowed ${tree.displayName}`);
    else {
      setFollowingState(!next);
      setToast('Couldn’t update. Please try again.');
    }
  };

  return (
    <main className={`screen${member ? '' : ' no-nav'}`}>
      {/* members get a back arrow; guests from a shared link land here first, so no way back */}
      <PageHeader
        back={member ? '/friends' : undefined}
        title={
          tree ? (
            // the follow chip sits right after the name; not on your own tree, and not for guests
            <div className="title-row loaded">
              <TreeTitle name={tree.exists ? tree.displayName : 'Tree not found'} />
              {member && tree.exists && following !== null && <FollowButton following={following} onClick={toggleFollow} />}
            </div>
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
            <PixelTree ornaments={[]} label="" decorative scale={scale} />
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
          {/* how many sealed letters hang here; tap for a little bubble saying when they open */}
          <div className="center loaded">
            <div className="letters-wrap">
              <button
                type="button"
                className="letters"
                aria-expanded={letterTip}
                aria-label={`${tree.ornaments.length} sealed ${tree.ornaments.length === 1 ? 'letter' : 'letters'}`}
                onClick={() => setLetterTip((v) => !v)}
              >
                <LetterIcon />
                <b>{tree.ornaments.length}</b>
              </button>
              {letterTip && (
                <p className="bubble" role="status">
                  {tree.ornaments.length === 0 ? 'No letters yet. Be the first!' : 'Sealed until Christmas'}
                </p>
              )}
            </div>
          </div>
          <div className="tree-stage">
            <PixelTree
              ornaments={tree.ornaments}
              owner={{ name: tree.displayName, avatarUrl: tree.avatarUrl ?? undefined }}
              onSelect={setOpen}
              scale={scale}
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
