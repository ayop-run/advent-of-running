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

/** Pixel finger tapping, for "tap this" notes. 12×12 grid at 2px per pixel. */
export function TapIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M5 2h2v3h2v1h2v6H4v-1H3V6h2z" fill="currentColor" />
      <path d="M3 0h1v1H3zM8 0h1v1H8zM1 2h1v1H1zM10 2h1v1h-1z" fill="var(--gold)" />
    </svg>
  );
}

/** Pixel magnifying glass for search fields. 12×12 grid at 2px per pixel. */
export function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fillRule="evenodd" d="M3 0h4v1h1v1h1v4H8v1H7v1H3V7H2V6H1V2h1V1h1zM3 2h4v4H3z" fill="currentColor" />
      <path d="M8 7h1v1h1v1h1v2h-2v-1H9V9H8z" fill="currentColor" />
    </svg>
  );
}

/** Pixel envelope: cream paper, a soft fold and a red wax seal. 12×10 grid at 2px per pixel. */
export function LetterIcon({ px = 2 }: { px?: number }) {
  return (
    <svg width={12 * px} height={10 * px} viewBox="0 0 12 10" shapeRendering="crispEdges" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M1 1h10v1h1v6h-1v1H1V8H0V2h1z" fill="#fff7ec" />
      <path d="M1 8h10v1H1z" fill="#c7d3f0" />
      <path d="M1 2h1v1H1zM2 3h1v1H2zM3 4h1v1H3zM10 2h1v1h-1zM9 3h1v1H9zM8 4h1v1H8z" fill="#b9c7ea" />
      <path d="M5 4h2v1h1v2H7v1H5V7H4V5h1z" fill="var(--cranberry)" />
      <path d="M5 5h1v1H5z" fill="#ff9aa8" />
    </svg>
  );
}

/** Pixel "share" icon: an arrow out of a box, 12×12 grid at 2px per pixel. */
export function ShareIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M5 1h2v7H5zM4 2h1v1H4zM3 3h1v1H3zM7 2h1v1H7zM8 3h1v1H8zM1 6h2v1H2v4h8V7H9V6h2v6H1z" fill="currentColor" />
    </svg>
  );
}

/** Pixel camera: a body with a lens, 12×12 grid at 2px per pixel. */
export function CameraIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true">
      <path fillRule="evenodd" d="M1 3h3V2h4v1h3v8H1zM5 5h2v1h1v2H7v1H5V8H4V6h1z" fill="currentColor" />
    </svg>
  );
}
