/**
 * The current data notice. Bump it (and add what changed to DataNotice.tsx) whenever the app
 * starts keeping a new kind of Strava data: every runner sees the notice again once.
 */
export const DATA_NOTICE = 1;

/** The name friends see on your tree: 1–30 characters, chosen by the runner. */
export const validDisplayName = (name: unknown): name is string =>
  typeof name === 'string' && name.trim().length >= 1 && name.trim().length <= 30;
