'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sprite from '@/components/Sprite';

export default function Onboarding() {
  const router = useRouter();
  const [nick, setNick] = useState('demo');
  const [anyone, setAnyone] = useState(true);
  const [tz, setTz] = useState('');
  useEffect(() => setTz(Intl.DateTimeFormat().resolvedOptions().timeZone), []);

  return (
    <main className="screen no-nav">
      <div className="topbar">
        <span className="brand">Advent of Running</span>
      </div>
      <div className="row mt8">
        <Sprite id="gift-box" px={4} style={{ flexShrink: 0 }} />
        <div>
          <h1 className="title">Set up your tree</h1>
          <p className="small soft mt4">Three quick choices. You can change them later.</p>
          <p className="mt8"><span className="badge">Strava connected</span></p>
        </div>
      </div>

      <form
        className="stack mt24"
        style={{ gap: 22 }}
        onSubmit={(e) => {
          e.preventDefault();
          router.push('/tree');
        }}
      >
        <label className="field">
          Nickname
          <input className="input" value={nick} onChange={(e) => setNick(e.target.value.replace(/[^a-z0-9-]/gi, '').toLowerCase())} />
          <span className="help">Your tree link will be /t/{nick || 'nickname'}</span>
        </label>

        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ padding: 0, marginBottom: 8 }}>Who can hang ornaments?</legend>
          <div className="row">
            <button type="button" className="pill grow" aria-pressed={anyone} onClick={() => setAnyone(true)}>Anyone with link</button>
            <button type="button" className="pill grow" aria-pressed={!anyone} onClick={() => setAnyone(false)}>Runners only</button>
          </div>
        </fieldset>

        <div className="field">
          Time zone
          <div className="panel quiet row between" style={{ padding: 14 }}>
            <span>{tz || 'Detecting…'}</span>
          </div>
          <span className="help">Your messages open at midnight on December 25 in this time zone.</span>
        </div>

        <label className="row small" style={{ alignItems: 'flex-start', fontWeight: 600 }}>
          <input type="checkbox" defaultChecked style={{ width: 22, height: 22, marginTop: 1, accentColor: 'var(--gold)' }} />
          <span>Email me when someone hangs an ornament, and when next Advent starts</span>
        </label>

        <button className="btn block mt8" type="submit">Create my tree</button>
      </form>
    </main>
  );
}
