'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DATA_NOTICE, validDisplayName } from '@/lib/dataNotice';
import { getMe, saveProfile, type Me } from '@/lib/me';

// pages where the notice would get in the way: signing up already shows it, and reading it
const SKIP = ['/signup', '/privacy', '/coming-soon', '/about'];

/**
 * Once per change in what we collect (Strava API Policy 7.2), signed-in runners see what's new
 * and say OK before going on. This one also asks for the name friends see on the tree, since it
 * used to be copied from Strava.
 */
export default function DataNotice() {
  const path = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    getMe().then((m) => {
      if (!m?.onboarded || m.dataNotice >= DATA_NOTICE) return;
      setMe(m);
      setName(m.displayName);
    });
  }, []);
  if (!me || SKIP.some((p) => path.startsWith(p))) return null;

  const accept = async () => {
    if (!validDisplayName(name) || saving) return;
    setSaving(true);
    setFailed(false);
    const res = await saveProfile({ nickname: me.nickname, timeZone: me.timeZone, emailOptIn: me.emailOptIn, displayName: name.trim(), acceptNotice: true });
    setSaving(false);
    if ('error' in res) return setFailed(true);
    setMe(null);
  };

  return (
    <div className="scrim">
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="notice-title">
        <div className="grab" />
        <h2 id="notice-title" className="h2 center">A quick update</h2>
        <ul className="stack mt16 small soft" style={{ gap: 10, paddingLeft: 18, margin: '16px 0 0' }}>
          <li>
            <strong style={{ color: 'var(--snow)' }}>Two more things from your runs.</strong> For each day we now also keep your longest
            run’s title and how many were group runs, for the chart and the weeks 3–4 bonus. Only you see them.
          </li>
          <li>
            <strong style={{ color: 'var(--snow)' }}>Your name, your choice.</strong> Friends see the name below, not your Strava name or
            photo. They see your initial instead of the photo.
          </li>
          <li>We keep your synced runs only while you use the app, and delete them 7 days after your last visit.</li>
        </ul>
        <label className="field mt16">
          Your name on your tree
          <input className="input" value={name} maxLength={30} autoComplete="nickname" onChange={(e) => setName(e.target.value)} aria-invalid={!validDisplayName(name)} />
        </label>
        {failed && <p className="small center mt8" role="alert">Couldn’t save. Please try again.</p>}
        <button className="btn block mt16" onClick={accept} disabled={!validDisplayName(name) || saving} aria-busy={saving}>
          {saving ? 'Saving…' : 'OK, continue'}
        </button>
        <p className="tiny muted center mt12">
          Details in <Link href="/privacy" className="textlink">Privacy</Link>. Not OK? Delete your tree in Me, or disconnect the app
          in your Strava settings, and we delete everything.
        </p>
      </div>
    </div>
  );
}
