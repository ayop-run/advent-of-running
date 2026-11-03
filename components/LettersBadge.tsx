'use client';

import { useEffect, useState } from 'react';
import { LetterIcon } from '@/components/Icons';

/**
 * How many sealed letters hang on a tree: an envelope with the count. Tapping it shows a
 * little bubble to the right (never over the tree) saying when they open; it hides itself.
 */
export default function LettersBadge({ count, empty }: { count: number; empty: string }) {
  const [tip, setTip] = useState(false);
  useEffect(() => {
    if (!tip) return;
    const id = setTimeout(() => setTip(false), 3200);
    return () => clearTimeout(id);
  }, [tip]);
  return (
    <div className="center loaded">
      <div className="letters-wrap">
        <button
          type="button"
          className="letters"
          aria-expanded={tip}
          aria-label={`${count} sealed ${count === 1 ? 'letter' : 'letters'}`}
          onClick={() => setTip((v) => !v)}
        >
          <LetterIcon />
          <b>{count}</b>
        </button>
        {tip && <p className="bubble" role="status">{count === 0 ? empty : 'Sealed until Christmas'}</p>}
      </div>
    </div>
  );
}
