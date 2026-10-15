/**
 * Pixel particles that play once around a tapped sprite: snow puffs, steam, music notes,
 * speed lines, crumbs and sparkles. Each particle is a tiny pixel shape drawn with
 * box-shadows on the same grid as the sprite, so it scales with it.
 */

const SHAPES: Record<string, string[]> = {
  dot: ['X'],
  puff: ['XX', 'XX'],
  cloud: ['.XX.', 'XXXX', '.XX.'],
  plus: ['.X.', 'XXX', '.X.'],
  heart: ['X.X', 'XXX', '.X.'],
  note: ['..XX', '..X.', '..X.', 'XXX.', 'XX..'],
  bang: ['X', 'X', 'X', '.', 'X'],
  q: ['XXX', '..X', '.XX', '...', '.X.'],
  line: ['XXXX'],
  tick: ['X', 'X', 'X'],
};

const C = { snow: '#fff7ec', frost: '#8fd3ff', gold: '#ffc94a', red: '#e8546a', pink: '#ff9fb0', crumb: '#b07a4f', mist: '#c7d3f0', mint: '#7fe0c4' };

type Particle = {
  shape: keyof typeof SHAPES;
  color: string;
  /** start, relative to the sprite's centre, in sprite pixels */
  x: number;
  y: number;
  /** travel, in sprite pixels */
  dx: number;
  dy: number;
  delay?: number;
  dur?: number;
  /** 'arc' rises by `lift` on the way, like something tossed */
  path?: 'line' | 'arc';
  lift?: number;
};

const p = (shape: Particle['shape'], color: string, x: number, y: number, dx: number, dy: number, delay = 0, dur = 0.6, path: Particle['path'] = 'line', lift = 0): Particle =>
  ({ shape, color, x, y, dx, dy, delay, dur, path, lift });

/** Particles per animation, in sprite pixels (a 16×16 sprite spans -8..8). */
const FX: Record<string, Particle[]> = {
  // snowball lands twice and kicks up powder
  bounce: [
    p('cloud', C.snow, -10, 6, -4, 0, 0.26, 0.4), p('cloud', C.snow, 7, 6, 4, 0, 0.26, 0.4),
    p('dot', C.snow, -4, 7, -6, 2, 0.26, 0.5, 'arc', 8), p('dot', C.snow, 4, 7, 6, 2, 0.28, 0.5, 'arc', 10),
    p('puff', C.mist, -9, 7, -3, 0, 0.56, 0.3), p('puff', C.mist, 7, 7, 3, 0, 0.56, 0.3),
  ],
  // six frosty sparkles fly off as it twirls
  twirl: [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i / 6) * Math.PI * 2;
    return p('plus', i % 2 ? C.frost : C.snow, Math.round(Math.cos(a) * 6) - 1, Math.round(Math.sin(a) * 6) - 1, Math.round(Math.cos(a) * 8), Math.round(Math.sin(a) * 8), 0.1 + i * 0.06, 0.5);
  }),
  // a little gold star tumbles out of the sock
  swing: [
    p('plus', C.gold, -1, -8, 10, 14, 0.2, 0.7, 'arc', 8),
    p('dot', C.snow, 4, -6, 6, -4, 0.35, 0.4),
  ],
  // frost crystals crackle outward
  shiver: [
    p('plus', C.frost, -9, -6, -4, -4, 0.05, 0.45), p('plus', C.frost, 8, -6, 4, -4, 0.12, 0.45),
    p('plus', C.snow, -9, 5, -4, 4, 0.19, 0.45), p('plus', C.snow, 8, 5, 4, 4, 0.26, 0.45),
    p('dot', C.frost, 0, -9, 0, -6, 0.3, 0.4),
  ],
  // steam curls up, then a heart
  slosh: [
    p('puff', C.snow, -3, -8, -2, -10, 0.1, 0.7), p('puff', C.snow, 1, -8, 2, -12, 0.25, 0.7),
    p('dot', C.mist, -1, -8, 0, -14, 0.4, 0.6), p('heart', C.pink, 3, -10, 2, -10, 0.55, 0.7),
  ],
  // gold glints chase around as it spins
  spin: [
    p('plus', C.gold, -9, -2, -2, 0, 0.0, 0.3), p('plus', C.gold, 8, -2, 2, 0, 0.14, 0.3),
    p('plus', C.snow, -9, -2, -2, 0, 0.28, 0.3), p('plus', C.snow, 8, -2, 2, 0, 0.42, 0.3),
    p('dot', C.gold, -1, -10, 0, -6, 0.5, 0.4),
  ],
  // "!" — then a quick hop with a dust kick
  look: [
    p('bang', C.snow, 6, -14, 0, -2, 0.12, 0.35),
    p('puff', C.mist, -5, 8, -4, 0, 0.5, 0.35), p('puff', C.mist, 4, 8, 4, 0, 0.5, 0.35),
  ],
  // snow puffs at alternating feet
  waddle: [
    p('puff', C.snow, -6, 8, -3, -1, 0.05, 0.3), p('puff', C.snow, 5, 8, 3, -1, 0.25, 0.3),
    p('puff', C.snow, -6, 8, -3, -1, 0.45, 0.3), p('puff', C.snow, 5, 8, 3, -1, 0.65, 0.3),
  ],
  // big leap with a sparkle trail and a landing puff
  leap: [
    p('cloud', C.mist, -9, 7, -4, 0, 0.05, 0.35), p('cloud', C.mist, 6, 7, 4, 0, 0.05, 0.35),
    p('dot', C.gold, -2, 0, -4, 4, 0.18, 0.4), p('dot', C.gold, 0, -6, -4, 4, 0.26, 0.4), p('plus', C.gold, 2, -10, -2, 2, 0.34, 0.4),
    p('puff', C.snow, -6, 8, -4, 0, 0.6, 0.3), p('puff', C.snow, 5, 8, 4, 0, 0.6, 0.3),
  ],
  // crumbs fly as it runs, with speed lines behind
  run: [
    p('dot', C.crumb, -2, 4, -8, 6, 0.05, 0.5, 'arc', 6), p('dot', C.crumb, 2, 4, 8, 6, 0.18, 0.5, 'arc', 8),
    p('dot', C.crumb, 0, 6, -6, 4, 0.32, 0.5, 'arc', 6),
    p('line', C.mist, -14, -2, -4, 0, 0.1, 0.3), p('line', C.mist, -14, 3, -4, 0, 0.3, 0.3),
  ],
  // big stomp: dust clouds burst out on impact
  stomp: [
    p('cloud', C.mist, -10, 4, -8, -2, 0.34, 0.45), p('cloud', C.mist, 7, 4, 8, -2, 0.34, 0.45),
    p('dot', C.snow, -4, 5, -6, -2, 0.34, 0.45, 'arc', 8), p('dot', C.snow, 4, 5, 6, -2, 0.34, 0.45, 'arc', 10),
  ],
  // zooms off and comes back, trailing speed lines
  dash: [
    p('line', C.mint, -14, -2, -6, 0, 0.12, 0.35), p('line', C.snow, -16, 2, -6, 0, 0.18, 0.35),
    p('line', C.mint, -14, 5, -6, 0, 0.24, 0.35), p('puff', C.mist, -9, 6, -4, 0, 0.1, 0.3),
  ],
  // flips high and flashes with sparkles
  coin: [
    p('plus', C.gold, -10, -12, -4, -4, 0.28, 0.45), p('plus', C.snow, 9, -12, 4, -4, 0.32, 0.45),
    p('plus', C.gold, -11, -2, -4, 2, 0.36, 0.45), p('plus', C.snow, 10, -2, 4, 2, 0.4, 0.45),
  ],
  // ringing alarm: ticks on both sides
  rattle: [
    p('tick', C.snow, -12, -4, -2, 0, 0.0, 0.2), p('tick', C.snow, 11, -4, 2, 0, 0.1, 0.2),
    p('tick', C.snow, -12, -4, -2, 0, 0.25, 0.2), p('tick', C.snow, 11, -4, 2, 0, 0.35, 0.2),
    p('bang', C.gold, -1, -15, 0, -2, 0.3, 0.35),
  ],
  // shaken snow globe: flakes swirl up and drift down
  shake: [-6, -3, 0, 3, 6].map((x, i) => p('dot', C.snow, x, -4, x, 10, 0.25 + i * 0.06, 0.8, 'arc', 12)),
  // ding-dong: music notes float up
  ring: [
    p('note', C.gold, -12, -10, -4, -10, 0.12, 0.8), p('note', C.snow, 9, -10, 4, -12, 0.42, 0.8),
  ],
  // wrapped gift: a "?" pops up
  tease: [p('q', C.gold, -1, -16, 0, -4, 0.45, 0.45), p('dot', C.snow, -7, -8, -2, -2, 0.5, 0.3), p('dot', C.snow, 6, -8, 2, -2, 0.5, 0.3)],
  nope: [],
};

export default function SpriteFx({ anim, px }: { anim: string; px: number }) {
  const list = FX[anim] ?? [];
  if (!list.length) return null;
  return (
    <span className="fx-layer" aria-hidden="true">
      {list.map((q, i) => {
        const shape = SHAPES[q.shape];
        const shadows: string[] = [];
        shape.forEach((row, y) => [...row].forEach((c, x) => c === 'X' && shadows.push(`${x * px}px ${y * px}px`)));
        return (
          <i
            key={i}
            className={`fx fx-${q.path}`}
            style={{
              '--u': `${px}px`,
              '--x': `${q.x * px}px`,
              '--y': `${q.y * px}px`,
              '--dx': `${q.dx * px}px`,
              '--dy': `${q.dy * px}px`,
              '--lift': `${(q.lift ?? 0) * px}px`,
              '--d': `${q.delay}s`,
              '--dur': `${q.dur}s`,
              color: q.color,
              boxShadow: shadows.join(','),
            } as React.CSSProperties}
          />
        );
      })}
    </span>
  );
}
