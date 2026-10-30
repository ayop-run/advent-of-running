'use client';

import { useEffect, useMemo, useState } from 'react';
import { adventMonth } from '@/lib/calendar';
import { saveProfile, useMe, type Me, type ProfileError } from '@/lib/me';
import { checkNickname, cleanNickname } from '@/lib/nickname';
import { AVAILABILITY, useAvailability } from '@/lib/useNickname';
import Sk from './Skeleton';

const ERROR: Record<ProfileError, string> = {
  nickname_taken: 'That tree name was just taken. Try another.',
  invalid: 'Check your tree name.',
  timezone_locked: 'Your time zone can’t change during Advent.',
  signed_out: 'Your Strava login expired. Please log in again.',
  unknown: 'Couldn’t save. Please try again.',
};

const browserZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

/** Days 1–25 of Advent here, when the time zone is locked (it decides which day each run counts for). */
function duringAdvent(timeZone: string) {
  const [, month, day] = new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date()).split('-').map(Number);
  return month === adventMonth(month) && day <= 25;
}

/** The runner's settings: tree name, time zone and emails. Signed out, the demo's time zone. */
export default function MeSettings() {
  const me = useMe();
  if (me === undefined) {
    return (
      <div className="panel quiet flush" aria-busy="true">
        <div className="setting"><Sk w={90} h={15} /><Sk h={44} className="mt8" /></div>
        <div className="setting"><Sk w={90} h={15} /><Sk h={44} className="mt8" /></div>
      </div>
    );
  }
  if (me === null) {
    return (
      <div className="panel quiet flush loaded">
        <div className="setting">
          <p className="setting-title">Time zone</p>
          <p className="setting-help">{browserZone()} · your doors close at 23:59 and your tree opens at midnight on December 25 here.</p>
        </div>
      </div>
    );
  }
  return <Settings me={me} />;
}

function Settings({ me }: { me: Me }) {
  const [nick, setNick] = useState(me.nickname);
  const [tz, setTz] = useState(me.timeZone);
  const [email, setEmail] = useState(me.emailOptIn);
  const [saved, setSaved] = useState(me);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | ProfileError>('idle');
  const zones = useMemo(() => {
    const all = Intl.supportedValuesOf('timeZone');
    return all.includes(saved.timeZone) ? all : [saved.timeZone, ...all];
  }, [saved.timeZone]);
  const locked = duringAdvent(saved.timeZone);

  const renamed = nick !== saved.nickname;
  const format = checkNickname(nick);
  const { avail, confirm } = useAvailability(nick, renamed && format.ok);
  const check = !renamed ? null : avail ? AVAILABILITY[avail](nick) : format;
  const dirty = renamed || tz !== saved.timeZone || email !== saved.emailOptIn;
  const blocked = renamed && (!format.ok || avail === 'taken');

  // "Saved" fades back once you change something again
  useEffect(() => {
    if (dirty && status === 'saved') setStatus('idle');
  }, [dirty, status]);

  const save = async () => {
    if (renamed && (await confirm()) !== 'free') return setStatus('nickname_taken');
    setStatus('saving');
    const res = await saveProfile({ nickname: nick, timeZone: tz, emailOptIn: email });
    if ('error' in res) return setStatus(res.error);
    setSaved({ ...saved, nickname: nick, timeZone: tz, emailOptIn: email });
    setStatus('saved');
  };

  return (
    <form
      className="panel quiet flush loaded"
      onSubmit={(e) => {
        e.preventDefault();
        if (dirty && !blocked) save();
      }}
    >
      <label className="setting field">
        <span className="setting-title">Tree name</span>
        <div className="input-prefix">
          <span aria-hidden="true">/t/</span>
          <input
            className="input"
            value={nick}
            autoCapitalize="none"
            autoComplete="username"
            spellCheck={false}
            maxLength={20}
            aria-invalid={Boolean(check && !check.ok && avail !== 'checking')}
            aria-describedby="nick-help"
            onChange={(e) => setNick(cleanNickname(e.target.value))}
          />
        </div>
        <span id="nick-help" className={`help${check && avail !== 'checking' ? (check.ok ? ' ok' : ' bad') : ''}`} aria-live="polite">
          {check ? (check.ok ? `${check.message}. Your old link /t/${saved.nickname} will stop working.` : check.message) : 'Friends use it to find your tree.'}
        </span>
      </label>

      <label className="setting field">
        <span className="setting-title">Time zone</span>
        <select className="input" value={tz} disabled={locked} onChange={(e) => setTz(e.target.value)}>
          {zones.map((z) => <option key={z} value={z}>{z.replace(/_/g, ' ')}</option>)}
        </select>
        <span className="help">
          {locked
            ? 'Locked during Advent, so every run counts for the right day.'
            : 'Your doors close at 23:59 and your letters open at midnight on December 25 here.'}
          {!locked && tz !== browserZone() && (
            <> <button type="button" className="ask-link" onClick={() => setTz(browserZone())}>Use {browserZone().replace(/_/g, ' ')}</button></>
          )}
        </span>
      </label>

      <label className="setting row" style={{ gap: 12, cursor: 'pointer' }}>
        <span className="grow">
          <span className="setting-title" style={{ display: 'block' }}>Emails</span>
          <span className="setting-help" style={{ display: 'block' }}>Launch day and Christmas morning. No spam.</span>
        </span>
        <input type="checkbox" className="switch" checked={email} onChange={(e) => setEmail(e.target.checked)} />
      </label>

      <div className="setting">
        <button className="btn block" type="submit" disabled={!dirty || blocked || status === 'saving'} aria-busy={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : status === 'saved' && !dirty ? 'Saved' : 'Save changes'}
        </button>
        {status !== 'idle' && status !== 'saving' && status !== 'saved' && (
          <p className="tiny center mt8" style={{ color: '#ff9aa8' }} role="alert">{ERROR[status]}</p>
        )}
      </div>
    </form>
  );
}
