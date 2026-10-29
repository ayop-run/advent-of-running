'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronIcon } from '@/components/Icons';
import { canGoBack, willReplace } from '@/components/NavHistory';

/**
 * The back arrow at the start of the top bar. Goes back to the previous page of this app,
 * or to `fallback` when there isn't one (opened from a link, a new tab or another site).
 */
export default function BackLink({ fallback = '/', label = 'Back' }: { fallback?: string; label?: string }) {
  const router = useRouter();
  return (
    <Link
      href={fallback}
      replace
      className="icon-btn"
      aria-label={label}
      title={label}
      onClick={(e) => {
        if (canGoBack()) {
          e.preventDefault();
          router.back();
        } else willReplace();
      }}
    >
      <ChevronIcon dir="left" />
    </Link>
  );
}
