'use client';

import { BY_ID } from '@/lib/ornaments';
import type { Hung } from '@/lib/data';

/** Ornament slots (centre points) on the 64×76 pixel tree, in tree pixels, top to bottom. */
const SLOTS: [number, number][] = [
  [32.5, 21.5], [25.5, 27.5], [39.5, 27.5], [18.5, 43.5], [31.5, 44.5], [45.5, 42.5],
  [25, 49.5], [39, 49.5], [16.5, 54.5], [31.5, 53], [47.5, 55.5], [11, 62],
  [24.5, 60.5], [40.5, 60.5], [55.5, 61.5],
];

export type Owner = {
  name: string;
  /** Strava profile photo in phase 2. Falls back to a pixel initial. */
  avatarUrl?: string;
  /** "Your tree" instead of "Mina's tree". */
  isYou?: boolean;
};

const AVATAR_COLORS = ['#e8546a', '#3fb57a', '#8fd3ff', '#ffc94a', '#c38bff', '#ff9a5c'];

export function Avatar({ owner, size = 32 }: { owner: Owner; size?: number }) {
  if (owner.avatarUrl) {
    return <img className="avatar-img" src={owner.avatarUrl} alt="" width={size} height={size} />;
  }
  const hue = AVATAR_COLORS[[...owner.name].reduce((n, ch) => n + ch.charCodeAt(0), 0) % AVATAR_COLORS.length];
  return (
    <span className="avatar-img" aria-hidden="true" style={{ width: size, height: size, background: hue, fontSize: size * 0.55 }}>
      {owner.name.charAt(0).toUpperCase()}
    </span>
  );
}

type Props = {
  ornaments: Hung[];
  owner?: Owner;
  onSelect?: (h: Hung) => void;
  highlightId?: string;
  label: string;
  /** Screen pixels per tree pixel. */
  scale?: number;
  decorative?: boolean;
};

export default function PixelTree({ ornaments, owner, onSelect, highlightId, label, scale = 5, decorative }: Props) {
  const order = { rare: 0, special: 1, basic: 2 } as const;
  const sorted = [...ornaments].sort(
    (a, b) => order[BY_ID[a.ornamentId]?.tier ?? 'basic'] - order[BY_ID[b.ornamentId]?.tier ?? 'basic'],
  );
  // Keep a freshly hung ornament visible even when the tree is full.
  if (highlightId) {
    const i = sorted.findIndex((h) => h.id === highlightId);
    if (i >= SLOTS.length) sorted.unshift(...sorted.splice(i, 1));
  }
  const shown = sorted.slice(0, SLOTS.length);
  const extra = ornaments.length - shown.length;
  const W = 64 * scale;
  const H = 76 * scale;
  const size = Math.round(scale * 7.6);

  return (
    <div style={owner ? { paddingBottom: 30 } : undefined}>
      <div
        className="scene"
        style={{ width: W, height: H }}
        role={decorative ? undefined : 'group'}
        aria-label={decorative ? undefined : label}
        aria-hidden={decorative || undefined}
      >
        <svg className="ground px" viewBox="0 0 90 14" shapeRendering="crispEdges" aria-hidden="true">
          <path d="M0 14V9h6V7h10V5h14V4h30v1h14v2h10v2h6v5z" fill="#e9eefb" />
          <path d="M0 14v-3h8V9h12V8h50v1h12v2h8v3z" fill="#c7d3f0" />
        </svg>
        <img className="tree px" src="/ornaments/tree.png" alt="" width={W} height={H} />
        {shown.map((h, i) => {
          const o = BY_ID[h.ornamentId];
          if (!o) return null;
          const [x, y] = SLOTS[i];
          const style = { left: x * scale, top: y * scale, width: size, height: size };
          const cls = `orn ${o.tier}${h.id === highlightId ? ' new' : ''}`;
          const sparkle =
            o.tier === 'basic' ? null : (
              <>
                {o.tier === 'rare' && <i className="ring" aria-hidden="true" />}
                <i className="spark s1" aria-hidden="true" />
                <i className="spark s2" aria-hidden="true" />
                {o.tier === 'rare' && <i className="spark s3" aria-hidden="true" />}
              </>
            );
          if (!onSelect) {
            return (
              <span key={h.id} className={cls} style={style}>
                {sparkle}
                <img className="px" src={o.img} alt="" />
              </span>
            );
          }
          return (
            <button key={h.id} type="button" className={cls} style={style} onClick={() => onSelect(h)} aria-label={`${o.name} from ${h.from}, ${o.tier === 'basic' ? 'free' : o.tier} ornament`}>
              {sparkle}
              <img className="px" src={o.img} alt="" />
            </button>
          );
        })}
        {owner && (
          <div className="nametag">
            <Avatar owner={owner} size={30} />
            <span>{owner.isYou ? 'Your tree' : `${owner.name}'s tree`}</span>
          </div>
        )}
      </div>
      {extra > 0 && <p className="center tiny muted mt12">{extra} more ornaments are waiting under the tree</p>}
    </div>
  );
}

export function Legend() {
  return (
    <div className="legend mt16">
      <span className="tier-rare"><i style={{ background: 'var(--gold)' }} />Rare</span>
      <span className="tier-special"><i style={{ background: 'var(--cranberry)' }} />Special</span>
      <span className="tier-basic"><i style={{ background: 'var(--snow)' }} />Free</span>
    </div>
  );
}
