/** Small pixel-art icons drawn on an 8×8 / 10×10 grid. */

export function LockIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M3 1h4v1h1v3H7V2H3v3H2V2h1z" fill="#a9b6d3" />
      <path d="M1 5h8v5H1z" fill="#ffc94a" />
      <path d="M1 9h8v1H1z" fill="#c98a16" />
      <path d="M4 6h2v2H4z" fill="#2b1d07" />
    </svg>
  );
}

export function Meter({ value, max }: { value: number; max: number }) {
  const on = Math.round((Math.min(value, max) / max) * 10);
  return (
    <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      {Array.from({ length: 10 }, (_, i) => (
        <i key={i} className={i < on ? 'on' : ''} />
      ))}
    </div>
  );
}
