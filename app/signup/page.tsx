'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { ChevronIcon } from '@/components/Icons';
import PageHeader from '@/components/PageHeader';
import { StravaLogin } from '@/components/Strava';
import Sprite from '@/components/Sprite';
import { getMe, saveProfile, stravaLoginUrl, type Me, type ProfileError } from '@/lib/me';
import { checkNickname, cleanNickname } from '@/lib/nickname';
import { AVAILABILITY, useAvailability } from '@/lib/useNickname';

const PROFILE_ERROR: Record<ProfileError, string> = {
  nickname_taken: 'That tree name was just taken. Try another.',
  invalid: 'Check your tree name.',
  timezone_locked: 'Your time zone can’t change during Advent.',
  signed_out: 'Your Strava login expired. Please connect again.',
  unknown: 'Couldn’t save. Please try again.',
};

const STEPS = ['Tree name', 'Strava', 'Finish'] as const;

export default function SignUp() {
  return (
    <Suspense>
      <SignUpInner />
    </Suspense>
  );
}

function SignUpInner() {
  const router = useRouter();
  // Strava sends new runners back to the last step (?step=finish)
  const finishing = useSearchParams().get('step') === 'finish';
  const [step, setStep] = useState(finishing ? 2 : 0);
  const [nick, setNick] = useState('');
  const [touched, setTouched] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState<ProfileError | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [tz, setTz] = useState('');
  const nameInput = useRef<HTMLInputElement>(null);

  const [host, setHost] = useState('advent.ayop.run');
  useEffect(() => {
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setHost(window.location.host);
  }, []);
  useEffect(() => {
    if (!finishing) return;
    getMe().then((runner) => {
      if (!runner) return setStep(0);
      if (runner.onboarded) return router.replace('/tree');
      setMe(runner);
      // the name picked in step 1, or a free one based on the Strava name if it was taken
      setNick(runner.nickname);
    });
  }, [finishing, router]);

  const format = checkNickname(nick);
  const { avail, confirm } = useAvailability(nick, format.ok);
  const check = avail ? AVAILABILITY[avail](nick) : format;
  const showCheck = touched || nick.length >= 3;
  const checking = avail === 'checking';
  // a bad or taken name can't go on; a failed check can, so Continue retries it
  const invalid = !format.ok || avail === 'taken';

  const connectStrava = () => {
    setConnecting(true);
    window.location.href = stravaLoginUrl({ nick, tz });
  };

  return (
    <main className="screen no-nav">
      <PageHeader
        title="Sign up"
        start={
          step === 0 ? (
            <Link href="/" className="icon-btn" aria-label="Back" title="Back"><ChevronIcon dir="left" /></Link>
          ) : (
            <button type="button" className="icon-btn" aria-label="Back" title="Back" onClick={() => setStep(step - 1)}>
              <ChevronIcon dir="left" />
            </button>
          )
        }
      />

      <ol className="stepper" aria-label={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}>
        {STEPS.map((s, i) => (
          <li key={s} className={i < step ? 'done' : i === step ? 'now' : ''} aria-current={i === step ? 'step' : undefined}>
            <i />
            <span>{s}</span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <form
          className="stack mt24 fade-in"
          style={{ gap: 20 }}
          onSubmit={async (e) => {
            e.preventDefault();
            setTouched(true);
            if (!format.ok) return nameInput.current?.focus();
            if ((await confirm()) !== 'free') return nameInput.current?.focus();
            setStep(1);
          }}
        >
          <div className="row">
            <Sprite id="star-gold" px={4} style={{ flexShrink: 0 }} />
            <div>
              <h2 className="h2">Name your tree</h2>
              <p className="small soft mt4">This is your username. Friends use it to find your tree.</p>
            </div>
          </div>

          <label className="field">
            Tree name
            <div className="input-prefix">
              <span aria-hidden="true">/t/</span>
              <input
                ref={nameInput}
                className="input"
                value={nick}
                autoFocus
                autoCapitalize="none"
                autoComplete="username"
                spellCheck={false}
                placeholder="yourname"
                maxLength={20}
                aria-invalid={showCheck && !check.ok && !checking}
                aria-describedby="nick-help"
                onChange={(e) => setNick(cleanNickname(e.target.value))}
                onBlur={() => setTouched(true)}
              />
            </div>
            <span id="nick-help" className={`help${showCheck && !checking ? (check.ok ? ' ok' : ' bad') : ''}`} aria-live="polite">
              {showCheck ? check.message : 'Lowercase letters, numbers and dashes. 3–20 characters.'}
            </span>
          </label>

          <div className="panel quiet row link-row">
            <Sprite id="gift-box" px={2} style={{ flexShrink: 0 }} />
            <p className="small soft">
              Your link: <strong style={{ color: 'var(--snow)' }}>{host}/t/{nick || 'yourname'}</strong>
            </p>
          </div>

          <button className="btn block" type="submit" aria-busy={checking} disabled={invalid}>Continue</button>
          <p className="center small soft">
            Already have a tree? <a href={stravaLoginUrl()} style={{ fontWeight: 800 }}>Log in with Strava</a>
          </p>
        </form>
      )}

      {step === 1 && (
        <div className="stack mt24 fade-in" style={{ gap: 16 }}>
          <div className="row">
            <Sprite id="running-shoe" px={4} style={{ flexShrink: 0 }} />
            <div>
              <h2 className="h2">Connect Strava</h2>
              <p className="small soft mt4">Your runs open the Advent doors, so we need to see them.</p>
            </div>
          </div>

          <ul className="panel quiet flush" style={{ listStyle: 'none', margin: 0 }}>
            {[
              ['We read', 'Your runs from December 1 to 24: distance and date.'],
              ['Friends see', 'Only the ornaments on your tree. Never your runs.'],
              ['You can leave', 'Delete your tree any time from Me. It removes everything.'],
            ].map(([k, v]) => (
              <li key={k} className="list-row small" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '12px 0' }}>
                <span style={{ fontWeight: 800 }}>{k}</span>
                <span className="soft" style={{ fontWeight: 500 }}>{v}</span>
              </li>
            ))}
          </ul>

          <StravaLogin onClick={connectStrava} busy={connecting} />
        </div>
      )}

      {step === 2 && (
        <form
          className="stack mt24 fade-in"
          style={{ gap: 20 }}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!me || saving) return;
            if (!format.ok) return setFailed('invalid');
            setSaving(true);
            setFailed(null);
            const free = await confirm();
            if (free !== 'free') {
              setFailed(free === 'taken' ? 'nickname_taken' : 'unknown');
              setSaving(false);
              return;
            }
            const res = await saveProfile({ nickname: nick, timeZone: tz || me.timeZone, emailOptIn: me.emailOptIn });
            if ('error' in res) {
              setFailed(res.error);
              setSaving(false);
              return;
            }
            router.push('/tree');
          }}
        >
          <div className="row">
            <Sprite id="bauble-snow" px={4} style={{ flexShrink: 0 }} />
            <div>
              <h2 className="h2">Almost there</h2>
              <p className="mt4"><span className="badge">Strava connected</span></p>
            </div>
          </div>

          <label className="field">
            Tree name
            <div className="input-prefix">
              <span aria-hidden="true">/t/</span>
              <input
                className="input"
                value={nick}
                autoCapitalize="none"
                spellCheck={false}
                maxLength={20}
                aria-invalid={!check.ok && !checking}
                onChange={(e) => {
                  setNick(cleanNickname(e.target.value));
                  setFailed(null);
                }}
              />
            </div>
            <span className={`help${checking ? '' : check.ok ? ' ok' : ' bad'}`} aria-live="polite">
              {check.ok ? 'Free. Friends use it to find your tree.' : check.message}
            </span>
          </label>

          <div className="field">
            Time zone
            <div className="panel quiet row between" style={{ padding: 14 }}>
              <span>{tz || 'Detecting…'}</span>
            </div>
            <span className="help">Your messages open at midnight on December 25 in this time zone.</span>
          </div>

          {failed && <p className="center small" role="alert">{PROFILE_ERROR[failed]}</p>}
          <button className="btn block" type="submit" aria-busy={saving} disabled={!me || saving || invalid}>{saving ? 'Creating…' : 'Create my tree'}</button>
        </form>
      )}
    </main>
  );
}
