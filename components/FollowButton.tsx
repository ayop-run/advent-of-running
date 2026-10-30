/**
 * Follow / Following, the same everywhere: a small chip next to a name. Gold to follow, a plain
 * outline once you do; both the same width, so it doesn't jump when tapped.
 */
export default function FollowButton({ following, onClick }: { following: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`follow-chip${following ? ' on' : ''}`} aria-pressed={following} onClick={onClick}>
      {following ? 'Following' : 'Follow'}
    </button>
  );
}
