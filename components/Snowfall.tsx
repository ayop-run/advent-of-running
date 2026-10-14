'use client';

import { useEffect, useRef } from 'react';

type Flake = { x: number; y: number; s: number; v: number; phase: number; amp: number };

/** Full-screen pixel snowfall. Square flakes, bigger ones fall faster (parallax). */
export default function Snowfall() {
  const ref = useRef<HTMLCanvasElement>(null);

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

    const make = (anywhere: boolean): Flake => {
      const r = Math.random();
      const s = r < 0.55 ? 2 : r < 0.85 ? 3 : r < 0.97 ? 4 : 6;
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : -10,
        s,
        v: 0.25 + s * 0.18 + Math.random() * 0.2,
        phase: Math.random() * Math.PI * 2,
        amp: 0.2 + Math.random() * 0.5,
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
      const target = Math.min(320, Math.round((w * h) / 2800));
      flakes = Array.from({ length: target }, () => make(true));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        ctx.fillStyle = f.s >= 4 ? 'rgba(255,247,236,1)' : f.s === 3 ? 'rgba(255,247,236,0.85)' : 'rgba(255,247,236,0.6)';
        ctx.fillRect(Math.round(f.x), Math.round(f.y), f.s, f.s);
      }
    };

    const tick = () => {
      for (const f of flakes) {
        f.phase += 0.012;
        f.y += f.v;
        f.x += Math.sin(f.phase) * f.amp;
        if (f.y > h + 8) Object.assign(f, make(false));
        if (f.x < -8) f.x = w + 4;
        if (f.x > w + 8) f.x = -4;
      }
      draw();
      raf = requestAnimationFrame(tick);
    };

    const onVis = () => {
      cancelAnimationFrame(raf);
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
      <canvas ref={ref} className="snowfall" />
      <svg className="drifts" viewBox="0 0 120 16" preserveAspectRatio="none" shapeRendering="crispEdges">
        <path d="M0 16V9h8V7h14V6h12V8h10V9h12V7h10V5h16V6h10V8h10V7h12V9h6v7z" fill="#dfe7fa" />
        <path d="M0 16v-4h10v-1h16V10h20v1h18v-1h22v1h14v1h20v4z" fill="#b9c7ea" />
      </svg>
    </div>
  );
}
