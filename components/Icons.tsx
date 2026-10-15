import Sprite from '@/components/Sprite';

/** Padlock for sealed messages, drawn on the shared 2px sprite grid. */
export function LockIcon() {
  return <Sprite id="lock" px={2} style={{ flexShrink: 0 }} />;
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

/** Pixel chevron for rows and links that go somewhere. 6×10 grid at 2px per pixel. */
export function ChevronIcon({ dir = 'right' }: { dir?: 'right' | 'left' }) {
  return (
    <svg width="12" height="20" viewBox="0 0 6 10" shapeRendering="crispEdges" aria-hidden="true" style={{ flexShrink: 0, transform: dir === 'left' ? 'scaleX(-1)' : undefined }}>
      <path d="M1 1h2v2h1v2h1v1H4v2H3v1H1V8h1V7h1V5H2V3H1z" fill="currentColor" />
    </svg>
  );
}
