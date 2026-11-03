import type { ReactNode } from 'react';

/**
 * A small label under a header button, on mouse hover or keyboard focus. The buttons clip
 * their own pixel corners, so the label hangs off this wrapper instead.
 */
export default function Tip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="tip" data-tip={label}>
      {children}
    </span>
  );
}
