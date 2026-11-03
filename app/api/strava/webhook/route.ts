import { NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { forgetRunner } from '@/lib/server/forget';
import { stillAuthorized } from '@/lib/server/strava';

export const dynamic = 'force-dynamic';

/**
 * Strava's webhook (one subscription per app, created with scripts/strava-webhook.mjs).
 * Staging and production share the Strava app, so the subscription points at production,
 * which passes every event on to STRAVA_WEBHOOK_FORWARD (staging's webhook).
 * GET answers Strava's check when the subscription is created.
 */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const token = process.env.STRAVA_WEBHOOK_TOKEN;
  if (!token || q.get('hub.mode') !== 'subscribe' || q.get('hub.verify_token') !== token) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  return NextResponse.json({ 'hub.challenge': q.get('hub.challenge') });
}

const FORWARDED = 'x-advent-forwarded';

type Event = {
  object_type: 'activity' | 'athlete';
  aspect_type: 'create' | 'update' | 'delete';
  owner_id: number;
  subscription_id: number;
  updates?: Record<string, string>;
};

/**
 * An athlete revoked access on Strava: delete everything about them (Strava API Policy 7.4).
 * An activity was added, edited or deleted: mark the runner for a fresh sync, so the change
 * shows on their next visit and deleted runs never show again. Strava needs a 200 within 2 s.
 */
export async function POST(req: Request) {
  const e = (await req.json().catch(() => null)) as Event | null;
  const forward = process.env.STRAVA_WEBHOOK_FORWARD;
  // an event production already passed on is never passed on again, so a forward URL set by
  // mistake on staging (or pointing at itself) can't start a loop
  if (e && forward && !req.headers.get(FORWARDED)) {
    await fetch(forward, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', [FORWARDED]: '1' },
      body: JSON.stringify(e),
      signal: AbortSignal.timeout(800),
    }).catch(() => null);
  }
  const sub = process.env.STRAVA_WEBHOOK_SUBSCRIPTION_ID;
  if (!e || typeof e.owner_id !== 'number' || (sub && String(e.subscription_id) !== sub)) {
    return NextResponse.json({ ok: true });
  }
  const { data: runner } = await db().from('runners').select('id').eq('strava_athlete_id', e.owner_id).maybeSingle();
  if (!runner) return NextResponse.json({ ok: true });

  if (e.object_type === 'athlete' && e.updates?.authorized === 'false') {
    if (!(await stillAuthorized(runner.id))) await forgetRunner(runner.id);
  } else if (e.object_type === 'activity') {
    await db().from('runners').update({ last_synced_at: null }).eq('id', runner.id);
    // a deleted run disappears right away, before the next sync
    if (e.aspect_type === 'delete') await db().from('daily_progress').delete().eq('runner_id', runner.id);
  }
  return NextResponse.json({ ok: true });
}
