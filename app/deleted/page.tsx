import type { Metadata } from 'next';
import Link from 'next/link';
import Sprite from '@/components/Sprite';

export const metadata: Metadata = { title: 'Deleted' };

/** Shown after "Delete my tree": written confirmation that the deletion is done (Strava API Policy 2.5). */
export default function Deleted() {
  return (
    <main className="screen no-nav">
      <div className="center mt32">
        <div className="showcase"><Sprite id="snowflake" px={4} label="" /></div>
        <h1 className="h1 mt16">Your data was deleted</h1>
        <p className="soft mt8">
          Your tree, its ornaments and letters, your calendar, your synced runs and your Strava
          connection are gone. Ornaments you hung on friends&apos; trees stay as gifts, signed with the
          name you chose.
        </p>
        <p className="small soft mt12">
          Want one of those removed too, or a written confirmation? Email{' '}
          <a href="mailto:hello@ayop.run" style={{ fontWeight: 800 }}>hello@ayop.run</a>.
        </p>
      </div>
      <Link href="/" className="btn block mt32">Back to the start</Link>
    </main>
  );
}
