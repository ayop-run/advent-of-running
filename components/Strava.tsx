/** Strava's official "Powered by Strava" logo (public/strava), unmodified as their brand guidelines require. */

/** Our own pixel button for Strava OAuth: a link, or a button when `onClick` builds the URL. */
export function StravaLogin({ href, onClick, busy }: { href?: string; onClick?: () => void; busy?: boolean }) {
  if (href) return <a href={href} className="btn strava block">Log in with Strava</a>;
  return (
    <button type="button" className="btn strava block" onClick={onClick} aria-busy={busy} disabled={busy}>
      {busy ? 'Connecting…' : 'Log in with Strava'}
    </button>
  );
}

/** "Powered by Strava", small and below our own name, never more prominent. */
export function PoweredByStrava() {
  return <img className="powered-by-strava" src="/strava/powered-by-strava.svg" alt="Powered by Strava" width={138} height={14} />;
}
