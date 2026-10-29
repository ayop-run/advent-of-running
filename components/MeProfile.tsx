'use client';

import { Avatar } from '@/components/PixelTree';
import Sk from '@/components/Skeleton';
import { DEMO_NICKNAME, useMe } from '@/lib/me';

/** The signed-in runner's avatar, tree name and Strava status. */
export default function MeProfile() {
  const me = useMe();
  const name = me?.displayName ?? DEMO_NICKNAME;
  if (me === undefined) {
    return (
      <div className="row" aria-busy="true">
        <Sk w={48} h={48} />
        <div className="grow">
          <Sk w={140} h={20} />
          <Sk w={180} h={14} className="mt8" />
        </div>
      </div>
    );
  }
  return (
    <div className="row loaded">
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
