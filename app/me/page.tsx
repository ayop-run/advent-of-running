import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { MusicButton } from '@/components/MusicToggle';
import { Avatar } from '@/components/PixelTree';
import { DEMO_POUCH } from '@/lib/data';
import { BY_ID } from '@/lib/ornaments';

const ROWS = [
  { label: 'People you swapped ornaments with', value: '14' },
  { label: 'Saved trees', value: '3' },
  { label: 'Ornament collection', value: '10/100' },
  { label: 'Catch-ups left this week', value: '1' },
];

const SETTINGS = [
  { label: 'Who can hang ornaments', value: 'Anyone with the link' },
  { label: 'Email notifications', value: 'On' },
  { label: 'Time zone', value: 'Automatic' },
];

export default function Me() {
  const slots = [...DEMO_POUCH, null];
  return (
    <main className="screen">
      <div className="topbar">
        <div className="row">
          <Avatar owner={{ name: 'demo' }} size={48} />
          <div>
            <h1 className="title" style={{ fontSize: 24 }}>demo</h1>
            <p className="tiny muted">Connected to Strava (demo)</p>
          </div>
        </div>
        <MusicButton />
      </div>

      <section className="panel gold">
        <div className="row between">
          <h2 className="h2">Ornaments to give</h2>
          <span className="num" style={{ color: 'var(--gold)' }}>{DEMO_POUCH.length}/3</span>
        </div>
        <div className="picker mt12">
          {slots.map((id, k) =>
            id ? (
              <div key={id} className="pick">
                <img className="px" src={BY_ID[id].img} alt="" />
                <span className="tier-special">{BY_ID[id].name}</span>
              </div>
            ) : (
              <div key={`empty-${k}`} className="pick empty">Run to fill</div>
            ),
          )}
        </div>
        <p className="small soft mt12">Give them by December 24. Any you keep go on your own tree on Christmas.</p>
        <Link href="/gift" className="btn block mt16">Give one</Link>
      </section>

      <div className="mt16">
        {ROWS.map((r) => (
          <div key={r.label} className="list-row small"><span>{r.label}</span><span className="value">{r.value}</span></div>
        ))}
      </div>

      <h2 className="h2 mt32">Settings</h2>
      <div className="mt4">
        {SETTINGS.map((s) => (
          <div key={s.label} className="list-row small"><span>{s.label}</span><span className="value small">{s.value}</span></div>
        ))}
        <Link href="/christmas" className="list-row small"><span>Preview Christmas morning</span><span className="value">Open</span></Link>
      </div>
      <button className="btn red block mt24">Disconnect Strava and delete my data</button>

      <BottomNav />
    </main>
  );
}
