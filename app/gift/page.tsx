import Link from 'next/link';
import { Avatar } from '@/components/PixelTree';
import { FRIENDS } from '@/lib/data';
import { BY_ID } from '@/lib/ornaments';

const TODAY_ORNAMENT = 'santa-shoe';

export default function GiftOpened() {
  const o = BY_ID[TODAY_ORNAMENT];
  return (
    <main className="screen no-nav">
      <div className="topbar">
        <span className="small muted">December 14, 3.2 km synced</span>
        <Link href="/tree" className="textlink">Close</Link>
      </div>

      <div className="center mt8" style={{ position: 'relative' }}>
        <img className="px" src="/ornaments/gift-box.png" alt="" width={72} height={72} style={{ opacity: .35, position: 'absolute', left: '50%', top: 130, transform: 'translateX(-50%)' }} />
        <img className="px" src={o.img} alt={o.name} width={176} height={176} style={{ position: 'relative', filter: 'drop-shadow(0 0 22px rgba(232,84,106,.6))' }} />
      </div>
      <p className="center tier tier-special mt16">Door 14 of 24, special ornament</p>
      <h1 className="h1 center mt8">You unwrapped the {o.name}</h1>
      <p className="center soft mt8">Hang it on a friend&apos;s tree. It glows brighter than the free ones.</p>

      <h2 className="h2 mt32">Give it to</h2>
      <div className="stack mt12" style={{ gap: 8 }}>
        {FRIENDS.map((f) => (
          <div key={f.nickname} className="panel quiet row" style={{ padding: 12 }}>
            <Avatar owner={{ name: f.name }} size={38} />
            <div className="grow">
              <div style={{ fontWeight: 800 }}>{f.name}</div>
              <div className="tiny muted">{f.note}</div>
            </div>
            <Link href={`/t/${f.nickname}/hang?o=${o.id}`} className="btn sm">Hang</Link>
          </div>
        ))}
      </div>

      <div className="grow" />
      <Link href="/tree" className="btn ghost block mt24">Keep it for later</Link>
      <p className="center tiny muted mt8">You&apos;re holding 2 of 3. Any left on December 25 go on your own tree.</p>
    </main>
  );
}
