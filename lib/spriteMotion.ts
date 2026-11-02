'use client';

import { animName } from '@/components/useBump';

/**
 * Each ornament's own movement, for drawing on a canvas: read from the same CSS keyframes
 * the app plays when you tap an ornament (globals.css, `a-*`), so stickers move exactly like
 * the originals. Keyframes run in steps, holding each pose until the next one.
 */

/** A pose in art pixels: offset, mirrored, turned (degrees), brightness and opacity. */
export type Pose = { dx: number; dy: number; flip: boolean; turn: number; bright: number; alpha: number };
type Motion = { dur: number; frames: { at: number; pose: Pose }[] };

const REST: Pose = { dx: 0, dy: 0, flip: false, turn: 0, bright: 1, alpha: 1 };
/** The page's sprites move at 2 screen pixels per art pixel. */
const PAGE_PX = 2;

let motions: Record<string, Motion> | null = null;

function rules(): CSSRule[] {
  const out: CSSRule[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      out.push(...Array.from(sheet.cssRules));
    } catch {
      /* a stylesheet from another origin */
    }
  }
  return out;
}

function toPose(style: CSSStyleDeclaration): Pose {
  let { dx, dy, flip, turn } = REST;
  if (style.transform && style.transform !== 'none') {
    const m = new DOMMatrix(style.transform);
    dx = m.e / PAGE_PX;
    dy = m.f / PAGE_PX;
    flip = m.a < 0 && Math.abs(m.b) < 0.01;
    turn = flip ? 0 : Math.round((Math.atan2(m.b, m.a) * 180) / Math.PI);
  }
  const b = style.filter?.match(/brightness\(([\d.]+)\)/);
  return { dx, dy, flip, turn, bright: b ? Number(b[1]) : 1, alpha: style.opacity ? Number(style.opacity) : 1 };
}

/** Reads every `.anim-*` class and its keyframes once. */
function load(): Record<string, Motion> {
  if (motions) return motions;
  const all = rules();
  const frames: Record<string, Motion['frames']> = {};
  for (const r of all) {
    if (!(r instanceof CSSKeyframesRule) || !r.name.startsWith('a-')) continue;
    const list: Motion['frames'] = [];
    for (const k of Array.from(r.cssRules) as CSSKeyframeRule[]) {
      const pose = toPose(k.style);
      for (const at of k.keyText.split(',')) list.push({ at: at.trim() === 'from' ? 0 : at.trim() === 'to' ? 1 : parseFloat(at) / 100, pose });
    }
    frames[r.name] = list.sort((a, b) => a.at - b.at);
  }
  const out: Record<string, Motion> = {};
  for (const r of all) {
    if (!(r instanceof CSSStyleRule)) continue;
    const m = r.selectorText.match(/^\.anim-([a-z]+)$/);
    if (!m) continue;
    const name = r.style.animationName;
    const dur = parseFloat(r.style.animationDuration) || 0.9;
    if (frames[name]) out[m[1]] = { dur, frames: frames[name] };
  }
  // keep an empty table until the stylesheet is there, then read it for real
  if (Object.keys(out).length) motions = out;
  return out;
}

/**
 * The sprite's pose at `t` seconds. It plays its move, rests a moment, and plays it again;
 * `phase` (seconds) staggers stickers so they don't all move at once.
 */
export function poseAt(spriteId: string, t: number, phase = 0, rest = 1.1): Pose {
  const m = load()[animName(spriteId)];
  if (!m) return REST;
  const cycle = m.dur + rest;
  const local = (((t + phase) % cycle) + cycle) % cycle;
  if (local >= m.dur) return REST;
  const p = local / m.dur;
  let pose = REST;
  for (const f of m.frames) {
    if (f.at <= p) pose = f.pose;
    else break;
  }
  return pose;
}
