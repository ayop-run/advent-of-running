'use client';

import { useEffect, useState } from 'react';
import { getMe } from '@/lib/me';

/** The runner's settings. */
export default function MeSettings() {
  const [tz, setTz] = useState('');
  // yours as saved at sign-up; the browser's in the demo
  useEffect(() => {
    getMe().then((me) => setTz(me?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone));
  }, []);

  return (
    <div className="panel quiet flush mt12">
      <div className="setting">
        <p className="setting-title">Time zone</p>
        <p className="setting-help">{tz || 'Detecting…'} · your doors close at 23:59 and your tree opens at midnight on December 25 here.</p>
      </div>
    </div>
  );
}
