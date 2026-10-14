'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

/**
 * Chiptune "Jingle Bells" (J. L. Pierpont, 1857, public domain), synthesised with the
 * Web Audio API so there is no audio file to license or download.
 */

const BPM = 152;
const BEAT = 60 / BPM;
const N: Record<string, number> = { C3: 48, D3: 50, F3: 53, G3: 55, C5: 72, D5: 74, E5: 76, F5: 77, G5: 79 };
const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

const A: [string, number][] = [
  ['E5', 1], ['E5', 1], ['E5', 2], ['E5', 1], ['E5', 1], ['E5', 2],
  ['E5', 1], ['G5', 1], ['C5', 1.5], ['D5', 0.5], ['E5', 4],
  ['F5', 1], ['F5', 1], ['F5', 1.5], ['F5', 0.5], ['F5', 1], ['E5', 1], ['E5', 1], ['E5', 0.5], ['E5', 0.5],
];
const MELODY: [string, number][] = [
  ...A, ['E5', 1], ['D5', 1], ['D5', 1], ['E5', 1], ['D5', 2], ['G5', 2],
  ...A, ['G5', 1], ['G5', 1], ['F5', 1], ['D5', 1], ['C5', 4],
];
// One root per bar, played as a bouncing root-fifth bass line.
const BASS = ['C3', 'C3', 'C3', 'C3', 'F3', 'C3', 'D3', 'G3', 'C3', 'C3', 'C3', 'C3', 'F3', 'C3', 'G3', 'C3'];
const LOOP_BEATS = MELODY.reduce((n, [, d]) => n + d, 0);

function playNote(ctx: AudioContext, out: GainNode, type: OscillatorType, freq: number, t: number, dur: number, vol: number) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.06, dur * 0.9));
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + dur);
}

function scheduleLoop(ctx: AudioContext, out: GainNode, start: number) {
  let t = start;
  for (const [n, d] of MELODY) {
    playNote(ctx, out, 'square', hz(N[n]), t, d * BEAT, 0.09);
    t += d * BEAT;
  }
  BASS.forEach((root, bar) => {
    for (let b = 0; b < 4; b++) {
      const m = N[root] + (b % 2 ? 7 : 0);
      playNote(ctx, out, 'triangle', hz(m), start + (bar * 4 + b) * BEAT, BEAT * 0.9, 0.22);
    }
    // sleigh-bell tick on the off-beats
    for (let b = 0; b < 4; b++) {
      playNote(ctx, out, 'square', 2600, start + (bar * 4 + b + 0.5) * BEAT, 0.04, 0.012);
    }
  });
  return start + LOOP_BEATS * BEAT;
}

const KEY = 'aor:music';

const MusicCtx = createContext<{ on: boolean; toggle: () => void }>({ on: false, toggle: () => {} });

/** Lives in the root layout, so the music keeps playing while you move between pages. */
export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
  }, []);

  const start = useCallback(() => {
    if (ctxRef.current) return;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const out = ctx.createGain();
    out.gain.value = 0.5;
    out.connect(ctx.destination);
    ctxRef.current = ctx;
    const loop = (at: number) => {
      const end = scheduleLoop(ctx, out, at);
      timer.current = setTimeout(() => loop(end), Math.max(0, (end - ctx.currentTime - 1) * 1000));
    };
    loop(ctx.currentTime + 0.1);
  }, []);

  // Browsers only allow sound after a tap, so a saved "on" resumes on the first interaction.
  useEffect(() => {
    let saved = false;
    try {
      saved = window.localStorage.getItem(KEY) === 'on';
    } catch {
      /* storage blocked */
    }
    if (!saved) return;
    const resume = () => {
      setOn(true);
      start();
    };
    window.addEventListener('pointerdown', resume, { once: true });
    return () => window.removeEventListener('pointerdown', resume);
  }, [start]);

  useEffect(() => stop, [stop]);

  const toggle = useCallback(() => {
    setOn((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(KEY, next ? 'on' : 'off');
      } catch {
        /* storage blocked */
      }
      if (next) start();
      else stop();
      return next;
    });
  }, [start, stop]);

  return <MusicCtx.Provider value={{ on, toggle }}>{children}</MusicCtx.Provider>;
}

/** Pixel note button for a screen's top bar. */
export function MusicButton() {
  const { on, toggle } = useContext(MusicCtx);
  return (
    <button
      type="button"
      className="music"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Turn music off' : 'Turn music on'}
      title={on ? 'Music on' : 'Music off'}
    >
      <svg width="22" height="22" viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true">
        <path d="M5 1h6v2H7v6H6v1H5v1H2v-1H1V8h1V7h3z" fill="currentColor" />
        {!on && <path d="M1 1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h-1v-1h-1v-1H9V9H8V8H7V7H6V6H5V5H4V4H3V3H2V2H1z" fill="#e8546a" />}
      </svg>
    </button>
  );
}
