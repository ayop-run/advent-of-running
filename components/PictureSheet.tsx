'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getProgress, type Hung } from '@/lib/data';
import { canShareFiles, downloadCanvas, renderTreeCard, shareCanvas, type CardFormat, type CardStats } from '@/lib/treeImage';

type Props = {
  ornaments: Hung[];
  ownerName: string;
  /** same-origin photo URL, from `avatarSrc` */
  avatar?: string | null;
  /** the tree's public link, printed on the card */
  link: string;
  onClose: () => void;
};

const FORMATS: { id: CardFormat; label: string; ratio: string }[] = [
  { id: 'story', label: 'Story', ratio: '9:16' },
  { id: 'post', label: 'Post', ratio: '3:4' },
];

/**
 * Share your tree, like sharing a run: a picture for an Instagram story or post with your
 * Advent stats and tree link, to share, save, or copy the link for a link sticker.
 */
export default function PictureSheet({ ornaments, ownerName, avatar, link, onClose }: Props) {
  const [format, setFormat] = useState<CardFormat>('story');
  // undefined while loading; null if the calendar couldn't load (the picture leaves the stats out)
  const [stats, setStats] = useState<CardStats | null | undefined>(undefined);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [src, setSrc] = useState('');
  const [canShare, setCanShare] = useState(false);
  const [note, setNote] = useState('');
  const file = `${ownerName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-tree-${format}.png`;

  useEffect(() => {
    setCanShare(canShareFiles());
    getProgress().then((res) => {
      if (!('progress' in res)) return setStats(null);
      const p = res.progress;
      setStats({ doors: p.doors.filter((s) => s === 'opened').length, km: p.km.reduce((a, b) => a + b, 0) });
    });
  }, []);
  useEffect(() => {
    if (stats === undefined) return;
    let live = true;
    setCanvas(null);
    renderTreeCard({ ornaments, ownerName, avatar, link, format, stats }).then((c) => {
      if (!live) return;
      setCanvas(c);
      setSrc(c.toDataURL('image/png'));
    });
    return () => {
      live = false;
    };
  }, [ornaments, ownerName, avatar, link, format, stats]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  useEffect(() => {
    if (!note) return;
    const id = setTimeout(() => setNote(''), 4000);
    return () => clearTimeout(id);
  }, [note]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      return true;
    } catch {
      return false;
    }
  };
  /** The picture goes to the share sheet; the link is copied too, for Instagram's link sticker. */
  const share = async () => {
    if (!canvas) return;
    const copied = await copyLink();
    if (copied) setNote('Link copied. In Instagram, paste it with the Link sticker.');
    await shareCanvas(canvas, file, `Hang an ornament on my tree: ${link}`);
  };

  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Share your tree" onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        <h2 className="h2 center">Share your tree</h2>
        <div className="row mt12" style={{ justifyContent: 'center', gap: 8 }} role="group" aria-label="Picture size">
          {FORMATS.map((f) => (
            <button key={f.id} type="button" className="pill" aria-pressed={format === f.id} onClick={() => setFormat(f.id)}>
              {f.label} <span className="pill-note">{f.ratio}</span>
            </button>
          ))}
        </div>
        <div className={`picture-frame ${format}`}>
          {canvas && src ? (
            <img src={src} alt={`${ownerName}'s tree with ${ornaments.length} sealed ornaments`} />
          ) : (
            <span className="small soft">Drawing your tree…</span>
          )}
        </div>
        {note && <p className="small center mt8" role="status" style={{ color: '#7fe0a6' }}>{note}</p>}
        {canShare ? (
          <button className="btn block mt16" disabled={!canvas} onClick={share}>Share</button>
        ) : null}
        <div className="row mt8" style={{ gap: 8 }}>
          <button className={`btn ${canShare ? 'ghost' : ''} grow`} disabled={!canvas} onClick={() => canvas && downloadCanvas(canvas, file)}>
            Download
          </button>
          <button
            className="btn ghost grow"
            onClick={async () => setNote((await copyLink()) ? 'Link copied.' : 'Couldn’t copy the link.')}
          >
            Copy link
          </button>
        </div>
        <p className="tiny muted center mt8">For a story, add your link with Instagram&apos;s Link sticker.</p>
        <Link href="/tree/photo" className="btn ghost block mt8">Photo booth: add your photo</Link>
        <button className="btn ghost block mt8" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
