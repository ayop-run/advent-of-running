'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StravaLogin } from '@/components/Strava';
import { deleteAccount, stravaLoginUrl, useMe } from '@/lib/me';

const GONE = [
  'Your tree and every ornament friends hung on it',
  'Letters waiting for you on Christmas morning',
  'Your calendar, unwrapped ornaments and synced runs',
];

/** "Delete my tree": revokes Strava access and deletes the tree, ornaments and runs. Signed out: log in. */
export default function DisconnectButton() {
  const router = useRouter();
  const me = useMe();
  const [asking, setAsking] = useState(false);
  if (me === undefined) return null;
  if (me === null) {
    return <div className="mt8"><StravaLogin href={stravaLoginUrl()} /></div>;
  }
  return (
    <>
      <button type="button" className="danger-link mt16" onClick={() => setAsking(true)}>Delete my tree</button>
      {asking && <DeleteSheet nickname={me.nickname} onClose={() => setAsking(false)} onDeleted={() => router.push('/')} />}
    </>
  );
}

/** Asks before deleting: what goes, then typing your tree name so it can't happen by accident. */
function DeleteSheet({ nickname, onClose, onDeleted }: { nickname: string; onClose: () => void; onDeleted: () => void }) {
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const ready = typed.trim().toLowerCase() === nickname;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  const remove = async () => {
    setBusy(true);
    setFailed(false);
    if (await deleteAccount()) return onDeleted();
    setBusy(false);
    setFailed(true);
  };

  return (
    <div className="scrim" onClick={() => !busy && onClose()}>
      <form
        className="sheet"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        aria-describedby="delete-help"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (ready && !busy) remove();
        }}
      >
        <div className="grab" />
        <h2 id="delete-title" className="h2">Delete your tree?</h2>
        <p id="delete-help" className="small soft mt8">This can&apos;t be undone. We&apos;ll delete:</p>
        <ul className="gone-list mt8">
          {GONE.map((g) => <li key={g}>{g}</li>)}
        </ul>
        <p className="small soft mt12">Strava will be disconnected. Your runs stay on Strava.</p>

        <label className="field mt16">
          <span className="small">Type <strong style={{ color: 'var(--snow)' }}>{nickname}</strong> to confirm</span>
          <input
            className="input"
            value={typed}
            autoFocus
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setTyped(e.target.value)}
          />
        </label>
        {failed && <p className="tiny center mt8" style={{ color: '#ff9aa8' }} role="alert">Couldn&apos;t delete your tree. Please try again.</p>}

        <button type="submit" className="btn red block mt16" disabled={!ready || busy} aria-busy={busy}>
          {busy ? 'Deleting…' : 'Delete my tree'}
        </button>
        <button type="button" className="btn ghost block mt8" onClick={onClose} disabled={busy}>Keep my tree</button>
      </form>
    </div>
  );
}
