import { SPRITES, spritePaths as paths } from '@/lib/sprites';

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
