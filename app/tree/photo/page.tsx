'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Sprite from '@/components/Sprite';
import { avatarSrc } from '@/lib/avatar';
import { WEEKLY, dayLabel } from '@/lib/calendar';
import { getProgress, getTree, type Hung } from '@/lib/data';
import { getMe, myNickname } from '@/lib/me';
import { BY_ID } from '@/lib/ornaments';
import { canvasSize, downloadBlob, drawRunPhoto, recordRunPhoto, shareBlob, videoType, type Layers, type RunPhoto, type RunStats } from '@/lib/runPhoto';
import { canShareFiles, loadFonts, loadImage, type CardFormat } from '@/lib/treeImage';

type Step = 'pick' | 'camera' | 'edit';
type Photo = RunPhoto['photo'];

const MAX_STICKERS = 4;
/** Free ornaments to fall back on before any door is unwrapped. */
const STARTERS = ['star-gold', 'gift-box', 'bauble-snow'];

/**
 * Run photo: a photo from your run (or a selfie) with your Advent progress, your tree and
 * ornament stickers on top, as a picture or a short animated video for a story or a post.
 */
export default function RunPhotoStudio() {
  const [step, setStep] = useState<Step>('pick');
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [format, setFormat] = useState<CardFormat>('story');
  const [layers, setLayers] = useState<Layers>({ progress: true, tree: true, stickers: true });
  const [animate, setAnimate] = useState(false);
  const [stickers, setStickers] = useState<string[]>([]);
  const [choices, setChoices] = useState<string[]>([]);
  const [stats, setStats] = useState<RunStats | null>(null);
  const [ornaments, setOrnaments] = useState<Hung[]>([]);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<HTMLImageElement | null>(null);
  const [cameraError, setCameraError] = useState('');
  const [busy, setBusy] = useState('');
  const [canShare, setCanShare] = useState(false);

  const preview = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // who you are, your tree, and your Advent so far
  useEffect(() => {
    setCanShare(canShareFiles());
    loadFonts();
    getMe().then(async (me) => {
      const nick = myNickname(me);
      setName(me?.displayName ?? nick.charAt(0).toUpperCase() + nick.slice(1));
      loadImage(avatarSrc(nick, me?.avatarUrl)).then(setAvatar);
      setOrnaments((await getTree(nick)).ornaments);
    });
    getProgress().then((res) => {
      if (!('progress' in res)) return setChoices(STARTERS);
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
      const list = [...new Set([...opened, ...prizes, ...STARTERS])].filter((id) => BY_ID[id] || STARTERS.includes(id)).slice(0, 10);
      setChoices(list);
      setStickers(list.slice(0, 3));
    });
    return () => stream.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const scene = useCallback(
    (p: Photo): RunPhoto => ({ photo: p, format, layers, stickers, stats, ornaments, ownerName: name, avatar }),
    [format, layers, stickers, stats, ornaments, name, avatar],
  );

  // the preview: one frame, or a running animation
  useEffect(() => {
    const c = preview.current;
    if (step !== 'edit' || !photo || !c) return;
    const { W, H } = canvasSize(format);
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d')!;
    const s = scene(photo);
    if (!animate) return drawRunPhoto(ctx, s, 0, false);
    let id = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      drawRunPhoto(ctx, s, (now - t0) / 1000, true);
      id = requestAnimationFrame(frame);
    };
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [step, photo, format, animate, scene]);

  const choose = (file: File | undefined) => {
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      setPhoto(img);
      setStep('edit');
    };
    img.src = URL.createObjectURL(file);
  };

  const startCamera = async () => {
    setCameraError('');
    setStep('camera');
    if (!navigator.mediaDevices?.getUserMedia) return setCameraError('No camera found on this device. Choose a photo instead.');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1920 } }, audio: false });
      stream.current = s;
      if (video.current) {
        video.current.srcObject = s;
        await video.current.play();
      }
    } catch (e) {
      setCameraError(
        (e as DOMException)?.name === 'NotAllowedError'
          ? 'Camera access is blocked. Allow it in your browser’s site settings, or choose a photo instead.'
          : 'No camera found on this device. Choose a photo instead.',
      );
    }
  };
  const snap = () => {
    const v = video.current;
    if (!v?.videoWidth) return;
    // mirrored, like the preview
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext('2d')!;
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0);
    stream.current?.getTracks().forEach((t) => t.stop());
    setPhoto(c);
    setStep('edit');
  };

  const toggleSticker = (id: string) =>
    setStickers((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < MAX_STICKERS ? [...s, id] : s));

  /** The finished file: a PNG, or with animation a few seconds of video. */
  const render = async (): Promise<{ blob: Blob; file: string } | null> => {
    if (!photo) return null;
    const base = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'my'}-advent-${format}`;
    if (animate) {
      setBusy('Recording your video…');
      const blob = await recordRunPhoto(scene(photo), 4);
      setBusy('');
      return blob ? { blob, file: `${base}.${blob.type.includes('mp4') ? 'mp4' : 'webm'}` } : null;
    }
    const { W, H } = canvasSize(format);
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    drawRunPhoto(c.getContext('2d')!, scene(photo), 0, false);
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/png'));
    return blob ? { blob, file: `${base}.png` } : null;
  };
  const save = async () => {
    const out = await render();
    if (out) downloadBlob(out.blob, out.file);
  };
  const share = async () => {
    const out = await render();
    if (out && !(await shareBlob(out.blob, out.file, 'My Advent of Running'))) downloadBlob(out.blob, out.file);
  };

  const canAnimate = typeof window !== 'undefined' && !!videoType();

  return (
    <main className="screen no-nav">
      <PageHeader back="/tree" title="Run photo" />

      <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => choose(e.target.files?.[0])} />

      {step === 'pick' && (
        <section className="stack" style={{ gap: 12 }}>
          <p className="small soft">Share today&apos;s run: your photo with your Advent progress, your tree and ornament stickers.</p>
          <button className="btn block" onClick={() => fileInput.current?.click()}>Choose a photo</button>
          <button className="btn ghost block" onClick={startCamera}>Take a selfie</button>
        </section>
      )}

      {step === 'camera' && (
        <>
          <div className="booth">
            {cameraError ? <p className="small soft center">{cameraError}</p> : <video ref={video} playsInline muted />}
          </div>
          {!cameraError && <button className="btn block mt16" onClick={snap}>Take photo</button>}
          <button className="btn ghost block mt8" onClick={() => { stream.current?.getTracks().forEach((t) => t.stop()); setStep('pick'); }}>Back</button>
        </>
      )}

      {step === 'edit' && photo && (
        <>
          <div className="row" style={{ justifyContent: 'center', gap: 8 }} role="group" aria-label="Picture size">
            {(['story', 'post'] as const).map((f) => (
              <button key={f} type="button" className="pill" aria-pressed={format === f} onClick={() => setFormat(f)}>
                {f === 'story' ? 'Story' : 'Post'} <span className="pill-note">{f === 'story' ? '9:16' : '3:4'}</span>
              </button>
            ))}
          </div>
          <div className={`picture-frame ${format}`}>
            <canvas ref={preview} className="run-preview" role="img" aria-label="Your run photo" />
          </div>

          <div className="row mt12" style={{ flexWrap: 'wrap', justifyContent: 'center', gap: 8 }} role="group" aria-label="Show on the photo">
            {([['progress', 'Progress'], ['tree', 'Tree'], ['stickers', 'Stickers']] as const).map(([k, label]) => (
              <button key={k} type="button" className="pill" aria-pressed={layers[k]} onClick={() => setLayers((l) => ({ ...l, [k]: !l[k] }))}>
                {label}
              </button>
            ))}
            {canAnimate && (
              <button type="button" className="pill" aria-pressed={animate} onClick={() => setAnimate((a) => !a)}>
                ✨ Animated
              </button>
            )}
          </div>

          {layers.stickers && choices.length > 0 && (
            <div className="mt12">
              <p className="tiny muted center">Stickers · pick up to {MAX_STICKERS}</p>
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
          {canShare && <button className="btn block mt16" disabled={!!busy} onClick={share}>{animate ? 'Share video' : 'Share'}</button>}
          <button className={`btn ${canShare ? 'ghost' : ''} block mt8`} disabled={!!busy} onClick={save}>
            {animate ? 'Download video' : 'Download picture'}
          </button>
          <button className="btn ghost block mt8" disabled={!!busy} onClick={() => setStep('pick')}>Change photo</button>
        </>
      )}
    </main>
  );
}
