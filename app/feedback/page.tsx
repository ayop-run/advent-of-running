'use client';

import Link from 'next/link';
import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Sprite from '@/components/Sprite';

const MAX = 1000;

/** Beta feedback: one box, one button. */
export default function Feedback() {
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const send = async () => {
    setState('sending');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, website }),
      });
      setState(res.ok ? 'sent' : 'error');
    } catch {
      setState('error');
    }
  };

  return (
    <main className="screen no-nav">
      <PageHeader back="/me" title="Feedback" />

      {state === 'sent' ? (
        <section className="panel quiet center loaded">
          <Sprite id="gift-box" px={4} style={{ margin: '0 auto' }} />
          <h2 className="h2 mt12">Thank you!</h2>
          <p className="small soft mt8">Every note helps make Advent of Running better.</p>
          <Link href="/me" className="btn block mt24">Done</Link>
        </section>
      ) : (
        <form
          className="stack"
          style={{ gap: 12 }}
          onSubmit={(e) => {
            e.preventDefault();
            if (message.trim() && state !== 'sending') send();
          }}
        >
          <p className="small soft">This is a beta. What&apos;s confusing, broken or missing? Anything helps.</p>
          <label className="field">
            <span className="sr-only">Your feedback</span>
            <textarea
              className="textarea"
              value={message}
              maxLength={MAX}
              autoFocus
              placeholder="I wish…"
              onChange={(e) => {
                setMessage(e.target.value);
                if (state === 'error') setState('idle');
              }}
            />
            <span className="help" style={{ textAlign: 'right' }}>{message.length}/{MAX}</span>
          </label>
          {/* bots fill this in; people never see it */}
          <input className="sr-only" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
          {state === 'error' && <p className="small" role="alert" style={{ color: '#ff9aa8' }}>Couldn&apos;t send. Please try again.</p>}
          <button className="btn block" type="submit" disabled={!message.trim() || state === 'sending'} aria-busy={state === 'sending'}>
            {state === 'sending' ? 'Sending…' : 'Send feedback'}
          </button>
        </form>
      )}
    </main>
  );
}
