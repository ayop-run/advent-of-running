'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Hung } from '@/lib/data';
import { canShareFiles, downloadCanvas, renderTreeCard, shareCanvas } from '@/lib/treeImage';

type Props = {
  ornaments: Hung[];
  ownerName: string;
  /** the tree's public link, printed on the card */
  link: string;
  onClose: () => void;
};

/** A picture of your tree to save or share, and the way into the photo booth. */
export default function PictureSheet({ ornaments, ownerName, link, onClose }: Props) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [src, setSrc] = useState('');
  const [share, setShare] = useState(false);
  const file = `${ownerName.toLowerCase()}-tree.png`;

  useEffect(() => {
    let live = true;
    setShare(canShareFiles());
    renderTreeCard({ ornaments, ownerName, link }).then((c) => {
      if (!live) return;
      setCanvas(c);
      setSrc(c.toDataURL('image/png'));
    });
    return () => {
      live = false;
    };
  }, [ornaments, ownerName, link]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Picture of your tree" onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        <h2 className="h2 center">Picture of your tree</h2>
        <div className="picture-frame mt12">
          {src ? <img src={src} alt={`${ownerName}'s tree with ${ornaments.length} sealed ornaments`} /> : <span className="small soft">Drawing your tree…</span>}
        </div>
        <button className="btn block mt16" disabled={!canvas} onClick={() => canvas && downloadCanvas(canvas, file)}>
          Download picture
        </button>
        {share && (
          <button className="btn ghost block mt8" disabled={!canvas} onClick={() => canvas && shareCanvas(canvas, file, `Hang an ornament on my tree: ${link}`)}>
            Share picture
          </button>
        )}
        <Link href="/tree/photo" className="btn ghost block mt8">Take a selfie with your tree</Link>
        <button className="btn ghost block mt8" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
