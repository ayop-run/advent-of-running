/** Runners without a photo get their initial on a colour picked from their name. */
const AVATAR_COLORS = ['#e8546a', '#3fb57a', '#8fd3ff', '#ffc94a', '#c38bff', '#ff9a5c'];

export const avatarColor = (name: string) => AVATAR_COLORS[[...name].reduce((n, ch) => n + ch.charCodeAt(0), 0) % AVATAR_COLORS.length];

/** The photo from this site (Strava's host can't be drawn on a canvas), or null without one. */
export const avatarSrc = (nickname: string, avatarUrl?: string | null) => (avatarUrl ? `/api/avatar/${encodeURIComponent(nickname)}` : null);
