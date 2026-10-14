import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { Meter } from '@/components/Icons';
import { MusicButton } from '@/components/MusicToggle';
import { BY_ID } from '@/lib/ornaments';
import { DEMO_TODAY, DEMO_TODAY_GOAL_KM, DEMO_TODAY_KM, WEEKLY, doorState } from '@/lib/calendar';

export default function Calendar() {
  const doors = Array.from({ length: 24 }, (_, i) => i + 1);
  const opened = doors.filter((n) => doorState(n) === 'opened').length;
  const week = WEEKLY[1];
  const reward = BY_ID[week.reward];

  return (
    <main className="screen">
      <div className="topbar">
        <h1 className="title">Calendar</h1>
        <div className="topbar-end">
          <span className="num" style={{ color: 'var(--gold)', fontSize: 18 }}>{opened}/24 open</span>
          <MusicButton />
        </div>
      </div>

      <div className="doors" role="list" aria-label="Advent doors">
        {doors.map((n) => {
          const s = doorState(n);
          return <div key={n} role="listitem" className={`door ${s}`} aria-label={`Door ${n}, ${s}`}>{n}</div>;
        })}
      </div>
      <div className="legend mt12" style={{ justifyContent: 'flex-start' }}>
        <span><i style={{ background: 'var(--cranberry)' }} />Opened</span>
        <span style={{ color: 'var(--gold)' }}><i style={{ boxShadow: 'inset 0 0 0 2px var(--gold)' }} />Today</span>
        <span className="muted"><i style={{ boxShadow: 'inset 0 0 0 1px #7d8db3' }} />Missed</span>
        <span className="muted" style={{ marginLeft: 'auto', fontWeight: 500 }}>Only you see this</span>
      </div>

      <section className="panel gold mt24">
        <div className="row between">
          <h2 className="h2">Door {DEMO_TODAY}: run 1 km</h2>
          <span className="small muted">until 23:59</span>
        </div>
        <div className="mt12"><Meter value={DEMO_TODAY_KM} max={DEMO_TODAY_GOAL_KM} /></div>
        <p className="small soft mt8">
          <span className="num" style={{ color: 'var(--gold)' }}>{DEMO_TODAY_KM.toFixed(1)} km</span> so far. Outdoor, trail and treadmill runs count; manual entries don&apos;t.
        </p>
      </section>

      <div className="panel hint small mt12">
        You missed door 13. Run 2 km today to open doors 13 and 14 together. You have 1 catch-up left this week.
      </div>

      <section className="panel mt24">
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <img className="px" src={reward.img} alt="" width={64} height={64} style={{ filter: 'drop-shadow(0 0 10px rgba(255,201,74,.8))' }} />
          <div className="grow">
            <p className="tier tier-rare">Week {week.week} challenge, ends today</p>
            <h2 className="h2 mt4">{week.title}</h2>
            <p className="small soft mt4">Finish it to win the rare {reward.name}.</p>
          </div>
        </div>
        <div className="mt12"><Meter value={week.progress ?? 0} max={week.goal ?? 1} /></div>
        <p className="small muted mt8"><span className="num" style={{ color: 'var(--snow)' }}>{week.progress} of {week.goal} km</span>. The next challenge starts December 15.</p>
      </section>

      <Link href="/gift" className="btn ghost block mt24">Try unwrapping today&apos;s gift</Link>
      <BottomNav />
    </main>
  );
}
