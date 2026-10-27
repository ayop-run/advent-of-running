'use client';

import { useEffect, useRef } from 'react';
import { SKY_KEYS, localHour, skyVars } from '@/lib/sky';

type Flake = { x: number; y: number; s: number; v: number; phase: number; sway: number; drift: number };

/** Snow is drawn on a 2px grid so it matches the rest of the pixel art. */
const PX = 2;

/** Updates the sky colours from the clock. `?sky=17.5` previews a time of day. */
function useDynamicSky() {
  useEffect(() => {
    const forced = Number(new URLSearchParams(window.location.search).get('sky'));
    const hasForced = Number.isFinite(forced) && new URLSearchParams(window.location.search).has('sky');
    const meta = document.querySelector('meta[name="theme-color"]');
    const apply = () => {
      const vars = skyVars(hasForced ? forced % 24 : localHour(), SKY_KEYS);
      const root = document.documentElement.style;
      for (const [k, v] of Object.entries(vars)) root.setProperty(k, v);
      meta?.setAttribute('content', vars['--sky-top']);
    };
    apply();
    const id = setInterval(apply, 60_000);
    return () => clearInterval(id);
  }, []);
}

/** Full-screen sky: time-of-day gradient, stars, slow pixel snowfall and snow drifts. */
export default function Snowfall() {
  const ref = useRef<HTMLCanvasElement>(null);
  useDynamicSky();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let flakes: Flake[] = [];
    let raf = 0;
    let last = 0;

    const make = (anywhere: boolean): Flake => {
      const big = Math.random() < 0.22;
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : -PX * 3,
        s: big ? PX * 2 : PX,
        // px per second: a slow, calm fall; nearer (bigger) flakes a little faster
        v: big ? 16 + Math.random() * 8 : 8 + Math.random() * 6,
        phase: Math.random() * Math.PI * 2,
        sway: 4 + Math.random() * 8,
        drift: 0.25 + Math.random() * 0.35,
      };
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.min(180, Math.round((w * h) / 4200));
      flakes = Array.from({ length: target }, () => make(true));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        ctx.fillStyle = f.s > PX ? 'rgba(255,247,236,0.95)' : 'rgba(255,247,236,0.6)';
        const x = f.x + Math.sin(f.phase) * f.sway;
        ctx.fillRect(Math.round(x), Math.round(f.y), f.s, f.s);
      }
    };

    const tick = (now: number) => {
      // Time-based, so the snow falls at the same calm pace on 60 Hz and 120 Hz screens.
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      for (const f of flakes) {
        f.phase += f.drift * dt;
        f.y += f.v * dt;
        if (f.y > h + 8) Object.assign(f, make(false));
      }
      draw();
      raf = requestAnimationFrame(tick);
    };

    const onVis = () => {
      cancelAnimationFrame(raf);
      last = 0;
      if (!document.hidden && !still) raf = requestAnimationFrame(tick);
    };

    resize();
    draw();
    if (!still) raf = requestAnimationFrame(tick);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <div className="sky" aria-hidden="true">
      <div className="sky-glow" />
      <div className="sky-stars" />
      <canvas ref={ref} className="snowfall" />
      <div className="drifts" />
    </div>
  );
}
