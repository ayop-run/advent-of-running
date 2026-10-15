import { SPRITES } from '@/lib/sprites';

const cache = new Map<string, [string, string][]>();

/** One SVG path per colour, built from horizontal runs of same-coloured pixels. */
function paths(id: string): [string, string][] {
  const hit = cache.get(id);
  if (hit) return hit;
  const byColour: Record<string, string> = {};
  (SPRITES[id] ?? []).forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      let n = 1;
      while (x + n < row.length && row[x + n] === c) n++;
      if (c) byColour[c] = (byColour[c] ?? '') + `M${x} ${y}h${n}v1h-${n}z`;
      x += n;
    }
  });
  const out = Object.entries(byColour);
  cache.set(id, out);
  return out;
}

type Props = {
  id: string;
  /** Screen pixels per art pixel. Always a whole number, so every pixel is square and equal. */
  px: number;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
};

export default function Sprite({ id, px, className, style, label }: Props) {
  const rows = SPRITES[id] ?? [];
  const w = rows[0]?.length ?? 0;
  const h = rows.length;
  const scale = Math.max(1, Math.round(px));
  return (
    <svg
      className={className}
      style={style}
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {paths(id).map(([fill, d], i) => (
        <path key={i} d={d} fill={fill} />
      ))}
    </svg>
  );
}
