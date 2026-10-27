'use client';

import { Avatar } from '@/components/PixelTree';
import { DEMO_NICKNAME, useMe } from '@/lib/me';

/** The signed-in runner's avatar, tree name and Strava status. */
export default function MeProfile() {
  const me = useMe();
  const name = me?.displayName ?? DEMO_NICKNAME;
  return (
    <div className="row">
      <Avatar owner={{ name, avatarUrl: me?.avatarUrl ?? undefined }} size={48} />
      <div className="grow">
        <p className="h2">{name}</p>
        <p className="mt4">
          {me ? <span className="badge">Strava connected</span> : <span className="tiny muted">Demo account</span>}
          {me && <span className="tiny muted" style={{ marginLeft: 8 }}>/t/{me.nickname}</span>}
        </p>
      </div>
    </div>
  );
}
