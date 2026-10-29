import type { CSSProperties } from 'react';

/**
 * A loading placeholder in the shape of what's coming (pixel corners, slow shimmer).
 * Hidden from screen readers: put `aria-busy` on the area that is loading.
 */
export default function Sk({ w = '100%', h = 12, inline, className = '', style }: { w?: number | string; h?: number | string; inline?: boolean; className?: string; style?: CSSProperties }) {
  return <span className={`sk${inline ? ' inline' : ''}${className ? ` ${className}` : ''}`} style={{ width: w, height: h, ...style }} aria-hidden="true" />;
}
