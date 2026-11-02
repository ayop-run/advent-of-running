'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Tip from '@/components/Tip';
import { scheduleLoop } from '@/lib/jingle';

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
    <Tip label={on ? 'Music off' : 'Music on'}>
      <button type="button" className="music" onClick={toggle} aria-pressed={on} aria-label={on ? 'Turn music off' : 'Turn music on'}>
        <svg width="24" height="24" viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true">
          <path d="M5 1h6v2H7v6H6v1H5v1H2v-1H1V8h1V7h3z" fill="currentColor" />
          {!on && <path d="M1 1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h-1v-1h-1v-1H9V9H8V8H7V7H6V6H5V5H4V4H3V3H2V2H1z" fill="#e8546a" />}
        </svg>
      </button>
    </Tip>
  );
}
