/**
 * Run photo: your own photo (from today's run, or a selfie) with Advent of Running on top,
 * like sharing an activity. Layers: a progress card, your mini tree, and ornament stickers
 * that can bob and sparkle. One frame is a picture; a few seconds of frames make a video.
 */

import type { Hung } from './data';
import { SPRITES, SPRITE_SIZE } from './sprites';
import { BODY, FONT, SCENE_H, SCENE_W, drawAvatar, drawGrid, drawTree, miniStar, notchedRect, type CardFormat } from './treeImage';

/** Your Advent so far, for the progress card. `door` is today's door (0 outside Advent). */
export type RunStats = { door: number; date: string; todayKm: number; doors: number; km: number };

export type Layers = { progress: boolean; tree: boolean; stickers: boolean };

export type RunPhoto = {
  /** the photo, already loaded (an image or a camera frame on a canvas) */
  photo: CanvasImageSource & { width: number; height: number };
  format: CardFormat;
  layers: Layers;
  /** ornament ids to stick on the photo, up to 4 */
  stickers: string[];
  stats: RunStats | null;
  ornaments: Hung[];
  ownerName: string;
  avatar: HTMLImageElement | null;
};

const SIZE = { story: { W: 1080, H: 1920, safe: 250 }, post: { W: 1080, H: 1440, safe: 48 } } as const;

/** Where stickers sit, as fractions of the free area above the card: [x, y, tilt]. */
const SPOTS: [number, number, number][] = [[0.17, 0.08, -8], [0.83, 0.13, 7], [0.13, 0.5, 6], [0.87, 0.56, -6]];

export const canvasSize = (format: CardFormat) => SIZE[format];

/** Draws the run photo at `t` seconds; with `animate`, stickers bob and sparkles twinkle. */
export function drawRunPhoto(ctx: CanvasRenderingContext2D, o: RunPhoto, t = 0, animate = false) {
  const { W, H, safe } = SIZE[o.format];
  ctx.imageSmoothingEnabled = true;
  // the photo fills the frame, cropped from the middle
  const k = Math.max(W / o.photo.width, H / o.photo.height);
  const pw = o.photo.width * k;
  const ph = o.photo.height * k;
  ctx.drawImage(o.photo, (W - pw) / 2, (H - ph) / 2, pw, ph);
  ctx.imageSmoothingEnabled = false;

  // a soft dark fade at the bottom so the card reads on any photo
  const fade = ctx.createLinearGradient(0, H * 0.55, 0, H);
  fade.addColorStop(0, 'rgba(7,13,31,0)');
  fade.addColorStop(1, 'rgba(7,13,31,.7)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, H * 0.55, W, H * 0.45);

  const cardH = o.layers.progress ? 236 : 0;
  const cardY = H - safe - cardH - (o.format === 'story' ? 20 : 24);

  // the mini tree stands on the card's right edge
  if (o.layers.tree) {
    const px = 2;
    const tx = W - 60 - SCENE_W * px;
    const ty = (o.layers.progress ? cardY + 40 : H - safe - 20) - SCENE_H * px;
    drawTree(ctx, o.ornaments, tx, ty, px);
  }

  if (o.layers.stickers) {
    const top = safe + 40;
    const bottom = (o.layers.progress ? cardY : H - safe) - 160;
    const px = 9;
    const size = SPRITE_SIZE * px;
    o.stickers.slice(0, SPOTS.length).forEach((id, i) => {
      const grid = SPRITES[id];
      if (!grid) return;
      const [fx, fy, tilt] = SPOTS[i];
      const phase = i * 1.7;
      const bob = animate ? Math.sin(t * 2.4 + phase) * 14 : 0;
      const turn = ((tilt + (animate ? Math.sin(t * 1.8 + phase) * 5 : 0)) * Math.PI) / 180;
      const cx = fx * W;
      const cy = top + fy * (bottom - top) + bob;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(turn);
      // a white sticker edge behind the art, like a die-cut sticker
      ctx.globalAlpha = 0.95;
      for (const [dx, dy] of [[-px, 0], [px, 0], [0, -px], [0, px], [-px, -px], [px, px], [-px, px], [px, -px]]) {
        drawGrid(ctx, grid.map((row) => row.map((c) => (c ? '#fff7ec' : null))), -size / 2 + dx, -size / 2 + dy, px);
      }
      ctx.globalAlpha = 1;
      drawGrid(ctx, grid, -size / 2, -size / 2, px);
      ctx.restore();
      if (animate) {
        // two sparkles that twinkle around each sticker
        for (const [sx, sy, d] of [[0.55, -0.55, 0], [-0.6, 0.35, 1.3]]) {
          const a = Math.max(0, Math.sin(t * 3.2 + phase + d));
          ctx.globalAlpha = a;
          miniStar(ctx, cx + sx * size, cy + sy * size, 5, '#ffc94a', '#fff7ec');
        }
        ctx.globalAlpha = 1;
      }
    });
  }

  if (o.layers.progress) drawCard(ctx, o, 60, cardY, W - 120 - (o.layers.tree ? 230 : 0), cardH);
}

/** The progress card: brand, your name, today's door and your Advent in numbers. */
function drawCard(ctx: CanvasRenderingContext2D, o: RunPhoto, x: number, y: number, w: number, h: number) {
  notchedRect(ctx, x, y, w, h, 10, 'rgba(10,17,36,.82)');
  ctx.fillStyle = '#ffc94a';
  ctx.fillRect(x + 10, y, w - 20, 6);

  const face = 64;
  drawAvatar(ctx, o.avatar, o.ownerName, x + 32, y + 34, face);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffc94a';
  ctx.font = `800 22px ${BODY}`;
  ctx.fillText('ADVENT OF RUNNING', x + 32 + face + 20, y + 62);
  ctx.fillStyle = '#fff7ec';
  ctx.font = `600 40px ${FONT}`;
  const s = o.stats;
  const heading = s && s.door > 0 ? `Door ${s.door} · ${s.date}` : `${o.ownerName}'s Advent`;
  ctx.fillText(heading, x + 32 + face + 20, y + 100, w - face - 84);

  const cols = s
    ? [
        ...(s.door > 0 ? [['TODAY', `${s.todayKm.toFixed(1)} km`]] : []),
        ['DOORS', `${s.doors}/24`],
        ['ADVENT', `${s.km.toFixed(1)} km`],
      ]
    : [['LETTERS', `${o.ornaments.length}`]];
  const colW = (w - 64) / cols.length;
  cols.forEach(([label, value], i) => {
    const cx = x + 32 + colW * i;
    ctx.fillStyle = '#c3cde6';
    ctx.font = `800 20px ${BODY}`;
    ctx.fillText(label, cx, y + h - 82);
    ctx.fillStyle = '#fff7ec';
    ctx.font = `600 ${cols.length > 2 ? 46 : 52}px ${FONT}`;
    ctx.fillText(value, cx, y + h - 34);
  });
}

/** Video formats to try, best for Instagram first. */
const VIDEO_TYPES = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'];

export const videoType = () =>
  typeof MediaRecorder === 'undefined' ? null : VIDEO_TYPES.find((t) => MediaRecorder.isTypeSupported(t)) ?? null;

/** Records `seconds` of the animated run photo. Null where the browser can't record video. */
export async function recordRunPhoto(o: RunPhoto, seconds = 4): Promise<Blob | null> {
  const type = videoType();
  if (!type) return null;
  const { W, H } = SIZE[o.format];
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  // Safari only records a canvas that's on the page: keep it there, tiny and out of sight
  canvas.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:.01;pointer-events:none';
  document.body.appendChild(canvas);
  // opaque: a see-through canvas turns black or tinted in some phones' MP4 encoders
  const ctx = canvas.getContext('2d', { alpha: false })!;
  drawRunPhoto(ctx, o, 0, true);
  // frames are handed over one by one after each draw, so none is half drawn or skipped
  const stream = canvas.captureStream(0);
  const track = stream.getVideoTracks()[0] as MediaStreamTrack & { requestFrame?: () => void };
  const manual = typeof track.requestFrame === 'function';
  const live = manual ? stream : canvas.captureStream(30);
  const rec = new MediaRecorder(live, { mimeType: type, videoBitsPerSecond: 8_000_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise<void>((r) => (rec.onstop = () => r()));
  rec.start();
  const t0 = performance.now();
  try {
    await new Promise<void>((resolve) => {
      const frame = (now: number) => {
        const t = (now - t0) / 1000;
        drawRunPhoto(ctx, o, t, true);
        if (manual) track.requestFrame!();
        if (t < seconds) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
    rec.stop();
    await done;
  } finally {
    stream.getTracks().forEach((tr) => tr.stop());
    live.getTracks().forEach((tr) => tr.stop());
    canvas.remove();
  }
  return new Blob(chunks, { type: type.split(';')[0] });
}

/** Saves or shares a file (picture or video). Share falls back to false where unsupported. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function shareBlob(blob: Blob, filename: string, text: string) {
  const file = new File([blob], filename, { type: blob.type });
  if (!navigator.canShare?.({ files: [file] })) return false;
  try {
    await navigator.share({ files: [file], text });
  } catch {
    /* share sheet dismissed */
  }
  return true;
}
