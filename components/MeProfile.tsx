'use client';

import { useEffect, useState } from 'react';
import { Avatar } from '@/components/PixelTree';
import { DEMO_NICKNAME, getMe } from '@/lib/me';

/** The signed-in runner's avatar, tree name and Strava status. */
export default function MeProfile() {
  const [name, setName] = useState(DEMO_NICKNAME);
  useEffect(() => setName(getMe().nickname), []);
  return (
    <div className="row">
      <Avatar owner={{ name }} size={48} />
      <div className="grow">
        <p className="h2">{name}</p>
        <p className="mt4"><span className="badge">Strava connected</span></p>
      </div>
    </div>
  );
}
