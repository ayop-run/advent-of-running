'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Sprite from '@/components/Sprite';
import { avatarSrc } from '@/lib/avatar';
import { WEEKLY, dayLabel } from '@/lib/calendar';
import { getProgress, getTree, type Hung } from '@/lib/data';
import { getMe, myNickname } from '@/lib/me';
import { BY_ID } from '@/lib/ornaments';
import { canvasSize, downloadBlob, drawBooth, recordBooth, shareBlob, videoType, type Backdrop, type BoothMode, type BoothScene, type RunStats } from '@/lib/photoBooth';
import { canShareFiles, loadFonts, loadImage, type CardFormat } from '@/lib/treeImage';

const MAX_STICKERS = 4;
/** Free ornaments to fall back on before any door is unwrapped. */
const STARTERS = ['star-gold', 'gift-box', 'bauble-snow'];
/** Big phone photos are scaled down to this long side: plenty for a 1080-wide picture. */
const MAX_PHOTO = 2160;

type Camera = 'starting' | 'live' | 'off' | 'blocked' | 'none';

/**
 * Photo booth: the camera opens with everything already on it (your card, your tree and
 * ornaments moving like in the app), so you see the picture before you take it. Or pick a
 * photo from today's run. Two layouts: Today's run, or My tree with your link.
 */
export default function PhotoBooth() {
  const [mode, setMode] = useState<BoothMode>('run');
  const [format, setFormat] = useState<CardFormat>('story');
  const [stickers, setStickers] = useState<string[]>([]);
  const [choices, setChoices] = useState<string[]>([]);
  const [asVideo, setAsVideo] = useState(false);
  const [camera, setCamera] = useState<Camera>('starting');
  // a taken or chosen photo; while it's null the preview shows the live camera
  const [still, setStill] = useState<Backdrop | null>(null);
  const [stats, setStats] = useState<RunStats | null>(null);
  const [ornaments, setOrnaments] = useState<Hung[]>([]);
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [avatar, setAvatar] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [canShare, setCanShare] = useState(false);
  // known only in the browser, so the server and the first render agree
  const [canVideo, setCanVideo] = useState(false);

  const preview = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  };
  const startCamera = useCallback(async () => {
    setStill(null);
    setError('');
    setCamera('starting');
    if (!navigator.mediaDevices?.getUserMedia) return setCamera('none');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1920 } }, audio: false });
      stream.current = s;
      if (video.current) {
        video.current.srcObject = s;
        await video.current.play();
      }
      setCamera('live');
    } catch (e) {
      setCamera((e as DOMException)?.name === 'NotAllowedError' ? 'blocked' : 'none');
    }
  }, []);

  // who you are, your tree, your Advent so far, and the camera
  useEffect(() => {
    setCanShare(canShareFiles());
    setCanVideo(!!videoType());
    loadFonts();
    getMe().then(async (me) => {
      const nick = myNickname(me);
      setName(me?.displayName ?? nick.charAt(0).toUpperCase() + nick.slice(1));
      setLink(`${window.location.origin}/t/${nick}`);
      loadImage(avatarSrc(nick, me?.avatarUrl)).then(setAvatar);
      setOrnaments((await getTree(nick)).ornaments);
    });
    getProgress().then((res) => {
      if (!('progress' in res)) {
        setChoices(STARTERS);
        return setStickers(STARTERS.slice(0, 2));
      }
      const p = res.progress;
      const running = p.today >= 1 && p.today <= 24;
      setStats({
        door: running ? p.today : 0,
        date: running ? dayLabel(p.start, p.today) : '',
        todayKm: p.todayKm,
        doors: p.doors.filter((s) => s === 'opened').length,
        km: p.km.reduce((a, b) => a + b, 0),
      });
      // stickers: ornaments you've unwrapped, newest door first, then weekly prizes you won
      const opened = p.doors.flatMap((s, i) => (s === 'opened' ? [p.ornaments[i]] : [])).reverse();
      const prizes = WEEKLY.filter((w) => p.weeksDone.includes(w.week)).map((w) => w.reward);
      const list = [...new Set([...opened, ...prizes, ...STARTERS])].filter((id) => BY_ID[id]).slice(0, 10);
      setChoices(list);
      setStickers(list.slice(0, 3));
    });
    startCamera();
    return stopCamera;
  }, [startCamera]);

  const scene = useCallback(
    (backdrop: Backdrop | null): BoothScene => ({ backdrop, format, mode, stickers, stats, ornaments, ownerName: name, avatar, link }),
    [format, mode, stickers, stats, ornaments, name, avatar, link],
  );

  // the preview, always moving: the live camera (mirrored, like a mirror) or the photo
  useEffect(() => {
    const c = preview.current;
    if (!c) return;
    const { W, H } = canvasSize(format);
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d')!;
    let id = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      const v = video.current;
      const backdrop = still ?? (camera === 'live' && v?.videoWidth ? { src: v, w: v.videoWidth, h: v.videoHeight, mirror: true } : null);
      drawBooth(ctx, scene(backdrop), (now - t0) / 1000, true);
      id = requestAnimationFrame(frame);
    };
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [format, still, camera, scene]);

  const snap = () => {
    const v = video.current;
    if (!v?.videoWidth) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d')!.drawImage(v, 0, 0);
    setStill({ src: c, w: c.width, h: c.height, mirror: true });
    stopCamera();
    setCamera('off');
  };

  /** A photo from your phone, scaled down so huge camera photos stay light. */
  const choose = (file: File | undefined) => {
    if (!file) return;
    setError('');
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, MAX_PHOTO / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * k);
      c.height = Math.round(img.naturalHeight * k);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      stopCamera();
      setCamera('off');
      setStill({ src: c, w: c.width, h: c.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError('Couldn’t open that photo. Try another one (JPG or PNG).');
    };
    img.src = url;
  };

  const toggleSticker = (id: string) =>
    setStickers((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < MAX_STICKERS ? [...s, id] : s));

  /** The finished file: a PNG, or a few seconds of video. */
  const render = async (): Promise<{ blob: Blob; file: string } | null> => {
    if (!still) return null;
    const base = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'my'}-advent-${mode === 'run' ? 'run' : 'tree'}-${format}`;
    if (asVideo) {
      setBusy('Recording your video…');
      const blob = await recordBooth(scene(still), 4);
      setBusy('');
      return blob ? { blob, file: `${base}.${blob.type.includes('mp4') ? 'mp4' : 'webm'}` } : null;
    }
    const { W, H } = canvasSize(format);
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    drawBooth(c.getContext('2d', { alpha: false })!, scene(still), 0, false);
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/png'));
    return blob ? { blob, file: `${base}.png` } : null;
  };
  const save = async () => {
    const out = await render();
    if (out) downloadBlob(out.blob, out.file);
  };
  const share = async () => {
    const out = await render();
    const text = mode === 'tree' ? `Hang an ornament on my tree: ${link}` : 'My Advent of Running';
    if (mode === 'tree') navigator.clipboard?.writeText(link).catch(() => {});
    if (out && !(await shareBlob(out.blob, out.file, text))) downloadBlob(out.blob, out.file);
  };

  const live = !still && camera === 'live';
  // the file input sits inside the label, so a tap opens the photo picker on every phone
  const pickPhoto = (primary: boolean) => (
    <label className={`btn ${primary ? '' : 'ghost'} block mt8 file-btn`}>
      {still ? 'Choose another photo' : 'Choose from photos'}
      <input type="file" accept="image/*" className="sr-only" onChange={(e) => { choose(e.target.files?.[0]); e.target.value = ''; }} />
    </label>
  );

  return (
    <main className="screen no-nav">
      <PageHeader back="/tree" title="Photo booth" />

      <div className="row" style={{ justifyContent: 'center', gap: 8 }} role="group" aria-label="Layout">
        <button type="button" className="pill" aria-pressed={mode === 'run'} onClick={() => setMode('run')}>Today&apos;s run</button>
        <button type="button" className="pill" aria-pressed={mode === 'tree'} onClick={() => setMode('tree')}>My tree</button>
      </div>

      <div className={`picture-frame ${format}`}>
        <canvas ref={preview} className="run-preview" role="img" aria-label={live ? 'Live preview of your photo' : 'Your photo'} />
      </div>
      {/* the camera feed only feeds the preview */}
      <video ref={video} playsInline muted hidden />

      {!still && camera === 'starting' && <p className="tiny muted center mt8">Starting the camera…</p>}
      {!still && camera === 'blocked' && <p className="tiny muted center mt8">Camera access is blocked. Allow it in your browser&apos;s settings, or choose a photo.</p>}
      {!still && camera === 'none' && <p className="tiny muted center mt8">No camera here. Choose a photo from today&apos;s run.</p>}
      {error && <p className="small center mt8" role="alert" style={{ color: '#ff9aa8' }}>{error}</p>}

      <div className="row mt12" style={{ flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
        {(['story', 'post'] as const).map((f) => (
          <button key={f} type="button" className="pill" aria-pressed={format === f} onClick={() => setFormat(f)}>
            {f === 'story' ? 'Story' : 'Post'} <span className="pill-note">{f === 'story' ? '9:16' : '3:4'}</span>
          </button>
        ))}
        {canVideo && (
          <button type="button" className="pill" aria-pressed={asVideo} onClick={() => setAsVideo((v) => !v)}>✨ Save as video</button>
        )}
      </div>

      {choices.length > 0 && (
        <div className="mt12">
          <p className="tiny muted center">Ornaments · pick up to {MAX_STICKERS}</p>
          <div className="sticker-picks mt8" role="group" aria-label="Ornament stickers">
            {choices.map((id) => (
              <button key={id} type="button" className="pick sticker-pick" aria-pressed={stickers.includes(id)} aria-label={BY_ID[id]?.name ?? id} onClick={() => toggleSticker(id)}>
                <Sprite id={id} px={2} />
              </button>
            ))}
          </div>
        </div>
      )}

      {busy && <p className="small center mt12" role="status">{busy}</p>}
      {live ? (
        <>
          <button className="btn block mt16" onClick={snap}>Take photo</button>
          {pickPhoto(false)}
        </>
      ) : still ? (
        <>
          {canShare && <button className="btn block mt16" disabled={!!busy} onClick={share}>{asVideo ? 'Share video' : 'Share'}</button>}
          <button className={`btn ${canShare ? 'ghost' : ''} block mt8`} disabled={!!busy} onClick={save}>{asVideo ? 'Download video' : 'Download picture'}</button>
          <button className="btn ghost block mt8" disabled={!!busy} onClick={startCamera}>Retake</button>
          {pickPhoto(false)}
        </>
      ) : (
        <div className="mt16">
          {pickPhoto(true)}
          {(camera === 'blocked' || camera === 'none') && <button className="btn ghost block mt8" onClick={startCamera}>Try the camera again</button>}
        </div>
      )}
      {mode === 'tree' && <p className="tiny muted center mt8">Sharing copies your tree link, for Instagram&apos;s Link sticker.</p>}
    </main>
  );
}
