'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { ChevronIcon } from '@/components/Icons';
import { MusicButton } from '@/components/MusicToggle';
import Sprite from '@/components/Sprite';
import { getMe, nicknameAvailable, saveProfile, stravaLoginUrl, type Me, type ProfileError } from '@/lib/me';
import { checkNickname, cleanNickname, type NicknameCheck } from '@/lib/nickname';

const PROFILE_ERROR: Record<ProfileError, string> = {
  nickname_taken: 'That tree name was just taken. Try another.',
  invalid: 'Check your tree name.',
  signed_out: 'Your Strava login expired. Please connect again.',
  unknown: 'Couldn’t save. Please try again.',
};

const STEPS = ['Tree name', 'Strava', 'Finish'] as const;

type Availability = 'checking' | 'free' | 'taken' | 'error';

/** Checks the tree name against the server as it's typed; `confirm()` waits for a fresh answer. */
function useAvailability(nick: string, formatOk: boolean) {
  const [state, setState] = useState<{ nick: string; avail: Availability } | null>(null);
  const ask = async (name: string) => {
    const free = await nicknameAvailable(name);
    const avail: Availability = free === null ? 'error' : free ? 'free' : 'taken';
    setState((s) => (s?.nick === name ? { nick: name, avail } : s));
    return avail;
  };
  useEffect(() => {
    if (!formatOk) return setState(null);
    setState({ nick, avail: 'checking' });
    const t = setTimeout(() => ask(nick), 350);
    return () => clearTimeout(t);
  }, [nick, formatOk]);
  const avail = state?.nick === nick ? state.avail : formatOk ? 'checking' : null;
  const confirm = () => {
    if (avail === 'free') return Promise.resolve<Availability>('free');
    setState({ nick, avail: 'checking' });
    return ask(nick);
  };
  return { avail, confirm };
}

const AVAILABILITY: Record<Availability, (nick: string) => NicknameCheck> = {
  checking: () => ({ ok: false, message: 'Checking…' }),
  free: () => ({ ok: true, message: 'Looks good, it’s free' }),
  taken: (nick) => ({ ok: false, message: `“${nick}” is taken. Try another.` }),
  error: () => ({ ok: false, message: 'Couldn’t check this name. Please try again.' }),
};

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

  useEffect(() => setTz(Intl.DateTimeFormat().resolvedOptions().timeZone), []);
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
      <div className="topbar">
        {step === 0 ? (
          <Link href="/" className="textlink"><ChevronIcon dir="left" /> Back</Link>
        ) : (
          <button type="button" className="textlink" style={{ background: 'none', border: 0, padding: 0, color: 'var(--gold)' }} onClick={() => setStep(step - 1)}>
            <ChevronIcon dir="left" /> Back
          </button>
        )}
        <MusicButton />
      </div>

      <p className="brand-mark">Advent of Running</p>
      <h1 className="title">Sign up</h1>

      <ol className="stepper mt16" aria-label={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}>
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

          <div className="panel quiet row" style={{ padding: '12px 16px' }}>
            <Sprite id="gift-box" px={2} style={{ flexShrink: 0 }} />
            <p className="small soft">
              Your link: <strong style={{ color: 'var(--snow)' }}>advent-of-running.vercel.app/t/{nick || 'yourname'}</strong>
            </p>
          </div>

          <button className="btn block" type="submit" aria-busy={checking} disabled={invalid}>Continue</button>
          <p className="center small soft">
            Already have a tree? <Link href="/login" style={{ fontWeight: 800 }}>Log in</Link>
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
              ['You can leave', 'Disconnect any time. It deletes everything.'],
            ].map(([k, v]) => (
              <li key={k} className="list-row small" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '12px 0' }}>
                <span style={{ fontWeight: 800 }}>{k}</span>
                <span className="soft" style={{ fontWeight: 500 }}>{v}</span>
              </li>
            ))}
          </ul>

          {/* Phase 2: replace with Strava's official "Connect with Strava" button artwork. */}
          <button className="btn block strava" onClick={connectStrava} aria-busy={connecting}>
            {connecting ? 'Connecting…' : 'Connect with Strava'}
          </button>
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
            const res = await saveProfile({ nickname: nick, timeZone: tz || me.timeZone, hangPolicy: me.hangPolicy, emailOptIn: me.emailOptIn });
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
