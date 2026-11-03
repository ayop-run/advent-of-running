import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { PoweredByStrava } from '@/components/Strava';

export const metadata: Metadata = { title: 'Privacy' };

/** Plain-language privacy notes. Keep in step with what the app stores (supabase/, lib/server). */
const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: 'Who is behind this',
    body: (
      <>
        Advent of Running is made by Sujin, who decides how your data is used here (the &ldquo;controller&rdquo;).
        Questions about your data, or a request to see, correct or delete it? Email{' '}
        <a href="mailto:hello@ayop.run" style={{ fontWeight: 800 }}>hello@ayop.run</a> or send a message on Instagram:{' '}
        <a href="https://www.instagram.com/sujinleeme/" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 800 }}>@sujinleeme</a>.
      </>
    ),
  },
  {
    title: 'What comes from Strava',
    body: (
      <>
        When you log in with Strava, we keep your Strava athlete number, your first name, your profile
        photo link and the access tokens Strava gives this app. To open doors we read your activities
        in Advent, including private ones, but keep only a daily summary: kilometres, how many runs, the
        longest one and its title, and how many were group runs (never who you ran with). Only you see
        it, and we delete it 7 days after your last sync (your next visit syncs it again). Routes,
        maps, times, pace, heart rate and photos stay on Strava.
      </>
    ),
  },
  {
    title: 'Why we may use it',
    body: (
      <>
        Your consent, which you give when you connect Strava. You can take it back at any time by
        deleting your tree on Me or disconnecting the app in your Strava settings. We use your data
        only to run Advent of Running: open your doors, show your tree and deliver your letters.
      </>
    ),
  },
  {
    title: 'What you add',
    body: (
      <>
        Your tree name, the name shown on your tree and your time zone. When you hang an ornament on a
        friend&apos;s tree, we store the ornament, the name you sign with, a hint and your message. Who
        you follow is stored too.
      </>
    ),
  },
  {
    title: 'What others see',
    body: (
      <>
        Your tree is public: anyone with the link sees the name you chose, your initial and the
        ornaments on it, with each sender shown only as an initial. Your Strava name and photo are
        never shown to anyone but you. Runners can find you by name in search. Messages stay
        sealed: only the tree&apos;s owner can read them, from midnight on December 25. Your runs,
        distances and calendar are only ever shown to you.
      </>
    ),
  },
  {
    title: 'How long we keep it',
    body: (
      <>
        Your synced runs: 7 days after your last sync. Your tree, ornaments and letters: until you
        delete your tree, and at the latest until the end of January after the season. If the app
        stops using Strava, we delete everything that came from Strava.
      </>
    ),
  },
  {
    title: 'Your rights',
    body: (
      <>
        You can see your data (your calendar shows what we keep, and we send a copy on request),
        have it corrected or deleted, take back your consent, and object to how we use it. Email{' '}
        <a href="mailto:hello@ayop.run" style={{ fontWeight: 800 }}>hello@ayop.run</a>; we answer within 30
        days and confirm every deletion. You can also complain to your data protection authority.
      </>
    ),
  },
  {
    title: 'Emails',
    body: (
      <>
        If you leave your email on the launch page, we use it once to tell you Advent of Running is
        open. That&apos;s it: no newsletters, no spam.
      </>
    ),
  },
  {
    title: 'Cookies and your browser',
    body: (
      <>
        One cookie keeps you signed in, and two short-lived ones are used while you log in with Strava.
        Your browser also remembers small things like the music setting. No ads, no tracking, no
        analytics.
      </>
    ),
  },
  {
    title: 'Where it lives',
    body: (
      <>
        In a Supabase database in Frankfurt, Germany (EU). The app is hosted on Vercel, which may
        handle requests outside the EU, including the US, under the EU&apos;s standard contractual
        clauses. Supabase and Vercel are the only services that process your data for us. Your data is
        never sold or passed on to anyone else, and never used to train AI. Strava may monitor and
        collect data about how this app uses the Strava API.
      </>
    ),
  },
  {
    title: 'Deleting your data',
    body: (
      <>
        &ldquo;Delete my tree&rdquo; on Me disconnects Strava and immediately deletes your tree, the
        ornaments and letters on it, your calendar and your synced runs. Disconnecting the app in
        your Strava settings does the same, automatically. Ornaments you hung on
        friends&apos; trees stay there as gifts, signed with the name you chose. To have one of those
        removed too, email <a href="mailto:hello@ayop.run" style={{ fontWeight: 800 }}>hello@ayop.run</a>.
        You see a confirmation once everything is deleted.
      </>
    ),
  },
];

export default function Privacy() {
  return (
    <main className="screen no-nav">
      <PageHeader back="/" title="Privacy" />

      <div className="panel quiet flush">
        {SECTIONS.map((s) => (
          <section key={s.title} className="privacy-row">
            <h2 className="setting-title">{s.title}</h2>
            <p className="small soft mt4">{s.body}</p>
          </section>
        ))}
      </div>

      <p className="center tiny muted section">
        This app uses the Strava API but is not developed, endorsed or certified by Strava.
      </p>
      <p className="center mt12"><PoweredByStrava /></p>
      <p className="center tiny muted mt12">
        Last updated November 3, 2026 · <Link href="/terms" className="textlink">Terms</Link>
      </p>
    </main>
  );
}
