'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * A tree's name as the page title. Long names shorten with "…"; then hovering, focusing or
 * tapping the name shows it in full in a small bubble underneath.
 */
export default function TreeTitle({ name }: { name: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [clipped, setClipped] = useState(false);
  const [open, setOpen] = useState(false);

  // only clipped names get the bubble; re-checked when the header resizes
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setClipped(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [name]);

  // a tap shows it for a moment; tapping elsewhere or Escape hides it
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), 3200);
    const away = (e: PointerEvent) => !ref.current?.parentElement?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => {
      clearTimeout(t);
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <span className={`name-wrap${clipped ? ' clipped' : ''}`}>
      <h1
        ref={ref}
        className="title clip"
        tabIndex={clipped ? 0 : undefined}
        aria-describedby={clipped && open ? 'full-name' : undefined}
        onClick={() => clipped && setOpen((o) => !o)}
        onMouseEnter={() => clipped && setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => clipped && setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {name}
      </h1>
      {clipped && open && <span id="full-name" role="tooltip" className="name-tip">{name}</span>}
    </span>
  );
}
