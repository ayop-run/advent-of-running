/**
 * Time-of-day sky, in the spirit of the macOS dynamic wallpapers.
 * Keyframes are blended by the viewer's local time, so the sky drifts slowly
 * from night to dawn, day, sunset and back. Every palette keeps body text and
 * muted text at 4.5:1 or better against the bottom of the sky.
 */

type Key = {
  /** Local hour, 0–24. */
  at: number;
  top: string;
  mid: string;
  bottom: string;
  /** Colour of the low glow above the horizon (sunrise / sunset). */
  glow: string;
  glowA: number;
  stars: number;
  muted: string;
};

const NIGHT = { top: '#070d1f', mid: '#0e1832', bottom: '#17284c', glow: '#3a2f6b', glowA: 0, stars: 1, muted: '#a9b6d3' };
const DAWN = { top: '#141c45', mid: '#38336a', bottom: '#6a4370', glow: '#ff9e7a', glowA: 0.45, stars: 0.35, muted: '#d9d3e6' };
const MORNING = { top: '#183a72', mid: '#24548f', bottom: '#2f62a0', glow: '#ffd9a0', glowA: 0.18, stars: 0, muted: '#dde5f4' };
const DAY = { top: '#1a4688', mid: '#245a9c', bottom: '#2c65a6', glow: '#bfe3ff', glowA: 0.12, stars: 0, muted: '#e1e8f6' };
const SUNSET = { top: '#1d1f4f', mid: '#523065', bottom: '#7f3d5c', glow: '#ff8a5c', glowA: 0.5, stars: 0.15, muted: '#e6d6e0' };
const DUSK = { top: '#0b1130', mid: '#1c2049', bottom: '#2c2a58', glow: '#7a4a8a', glowA: 0.2, stars: 0.7, muted: '#c3c6e0' };

// December-ish daylight: sunrise around 8, sunset around 16:30.
export const SKY_KEYS: Key[] = [
  { at: 0, ...NIGHT },
  { at: 6, ...NIGHT },
  { at: 7.5, ...DAWN },
  { at: 9.5, ...MORNING },
  { at: 12, ...DAY },
  { at: 14.5, ...DAY },
  { at: 16.25, ...SUNSET },
  { at: 17.5, ...DUSK },
  { at: 19, ...NIGHT },
  { at: 24, ...NIGHT },
];

/**
 * CSS custom properties for the sky at a given time. Self-contained (no imports
 * or closures) so it can also be inlined as a pre-paint script.
 */
export function skyVars(hour: number, keys: Key[]): Record<string, string> {
  const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const mix = (a: string, b: string, t: number) => {
    const x = hex(a);
    const y = hex(b);
    return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
  };
  let i = 0;
  while (i < keys.length - 2 && hour >= keys[i + 1].at) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const raw = Math.min(1, Math.max(0, (hour - a.at) / (b.at - a.at)));
  const t = raw * raw * (3 - 2 * raw); // ease in and out of each phase
  const glowA = a.glowA + (b.glowA - a.glowA) * t;
  const g = hex(mix(a.glow, b.glow, t));
  return {
    '--sky-top': mix(a.top, b.top, t),
    '--sky-mid': mix(a.mid, b.mid, t),
    '--sky-bottom': mix(a.bottom, b.bottom, t),
    '--sky-glow': `rgba(${g[0]},${g[1]},${g[2]},${glowA.toFixed(3)})`,
    '--sky-stars': (a.stars + (b.stars - a.stars) * t).toFixed(3),
    '--muted': mix(a.muted, b.muted, t),
  };
}

export const localHour = (d = new Date()) => d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;

/** Runs before first paint so a daytime visit never flashes the night sky. */
export const SKY_BOOT_SCRIPT = `(function(){try{var f=${skyVars.toString()};var d=new Date();var v=f(d.getHours()+d.getMinutes()/60,${JSON.stringify(SKY_KEYS)});var s=document.documentElement.style;for(var k in v)s.setProperty(k,v[k]);}catch(e){}})();`;
