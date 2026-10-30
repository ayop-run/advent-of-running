import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import { PoweredByStrava } from '@/components/Strava';

export const metadata: Metadata = { title: 'Privacy' };

/** Plain-language privacy notes. Keep in step with what the app stores (supabase/, lib/server). */
const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: 'Who is behind this',
    body: (
      <>
        Advent of Running is made by Sujin. Questions about your data? Send a message on Instagram:{' '}
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
        in Advent, including private ones, but keep only a daily total: kilometres, how many runs and
        the longest one. Routes, maps, times, pace, heart rate and photos stay on Strava.
      </>
    ),
  },
  {
    title: 'What you add',
    body: (
      <>
        Your tree name, your time zone and whether you want emails. When you hang an ornament on a
        friend&apos;s tree, we store the ornament, the name you sign with, a hint and your message. Who
        you follow is stored too.
      </>
    ),
  },
  {
    title: 'What others see',
    body: (
      <>
        Your tree is public: anyone with the link sees your name, photo and the ornaments on it, with
        each sender shown only as an initial. Runners can find you by name in search. Messages stay
        sealed: only the tree&apos;s owner can read them, from midnight on December 25. Your runs,
        distances and calendar are only ever shown to you.
      </>
    ),
  },
  {
    title: 'Emails',
    body: (
      <>
        If you leave your email on the launch page, we use it once to tell you Advent of Running is
        open. If you switch on emails in Settings, we only write about launch day and Christmas
        morning. No newsletters, no spam.
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
        In a Supabase database. The app is hosted on Vercel. Your data is never sold or passed on to
        anyone. Strava may collect data about how this app uses the Strava API.
      </>
    ),
  },
  {
    title: 'Deleting your data',
    body: (
      <>
        &ldquo;Delete my tree&rdquo; on Me disconnects Strava and immediately deletes your tree, the
        ornaments and letters on it, your calendar and your synced runs. Ornaments you hung on
        friends&apos; trees stay there as gifts, signed with the name you chose. To have one of those
        removed too, send a message on Instagram.
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
      <p className="center tiny muted mt12">Last updated October 30, 2026</p>
    </main>
  );
}
