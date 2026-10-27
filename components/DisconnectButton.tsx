'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteAccount, stravaLoginUrl, useMe } from '@/lib/me';

/** "Disconnect Strava": revokes access and deletes the tree, ornaments and synced runs. Signed out: log in. */
export default function DisconnectButton() {
  const router = useRouter();
  const me = useMe();
  const [busy, setBusy] = useState(false);
  if (me === undefined) return null;
  if (me === null) {
    return <a href={stravaLoginUrl()} className="btn block strava mt12">Log in with Strava</a>;
  }

  const disconnect = async () => {
    if (!confirm('Disconnect Strava and delete your tree, ornaments and runs? This can’t be undone.')) return;
    setBusy(true);
    if (await deleteAccount()) return router.push('/');
    setBusy(false);
    alert('Couldn’t delete your data. Please try again.');
  };

  return (
    <>
      <button className="btn red block mt12" onClick={disconnect} aria-busy={busy} disabled={busy}>Disconnect Strava</button>
      <p className="center tiny muted mt8">Deletes your tree, ornaments and synced runs.</p>
    </>
  );
}
