/**
 * Logging in is the Strava account: these go straight to Strava, there's no login page.
 * Kept out of lib/me.ts (a client module) so server pages can link here too.
 */

/** Strava login. Sign-up passes the chosen tree name and time zone along. */
export const stravaLoginUrl = (signup?: { nick: string; tz: string }) =>
  signup ? `/api/strava/connect?${new URLSearchParams(signup)}` : '/api/strava/connect';

/** Why a Strava login came back without logging in (`?login_error=` on the landing page). */
export const LOGIN_ERROR: Record<string, string> = {
  denied: 'Strava login was cancelled.',
  scope: 'Please allow access to your activities, so your runs can open doors.',
  expired: 'The login took too long. Please try again.',
  strava: 'Strava didn’t respond. Please try again.',
  db: 'Couldn’t open your tree. Please try again.',
};
