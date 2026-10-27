'use client';

import { useEffect } from 'react';
import Countdown from '@/components/Countdown';
import { LockIcon } from '@/components/Icons';
import Sprite from '@/components/Sprite';
import SpriteFx from '@/components/SpriteFx';
import { animFor, animName } from '@/components/useBump';
import type { Hung } from '@/lib/data';
import { maskName } from '@/components/PixelTree';
import { BY_ID } from '@/lib/ornaments';

type Props = {
  hung: Hung;
  /** whose tree it hangs on, for the "only Mina can read it" note */
  ownerName: string;
  /** true on your own tree */
  isOwner: boolean;
  onClose: () => void;
};

/** The bottom sheet for one ornament: who sent it, the hint, and (in the demo) the message. */
export default function OrnamentSheet({ hung, ownerName, isOwner, onClose }: Props) {
  const o = BY_ID[hung.ornamentId];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (!o) return null;

  // Until Christmas the sender shows as an initial and the message stays locked; only the
  // ornament you hung yourself shows your own words.
  const sender = hung.mine ? 'you' : maskName(hung.from);

  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={`${o.name} from ${sender}`} onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        <div className="center">
          <span className="bump" style={{ width: 'fit-content', margin: '0 auto' }}>
            <span className={animFor(o.id)} style={{ display: 'block' }}><Sprite id={o.id} px={4} /></span>
            <SpriteFx anim={animName(o.id)} px={4} />
          </span>
          <h2 className="title mt12">From {sender}</h2>
          <p className="small soft mt4">{o.name}</p>
          <p className="mt8"><span className="tag">Hint: {hung.hint}</span></p>
        </div>

        {hung.mine && hung.message ? (
          <div className="message-card mt16">
            <p style={{ fontSize: 18, lineHeight: 1.45, fontWeight: 700 }}>&ldquo;{hung.message}&rdquo;</p>
            <div className="tiny muted mt8 row" style={{ gap: 8, alignItems: 'center' }}>
              <LockIcon />
              <span>Only {ownerName} can read this, on December 25.</span>
            </div>
          </div>
        ) : (
          <div className="panel hint row mt16">
            <LockIcon />
            <div>
              <strong>The message is locked</strong>
              <div className="tiny soft">
                {isOwner ? <><Countdown prefix="It opens in" />, along with who sent it.</> : `Only ${ownerName} can read it, on December 25.`}
              </div>
            </div>
          </div>
        )}

        <button className="btn ghost block mt8" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
