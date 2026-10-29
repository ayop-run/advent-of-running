import type { ReactNode } from 'react';
import BackLink from '@/components/BackLink';
import { MusicButton } from '@/components/MusicToggle';

/**
 * The one header every app page uses: an optional back arrow, the yellow brand line over the
 * page title, then the page's own buttons and the music toggle. `start` replaces the back
 * arrow (e.g. a custom back button); `title` can be a node when the title needs more than text.
 */
export default function PageHeader({ title, back, start, children }: { title: ReactNode; back?: string; start?: ReactNode; children?: ReactNode }) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        {start ?? (back && <BackLink fallback={back} />)}
        <div className="topbar-heading">
          <p className="brand-mark">Advent of Running</p>
          {typeof title === 'string' ? <h1 className="title">{title}</h1> : title}
        </div>
      </div>
      <div className="topbar-end">
        {children}
        <MusicButton />
      </div>
    </header>
  );
}
