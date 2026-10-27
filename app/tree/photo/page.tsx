'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import BackLink from '@/components/BackLink';
import { getTree, type Hung } from '@/lib/data';
import { getMe, myNickname } from '@/lib/me';
import { canShareFiles, downloadCanvas, drawTree, photoLayout, renderPhoto, SCENE_H, SCENE_W, shareCanvas } from '@/lib/treeImage';

type State = 'starting' | 'live' | 'taken' | 'blocked' | 'nocamera';

/** Photo booth: your front camera with your pixel tree standing beside you. */
export default function PhotoBooth() {
  const video = useRef<HTMLVideoElement>(null);
  const overlay = useRef<HTMLCanvasElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [state, setState] = useState<State>('starting');
  const [shot, setShot] = useState<{ canvas: HTMLCanvasElement; src: string } | null>(null);
  const [ornaments, setOrnaments] = useState<Hung[]>([]);
  const [name, setName] = useState('');
  const [share, setShare] = useState(false);

  const start = useCallback(async () => {
    setState('starting');
    if (!navigator.mediaDevices?.getUserMedia) return setState('nocamera');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false });
      stream.current = s;
      if (video.current) {
        video.current.srcObject = s;
        await video.current.play();
      }
      setState('live');
    } catch (e) {
      setState((e as DOMException)?.name === 'NotAllowedError' ? 'blocked' : 'nocamera');
    }
  }, []);

  useEffect(() => {
    getMe().then(async (me) => {
      const nick = myNickname(me);
      setName(me?.displayName ?? nick.charAt(0).toUpperCase() + nick.slice(1));
      setOrnaments((await getTree(nick)).ornaments);
    });
    setShare(canShareFiles());
    start();
    return () => stream.current?.getTracks().forEach((t) => t.stop());
  }, [start]);

  // the live preview shows the tree where the photo will put it
  useEffect(() => {
    const v = video.current;
    const c = overlay.current;
    if (state !== 'live' || !v || !c || !v.videoWidth) return;
    const { W, H, px, margin } = photoLayout(v.videoWidth, v.videoHeight);
    c.width = W;
    c.height = H;
    drawTree(c.getContext('2d')!, ornaments, W - SCENE_W * px - margin, H - SCENE_H * px - margin, px);
  }, [state, ornaments]);

  const snap = async () => {
    if (!video.current) return;
    const canvas = await renderPhoto({ video: video.current, ornaments, ownerName: name });
    setShot({ canvas, src: canvas.toDataURL('image/png') });
    setState('taken');
  };
  const file = `${name.toLowerCase() || 'my'}-tree-selfie.png`;

  return (
    <main className="screen no-nav">
      <div className="topbar">
        <BackLink fallback="/tree" />
      </div>
      <p className="brand-mark">Advent of Running</p>
      <h1 className="title">Photo with your tree</h1>

      <div className="booth mt16">
        <div className="booth-view" hidden={state !== 'live'}>
          <video ref={video} playsInline muted />
          <canvas ref={overlay} className="booth-tree" aria-hidden="true" />
        </div>
        {shot && state === 'taken' && <img src={shot.src} alt="Your selfie with your tree" />}
        {state === 'starting' && <p className="small soft center">Starting the camera…</p>}
        {state === 'blocked' && (
          <p className="small soft center">Camera access is blocked. Allow it in your browser&apos;s site settings, then try again.</p>
        )}
        {state === 'nocamera' && <p className="small soft center">No camera found on this device. You can still download a picture of your tree from the tree page.</p>}
      </div>

      {state === 'live' && <button className="btn block mt16" onClick={snap}>Take photo</button>}
      {state === 'taken' && shot && (
        <>
          <button className="btn block mt16" onClick={() => downloadCanvas(shot.canvas, file)}>Download photo</button>
          {share && <button className="btn ghost block mt8" onClick={() => shareCanvas(shot.canvas, file, 'Me and my Advent of Running tree')}>Share photo</button>}
          <button className="btn ghost block mt8" onClick={() => { setShot(null); setState('live'); }}>Retake</button>
        </>
      )}
      {(state === 'blocked' || state === 'nocamera') && <button className="btn ghost block mt16" onClick={start}>Try again</button>}
    </main>
  );
}
