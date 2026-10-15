'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MusicButton } from '@/components/MusicToggle';
import { getTree, type Hung } from '@/lib/data';
import { BY_ID } from '@/lib/ornaments';
import Sprite from '@/components/Sprite';

const REACTIONS = ['Thank you', 'Made my day', 'Run together soon'];

export default function ChristmasUnlock() {
  const [list, setList] = useState<Hung[]>([]);
  const [i, setI] = useState(0);
  const [sent, setSent] = useState<Record<string, string>>({});
  useEffect(() => setList(getTree('demo').ornaments), []);

  const cur = list[i];
  const o = cur ? BY_ID[cur.ornamentId] : null;

  return (
    <main className="screen no-nav">
      <div className="topbar">
        <span className="small muted">Preview of December 25</span>
        <div className="topbar-end">
          <MusicButton />
          <Link href="/tree" className="textlink">Close</Link>
        </div>
      </div>
      <h1 className="h1 xl">Merry Christmas!</h1>
      <p className="soft mt8">{list.length} messages are open. The 2 ornaments you didn&apos;t give away are now on your tree.</p>

      {cur && o && (
        <section className="panel mt24" aria-live="polite">
          <div className="row">
            <Sprite id={o.id} px={2} style={{ flexShrink: 0 }} />
            <div className="grow">
              <h2 className="h2">From {cur.from}</h2>
              <p className="tier">{o.name}</p>
            </div>
            <span className="pix muted">{i + 1}/{list.length}</span>
          </div>
          <p className="mt16" style={{ fontSize: 20, lineHeight: 1.45, fontWeight: 700 }}>&ldquo;{cur.message}&rdquo;</p>

          <p className="small mt24" style={{ fontWeight: 800 }}>Send {cur.from} a reply</p>
          <div className="row wrap mt8" style={{ gap: 8 }}>
            {REACTIONS.map((r) => (
              <button key={r} className="pill" aria-pressed={sent[cur.id] === r} onClick={() => setSent({ ...sent, [cur.id]: r })}>{r}</button>
            ))}
          </div>
          {sent[cur.id] && <p className="tiny soft mt8">Sent. {cur.from} gets an email saying &ldquo;{sent[cur.id]}&rdquo;.</p>}
        </section>
      )}

      <div className="row mt16">
        <button className="btn ghost" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} aria-label="Previous message">Back</button>
        <button className="btn grow" onClick={() => setI(Math.min(list.length - 1, i + 1))} disabled={i >= list.length - 1}>Next</button>
      </div>

      <div className="grow" />
      <p className="center tiny muted mt24">Your 2026 running recap arrives here in phase 2.</p>
    </main>
  );
}
