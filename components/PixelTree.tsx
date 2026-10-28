'use client';

import Sprite from '@/components/Sprite';
import { BY_ID } from '@/lib/ornaments';
import { SPRITE_SIZE, TREE_H, TREE_LIGHTS, TREE_SLOTS as SLOTS, TREE_W } from '@/lib/sprites';
import { placeOrnaments, TOPPER_GLINTS } from '@/lib/treeImage';
import { avatarColor } from '@/lib/avatar';
import type { Hung } from '@/lib/data';

/** Senders stay secret until Christmas: only the first letter shows, e.g. "M***". */
export const maskName = (name: string) => `${Array.from(name.trim())[0] ?? '?'}***`;

/** What the tooltip says instead of the message, picked per ornament so neighbours differ. */
const SEALED_LINES = ['Sealed until Christmas', 'No peeking yet!', 'Opens on Dec 25', 'Wrapped up tight', 'A secret for Christmas', 'Save it for Christmas'];
const sealedLine = (id: string) => SEALED_LINES[[...id].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7) % SEALED_LINES.length];


export type Owner = {
  name: string;
  /** Strava profile photo in phase 2. Falls back to a pixel initial. */
  avatarUrl?: string;
  /** "Your tree" instead of "AYOP's tree". */
  isYou?: boolean;
};

export function Avatar({ owner, size = 32 }: { owner: Owner; size?: number }) {
  if (owner.avatarUrl) {
    return <img className="avatar-img" src={owner.avatarUrl} alt="" width={size} height={size} />;
  }
  return (
    <span className="avatar-img" aria-hidden="true" style={{ width: size, height: size, background: avatarColor(owner.name), fontSize: size * 0.55 }}>
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
  const { shown, extra } = placeOrnaments(ornaments, highlightId);
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
        {TREE_LIGHTS.map(([x, y, color], i) => (
          // three sets of bulbs take turns, like a real string of lights
          <i key={`l${i}`} className="tree-light" style={{ left: x * px, top: y * px, color, '--u': `${px}px`, animationDelay: `${-(i % 3) * 0.6}s` } as React.CSSProperties} />
        ))}
        {TOPPER_GLINTS.map(([x, y, d], i) => (
          <i key={i} className="topper-glint" style={{ left: x * px, top: y * px, '--u': `${px}px`, animationDelay: `${d}s` } as React.CSSProperties} />
        ))}
        {shown.map((h, i) => {
          const o = BY_ID[h.ornamentId];
          if (!o) return null;
          const [x, y] = SLOTS[i];
          // Slots are in tree pixels, so ornaments sit exactly on the tree's pixel grid.
          const style = { left: (x - half) * px, top: (y - half) * px };
          const cls = `orn${h.id === highlightId ? ' new' : ''}`;
          const sender = h.mine ? 'you' : maskName(h.from);
          const tip = (h.mine || h.from.trim()) && (
            <span className="orn-tip" aria-hidden="true">
              <b>From {sender}</b>
              <span><Sprite id="lock" px={1} /> {sealedLine(h.id)}</span>
            </span>
          );
          if (!onSelect) {
            return (
              <span key={h.id} className={cls} style={style}>
                <Sprite id={o.id} px={px} />
                {tip}
              </span>
            );
          }
          return (
            <button key={h.id} type="button" className={cls} style={style} onClick={() => onSelect(h)} aria-label={`${o.name}, from ${sender}, ${sealedLine(h.id)}`}>
              <Sprite id={o.id} px={px} />
              {tip}
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
