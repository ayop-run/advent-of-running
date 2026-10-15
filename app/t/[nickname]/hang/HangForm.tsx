'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { DEMO_POUCH, hangOrnament } from '@/lib/data';
import { BASIC, BY_ID, HINTS, type Hint } from '@/lib/ornaments';
import Sprite from '@/components/Sprite';
import SpriteFx from '@/components/SpriteFx';
import { useBump } from '@/components/useBump';

const MAX = 200;

export default function HangForm() {
  const { nickname } = useParams<{ nickname: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const preset = params.get('o');
  // a free ornament picked elsewhere stays under "Free ornaments", not "Earned"
  const earned = preset && BY_ID[preset] && BY_ID[preset].tier !== 'basic' ? Array.from(new Set([preset, ...DEMO_POUCH])) : DEMO_POUCH;

  const [pick, setPick] = useState<string>(preset && BY_ID[preset] ? preset : BASIC[0].id);
  const [message, setMessage] = useState('');
  const [hint, setHint] = useState<Hint>('Cheer');
  const [from, setFrom] = useState('');
  const [email, setEmail] = useState('');
  const [tried, setTried] = useState(false);
  const name = nickname.charAt(0).toUpperCase() + nickname.slice(1);
  const valid = message.trim().length > 0 && from.trim().length > 0;
  const chosen = BY_ID[pick];
  const { bump, of } = useBump();
  const choose = (id: string) => {
    setPick(id);
    bump(id);
  };
  const art = (id: string) => {
    const b = of(id, id);
    return (
      <span key={b.k} className="bump">
        <span className={b.anim}><Sprite id={id} px={2} /></span>
        {b.fx && <SpriteFx anim={b.fx} px={2} />}
      </span>
    );
  };

  return (
    <main className="screen no-nav">
      <div className="topbar">
        <Link href={`/t/${nickname}`} className="textlink">Back</Link>
        <span className="small muted">for {name}</span>
      </div>

      <div className="row">
        <span key={of(chosen.id, chosen.id).k} className="bump" style={{ flexShrink: 0 }}>
          <span className={of(chosen.id, chosen.id).anim}><Sprite id={chosen.id} px={2} /></span>
        </span>
        <div>
          <h1 className="title">Hang an ornament</h1>
          <p className="small soft">{chosen.name}</p>
        </div>
      </div>

      <form
        className="stack mt24"
        style={{ gap: 22 }}
        onSubmit={(e) => {
          e.preventDefault();
          setTried(true);
          if (!valid) return;
          const item = hangOrnament(nickname, { ornamentId: pick, from: from.trim(), hint, message: message.trim() });
          router.push(`/t/${nickname}/done?id=${item.id}`);
        }}
      >
        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ padding: 0, marginBottom: 8 }}>Earned by your runs</legend>
          <div className="picker">
            {earned.map((id) => (
              <button key={id} type="button" className="pick" aria-pressed={pick === id} onClick={() => choose(id)}>
                {art(id)}
                <span>{BY_ID[id].name.replace('Advent Runner: ', '')}</span>
              </button>
            ))}
          </div>
          <span className="help">Demo pouch. Guests see free ornaments only.</span>
        </fieldset>

        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ padding: 0, marginBottom: 8 }}>Free ornaments</legend>
          <div className="picker">
            {BASIC.map((o) => (
              <button key={o.id} type="button" className="pick" aria-pressed={pick === o.id} onClick={() => choose(o.id)}>
                {art(o.id)}
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
          <button className="btn block" type="submit">Hang it on {name}&apos;s tree</button>
          <p className="center tiny muted mt8">Messages are checked for spam. Hanging closes December 24 at 23:59.</p>
        </div>
      </form>
    </main>
  );
}
