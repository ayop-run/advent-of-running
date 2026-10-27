'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getMe, saveProfile, type Me, type ProfileError } from '@/lib/data';

const PROFILE_ERROR: Record<ProfileError, string> = {
  nickname_taken: 'That nickname is taken. Try another one.',
  invalid: 'Nicknames need 2–30 letters, numbers or dashes.',
  signed_out: 'Your login expired. Please log in with Strava again.',
  unknown: "Couldn't save. Please try again.",
};

export default function Onboarding() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [nick, setNick] = useState('');
  const [anyone, setAnyone] = useState(true);
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [tz, setTz] = useState('');
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState<ProfileError | null>(null);

  useEffect(() => {
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    getMe().then((runner) => {
      setMe(runner);
      if (runner) {
        setNick(runner.nickname);
        setAnyone(runner.hangPolicy === 'anyone');
        setEmailOptIn(runner.emailOptIn);
      }
    });
  }, []);

  if (me === null) {
    return (
      <main className="screen no-nav">
        <div className="topbar"><span className="brand">Advent of Running</span></div>
        <h1 className="h1 mt8" style={{ fontSize: 32 }}>Connect Strava first</h1>
        <p className="soft mt8">Your runs open the doors of your advent calendar.</p>
        <a href="/api/strava/connect" className="btn block mt24">Log in with Strava</a>
      </main>
    );
  }

  return (
    <main className="screen no-nav">
      <div className="topbar">
        <span className="brand">Advent of Running</span>
        {me && <span className="small" style={{ color: 'var(--pine)', fontWeight: 800 }}>Strava connected</span>}
      </div>
      <div className="row mt8">
        <img className="px" src="/ornaments/tree.png" alt="" width={64} height={76} />
        <div>
          <h1 className="h1" style={{ fontSize: 32 }}>Set up your tree</h1>
          <p className="soft">You can change any of this later.</p>
        </div>
      </div>

      <form
        className="stack mt24"
        style={{ gap: 22 }}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!me || saving) return;
          setSaving(true);
          setFailed(null);
          const res = await saveProfile({ nickname: nick, timeZone: tz || 'UTC', hangPolicy: anyone ? 'anyone' : 'signed_in', emailOptIn });
          if ('error' in res) {
            setFailed(res.error);
            setSaving(false);
            return;
          }
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
            <button type="button" className="pill grow" aria-pressed={anyone} onClick={() => setAnyone(true)}>Anyone with the link</button>
            <button type="button" className="pill grow" aria-pressed={!anyone} onClick={() => setAnyone(false)}>Signed-in runners</button>
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
          <input type="checkbox" checked={emailOptIn} onChange={(e) => setEmailOptIn(e.target.checked)} style={{ width: 22, height: 22, marginTop: 1, accentColor: 'var(--gold)' }} />
          <span>Email me when someone hangs an ornament, and when next Advent starts</span>
        </label>

        {failed && <p className="center small" role="alert">{PROFILE_ERROR[failed]}</p>}
        <button className="btn block mt8" type="submit" disabled={!me || saving}>
          {saving ? 'Saving…' : me?.onboarded ? 'Save' : 'Create my tree'}
        </button>
      </form>
    </main>
  );
}
