/**
 * Photo booth: your photo (a selfie, or one from today's run) with Advent of Running on top,
 * like sharing an activity. Two layouts: "Today's run" (your progress) and "My tree" (an
 * invitation with your tree link). Ornament stickers move like they do in the app. One frame
 * is a picture; a few seconds of frames make a video. Works on a live camera feed too.
 */

import type { Hung } from './data';
import { poseAt } from './spriteMotion';
import { SPRITES, SPRITE_SIZE } from './sprites';
import { BODY, FONT, SCENE_H, SCENE_W, drawAvatar, drawGrid, drawTree, miniStar, notchedRect, type CardFormat } from './treeImage';

/** Your Advent so far, for the run card. `door` is today's door (0 outside Advent). */
export type RunStats = { door: number; date: string; todayKm: number; doors: number; km: number };

export type BoothMode = 'run' | 'tree';

/** What's behind everything: a photo, a camera frame or the live camera, `w`×`h` big. */
export type Backdrop = { src: CanvasImageSource; w: number; h: number; mirror?: boolean };

export type BoothScene = {
  backdrop: Backdrop | null;
  format: CardFormat;
  mode: BoothMode;
  /** ornament ids to stick on the photo, up to 4 */
  stickers: string[];
  stats: RunStats | null;
  ornaments: Hung[];
  ownerName: string;
  avatar: HTMLImageElement | null;
  /** your tree's public link, for the "My tree" card */
  link: string;
};

const SIZE = { story: { W: 1080, H: 1920, safe: 250 }, post: { W: 1080, H: 1440, safe: 48 } } as const;

/** Where stickers sit, as fractions of the free area above the card: [x, y, tilt]. */
const SPOTS: [number, number, number][] = [[0.18, 0.1, -8], [0.82, 0.16, 7], [0.14, 0.52, 6], [0.86, 0.58, -6]];

export const canvasSize = (format: CardFormat) => SIZE[format];

/** Draws the scene at `t` seconds; with `animate`, stickers play their moves and sparkle. */
export function drawBooth(ctx: CanvasRenderingContext2D, o: BoothScene, t = 0, animate = false) {
  const { W, H, safe } = SIZE[o.format];
  drawBackdrop(ctx, o.backdrop, W, H);

  // a soft dark fade at the bottom so the card reads on any photo
  const fade = ctx.createLinearGradient(0, H * 0.5, 0, H);
  fade.addColorStop(0, 'rgba(7,13,31,0)');
  fade.addColorStop(1, 'rgba(7,13,31,.72)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, H * 0.5, W, H * 0.5);

  const cardH = o.mode === 'run' ? 236 : 300;
  const cardY = H - safe - cardH - (o.format === 'story' ? 20 : 24);

  // the tree stands beside the card: small for a run, bigger when it's the star
  const px = o.mode === 'tree' ? 3 : 2;
  const treeW = SCENE_W * px;
  drawTree(ctx, o.ornaments, W - 50 - treeW, cardY + 40 - SCENE_H * px, px, animate ? t : undefined);

  drawStickers(ctx, o, safe + 40, cardY - 170 - (o.mode === 'tree' ? 120 : 0), t, animate);

  const cardW = W - 110 - (o.mode === 'run' ? 220 : 0);
  if (o.mode === 'run') drawRunCard(ctx, o, 60, cardY, cardW, cardH);
  else drawTreeCard(ctx, o, 60, cardY, W - 120, cardH);
}

/** The photo fills the frame, cropped from the middle; without one, the night sky. */
function drawBackdrop(ctx: CanvasRenderingContext2D, b: Backdrop | null, W: number, H: number) {
  if (!b || !b.w) {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#070d1f');
    sky.addColorStop(0.6, '#17284c');
    sky.addColorStop(1, '#2c2a58');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    return;
  }
  const k = Math.max(W / b.w, H / b.h);
  const pw = b.w * k;
  const ph = b.h * k;
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  if (b.mirror) {
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(b.src, (W - pw) / 2, (H - ph) / 2, pw, ph);
  ctx.restore();
  ctx.imageSmoothingEnabled = false;
}

/** Up to four ornaments, each with a white die-cut edge, moving like they do in the app. */
function drawStickers(ctx: CanvasRenderingContext2D, o: BoothScene, top: number, bottom: number, t: number, animate: boolean) {
  const { W } = SIZE[o.format];
  const px = 9;
  const size = SPRITE_SIZE * px;
  o.stickers.slice(0, SPOTS.length).forEach((id, i) => {
    const grid = SPRITES[id];
    if (!grid) return;
    const [fx, fy, tilt] = SPOTS[i];
    const pose = animate ? poseAt(id, t, i * 0.55) : null;
    const cx = fx * W + (pose ? pose.dx * px : 0);
    const cy = top + fy * Math.max(0, bottom - top) + (pose ? pose.dy * px : 0);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(((tilt + (pose?.turn ?? 0)) * Math.PI) / 180);
    if (pose?.flip) ctx.scale(-1, 1);
    ctx.globalAlpha = pose?.alpha ?? 1;
    const edge = grid.map((row) => row.map((c) => (c ? '#fff7ec' : null)));
    for (const [dx, dy] of [[-px, 0], [px, 0], [0, -px], [0, px], [-px, -px], [px, px], [-px, px], [px, -px]]) {
      drawGrid(ctx, edge, -size / 2 + dx, -size / 2 + dy, px);
    }
    if (pose && pose.bright > 1) ctx.filter = `brightness(${pose.bright})`;
    drawGrid(ctx, grid, -size / 2, -size / 2, px);
    ctx.restore();
    if (animate) {
      // two sparkles that twinkle around each sticker
      for (const [sx, sy, d] of [[0.6, -0.6, 0], [-0.65, 0.4, 1.3]]) {
        ctx.globalAlpha = Math.max(0, Math.sin(t * 3.2 + i * 1.7 + d));
        miniStar(ctx, cx + sx * size, cy + sy * size, 5, '#ffc94a', '#fff7ec');
      }
      ctx.globalAlpha = 1;
    }
  });
}

/** Card header: your avatar, the brand, and a heading in the pixel font. */
function cardHeader(ctx: CanvasRenderingContext2D, o: BoothScene, x: number, y: number, w: number, heading: string) {
  notchedRect(ctx, x, y, w, 6, 0, '#ffc94a');
  const face = 64;
  drawAvatar(ctx, o.avatar, o.ownerName, x + 32, y + 34, face);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffc94a';
  ctx.font = `800 22px ${BODY}`;
  ctx.fillText('ADVENT OF RUNNING', x + 32 + face + 20, y + 62);
  ctx.fillStyle = '#fff7ec';
  ctx.font = `600 40px ${FONT}`;
  ctx.fillText(heading, x + 32 + face + 20, y + 100, w - face - 84);
}

/** Today's run: today's door and your Advent in numbers. */
function drawRunCard(ctx: CanvasRenderingContext2D, o: BoothScene, x: number, y: number, w: number, h: number) {
  notchedRect(ctx, x, y, w, h, 10, 'rgba(10,17,36,.82)');
  const s = o.stats;
  cardHeader(ctx, o, x + 10, y, w - 20, s && s.door > 0 ? `Door ${s.door} · ${s.date}` : `${o.ownerName}'s Advent`);
  const cols = s
    ? [...(s.door > 0 ? [['TODAY', `${s.todayKm.toFixed(1)} km`]] : []), ['DOORS', `${s.doors}/24`], ['ADVENT', `${s.km.toFixed(1)} km`]]
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

/** My tree: an invitation to hang an ornament, the letter count and your tree link. */
function drawTreeCard(ctx: CanvasRenderingContext2D, o: BoothScene, x: number, y: number, w: number, h: number) {
  notchedRect(ctx, x, y, w, h, 10, 'rgba(10,17,36,.82)');
  const n = o.ornaments.length;
  cardHeader(ctx, o, x + 10, y, w - 20, `${o.ownerName}'s tree`);
  ctx.fillStyle = '#c3cde6';
  ctx.font = `800 26px ${BODY}`;
  ctx.fillText(`${n} sealed ${n === 1 ? 'letter' : 'letters'} · opens on Christmas`, x + 32, y + 152);
  ctx.fillStyle = '#fff7ec';
  ctx.font = `600 38px ${FONT}`;
  ctx.fillText('Hang an ornament on my tree', x + 32, y + 202, w - 64);
  // the link as a sticker: a cranberry chip with a snow-white address
  const address = o.link.replace(/^https?:\/\//, '');
  ctx.font = `800 28px ${BODY}`;
  const chipW = Math.min(w - 64, ctx.measureText(address).width + 56);
  const chipY = y + h - 76;
  notchedRect(ctx, x + 32, chipY + 5, chipW, 54, 6, '#8f2a3d');
  notchedRect(ctx, x + 32, chipY, chipW, 54, 6, '#b8384f');
  ctx.fillStyle = '#fff7ec';
  ctx.textBaseline = 'middle';
  ctx.fillText(address, x + 60, chipY + 28, chipW - 56);
  ctx.textBaseline = 'alphabetic';
}

/** Video formats to try, best for Instagram first. */
const VIDEO_TYPES = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'];

export const videoType = () =>
  typeof MediaRecorder === 'undefined' ? null : VIDEO_TYPES.find((t) => MediaRecorder.isTypeSupported(t)) ?? null;

/** Records `seconds` of the animated scene. Null where the browser can't record video. */
export async function recordBooth(o: BoothScene, seconds = 4): Promise<Blob | null> {
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
  drawBooth(ctx, o, 0, true);
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
        drawBooth(ctx, o, t, true);
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
