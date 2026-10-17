'use client';

import { useEffect } from 'react';
import Countdown from '@/components/Countdown';
import { LockIcon } from '@/components/Icons';
import Sprite from '@/components/Sprite';
import SpriteFx from '@/components/SpriteFx';
import { animFor, animName } from '@/components/useBump';
import type { Hung } from '@/lib/data';
import { BY_ID } from '@/lib/ornaments';

type Props = {
  hung: Hung;
  /** whose tree it hangs on, for the "only Mina can read it" note */
  ownerName: string;
  /** true on your own tree */
  isOwner: boolean;
  onClose: () => void;
  /** an extra action, e.g. "Hang one back" */
  action?: React.ReactNode;
};

/** The bottom sheet for one ornament: who sent it, the hint, and (in the demo) the message. */
export default function OrnamentSheet({ hung, ownerName, isOwner, onClose, action }: Props) {
  const o = BY_ID[hung.ornamentId];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (!o) return null;

  const sealedNote = isOwner ? 'On a real tree this stays sealed.' : `On a real tree only ${ownerName} can read this, on December 25.`;

  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={`${o.name} from ${hung.from}`} onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        <div className="center">
          <span className="bump" style={{ width: 'fit-content', margin: '0 auto' }}>
            <span className={animFor(o.id)} style={{ display: 'block' }}><Sprite id={o.id} px={4} /></span>
            <SpriteFx anim={animName(o.id)} px={4} />
          </span>
          <h2 className="title mt12">From {hung.from}{hung.mine && !isOwner ? ' (you)' : ''}</h2>
          <p className="small soft mt4">{o.name}</p>
          <p className="mt8"><span className="tag">Hint: {hung.hint}</span></p>
        </div>

        {/* Demo: messages open early so you can see how they read. Real trees stay sealed until Dec 25. */}
        {hung.message ? (
          <div className="message-card mt16">
            <span className="badge demo">Demo preview</span>
            <p className="mt8" style={{ fontSize: 18, lineHeight: 1.45, fontWeight: 700 }}>&ldquo;{hung.message}&rdquo;</p>
            <div className="tiny muted mt8 row" style={{ gap: 8, alignItems: 'center' }}>
              <LockIcon />
              <span>{sealedNote} {isOwner && <><Countdown prefix="It opens in" />.</>}</span>
            </div>
          </div>
        ) : (
          <div className="panel hint row mt16">
            <LockIcon />
            <div>
              <strong>The message is sealed</strong>
              <div className="tiny soft"><Countdown prefix="It opens in" /></div>
            </div>
          </div>
        )}

        {action}
        <button className="btn ghost block mt8" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
