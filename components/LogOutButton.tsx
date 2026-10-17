'use client';

import { useRouter } from 'next/navigation';
import { logOut } from '@/lib/me';

/** Signs out and returns to the landing page; the tree is kept for next time. */
export default function LogOutButton() {
  const router = useRouter();
  return (
    <button
      className="btn ghost block"
      onClick={() => {
        logOut();
        router.push('/');
      }}
    >
      Log out
    </button>
  );
}
