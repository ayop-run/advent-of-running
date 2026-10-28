import type { NextRequest } from 'next/server';

/** Canonical site origin. Strava checks redirect_uri against the app's callback domain. */
export function appOrigin(req: NextRequest): string {
  // locally the dev server's port can change; Strava accepts any localhost callback
  if (process.env.NODE_ENV !== 'production') return req.nextUrl.origin;
  const fromEnv = process.env.APP_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (process.env.VERCEL_ENV === 'production' && prod) return `https://${prod}`;
  return req.nextUrl.origin;
}

export const stravaRedirectUri = (req: NextRequest) => `${appOrigin(req)}/api/strava/callback`;
