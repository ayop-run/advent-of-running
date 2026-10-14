'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MusicButton } from '@/components/MusicToggle';
import PixelTree from '@/components/PixelTree';
import { getTree, type Tree } from '@/lib/data';

export default function FriendTree() {
  const { nickname } = useParams<{ nickname: string }>();
  const [tree, setTree] = useState<Tree | null>(null);
  useEffect(() => setTree(getTree(nickname)), [nickname]);

  return (
    <main className="screen no-nav">
      <div className="topbar">
        <Link href="/" className="brand">Advent of Running</Link>
        <div className="topbar-end">
          <Link href="/onboarding" className="textlink">Get a tree</Link>
          <MusicButton />
        </div>
      </div>

      {tree && (
        <>
          <h1 className="h2 center mt8">
            {tree.ornaments.length === 0 ? `Be the first on ${tree.displayName}'s tree` : `${tree.ornaments.length} sealed ornaments so far`}
          </h1>
          <p className="small muted center mt4">Every message stays hidden until Christmas morning.</p>
          <PixelTree
            ornaments={tree.ornaments}
            owner={{ name: tree.displayName }}
            label={`${tree.displayName}'s tree with ${tree.ornaments.length} sealed ornaments`}
          />
        </>
      )}

      <div className="grow" />
      <div className="sticky-cta mt24">
        <Link href={`/t/${nickname}/hang`} className="btn block">Hang an ornament</Link>
        <p className="center tiny muted mt8">
          No sign-up needed. Only {tree?.displayName ?? 'they'} can read it, on December 25.
        </p>
      </div>
    </main>
  );
}
