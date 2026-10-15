'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronIcon } from '@/components/Icons';

/** Goes back to wherever you came from, or to `fallback` when the page was opened directly. */
export default function BackLink({ fallback = '/', label = 'Back' }: { fallback?: string; label?: string }) {
  const router = useRouter();
  return (
    <Link
      href={fallback}
      className="textlink"
      onClick={(e) => {
        if (window.history.length > 1) {
          e.preventDefault();
          router.back();
        }
      }}
    >
      <ChevronIcon dir="left" /> {label}
    </Link>
  );
}
