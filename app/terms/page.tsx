import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

export const metadata: Metadata = { title: 'Terms' };

/** Plain-language terms. Section 9.2 of the Strava API Policy asks for the warranty disclaimer. */
const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: 'What this is',
    body: (
      <>
        Advent of Running is a free, non-commercial December running challenge made by Sujin. By using
        it you agree to these terms and to the <Link href="/privacy" className="textlink">privacy notes</Link>.
        You must be at least 16, or have a parent&apos;s permission.
      </>
    ),
  },
  {
    title: 'Your account',
    body: (
      <>
        You sign in with Strava, and your use of Strava stays under Strava&apos;s own terms. Only count
        runs you really did. You can delete your tree at any time on Me.
      </>
    ),
  },
  {
    title: 'Be kind',
    body: (
      <>
        Messages you hang on friends&apos; trees are yours: keep them friendly, and don&apos;t post anything
        hurtful, illegal or someone else&apos;s private information. We may hide messages or remove
        trees that break this.
      </>
    ),
  },
  {
    title: 'No guarantees',
    body: (
      <>
        Advent of Running is provided &ldquo;as is&rdquo;, without warranties of any kind. This includes, on
        behalf of the third-party services it uses (such as Strava, Vercel and Supabase), all
        warranties of merchantability, fitness for a particular purpose and non-infringement. Neither
        we nor those third-party services are liable for any indirect, incidental, special,
        consequential or punitive damages, as far as the law allows. Runs and ornaments may sync late,
        and the app may change or stop.
      </>
    ),
  },
  {
    title: 'Contact',
    body: (
      <>
        Questions? Email <a href="mailto:hello@ayop.run" style={{ fontWeight: 800 }}>hello@ayop.run</a>.
      </>
    ),
  },
];

export default function Terms() {
  return (
    <main className="screen no-nav">
      <PageHeader back="/" title="Terms" />
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
      <p className="center tiny muted mt12">Last updated November 3, 2026</p>
    </main>
  );
}
