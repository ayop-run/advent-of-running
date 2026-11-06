import Sprite from './Sprite';
import { friendNote, type Friend } from '@/lib/friends';
import { BY_ID } from '@/lib/ornaments';

const name = (id: string) => BY_ID[id]?.name ?? 'an ornament';

/** You hung one on their tree and they hung one on yours. */
export const swapped = (f: Friend) => Boolean(f.mine) && f.hung > 0;

/** The "Swapped" tag beside a friend's name. */
export const SwapTag = ({ f }: { f: Friend }) => (swapped(f) ? <span className="swap-tag">Swapped</span> : null);

/**
 * How you know a friend: the ornament you hung on their tree, and a wrapped gift for the
 * ones they hung on yours (which ones stays a surprise).
 */
export default function FriendNote({ f, showGiven = true }: { f: Friend; showGiven?: boolean }) {
  const mine = showGiven ? f.mine ?? null : null;
  if (!mine && !f.hung) {
    const text = friendNote(f, { showGiven });
    return text ? <div className="tiny muted">{text}</div> : null;
  }
  return (
    <div className="friend-swap tiny muted">
      {mine && (
        <span className="swap-item" title={`You gave ${name(mine)}`}>
          You gave
          <Sprite id={mine} px={2} label={name(mine)} />
        </span>
      )}
      {f.hung > 0 && (
        <span className="swap-item" title="A surprise until Christmas">
          {mine ? 'Got' : 'Gave you'}
          <Sprite id="gift-box" px={2} label="A wrapped ornament" />
          {f.hung > 1 && `×${f.hung}`}
        </span>
      )}
    </div>
  );
}
