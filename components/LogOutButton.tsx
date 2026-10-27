'use client';

import { useRouter } from 'next/navigation';
import { logOut, useMe } from '@/lib/me';

/** Signs out and returns to the landing page; logging in with Strava returns to the same tree. */
export default function LogOutButton() {
  const router = useRouter();
  const me = useMe();
  if (me === null) return null;
  return (
    <button
      className="btn ghost block"
      onClick={async () => {
        await logOut();
        router.push('/');
      }}
    >
      Log out
    </button>
  );
}
