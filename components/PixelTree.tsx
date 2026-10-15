'use client';

import Sprite from '@/components/Sprite';
import { BY_ID } from '@/lib/ornaments';
import { SPRITE_SIZE, TREE_H, TREE_SLOTS as SLOTS, TREE_W } from '@/lib/sprites';
import type { Hung } from '@/lib/data';

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
  /** Screen pixels per art pixel, shared by the tree and its ornaments. */
  scale?: number;
  decorative?: boolean;
};

export default function PixelTree({ ornaments, owner, onSelect, highlightId, label, scale = 2, decorative }: Props) {
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
  // The tree and its ornaments share one pixel size, so every pixel on screen is identical.
  const px = Math.max(1, Math.round(scale));
  const W = TREE_W * px;
  const H = TREE_H * px;
  const half = SPRITE_SIZE / 2;

  return (
    <div style={owner ? { paddingBottom: 30 } : undefined}>
      <div
        className="scene"
        style={{ width: W, height: H }}
        role={decorative ? undefined : 'group'}
        aria-label={decorative ? undefined : label}
        aria-hidden={decorative || undefined}
      >
        <svg className="ground" viewBox="4 0 82 14" width={164 * px} height={28 * px} style={{ bottom: -16 * px }} shapeRendering="crispEdges" aria-hidden="true">
          <path d="M0 14V9h6V7h10V5h14V4h30v1h14v2h10v2h6v5z" fill="#e9eefb" />
          <path d="M0 14v-3h8V9h12V8h50v1h12v2h8v3z" fill="#c7d3f0" />
        </svg>
        <Sprite id="tree" px={px} className="tree" />
        {shown.map((h, i) => {
          const o = BY_ID[h.ornamentId];
          if (!o) return null;
          const [x, y] = SLOTS[i];
          // Slots are in tree pixels, so ornaments sit exactly on the tree's pixel grid.
          const style = { left: (x - half) * px, top: (y - half) * px };
          const cls = `orn${h.id === highlightId ? ' new' : ''}`;
          if (!onSelect) {
            return (
              <span key={h.id} className={cls} style={style}>
                <Sprite id={o.id} px={px} />
              </span>
            );
          }
          return (
            <button key={h.id} type="button" className={cls} style={style} onClick={() => onSelect(h)} aria-label={`${o.name} from ${h.from}`}>
              <Sprite id={o.id} px={px} />
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
