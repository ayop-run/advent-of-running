'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { DEMO_POUCH, hangOrnament, type HangError } from '@/lib/data';
import { BASIC, BY_ID, HINTS, TIER_LABEL, type Hint } from '@/lib/ornaments';

const MAX = 200;

const HANG_ERROR: Record<HangError, string> = {
  tree_not_found: "This tree doesn't exist yet.",
  sign_in_required: 'This runner only accepts ornaments from signed-in runners.',
  hanging_closed: 'Hanging closed on December 24.',
  unknown: "Couldn't hang your ornament. Please try again.",
};

export default function HangForm() {
  const { nickname } = useParams<{ nickname: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const preset = params.get('o');
  const earned = preset && BY_ID[preset] ? Array.from(new Set([preset, ...DEMO_POUCH])) : DEMO_POUCH;

  const [pick, setPick] = useState<string>(preset && BY_ID[preset] ? preset : BASIC[0].id);
  const [message, setMessage] = useState('');
  const [hint, setHint] = useState<Hint>('Cheer');
  const [from, setFrom] = useState('');
  const [email, setEmail] = useState('');
  const [tried, setTried] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState<HangError | null>(null);
  const name = nickname.charAt(0).toUpperCase() + nickname.slice(1);
  const valid = message.trim().length > 0 && from.trim().length > 0;
  const chosen = BY_ID[pick];

  return (
    <main className="screen no-nav">
      <div className="topbar">
        <Link href={`/t/${nickname}`} className="textlink">Back</Link>
        <span className="small muted">for {name}</span>
      </div>

      <div className="row">
        <img className="px" src={chosen.img} alt="" width={72} height={72} style={{ flexShrink: 0 }} />
        <div>
          <h1 className="title">Hang an ornament</h1>
          <p className="small soft">{chosen.name}, {TIER_LABEL[chosen.tier].toLowerCase()}</p>
        </div>
      </div>

      <form
        className="stack mt24"
        style={{ gap: 22 }}
        onSubmit={async (e) => {
          e.preventDefault();
          setTried(true);
          if (!valid || sending) return;
          setSending(true);
          setFailed(null);
          const res = await hangOrnament(nickname, { ornamentId: pick, from: from.trim(), hint, message: message.trim(), email: email.trim() });
          if ('error' in res) {
            setFailed(res.error);
            setSending(false);
            return;
          }
          router.push(`/t/${nickname}/done?id=${res.id}`);
        }}
      >
        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ padding: 0, marginBottom: 8 }}>Earned by your runs</legend>
          <div className="picker">
            {earned.map((id) => (
              <button key={id} type="button" className="pick" aria-pressed={pick === id} onClick={() => setPick(id)}>
                <img className="px" src={BY_ID[id].img} alt="" />
                <span className={`tier-${BY_ID[id].tier}`}>{BY_ID[id].name.replace('Advent Runner: ', '')}</span>
              </button>
            ))}
          </div>
          <span className="help">Demo pouch. Guests see free ornaments only.</span>
        </fieldset>

        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ padding: 0, marginBottom: 8 }}>Free ornaments</legend>
          <div className="picker">
            {BASIC.map((o) => (
              <button key={o.id} type="button" className="pick" aria-pressed={pick === o.id} onClick={() => setPick(o.id)}>
                <img className="px" src={o.img} alt="" />
                <span>{o.name}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <label className="field">
          Your message
          <textarea
            className="textarea"
            maxLength={MAX}
            placeholder="See you at the Sunday long run!"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            aria-invalid={tried && !message.trim()}
          />
          <span className="help" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{tried && !message.trim() ? 'Write a message to hang your ornament.' : `${name} reads it on December 25.`}</span>
            <span>{message.length}/{MAX}</span>
          </span>
        </label>

        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ padding: 0, marginBottom: 8 }}>A hint they can see now</legend>
          <div className="row wrap" style={{ gap: 8 }}>
            {HINTS.map((x) => (
              <button key={x} type="button" className="pill" aria-pressed={hint === x} onClick={() => setHint(x)}>{x}</button>
            ))}
          </div>
        </fieldset>

        <label className="field">
          Your name
          <input className="input" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Shown on the ornament" maxLength={30} aria-invalid={tried && !from.trim()} />
          {tried && !from.trim() && <span className="help">Add your name so {name} knows who it&apos;s from.</span>}
        </label>

        <label className="field">
          Email, if you want to know when it&apos;s read
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>

        <div className="panel quiet tiny muted center">Bot check goes here (Cloudflare Turnstile, phase 2)</div>

        <div className="sticky-cta">
          {failed && <p className="center small" style={{ marginBottom: 8 }} role="alert">{HANG_ERROR[failed]}</p>}
          <button className="btn block" type="submit" disabled={sending}>{sending ? 'Hanging…' : <>Hang it on {name}&apos;s tree</>}</button>
          <p className="center tiny muted mt8">Messages are checked for spam. Hanging closes December 24 at 23:59.</p>
        </div>
      </form>
    </main>
  );
}
