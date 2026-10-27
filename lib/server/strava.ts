import { db } from './db';

const BASE = 'https://www.strava.com';

/** activity:read_all so private runs count too. Activity data is never shown to other users. */
export const SCOPE = 'read,activity:read_all';

export function authorizeUrl(redirectUri: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: SCOPE,
    state,
  });
  return `${BASE}/oauth/authorize?${params}`;
}

export type StravaAthlete = { id: number; firstname: string; lastname: string; username: string | null; profile: string };

type TokenResponse = { access_token: string; refresh_token: string; expires_at: number; athlete?: StravaAthlete };

async function tokenRequest(params: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(`${BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID!,
      client_secret: process.env.STRAVA_CLIENT_SECRET!,
      ...params,
    }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Strava token request failed: ${res.status}`);
  return res.json();
}

export const exchangeCode = (code: string) => tokenRequest({ code, grant_type: 'authorization_code' });

export const tokenColumns = (t: TokenResponse) => ({
  strava_access_token: t.access_token,
  strava_refresh_token: t.refresh_token,
  strava_expires_at: new Date(t.expires_at * 1000).toISOString(),
});

/** A valid access token for the runner, refreshed (and saved) if it expires within 5 minutes. */
export async function accessToken(runnerId: string): Promise<string | null> {
  const { data } = await db()
    .from('runners')
    .select('strava_access_token, strava_refresh_token, strava_expires_at')
    .eq('id', runnerId)
    .single();
  if (!data?.strava_refresh_token) return null;
  if (data.strava_access_token && new Date(data.strava_expires_at).getTime() > Date.now() + 5 * 60_000) {
    return data.strava_access_token;
  }
  const t = await tokenRequest({ refresh_token: data.strava_refresh_token, grant_type: 'refresh_token' });
  await db().from('runners').update(tokenColumns(t)).eq('id', runnerId);
  return t.access_token;
}

/** Revokes the app's access on Strava. */
export async function deauthorize(token: string) {
  await fetch(`${BASE}/oauth/deauthorize`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
}

export type StravaActivity = {
  id: number;
  sport_type?: string;
  type: string;
  manual: boolean;
  /** Meters. */
  distance: number;
  /** Local time of the activity, e.g. "2026-12-14T07:30:00Z" (the Z is meaningless here). */
  start_date_local: string;
};

const COUNTED = ['Run', 'TrailRun', 'VirtualRun'];

/** Outdoor, trail and treadmill runs; manual entries don't count. */
export const isCountedRun = (a: StravaActivity) => COUNTED.includes(a.sport_type ?? a.type) && !a.manual;

/** All of the athlete's activities between two Unix timestamps. */
export async function fetchActivities(token: string, after: number, before: number): Promise<StravaActivity[]> {
  const all: StravaActivity[] = [];
  for (let page = 1; page <= 5; page++) {
    const params = new URLSearchParams({ after: String(after), before: String(before), per_page: '200', page: String(page) });
    const res = await fetch(`${BASE}/api/v3/athlete/activities?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Strava activities request failed: ${res.status}`);
    const batch: StravaActivity[] = await res.json();
    all.push(...batch);
    if (batch.length < 200) break;
  }
  return all;
}
