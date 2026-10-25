'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PixelTree from '@/components/PixelTree';
import { getTree, type Tree } from '@/lib/data';

export default function Done() {
  const { nickname } = useParams<{ nickname: string }>();
  const id = useSearchParams().get('id') ?? undefined;
  const [tree, setTree] = useState<Tree | null>(null);
  useEffect(() => {
    getTree(nickname).then(setTree, console.error);
  }, [nickname]);
  const name = tree?.displayName ?? '';

  return (
    <main className="screen no-nav">
      <div className="topbar">
        <span className="brand">Advent of Running</span>
        <Link href={`/t/${nickname}`} className="textlink">Close</Link>
      </div>

      <h1 className="h1 center mt8">Hung on {name}&apos;s tree</h1>
      <p className="center soft mt8">It stays sealed until Christmas morning.</p>

      {tree && <PixelTree ornaments={tree.ornaments} owner={{ name: tree.displayName }} highlightId={id} label={`${name}'s tree with your new ornament`} scale={4.25} />}

      <section className="panel gold mt32">
        <h2 className="h2">Want a tree of your own?</h2>
        <p className="small soft mt8">Friends hang ornaments on it, and you unwrap special ones by running each day of Advent.</p>
        <Link href="/onboarding" className="btn block mt16">Start my tree with Strava</Link>
      </section>

      <Link href={`/t/${nickname}`} className="textlink center mt16" style={{ alignSelf: 'center' }}>Back to {name}&apos;s tree</Link>
    </main>
  );
}
