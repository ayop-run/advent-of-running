'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { MusicButton } from '@/components/MusicToggle';
import { Avatar } from '@/components/PixelTree';
import { deleteAccount, getMe, getProgress, logOut, type Me } from '@/lib/data';
import { BY_ID } from '@/lib/ornaments';

const ROWS = [
  { label: 'People you swapped ornaments with', value: '14' },
  { label: 'Saved trees', value: '3' },
  { label: 'Ornament collection', value: '10/100' },
];

export default function MePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [busy, setBusy] = useState(false);
  const [pouch, setPouch] = useState<string[]>([]);
  useEffect(() => {
    getMe().then(setMe);
    getProgress().then((res) => 'progress' in res && setPouch(res.progress.pouch));
  }, []);

  const slots = [...pouch, null];
  const settings = [
    { label: 'Who can hang ornaments', value: me?.hangPolicy === 'signed_in' ? 'Signed-in runners' : 'Anyone with the link' },
    { label: 'Email notifications', value: me && !me.emailOptIn ? 'Off' : 'On' },
    { label: 'Time zone', value: me?.timeZone ?? 'Automatic' },
  ];

  const disconnect = async () => {
    if (!confirm('Disconnect Strava and delete your tree, ornaments and progress? This cannot be undone.')) return;
    setBusy(true);
    if (await deleteAccount()) router.push('/');
    else {
      setBusy(false);
      alert("Couldn't delete your data. Please try again.");
    }
  };
  return (
    <main className="screen">
      <div className="topbar">
        <div className="row">
          <Avatar owner={{ name: me?.displayName ?? 'demo', avatarUrl: me?.avatarUrl ?? undefined }} size={48} />
          <div>
            <h1 className="title" style={{ fontSize: 24 }}>{me?.displayName ?? 'demo'}</h1>
            <p className="tiny muted">{me ? `Connected to Strava · /t/${me.nickname}` : 'Demo profile'}</p>
          </div>
        </div>
        <MusicButton />
      </div>

      <section className="panel gold">
        <div className="row between">
          <h2 className="h2">Ornaments to give</h2>
          <span className="num" style={{ color: 'var(--gold)' }}>{pouch.length}</span>
        </div>
        <div className="picker mt12">
          {slots.map((id, k) =>
            id ? (
              <div key={`${id}-${k}`} className="pick">
                <img className="px" src={BY_ID[id].img} alt="" />
                <span className="tier-special">{BY_ID[id].name}</span>
              </div>
            ) : (
              <div key={`empty-${k}`} className="pick empty">Run to fill</div>
            ),
          )}
        </div>
        <p className="small soft mt12">Give them by December 24. Any you keep go on your own tree on Christmas.</p>
        <Link href="/gift" className="btn block mt16">Give one</Link>
      </section>

      <div className="mt16">
        {ROWS.map((r) => (
          <div key={r.label} className="list-row small"><span>{r.label}</span><span className="value">{r.value}</span></div>
        ))}
      </div>

      <h2 className="h2 mt32">Settings</h2>
      <div className="mt4">
        {settings.map((s) => (
          <div key={s.label} className="list-row small"><span>{s.label}</span><span className="value small">{s.value}</span></div>
        ))}
        {me && <Link href="/onboarding" className="list-row small"><span>Change nickname and settings</span><span className="value">Edit</span></Link>}
        <Link href="/christmas" className="list-row small"><span>Preview Christmas morning</span><span className="value">Open</span></Link>
      </div>
      {me ? (
        <>
          <button className="btn ghost block mt24" onClick={async () => { await logOut(); router.push('/'); }}>Log out</button>
          <button className="btn red block mt12" onClick={disconnect} disabled={busy}>Disconnect Strava and delete my data</button>
        </>
      ) : (
        <a href="/api/strava/connect" className="btn block mt24">Log in with Strava</a>
      )}

      <BottomNav />
    </main>
  );
}
