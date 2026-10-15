'use client';

import { useCallback, useState } from 'react';

/** Each sprite's own tap animation (keyframes in globals.css, all in whole-pixel steps). */
const SPRITE_ANIM: Record<string, string> = {
  'bauble-snow': 'bounce',
  snowflake: 'twirl',
  sock: 'swing',
  'bauble-frost': 'shiver',
  'hot-cocoa': 'slosh',
  'bauble-cranberry': 'spin',
  fox: 'look',
  penguin: 'waddle',
  reindeer: 'leap',
  'gingerbread-runner': 'run',
  'santa-shoe': 'stomp',
  'running-shoe': 'dash',
  'finish-medal': 'coin',
  stopwatch: 'rattle',
  'snow-globe': 'shake',
  'bell-gold': 'ring',
  'gift-box': 'tease',
};

/** Name of this sprite's animation (also picks its particles in SpriteFx). */
export const animName = (spriteId: string) => SPRITE_ANIM[spriteId] ?? 'bounce';

/** Class that plays this sprite's animation once. */
export const animFor = (spriteId: string) => `anim-${animName(spriteId)}`;

/** 'play' runs the sprite's own animation; 'nope' is a wrapped present you can't open yet. */
export type BumpKind = 'play' | 'nope';

/**
 * Plays a one-shot sprite animation on the thing that was just tapped.
 * `of(id, spriteId)` gives a key for the still wrapper (it changes per tap, remounting it so
 * the animation replays), the class for the moving sprite, and which particles to play
 * in the still layer beside it.
 */
export function useBump() {
  const [b, setB] = useState<{ id: string | number; n: number; kind: BumpKind } | null>(null);
  const bump = useCallback((id: string | number, kind: BumpKind = 'play') => {
    setB((prev) => ({ id, kind, n: (prev?.n ?? 0) + 1 }));
  }, []);
  /** `fx` is the animation to play particles for, or null when this item isn't playing. */
  const of = (id: string | number, spriteId: string) => {
    if (!b || b.id !== id) return { k: `${id}-0`, anim: '', fx: null };
    const name = b.kind === 'nope' ? 'nope' : animName(spriteId);
    return { k: `${id}-${b.n}`, anim: `anim-${name}`, fx: name };
  };
  return { bump, of };
}
