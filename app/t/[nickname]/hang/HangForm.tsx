'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import BackLink from '@/components/BackLink';
import { MusicButton } from '@/components/MusicToggle';
import Sprite from '@/components/Sprite';
import SpriteFx from '@/components/SpriteFx';
import { useBump } from '@/components/useBump';
import Link from 'next/link';
import { editMyOrnament, hangOrnament, myOrnamentOn, type HangError, type Hung } from '@/lib/data';
import { getMe } from '@/lib/me';
import { BASIC, BY_ID, HINTS, type Hint } from '@/lib/ornaments';

const MAX = 200;
const IDEAS = ['See you at the Sunday long run!', 'So proud of every mile you ran.', 'Thanks for all the runs together.'];
const HINT_NOTE: Record<Hint, string> = {
  Cheer: 'Something to keep them going',
  Thanks: 'A thank-you',
  Funny: 'Something to make them laugh',
  Love: 'Something warm',
};

const short = (name: string) => name.replace('Advent Runner: ', '');

const HANG_ERROR: Record<HangError, string> = {
  tree_not_found: 'This tree doesn’t exist.',
  sign_in_required: 'Only signed-in runners can hang ornaments on this tree.',
  hanging_closed: 'Hanging closed on December 24.',
  not_earned: 'You haven’t unwrapped this ornament. Pick a free one, or run to earn it.',
  not_yours: 'You can only edit the ornament you hung.',
  invalid: 'Please check your message and name.',
  unknown: 'That didn’t work. Please try again.',
};

export default function HangForm() {
  const { nickname } = useParams<{ nickname: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const preset = params.get('o');
  const wantsEdit = params.get('edit') === '1';

  const [pick, setPick] = useState<string>(preset && BY_ID[preset] ? preset : BASIC[0].id);
  const [message, setMessage] = useState('');
  const [hint, setHint] = useState<Hint>('Cheer');
  const [from, setFrom] = useState('');
  const [tried, setTried] = useState(false);
  const [already, setAlready] = useState<Hung | null>(null);
  const [ready, setReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState<HangError | null>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const fromRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let live = true;
    Promise.all([myOrnamentOn(nickname), getMe()]).then(([mine, me]) => {
      if (!live) return;
      setAlready(mine);
      if (mine && wantsEdit) {
        // editing: start from what's already hanging
        setPick(mine.ornamentId);
        setMessage(mine.message);
        setHint(mine.hint);
        setFrom(mine.from);
      } else if (me) {
        // signed-in runners sign with their name; guests type theirs
        setFrom(me.displayName);
      }
      setReady(true);
    });
    return () => {
      live = false;
    };
  }, [nickname, wantsEdit]);

  const editing = Boolean(already && wantsEdit);
  // an earned ornament is fixed once given; free ones can be swapped while editing
  const lockedEarned = editing && already && BY_ID[already.ornamentId]?.tier !== 'basic' ? already.ornamentId : null;
  // an ornament you just unwrapped comes first and is preselected; free ones are always there
  const earned = lockedEarned ?? (preset && BY_ID[preset] && BY_ID[preset].tier !== 'basic' ? preset : null);
  const options = lockedEarned ? [lockedEarned] : earned ? [earned, ...BASIC.map((o) => o.id)] : BASIC.map((o) => o.id);

  const name = nickname.charAt(0).toUpperCase() + nickname.slice(1);
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
  const preview = of(pick, pick);

  if (!ready) return <main className="screen no-nav" aria-busy="true" />;

  if (already && !editing) {
    const o = BY_ID[already.ornamentId];
    return (
      <main className="screen no-nav">
        <div className="topbar">
          <BackLink fallback={`/t/${nickname}`} />
          <MusicButton />
        </div>
        <div className="center mt24">
          <div className="showcase"><Sprite id={already.ornamentId} px={4} label={o?.name} /></div>
          <p className="brand-mark mt16">One per tree</p>
          <h1 className="title mt4">You already hung one on {name}&apos;s tree</h1>
          <p className="soft mt8">Your {o ? short(o.name) : 'ornament'} is there, sealed until Christmas. Everyone can hang one ornament on each tree.</p>
        </div>
        <Link href={`/t/${nickname}/hang?edit=1`} className="btn block mt32">Edit my message</Link>
        <Link href={`/t/${nickname}`} className="btn ghost block mt8">See {name}&apos;s tree</Link>
        <Link href="/friends" className="btn ghost block mt8">Find another friend</Link>
      </main>
    );
  }

  return (
    <main className="screen no-nav">
      <div className="topbar">
        <BackLink fallback={`/t/${nickname}`} />
        <MusicButton />
      </div>

      <p className="brand-mark">Advent of Running</p>
      <h1 className="title">{editing ? 'Edit your ornament' : `Hang on ${name}’s tree`}</h1>
      {editing && <p className="small soft mt4">You can change it until December 24 at 23:59.</p>}

      {/* live preview: the ornament and its gift tag, as it will hang */}
      <section className="hang-preview mt16" aria-label="Preview">
        <div className="hang-art">
          <span key={preview.k} className="bump">
            <span className={preview.anim}><Sprite id={pick} px={4} label={chosen.name} /></span>
            {preview.fx && <SpriteFx anim={preview.fx} px={4} />}
          </span>
        </div>
        <div className="gift-tag">
          <p><span className="k">To</span> {name}</p>
          <p><span className="k">From</span> {from.trim() || 'you'}</p>
          <p className="mt4"><span className="tag-chip">Hint: {hint}</span></p>
          <p className="sealed"><Sprite id="lock" px={1} /> Sealed until Dec 25</p>
        </div>
      </section>

      <form
        className="stack mt24"
        style={{ gap: 28 }}
        onSubmit={async (e) => {
          e.preventDefault();
          setTried(true);
          if (!message.trim()) return messageRef.current?.focus();
          if (!from.trim()) return fromRef.current?.focus();
          if (sending) return;
          // Phase 2: Cloudflare Turnstile bot check and a spam filter before saving.
          setSending(true);
          setFailed(null);
          const input = { ornamentId: pick, from: from.trim(), hint, message: message.trim() };
          const res = editing ? await editMyOrnament(nickname, input) : await hangOrnament(nickname, input);
          if ('error' in res) {
            setFailed(res.error);
            setSending(false);
            return;
          }
          router.push(editing ? `/t/${nickname}?saved=1` : `/t/${nickname}/done?id=${res.id}`);
        }}
      >
        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="step-label"><b>1</b> Pick an ornament</legend>
          <div className="picker">
            {options.map((id) => (
              <button key={id} type="button" className="pick" aria-pressed={pick === id} onClick={() => choose(id)}>
                {id === earned && <span className="pick-tag">{lockedEarned ? 'Earned' : 'Today'}</span>}
                {art(id)}
                <span>{short(BY_ID[id].name)}</span>
              </button>
            ))}
          </div>
          {lockedEarned ? (
            <span className="help">You earned this one from a door, so it stays. You can still change the message.</span>
          ) : earned ? (
            <span className="help">“Today” is the ornament you just unwrapped. The rest are free.</span>
          ) : null}
        </fieldset>

        <div className="stack" style={{ gap: 8 }}>
          <label className="field">
            <span className="step-label"><b>2</b> Write a message</span>
            <textarea
              ref={messageRef}
              className="textarea"
              maxLength={MAX}
              placeholder={`Write something for ${name}…`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              aria-invalid={tried && !message.trim()}
            />
            <span className="help" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span className={tried && !message.trim() ? 'bad' : undefined}>
                {tried && !message.trim() ? 'Write a message to hang your ornament.' : `Only ${name} can read it, on December 25.`}
              </span>
              <span className="num">{message.length}/{MAX}</span>
            </span>
          </label>
          {!message && (
            <div className="row wrap" style={{ gap: 6 }} aria-label="Message ideas">
              {IDEAS.map((idea) => (
                <button key={idea} type="button" className="idea" onClick={() => { setMessage(idea); messageRef.current?.focus(); }}>{idea}</button>
              ))}
            </div>
          )}
        </div>

        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="step-label"><b>3</b> Add a hint</legend>
          <div className="row wrap" style={{ gap: 8 }}>
            {HINTS.map((x) => (
              <button key={x} type="button" className="pill" aria-pressed={hint === x} onClick={() => setHint(x)}>{x}</button>
            ))}
          </div>
          <span className="help">{HINT_NOTE[hint]}. {name} sees the hint now, but not the message.</span>
        </fieldset>

        <label className="field">
          <span className="step-label"><b>4</b> Sign it</span>
          <input
            ref={fromRef}
            className="input"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Your name"
            maxLength={30}
            autoComplete="nickname"
            aria-invalid={tried && !from.trim()}
          />
          <span className={`help${tried && !from.trim() ? ' bad' : ''}`}>
            {tried && !from.trim() ? `Add your name so ${name} knows who it’s from.` : 'Shown on the ornament.'}
          </span>
        </label>

        <div className="sticky-cta">
          {failed && <p className="center small" role="alert" style={{ marginBottom: 8 }}>{HANG_ERROR[failed]}</p>}
          <button className="btn block" type="submit" aria-busy={sending} disabled={sending}>
            {sending ? 'Hanging…' : editing ? 'Save changes' : `Hang it on ${name}’s tree`}
          </button>
          <p className="center tiny muted mt8">Hanging closes December 24 at 23:59.</p>
        </div>
      </form>
    </main>
  );
}
