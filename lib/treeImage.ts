/**
 * Draws a tree onto a canvas from the same pixel data the page uses, for pictures people
 * can save: a tree card, and the tree beside you in the photo booth. Everything is drawn
 * at a whole number of screen pixels per art pixel, so the pixels stay square and crisp.
 */

import { avatarColor } from './avatar';
import type { Hung } from './data';
import { BY_ID } from './ornaments';
import { SKY_KEYS, localHour, skyVars } from './sky';
import { SPRITE_SIZE, SPRITES, TREE_H, TREE_LIGHTS, TREE_SLOTS, TREE_W } from './sprites';

/** Sparkles that twinkle around the star, in tree pixels: [x, y, delay]. */
export const TOPPER_GLINTS: [number, number, number][] = [[63, 4, 0], [96, 2, -0.8], [99, 14, -1.6], [61, 15, -2.2]];

/** The mini star used for every sparkle, as [dx, dy] from its centre pixel. */
const MINI_STAR = [[0, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [-1, 2], [1, 2]];

/** Which ornaments fit on the tree, rarest first; a freshly hung one always gets a spot. */
export function placeOrnaments(ornaments: Hung[], highlightId?: string) {
  const order = { rare: 0, special: 1, basic: 2 } as const;
  const sorted = [...ornaments].sort(
    (a, b) => order[BY_ID[a.ornamentId]?.tier ?? 'basic'] - order[BY_ID[b.ornamentId]?.tier ?? 'basic'],
  );
  if (highlightId) {
    const i = sorted.findIndex((h) => h.id === highlightId);
    if (i >= TREE_SLOTS.length) sorted.unshift(...sorted.splice(i, 1));
  }
  const shown = sorted.slice(0, TREE_SLOTS.length);
  return { shown, extra: ornaments.length - shown.length };
}

/** The snow bank under the tree (same shape as the page's), in its own 2-pixel grid. */
const GROUND = [
  { d: 'M0 14V9h6V7h10V5h14V4h30v1h14v2h10v2h6v5z', fill: '#e9eefb' },
  { d: 'M0 14v-3h8V9h12V8h50v1h12v2h8v3z', fill: '#c7d3f0' },
];
/** Width and height of the tree plus its snow bank, in tree pixels. */
export const SCENE_W = 164;
export const SCENE_H = TREE_H + 16;

function drawGrid(ctx: CanvasRenderingContext2D, grid: (string | null)[][], x0: number, y0: number, px: number) {
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      let n = 1;
      while (x + n < row.length && row[x + n] === c) n++;
      if (c) {
        ctx.fillStyle = c;
        ctx.fillRect(x0 + x * px, y0 + y * px, n * px, px);
      }
      x += n;
    }
  });
}

function miniStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, u: number, body: string, centre: string) {
  for (const [dx, dy] of MINI_STAR) {
    ctx.fillStyle = dx === 0 && dy === 0 ? centre : body;
    ctx.fillRect(cx + dx * u, cy + dy * u, u, u);
  }
}

/**
 * Draws the tree, its lit bulbs, the star's sparkles, the ornaments and the snow bank.
 * (x, y) is the top-left of the scene, which is SCENE_W × SCENE_H tree pixels.
 */
export function drawTree(ctx: CanvasRenderingContext2D, ornaments: Hung[], x: number, y: number, px: number) {
  const tx = x + ((SCENE_W - TREE_W) / 2) * px;
  // snow bank: its paths are in a 2-pixel grid (the page's viewBox starts at x=4), and it
  // reaches 16 tree pixels below the tree, like the page's
  ctx.save();
  ctx.translate(x - 4 * 2 * px, y + (TREE_H - 12) * px);
  ctx.scale(2 * px, 2 * px);
  for (const g of GROUND) {
    ctx.fillStyle = g.fill;
    ctx.fill(new Path2D(g.d));
  }
  ctx.restore();

  drawGrid(ctx, SPRITES.tree, tx, y, px);
  for (const [lx, ly, color] of TREE_LIGHTS) {
    ctx.fillStyle = color;
    ctx.fillRect(tx + lx * px, y + ly * px, 2 * px, 2 * px);
    ctx.fillStyle = '#fff0b8';
    ctx.fillRect(tx + lx * px, y + ly * px, px, px);
  }
  for (const [gx, gy] of TOPPER_GLINTS) miniStar(ctx, tx + gx * px, y + gy * px, px, '#ffc94a', '#fff7ec');
  const half = SPRITE_SIZE / 2;
  placeOrnaments(ornaments).shown.forEach((h, i) => {
    const grid = SPRITES[h.ornamentId];
    if (!grid) return;
    const [sx, sy] = TREE_SLOTS[i];
    drawGrid(ctx, grid, tx + (sx - half) * px, y + (sy - half) * px, px);
  });
}

const FONT = '"Pixelify Sans", system-ui, sans-serif';
const BODY = '"M PLUS Rounded 1c", system-ui, sans-serif';

/** Waits for the pixel font so text on the canvas doesn't fall back to a system font. */
export async function loadFonts() {
  try {
    await Promise.all([document.fonts.load(`600 64px ${FONT}`), document.fonts.load(`800 32px ${BODY}`)]);
  } catch {
    /* older browsers: draw with whatever is there */
  }
}

/** Loads an image for the canvas, or null if there is none or it fails. */
function loadImage(src: string | null | undefined): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** A square with notched pixel corners, like the page's `--px4` clip. */
function notchedSquare(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, n: number) {
  ctx.beginPath();
  ctx.moveTo(x + n, y);
  ctx.lineTo(x + s - n, y);
  ctx.lineTo(x + s - n, y + n);
  ctx.lineTo(x + s, y + n);
  ctx.lineTo(x + s, y + s - n);
  ctx.lineTo(x + s - n, y + s - n);
  ctx.lineTo(x + s - n, y + s);
  ctx.lineTo(x + n, y + s);
  ctx.lineTo(x + n, y + s - n);
  ctx.lineTo(x, y + s - n);
  ctx.lineTo(x, y + n);
  ctx.lineTo(x + n, y + n);
  ctx.closePath();
}

/** The runner's avatar as on the page: their photo, or their initial on a colour, in a snow frame. */
function drawAvatar(ctx: CanvasRenderingContext2D, photo: HTMLImageElement | null, name: string, x: number, y: number, size: number) {
  const frame = Math.max(2, Math.round(size / 20));
  const inner = size - 2 * frame;
  const notch = Math.max(2, Math.round(size / 16));
  ctx.save();
  notchedSquare(ctx, x, y, size, notch);
  ctx.fillStyle = '#fff7ec';
  ctx.fill();
  notchedSquare(ctx, x + frame, y + frame, inner, notch);
  ctx.clip();
  if (photo) {
    // fill the square, cropping the longer side
    const s = Math.min(photo.naturalWidth, photo.naturalHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(photo, (photo.naturalWidth - s) / 2, (photo.naturalHeight - s) / 2, s, s, x + frame, y + frame, inner, inner);
  } else {
    ctx.fillStyle = avatarColor(name);
    ctx.fillRect(x + frame, y + frame, inner, inner);
    ctx.fillStyle = '#101a33';
    ctx.font = `800 ${Math.round(inner * 0.55)}px ${BODY}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name.charAt(0).toUpperCase(), x + size / 2, y + size / 2 + inner * 0.04);
  }
  ctx.restore();
}

/**
 * The sky exactly as it is on screen right now (it follows the time of day, or a ?sky=
 * preview), read from the page's CSS variables; worked out from the clock if they're missing.
 */
function currentSky() {
  const fallback = skyVars(localHour(), SKY_KEYS);
  const css = getComputedStyle(document.documentElement);
  const get = (k: string) => css.getPropertyValue(k).trim() || fallback[k];
  const glow = get('--sky-glow');
  const rgb = glow.match(/[\d.]+/g)?.slice(0, 3).join(',') ?? '0,0,0';
  return {
    top: get('--sky-top'),
    mid: get('--sky-mid'),
    bottom: get('--sky-bottom'),
    glow,
    glowClear: `rgba(${rgb},0)`,
    stars: Math.min(1, Math.max(0, Number(get('--sky-stars')) || 0)),
  };
}

/** A 1080×1350 card (4:5, fits a phone screen and an Instagram post): sky, tree, name, count. */
type Owner = { ornaments: Hung[]; ownerName: string; /** same-origin photo URL, from `avatarSrc` */ avatar?: string | null };

export async function renderTreeCard({ ornaments, ownerName, avatar, link }: Owner & { link: string }) {
  const [photo] = await Promise.all([loadImage(avatar), loadFonts()]);
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // the sky as it is right now: the same gradient, horizon glow and stars as the page
  const now = currentSky();
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, now.top);
  sky.addColorStop(0.55, now.mid);
  sky.addColorStop(1, now.bottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  // the page's glow is an ellipse 120% wide and 45% tall at the bottom centre, fading out by 70%
  ctx.save();
  ctx.translate(W / 2, H);
  ctx.scale((1.2 * W) / (0.45 * H), 1);
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 0.45 * H);
  glow.addColorStop(0, now.glow);
  glow.addColorStop(0.7, now.glowClear);
  ctx.fillStyle = glow;
  ctx.fillRect(-W, -H, 2 * W, H);
  ctx.restore();
  // a scattering of mini stars, the same shape as every other sparkle; they fade out by day
  const stars = [[90, 120], [980, 90], [180, 330], [930, 300], [60, 620], [1010, 560], [140, 900], [960, 860], [320, 70], [880, 214]];
  stars.forEach(([sx, sy], i) => {
    ctx.globalAlpha = (i % 2 ? 0.45 : 0.8) * now.stars;
    miniStar(ctx, sx, sy, 4, '#fff7ec', '#fff7ec');
  });
  ctx.globalAlpha = 1;

  // heading
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffc94a';
  ctx.font = `800 28px ${BODY}`;
  ctx.fillText('ADVENT OF RUNNING', W / 2, 96);
  // the avatar and "Name's tree", centred together; long names get a smaller font
  const title = `${ownerName}'s tree`;
  const face = 88;
  const gap = 24;
  let fontSize = 72;
  ctx.font = `600 ${fontSize}px ${FONT}`;
  while (fontSize > 40 && face + gap + ctx.measureText(title).width > W - 120) {
    fontSize -= 4;
    ctx.font = `600 ${fontSize}px ${FONT}`;
  }
  const left = (W - (face + gap + ctx.measureText(title).width)) / 2;
  drawAvatar(ctx, photo, ownerName, left, 150 - face / 2, face);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff7ec';
  ctx.font = `600 ${fontSize}px ${FONT}`;
  ctx.fillText(title, left + face + gap, 150);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // the tree, 4 screen pixels per art pixel
  const px = 4;
  drawTree(ctx, ornaments, (W - SCENE_W * px) / 2, 236, px);

  // snow at the bottom, with the details on it
  const groundTop = 236 + SCENE_H * px - 8;
  ctx.fillStyle = '#e9eefb';
  ctx.fillRect(0, groundTop, W, H - groundTop);
  ctx.fillStyle = '#c7d3f0';
  ctx.fillRect(0, H - 24, W, 24);
  ctx.fillStyle = '#101a33';
  ctx.font = `600 44px ${FONT}`;
  const n = ornaments.length;
  ctx.fillText(`${n} sealed ornament${n === 1 ? '' : 's'}`, W / 2, groundTop + 64);
  ctx.font = `800 28px ${BODY}`;
  ctx.fillStyle = '#3c4a70';
  ctx.fillText('Opens on Christmas morning. Hang one on my tree:', W / 2, groundTop + 112);
  ctx.fillStyle = '#b8384f';
  ctx.fillText(link.replace(/^https?:\/\//, ''), W / 2, groundTop + 152);
  return canvas;
}

/**
 * A photo booth picture: the camera frame (mirrored, like a mirror) with the tree standing
 * in the bottom-right corner and a small name plate.
 */
export async function renderPhoto({ video, ornaments, ownerName, avatar }: Owner & { video: HTMLVideoElement }) {
  const [photo] = await Promise.all([loadImage(avatar), loadFonts()]);
  const { W, H, px, margin } = photoLayout(video.videoWidth, video.videoHeight);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.save();
  ctx.translate(W, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, W, H);
  ctx.restore();

  drawTree(ctx, ornaments, W - SCENE_W * px - margin, H - SCENE_H * px - margin, px);

  // name plate with the avatar, top-left
  const size = Math.round(W * 0.032);
  const plate = Math.round(size * 2.2);
  const pad = Math.round(size * 0.3);
  const face = plate - 2 * pad;
  ctx.font = `600 ${size}px ${FONT}`;
  const text = `${ownerName}'s tree · Advent of Running`;
  const w = pad + face + size * 0.5 + ctx.measureText(text).width + size * 0.7;
  ctx.fillStyle = 'rgba(10,17,36,.78)';
  ctx.fillRect(margin, margin, w, plate);
  drawAvatar(ctx, photo, ownerName, margin + pad, margin + pad, face);
  ctx.fillStyle = '#fff7ec';
  ctx.font = `600 ${size}px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, margin + pad + face + size * 0.5, margin + plate / 2);
  return canvas;
}

/**
 * Size of a photo and of the tree in it. Small camera frames are scaled up first, so the
 * tree can be drawn at a whole number of pixels per art pixel and still fill about 40% of
 * the width (never more than 55%, or taller than 70% of the frame).
 */
export function photoLayout(videoW: number, videoH: number) {
  const k = Math.max(1, Math.ceil(1000 / videoW));
  const W = videoW * k;
  const H = videoH * k;
  let px = Math.max(1, Math.round((W * 0.42) / SCENE_W));
  while (px > 1 && (SCENE_W * px > W * 0.55 || SCENE_H * px > H * 0.7)) px--;
  return { W, H, px, margin: Math.round(W * 0.03) };
}

/** Saves a canvas as a PNG file. */
export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  return new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve();
    }, 'image/png');
  });
}

/** Opens the phone's share sheet with the picture, where that's supported. */
export async function shareCanvas(canvas: HTMLCanvasElement, filename: string, text: string) {
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
  if (!blob) return false;
  const file = new File([blob], filename, { type: 'image/png' });
  if (!navigator.canShare?.({ files: [file] })) return false;
  try {
    await navigator.share({ files: [file], text });
  } catch {
    /* share sheet dismissed */
  }
  return true;
}

export const canShareFiles = () => {
  try {
    return !!navigator.canShare?.({ files: [new File([''], 'x.png', { type: 'image/png' })] });
  } catch {
    return false;
  }
};
