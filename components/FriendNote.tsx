import Sprite from './Sprite';
import { friendNote, type Friend } from '@/lib/friends';
import { BY_ID } from '@/lib/ornaments';

const name = (id: string) => BY_ID[id]?.name ?? 'an ornament';

/** You hung one on their tree and they hung one on yours. */
export const swapped = (f: Friend) => Boolean(f.mine) && (f.theirs?.length ?? 0) > 0;

/** The "Swapped" tag beside a friend's name. */
export const SwapTag = ({ f }: { f: Friend }) => (swapped(f) ? <span className="swap-tag">Swapped</span> : null);

/**
 * How you know a friend, with the ornaments themselves: the one you hung on their tree,
 * the ones they hung on yours, and a "Swapped" tag when you both gave one.
 */
export default function FriendNote({ f, showGiven = true }: { f: Friend; showGiven?: boolean }) {
  const mine = showGiven ? f.mine ?? null : null;
  const theirs = f.theirs ?? [];
  if (!mine && !theirs.length) {
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
      {theirs.length > 0 && (
        <span className="swap-item" title={`They gave you ${theirs.map(name).join(', ')}`}>
          {mine ? 'Got' : 'Gave you'}
          {theirs.slice(0, 3).map((id, i) => <Sprite key={i} id={id} px={2} label={name(id)} />)}
          {theirs.length > 3 && `+${theirs.length - 3}`}
        </span>
      )}
    </div>
  );
}
