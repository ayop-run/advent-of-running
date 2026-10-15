/**
 * All pixel art in one place, on one grid: every pixel of the tree, every ornament and
 * the pixel font is the same size on screen (see --pixel in globals.css).
 *
 * Each drawing is a list of rows; each character is one pixel, looked up in PALETTE
 * ('.' is transparent). Ornaments are 16×16 and hand-drawn. The tree is generated.
 * A shading pass then adds a light rim on the top-left and a shaded rim on the
 * bottom-right of every shape, so all sprites are lit from the same direction.
 */

export const PALETTE: Record<string, string> = {
  K: '#3a2240', // outline (deep plum, softer than black)
  k: '#1b1424', // eyes
  W: '#fff7ec',
  w: '#c7d3f0',
  R: '#e8546a',
  r: '#b8384f',
  P: '#ff9fb0', // cheeks
  G: '#ffc94a',
  g: '#d69a1e',
  Y: '#fff0b8',
  B: '#8fd3ff',
  b: '#5aa7e0',
  V: '#d4f0ff', // glass
  D: '#2f3d6b', // penguin navy
  O: '#ff9a5c',
  T: '#b07a4f',
  t: '#7a4b2c',
  U: '#e8c39a', // muzzle
  M: '#7fe0c4',
  C: '#c3cde3',
  // tree
  E: '#1d4f37', // outline
  F: '#24704b', // deep shadow under each tier
  n: '#2f9466', // shade side
  N: '#3fb57a', // mid
  L: '#62cf92', // lit side
  l: '#8fe3b0', // needle highlights
  Q: '#8a5a36', // trunk
  q: '#5e3a22',
};

export const SPRITE_SIZE = 16;

// ---------- ornaments ----------

const BAUBLE = [
  '.......KK.......',
  '......KGGK......',
  '.....KgYGgK.....',
  '....KKKKKKKK....',
  '...KFFFFFFFFK...',
  '..KFFFFFFFFFFK..',
  '.KFFFFFFFFFFFFK.',
  '.KFFFFFFFFFFFFK.',
  'KFFFFFFFFFFFFFFK',
  'KFFFFFFFFFFFFFFK',
  'KFFFFFFFFFFFFFFK',
  '.KFFFFFFFFFFFFK.',
  '.KFFFFFFFFFFFFK.',
  '..KFFFFFFFFFFK..',
  '...KFFFFFFFFK...',
  '....KKKKKKKK....',
];

const FACE = ['..Wk..Wk..', '..kk..kk..', 'PP.k..k.PP', '....kk....'];
const SHINE = ['.WW', 'W..', 'W..'];

/** Paint `rows` onto `base` at (x, y); '.' leaves the pixel underneath. */
function stamp(base: string[], x: number, y: number, rows: string[]) {
  const g = base.map((r) => [...r]);
  rows.forEach((row, dy) =>
    [...row].forEach((c, dx) => {
      if (c !== '.' && g[y + dy]?.[x + dx] !== undefined) g[y + dy][x + dx] = c;
    }),
  );
  return g.map((r) => r.join(''));
}

const bauble = (fill: string, ...stamps: [number, number, string[]][]) =>
  stamps.reduce((g, [x, y, rows]) => stamp(g, x, y, rows), BAUBLE.map((r) => r.replace(/F/g, fill)));

const BASE: Record<string, string[]> = {
  'bauble-snow': bauble('W', [3, 7, FACE], [3, 4, ['.ww', 'w..']]),
  'bauble-frost': bauble(
    'B',
    [3, 4, SHINE],
    [8, 5, ['.W.', 'WVW', '.W.']],
    [3, 9, ['.W.', 'WVW', '.W.']],
    [10, 10, ['W']],
    [7, 12, ['W']],
    [11, 7, ['V']],
  ),
  'bauble-cranberry': bauble(
    'R',
    [3, 4, SHINE],
    [1, 8, ['GGGGGGGGGGGGGG', 'YgYgYgYgYgYgYg', 'GGGGGGGGGGGGGG']],
    [6, 12, ['W']],
  ),
  snowflake: [
    '.......bb.......',
    '..b....WW....b..',
    '.bWb...WW...bWb.',
    '..bWb..WW..bWb..',
    '...bWbbWWbbWb...',
    '....bWWWWWWb....',
    'bWWbbWkWWkWbbWWb',
    'bWWWWWkWWkWWWWWb',
    'bWWbbPWkkWPbbWWb',
    '.bb.bWWWWWWb.bb.',
    '....bWWWWWWb....',
    '...bWbbWWbbWb...',
    '..bWb..WW..bWb..',
    '.bWb...WW...bWb.',
    '..b....WW....b..',
    '.......bb.......',
  ],
  sock: [
    '...KKKKKKK......',
    '...KWWWWWK......',
    '...KwWwWwK......',
    '...KKKKKKK......',
    '...KRRRRRK......',
    '...KRkRkRK......',
    '...KPRkRPK......',
    '...KGGGGGK......',
    '...KRRRRRK......',
    '...KRRRRRRKK....',
    '...KRRRRRRRRKK..',
    '...KRRRRRRRRWWK.',
    '...KRRRRRRRRWWK.',
    '....KRRRRRRRWWK.',
    '.....KKKKKKKKK..',
    '................',
  ],
  'hot-cocoa': [
    '....W...W.......',
    '.....W...W......',
    '....W...W.......',
    '..KKKKKKKKKK....',
    '..KWWWWWWWWK....',
    '..KwWWwWWWwK....',
    '..KRRRRRRRRKKK..',
    '..KRRkRRkRRK.K..',
    '..KRPRkkRPRK.K..',
    '..KRRRRRRRRKKK..',
    '..KRRRRRRRRK....',
    '..KGGGGGGGGK....',
    '..KRRRRRRRRK....',
    '...KRRRRRRK.....',
    '....KKKKKK......',
    '................',
  ],
  fox: [
    '.KK..........KK.',
    '.KOK........KOK.',
    '.KOPK......KPOK.',
    '.KOPOKKKKKKOPOK.',
    '.KOOOOOOOOOOOOK.',
    'KOOOOOOOOOOOOOOK',
    'KOOOWkOOOOWkOOOK',
    'KOOOkkOOOOkkOOOK',
    'KWWPWWWOOWWWPWWK',
    'KWWWWWWkkWWWWWWK',
    '.KWWWWkWWkWWWWK.',
    '.KWWWWWkkWWWWWK.',
    '..KWWWWWWWWWWK..',
    '...KKWWWWWWKK...',
    '.....KKKKKK.....',
    '................',
  ],
  penguin: [
    '.....KKKKKK.....',
    '....KDDDDDDK....',
    '...KDDDDDDDDK...',
    '..KDDWWWWWWDDK..',
    '..KDWWWWWWWWDK..',
    '..KDWWkWWkWWDK..',
    '..KDWPWOOWPWDK..',
    '.KDDWWWWWWWWDDK.',
    '.KDRRRRRRRRRRDK.',
    'KDDrWWWWWWWWDDDK',
    'KDDrWWWWWWWWDDDK',
    '.KDDWWWWWWWWDDK.',
    '.KDDWWWWWWWWDDK.',
    '..KDDWWWWWWDDK..',
    '...KOOOKKOOOK...',
    '....KKK..KKK....',
  ],
  reindeer: [
    '.t..t......t..t.',
    '.tt.t......t.tt.',
    '..ttt......ttt..',
    '....tKKKKKKt....',
    '...KTTTTTTTTK...',
    '..KTTTTTTTTTTK..',
    '.KTTWkTTTTWkTTK.',
    '.KTTkkTTTTkkTTK.',
    '.KTTUUUUUUUUTTK.',
    '.KTPUUUUUUUUPTK.',
    '..KUUUURRUUUUK..',
    '..KUUUkUUkUUUK..',
    '...KUUUkkUUUK...',
    '....KKKKKKKK....',
    '................',
    '................',
  ],
  'gingerbread-runner': [
    '.....KKKKKK.....',
    '....KTTTTTTK....',
    '...KTTTTTTTTK...',
    '...KTWkTTWkTK...',
    '...KTPTTTTPTK...',
    '....KTTWWTTK....',
    '..KKKKTTTTKKKK..',
    '.KWTTTTRRTTTTWK.',
    '.KKKKTTTTTTKKKK.',
    '....KTTRRTTK....',
    '....KTTTTTTK....',
    '...KTTTKKTTTK...',
    '..KWTTK..KTTWK..',
    '..KKKK....KKKK..',
    '................',
    '................',
  ],
  'santa-shoe': [
    '................',
    '................',
    '.......KKK......',
    '......KRRRK.....',
    '.....KRRRRK.....',
    '....KWWWWWWK....',
    '...KRRWRWRRK....',
    '..KRRRRRRRRRKK..',
    '.KRRRRRRRRRRRRK.',
    'KRRRRRRRRRRRRRRK',
    'KWWWWWWWWWWWWWWK',
    'KwwwwwwwwwwwwwwK',
    '.KKKKKKKKKKKKKK.',
    '................',
    '................',
    '................',
  ],
  'running-shoe': [
    '................',
    '................',
    '................',
    '.....KKKK.......',
    '....KMMMMK......',
    '...KMWMWMMK.....',
    '..KMMMMMMMMKK...',
    '.KMMMMWWWWMMMK..',
    'KMMMMMMMMMMMMMK.',
    'KWWWWWWWWWWWWWWK',
    'KwwRwwRwwRwwwwwK',
    '.KKKKKKKKKKKKKK.',
    '................',
    '................',
    '................',
    '................',
  ],
  'finish-medal': [
    'KRRRK......KBBBK',
    '.KRRRK....KBBBK.',
    '..KRRRK..KBBBK..',
    '...KRRRKKBBBK...',
    '....KRRKKBBK....',
    '.....KKKKKK.....',
    '....KGGGGGGK....',
    '...KGGYYGGGgK...',
    '..KGYWkGGWkGgK..',
    '..KGGkkGGkkGgK..',
    '..KGPGkGGkGPgK..',
    '..KGGGGkkGGGgK..',
    '...KGGGGGGGgK...',
    '....KggggggK....',
    '.....KKKKKK.....',
    '................',
  ],
  stopwatch: [
    '.......KK.......',
    '......KCCK......',
    '.....KKKKKK.....',
    '....KCCCCCCK....',
    '...KCWWWWWWCK...',
    '..KCWWWWWWWWCK..',
    '.KCWWWkWWkWWWCK.',
    '.KCWWWkWWkWWWCK.',
    '.KCWPWkWWkWPWCK.',
    '.KCWWWWkkWWWWCK.',
    '..KCWWWWWWWWCK..',
    '...KCWWWWWWCK...',
    '....KCCCCCCK....',
    '.....KKKKKK.....',
    '................',
    '................',
  ],
  'snow-globe': [
    '.....KKKKKK.....',
    '....KVVVVVVK....',
    '...KVWVVVVVVK...',
    '..KVWVVNNVVVVK..',
    '..KVVVNNNNVWVK..',
    '.KVVVNNNNNNVVVK.',
    '.KVWNNNNNNNNVVK.',
    '.KVVVVVTTVVVWVK.',
    '.KWWWWWWWWWWWWK.',
    '..KWWwWWWWwWWK..',
    '...KKKKKKKKKK...',
    '..KRRRRRRRRRRK..',
    '.KRRGRRGGRRGRRK.',
    '.KrrrrrrrrrrrrK.',
    '..KKKKKKKKKKKK..',
    '................',
  ],
  'bell-gold': [
    '.......KK.......',
    '......KGGK......',
    '.....KGGGGK.....',
    '....KGYGGGGK....',
    '....KGYGGGGK....',
    '...KGGGGGGGGK...',
    '...KGWkGGWkGK...',
    '..KGGkkGGkkGgK..',
    '..KGPGkGGkGPgK..',
    '.KGGGGGkkGGGGgK.',
    '.KGGGGGGGGGGGgK.',
    'KGGGGGGGGGGGGGgK',
    'KRRRRRRRRRRRRRRK',
    '.KKKKKKggKKKKKK.',
    '.......KK.......',
    '................',
  ],
  'gift-box': [
    '...KKK....KKK...',
    '..KGGGK..KGGGK..',
    '..KGYGGKKGGYGK..',
    '...KKGGGGGGKK...',
    'KKKKKKKGGKKKKKKK',
    'KRRRRRRGGRRRRRRK',
    'KrrrrrrggrrrrrrK',
    'KKKKKKKGGKKKKKKK',
    '.KRRRRRGGRRRRRK.',
    '.KRWkRRGGRRWkRK.',
    '.KRkkRRGGRRkkRK.',
    '.KRPRRRGGRRRPRK.',
    '.KRRRRRGGRRRRRK.',
    '.KrrrrrggrrrrrK.',
    '.KKKKKKKKKKKKKK.',
    '................',
  ],
  // ---- UI icons (not ornaments), on the same grid ----
  lock: [
    '................',
    '.....KKKKKK.....',
    '....KCCCCCCK....',
    '...KCKKKKKKCK...',
    '...KCK....KCK...',
    '...KCK....KCK...',
    '..KKKKKKKKKKKK..',
    '..KGGGGGGGGGGK..',
    '..KGYGGGGGGGgK..',
    '..KGGGGKKGGGgK..',
    '..KGGGGKKGGGgK..',
    '..KGGGGGKGGGgK..',
    '..KggggggggggK..',
    '..KKKKKKKKKKKK..',
    '................',
    '................',
  ],
  // the tree topper (not an ornament)
  'star-gold': [
    '.......KK.......',
    '......KGGK......',
    '......KGGK......',
    '.....KGYGGK.....',
    'KKKKKKGYGGKKKKKK',
    'KGGGGGGGGGGGGGgK',
    '.KGGGWkGGWkGGgK.',
    '..KGGkkGGkkGgK..',
    '...KGGGkkGGgK...',
    '...KGGGGGGGgK...',
    '..KGGGGKKGGGgK..',
    '..KGGGK..KGGgK..',
    '.KGGGK....KGGgK.',
    '.KGGK......KGgK.',
    'KKKK........KKKK',
    '................',
  ],
};

// ---------- the tree ----------

export const TREE_W = 132;
export const TREE_H = 172;
const MID = TREE_W / 2;

/** [top row, bottom row, half-width at top, half-width at bottom], drawn bottom tier first. */
const TIERS: [number, number, number, number][] = [
  [96, 140, 30, 64],
  [64, 108, 22, 54],
  [34, 76, 14, 40],
  [12, 44, 4, 26],
];
/** Stable pseudo-random 0–99 per pixel, so texture looks scattered rather than gridded. */
const hash = (x: number, y: number) => (((x * 374761393 + y * 668265263) ^ ((x * 374761393 + y * 668265263) >>> 13)) >>> 0) % 100;
const BOUGH = 12; // width of each drooping bough along a tier's bottom edge
const LIGHTS = ['R', 'G', 'B', 'M', 'P'];

function buildTree(): string[] {
  const g: string[][] = Array.from({ length: TREE_H }, () => Array(TREE_W).fill('.'));
  const tier: number[][] = Array.from({ length: TREE_H }, () => Array(TREE_W).fill(-1));
  const inside = (x: number, y: number) => x >= 0 && x < TREE_W && y >= 0 && y < TREE_H;
  const set = (x: number, y: number, c: string) => {
    if (inside(x, y)) g[y][x] = c;
  };

  // trunk, with bark streaks
  for (let y = 136; y < 154; y++)
    for (let x = 58; x < 74; x++) set(x, y, x === 58 || x === 73 ? 'K' : x > 66 || (x * 3 + y) % 7 === 0 ? 'q' : 'Q');

  // pot: rim, gold band, body narrowing toward the base
  for (let y = 148; y < TREE_H; y++) {
    const inset = y < 154 ? 0 : 3 + Math.floor((y - 154) / 4);
    const l = 42 + inset;
    const r = 89 - inset;
    for (let x = l; x <= r; x++) {
      let c = x < MID + 8 ? 'R' : 'r';
      if (x === l || x === r || y === 148 || y === 153 || y === TREE_H - 1) c = 'K';
      else if (y === 149) c = 'W';
      else if (y === 158) c = 'G';
      else if (y === 159) c = 'g';
      set(x, y, c);
    }
  }

  TIERS.forEach(([top, bottom, hw0, hw1], t) => {
    const l = MID - hw1;
    const r = MID + hw1 - 1;
    // each bough droops a little below the tier's straight bottom
    const edge = (x: number) => bottom + Math.round(3 * Math.sin((Math.PI * (((x - l) % BOUGH) + 0.5)) / BOUGH));
    for (let x = l; x <= r; x++) {
      for (let y = top; y <= edge(x); y++) {
        const row = Math.min(y, bottom);
        const hw = hw0 + Math.floor(((row - top) * (hw1 - hw0)) / (bottom - top));
        if (x < MID - hw || x > MID + hw - 1) continue;
        // three tones across the tier, lit from the left, dithered where they meet
        const across = (x - (MID - hw)) / (2 * hw);
        const checker = (x + y) % 2 === 0 ? 0.03 : -0.03;
        let c = across + checker < 0.3 ? 'L' : across + checker < 0.62 ? 'N' : 'n';
        // scattered needle strokes: a light pixel with a darker one under it
        const h = hash(x, y);
        if (h < 4) c = across < 0.62 ? 'l' : 'N';
        else if (h < 7) c = 'F';
        else if (hash(x, y - 1) < 4) c = across < 0.62 ? 'N' : 'F';
        set(x, y, c);
        tier[y][x] = t;
      }
      // a soft shadow cast on the tier below
      for (let d = 1; d <= 3; d++) {
        const y = edge(x) + d;
        if (inside(x, y) && tier[y][x] >= 0 && tier[y][x] < t) set(x, y, 'F');
      }
    }

    // a sagging string of lights across the tier
    const ly = Math.round(top + (bottom - top) * 0.62);
    const lhw = hw0 + Math.floor(((ly - top) * (hw1 - hw0)) / (bottom - top));
    const a = MID - lhw + 3;
    const b = MID + lhw - 4;
    let bulb = t;
    for (let x = a; x <= b; x++) {
      const y = ly + Math.round(5 * Math.sin((Math.PI * (x - a)) / (b - a)));
      set(x, y, 'g');
      if ((x - a) % 10 === 5) {
        const c = LIGHTS[bulb++ % LIGHTS.length];
        set(x, y + 1, 'Y');
        set(x + 1, y + 1, c);
        set(x, y + 2, c);
        set(x + 1, y + 2, c);
      }
    }
  });

  // dark outline around the foliage silhouette
  const out = g.map((row) => [...row]);
  for (let y = 0; y < TREE_H; y++)
    for (let x = 0; x < TREE_W; x++) {
      if (!'LNnlFg'.includes(g[y][x])) continue;
      const open = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !inside(x + dx, y + dy) || g[y + dy][x + dx] === '.');
      if (open) out[y][x] = 'E';
    }

  // star on top
  BASE['star-gold'].forEach((row, y) => [...row].forEach((c, x) => {
    if (c !== '.') out[y][x + MID - 8] = c;
  }));
  return out.map((row) => row.join(''));
}

// ---------- colouring ----------

/** A sprite is a grid of hex colours; null is transparent. */
export type Grid = (string | null)[][];

const RIMLESS = new Set(['K', 'k', 'E', '.']);

function tone(hex: string, amount: number) {
  // amount > 0 mixes toward warm white, < 0 toward the outline plum
  const to = amount > 0 ? [255, 250, 240] : [40, 22, 48];
  const a = Math.abs(amount);
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return '#' + c.map((v, i) => Math.round(v + (to[i] - v) * a).toString(16).padStart(2, '0')).join('');
}

/** Colour a drawing, adding a light top-left rim and a shaded bottom-right rim to every shape. */
function colour(rows: string[], rim = true): Grid {
  const at = (x: number, y: number) => rows[y]?.[x] ?? '.';
  const edge = (c: string) => c === '.' || c === 'K' || c === 'E';
  return rows.map((row, y) =>
    [...row].map((c, x) => {
      if (c === '.') return null;
      const hex = PALETTE[c];
      if (!rim || RIMLESS.has(c)) return hex;
      if (edge(at(x + 1, y)) || edge(at(x, y + 1))) return tone(hex, -0.16);
      if (edge(at(x - 1, y)) || edge(at(x, y - 1))) return tone(hex, 0.3);
      return hex;
    }),
  );
}

export const SPRITES: Record<string, Grid> = Object.fromEntries(
  Object.entries(BASE).map(([id, rows]) => [id, colour(rows)]),
);
SPRITES.tree = colour(buildTree(), false);

/**
 * Where ornaments hang, as centre points in tree pixels. Ornaments are 16×16 and
 * these are spaced so they never overlap.
 */
export const TREE_SLOTS: [number, number][] = [
  // filled in this order, so even a few ornaments spread over the whole tree
  [66, 72],
  [34, 94], [100, 94],
  [46, 124], [90, 124],
  [50, 58], [82, 58],
  [56, 89], [78, 89],
  [24, 128], [110, 128], [68, 126],
  [66, 33],
];
