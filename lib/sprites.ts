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
  S: '#8e98b8', // concrete
  H: '#c38bff', // disco purple
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
/** A smaller face for narrow shapes. */
const FACE_S = ['Wk..Wk', 'kk..kk', 'P.kk.P'];
/** On white the eye shine disappears, so these faces get solid eyes. */
const solidEyes = (face: string[]) => face.map((r) => r.replace(/W/g, 'k'));
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

/** Berlin's crossing light: the walking man glowing on the dark signal box. */
const AMPEL_GO = [
  '.KKKKKKKKKKKKKK.',
  'KDDDDDDDDDDDDDDK',
  'KDDDDDLLLDDDDDDK',
  'KDDDDDLLLDDDDDDK',
  'KDDDLLLLLLLDDDDK',
  'KDDDDDLLLLDDDDDK',
  'KDDDDDLLLDDDDDDK',
  'KDDDLLLLLLLDDDDK',
  'KDDLDLLLLLDLDDDK',
  'KDDDDDLLLDDDDDDK',
  'KDDDDLLDLLDDDDDK',
  'KDDDLLDDDLLDDDDK',
  'KDDLLDDDDDLLDDDK',
  'KDDDDDDDDDDDDDDK',
  '.KKKKKKKKKKKKKK.',
  '................',
];

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
  snowflake: stamp([
    '......KKKK......',
    '.KK...KBBK...KK.',
    'KBBK..KBBK..KBBK',
    'KBBBK.KBBK.KBBBK',
    '.KBBBKKBBKKBBBK.',
    '..KBBBWWWWBBBK..',
    '.KKKKWWWWWWKKKK.',
    'KBBBBWWWWWWBBBBK',
    'KBBBBWWWWWWBBBBK',
    '.KKKKWWWWWWKKKK.',
    '..KBBBWWWWBBBK..',
    '.KBBBKKBBKKBBBK.',
    'KBBBK.KBBK.KBBBK',
    'KBBK..KBBK..KBBK',
    '.KK...KBBK...KK.',
    '......KKKK......',
  ], 5, 6, ['.k..k.', '.k..k.', 'P.kk.P']),
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

  // ---- running gear ----
  'water-bottle': stamp(
    [
      '......KKKK......',
      '......KbbK......',
      '.....KKKKKK.....',
      '.....KWWWWK.....',
      '....KVVVVVVK....',
      '...KVVVVVVVVK...',
      '...KBBBBBBBBK...',
      '...KBBBBBBBBK...',
      '...KBBBBBBBBK...',
      '...KBBBBBBBBK...',
      '...KVVVVVVVVK...',
      '...KVVVVVVVVK...',
      '...KVVVVVVVVK...',
      '...KBBBBBBBBK...',
      '....KKKKKKKK....',
      '................',
    ],
    5, 7, FACE_S,
  ),
  'energy-gel': stamp(
    [
      '.....KKKKKK.....',
      '.....KOOOOK.....',
      '......KOOK......',
      '.....KKKKKK.....',
      '....KOOOOOOK....',
      '....KOOOOOOK....',
      '....KOOOOOOK....',
      '....KOOOOOOK....',
      '....KOOOOOOK....',
      '....KWWWWWWK....',
      '....KWGGGGWK....',
      '....KWWWWWWK....',
      '....KOOOOOOK....',
      '....KOOOOOOK....',
      '....KKKKKKKK....',
      '................',
    ],
    5, 5, FACE_S,
  ),
  'race-bib': [
    '................',
    '................',
    '.KKKKKKKKKKKKKK.',
    '.KCWWWWWWWWWWCK.',
    '.KRRRRRRRRRRRRK.',
    '.KWWWWWWWWWWWWK.',
    '.KWWWkWkWkkkWWK.',
    '.KWWWkWkWWWkWWK.',
    '.KWWWkkkWkkkWWK.',
    '.KWWWWWkWkWWWWK.',
    '.KWWWWWkWkkkWWK.',
    '.KWWWWWWWWWWWWK.',
    '.KRRRRRRRRRRRRK.',
    '.KCWWWWWWWWWWCK.',
    '.KKKKKKKKKKKKKK.',
    '................',
  ],
  sweatband: [
    '................',
    '.....KKKKKK.....',
    '...KKRRRRRRKK...',
    '..KRRRRRRRRRRK..',
    '.KRRWWKKKKWWRRK.',
    '.KRWK......KWRK.',
    'KRRK........KRRK',
    'KRWK........KWRK',
    'KRWK........KWRK',
    'KRRK........KRRK',
    '.KRWK......KWRK.',
    '.KRRWWKKKKWWRRK.',
    '..KRRRRRRRRRRK..',
    '...KKRRRRRRKK...',
    '.....KKKKKK.....',
    '................',
  ],
  'bobble-beanie': stamp(
    [
      '......KKKK......',
      '.....KWWWWK.....',
      '.....KWwWWK.....',
      '......KKKK......',
      '....KKRRRRKK....',
      '...KRRRRRRRRK...',
      '..KRRRRRRRRRRK..',
      '..KRRRRRRRRRRK..',
      '.KRRRRRRRRRRRRK.',
      '.KRRRRRRRRRRRRK.',
      'KKKKKKKKKKKKKKKK',
      'KWwWwWwWwWwWwWwK',
      'KwWwWwWwWwWwWwWK',
      'KKKKKKKKKKKKKKKK',
      '................',
      '................',
    ],
    3, 6, FACE,
  ),
  'running-mitten': stamp(
    [
      '................',
      '.....KKKKK......',
      '....KMMMMMK.....',
      '...KMMMMMMMK....',
      '...KMMMMMMMKKK..',
      '...KMMMMMMMKMMK.',
      '...KMMMMMMMKMMK.',
      '...KMMMMMMMMMMK.',
      '...KMMMMMMMMMK..',
      '...KMMMMMMMMMK..',
      '...KMMMMMMMMK...',
      '...KKKKKKKKKK...',
      '...KWwWwWwWwK...',
      '...KwWwWwWwWK...',
      '...KKKKKKKKKK...',
      '................',
    ],
    5, 5, FACE_S,
  ),
  'running-cap': [
    '................',
    '................',
    '................',
    '.......KK.......',
    '.....KKBBKK.....',
    '....KBBBBBBK....',
    '...KBBBBBBBBK...',
    '..KBBBBBBBBBBK..',
    '..KBBBBBBBBBBK..',
    '..KBBWWWWWWBBK..',
    '..KKKKKKKKKKKKKK',
    '..KbbbbbbbbbbbbK',
    '...KKKKKKKKKKKK.',
    '................',
    '................',
    '................',
  ],
  'race-banana': [
    '................',
    '.............KK.',
    '............KtK.',
    '...........KGK..',
    '..........KGGK..',
    '.........KGGGK..',
    '........KGGGGK..',
    '.......KYGGGgK..',
    '.....KKYGGGGgK..',
    '...KKYYGGGGgK...',
    '.KKYYGGGGGgK....',
    'KtYGGGGGGgKK....',
    '.KKgggggKK......',
    '...KKKKK........',
    '................',
    '................',
  ],
  headlamp: [
    '................',
    '................',
    '................',
    '................',
    '.....KKKKKK.....',
    'KKKKKCCCCCCKKKKK',
    'KRRRKCYYYYCKRRRK',
    'KRRRKCYWWYCKRRRK',
    'KrrrKCYWWYCKrrrK',
    'KKKKKCYYYYCKKKKK',
    '.....KCCCCK.....',
    '......KKKK......',
    '................',
    '................',
    '................',
    '................',
  ],
  'aid-cup': stamp(
    [
      '................',
      '......B..B......',
      '.....B..B..B....',
      '...KKKKKKKKKK...',
      '...KBVBBBBVBK...',
      '...KWWWWWWWWK...',
      '...KWWWWWWWWK...',
      '....KWWWWWWK....',
      '....KWWWWWWK....',
      '....KRRRRRRK....',
      '....KWWWWWWK....',
      '.....KWWWWK.....',
      '.....KWWWWK.....',
      '.....KKKKKK.....',
      '................',
      '................',
    ],
    5, 6, solidEyes(FACE_S),
  ),
  'checkered-flag': [
    '.KK.............',
    'KCCK............',
    '.KCKKKKKKKKKKKK.',
    '.KCKWWkkWWkkWWK.',
    '.KCKWWkkWWkkWWK.',
    '.KCKkkWWkkWWkkK.',
    '.KCKkkWWkkWWkkK.',
    '.KCKWWkkWWkkWWK.',
    '.KCKWWkkWWkkWWK.',
    '.KCKKKKKKKKKKKK.',
    '.KCK............',
    '.KCK............',
    '.KCK............',
    '.KCK............',
    '.KKK............',
    '................',
  ],
  'gps-watch': [
    '.....KKKKKK.....',
    '.....KDDDDK.....',
    '.....KDDDDK.....',
    '...KKKKKKKKKK...',
    '..KCCCCCCCCCCK..',
    '..KCDDDDDDDDCKK.',
    '..KCDMDDDDMDCKK.',
    '..KCDMDDDDMDCK..',
    '..KCDDDDDDDDCK..',
    '..KCDMDDDDMDCK..',
    '..KCDDMMMMDDCK..',
    '..KCCCCCCCCCCK..',
    '...KKKKKKKKKK...',
    '.....KDDDDK.....',
    '.....KDDDDK.....',
    '.....KKKKKK.....',
  ],
  'super-shoe': [
    '................',
    '................',
    '................',
    '.....KKKK.......',
    '....KOOOOK......',
    '...KOWOWOOK.....',
    '..KOOOOOOOOKK...',
    '.KOOOOPPPPOOOK..',
    'KOOOOOOOOOOOOOK.',
    'KWWWWWWWWWWWWWWK',
    'KWWWWWWWWWWWWWWK',
    'KDDDDDDDDDDDDDDK',
    '.KKKKKKKKKKKKKK.',
    '................',
    '................',
    '................',
  ],
  'trail-shoe': [
    '................',
    '................',
    '................',
    '................',
    '.....KKKK.......',
    '....KOOOOK......',
    '...KOWOWOOK.....',
    '..KOOOOOOOOKKK..',
    '.KOOOOOOTTTOOOK.',
    'KOOOOOOOOOOOOOOK',
    'KttttttttttttttK',
    '.KKtKKtKKtKKtKK.',
    '................',
    '................',
    '................',
    '................',
  ],
  'foam-roller': stamp(
    [
      '................',
      '................',
      '................',
      '................',
      '..KKKKKKKKKKKK..',
      '.KMMMMMMMMMMKBK.',
      'KMMWMMWMMWMMKBBK',
      'KMMMMMMMMMMMKBbK',
      'KMWMMWMMWMMMKBbK',
      'KMMMMMMMMMMMKBBK',
      '.KMMMMMMMMMMKBK.',
      '..KKKKKKKKKKKK..',
      '................',
      '................',
      '................',
      '................',
    ],
    3, 6, FACE_S,
  ),
  'pacer-balloon': stamp(
    [
      '.....KKKKKK.....',
      '...KKBBBBBBKK...',
      '..KBWWBBBBBBBK..',
      '.KBWBBBBBBBBBBK.',
      '.KBBBBBBBBBBBBK.',
      'KBBBBBBBBBBBBBBK',
      'KBBBBBBBBBBBBBBK',
      'KBBBBBBBBBBBBBBK',
      '.KBBBBBBBBBBBBK.',
      '.KBBBBBBBBBBBbK.',
      '..KBBBBBBBBBbK..',
      '...KKBBBBBbKK...',
      '.....KKbbKK.....',
      '.......KK.......',
      '........K.......',
      '.......K........',
    ],
    3, 5, FACE,
  ),
  'race-singlet': stamp(
    [
      '................',
      '...KKK....KKK...',
      '...KBK....KBK...',
      '...KBBK..KBBK...',
      '..KBBBBKKBBBBK..',
      '..KWWWWWWWWWWK..',
      '..KBBBBBBBBBBK..',
      '..KBBBBBBBBBBK..',
      '..KBBBBBBBBBBK..',
      '..KBBBBBBBBBBK..',
      '..KBBBBBBBBBBK..',
      '..KBBBBBBBBBBK..',
      '..KBBBBBBBBBBK..',
      '..KbbbbbbbbbbK..',
      '..KKKKKKKKKKKK..',
      '................',
    ],
    3, 8, FACE,
  ),
  'foil-cape': [
    '.....KKKKKK.....',
    '....KTTTTTTK....',
    '...KTUUUUUUTK...',
    '...KUWkUUWkUK...',
    '...KUkkUUkkUK...',
    '...KPUUkkUUPK...',
    '..KKCCCCCCCCKK..',
    '.KCCWCCCCCCWCCK.',
    '.KCWCCCCCCCCWCK.',
    'KCCCCCWCCCCCCCCK',
    'KCWCCCCCCCWCCCCK',
    'KCCCCCCCCCCCCWCK',
    'KGGGGGGGGGGGGGGK',
    'KKKKKKKKKKKKKKKK',
    '................',
    '................',
  ],

  // ---- Berlin ----
  berliner: stamp(
    [
      '................',
      '................',
      '.....KKKKKK.....',
      '...KKWWWWWWKK...',
      '..KWWwWWwWWWWK..',
      '.KTWWWWWWWwWWTK.',
      '.KTTWWWWWWWWTTK.',
      'KTTTTTTTTTTTTTTK',
      'KTTTTTTTTTTTTTTK',
      'KTTTTTTTTTTTTTTK',
      'KRRTTTTTTTTTTTTK',
      '.KRTTTTTTTTTTTK.',
      '.KTTTTTTTTTTTTK.',
      '..KKTTTTTTTTKK..',
      '....KKKKKKKK....',
      '................',
    ],
    3, 8, FACE,
  ),
  pretzel: [
    '................',
    '................',
    '..KKKK....KKKK..',
    '.KTWTTK..KTTWTK.',
    'KTTKKTTKKTTKKTTK',
    'KTK..KTTTTK..KTK',
    'KTK...KTTK...KTK',
    'KTK..KTTTTK..KTK',
    'KTTKKTTKKTTKKTTK',
    '.KTTWTK..KTWTTK.',
    '..KTTK....KTTK..',
    '...KTTK..KTTK...',
    '....KTWKKWTK....',
    '.....KTTTTK.....',
    '......KKKK......',
    '................',
  ],
  'lebkuchen-heart': stamp(
    [
      '......KKKK......',
      '......KRRK......',
      '.KKKK..KK..KKKK.',
      'KTTTTK.KK.KTTTTK',
      'KTWWTTKKKKTTWWTK',
      'KTWTTTTTTTTTTWTK',
      'KTWTTTTTTTTTTWTK',
      'KTWTTTTTTTTTTWTK',
      '.KTWTTTTTTTTWTK.',
      '..KTWTTTTTTWTK..',
      '...KTWTTTTWTK...',
      '....KTWTTWTK....',
      '.....KTWWTK.....',
      '......KTTK......',
      '.......KK.......',
      '................',
    ],
    3, 5, FACE,
  ),
  gluehwein: stamp(
    [
      '....W...W.......',
      '.....W...W......',
      '....W...W.......',
      '..KKKKKKKKKK....',
      '..KrrrrrrrrK....',
      '..KBBBBBBBBKKK..',
      '..KBBBBBBBBK.K..',
      '..KBBBBBBBBK.K..',
      '..KBBBBBBBBKKK..',
      '..KBBBBBBBBK....',
      '..KWWWWWWWWK....',
      '..KBBBBBBBBK....',
      '...KBBBBBBK.....',
      '....KKKKKK......',
      '................',
      '................',
    ],
    4, 6, FACE_S,
  ),
  'ubahn-sign': [
    '................',
    '................',
    '..KKKKKKKKKKKK..',
    '..KBBBBBBBBBBK..',
    '..KBBWWBBWWBBK..',
    '..KBBWWBBWWBBK..',
    '..KBBWWBBWWBBK..',
    '..KBBWWBBWWBBK..',
    '..KBBWWBBWWBBK..',
    '..KBBWWWWWWBBK..',
    '..KBBBWWWWBBBK..',
    '..KBBBBBBBBBBK..',
    '..KKKKKKKKKKKK..',
    '................',
    '................',
    '................',
  ],
  'sbahn-sign': [
    '................',
    '.....KKKKKK.....',
    '...KKNNNNNNKK...',
    '..KNNNNNNNNNNK..',
    '.KNNNNWWWWNNNNK.',
    '.KNNNWWNNWWNNNK.',
    'KNNNNWWNNNNNNNNK',
    'KNNNNNWWWWNNNNNK',
    'KNNNNNNNNWWNNNNK',
    'KNNNNWWNNWWNNNNK',
    '.KNNNNWWWWNNNNK.',
    '.KNNNNNNNNNNNNK.',
    '..KNNNNNNNNNNK..',
    '...KKNNNNNNKK...',
    '.....KKKKKK.....',
    '................',
  ],
  // red-white-red, like the Berlin flag
  'berlin-bauble': bauble(
    'R',
    [3, 4, SHINE],
    [2, 7, ['WWWWWWWWWWWW']],
    [1, 8, ['WWWWWWWWWWWWWW', 'WWWWWWWWWWWWWW', 'WWWWWWWWWWWWWW']],
    [3, 7, solidEyes(FACE)],
  ),
  currywurst: stamp(
    [
      '................',
      '.............K..',
      '............KCK.',
      '...........KCK..',
      '..KKKKKKKKKCKK..',
      '.KRRGRRRGRKRRRK.',
      'KRRRRRRRRRRRGRRK',
      'KRGRRRRRRRRRRRRK',
      'KKKKKKKKKKKKKKKK',
      'KWWWWWWWWWWWWWWK',
      '.KWWWWWWWWWWWWK.',
      '.KWWWWWWWWWWWWK.',
      '..KWWWWWWWWWWK..',
      '...KKKKKKKKKK...',
      '................',
      '................',
    ],
    3, 9, solidEyes(FACE),
  ),
  'spree-duck': [
    '................',
    '................',
    '.....KKKK.......',
    '....KGGGGK......',
    '...KGGGGGGK.....',
    '...KGWkGGGK.....',
    '.KKKGkkGGGK.....',
    'KOOOKPGGGGK..KK.',
    '.KOOKGGGGGGKKGK.',
    '..KKGGGGGGGGGGK.',
    '..KGGGGGGGGGGgK.',
    '..KGGGGGGGGGGgK.',
    '...KGGGGGGGGgK..',
    'BBBBKKKKKKKKKBBB',
    'bBBbBBbBBbBBbBBb',
    '................',
  ],
  'berlin-bear': [
    '................',
    '.KKK........KKK.',
    'KTUTK......KTUTK',
    'KTTTKKKKKKKKTTTK',
    '.KTTTTTTTTTTTTK.',
    'KRRRRRRRRRRRRRRK',
    'KTTTTTTTTTTTTTTK',
    'KTTWkTTTTTTWkTTK',
    'KTTkkTTTTTTkkTTK',
    'KTPTTUUUUUUTTPTK',
    '.KTTUUUkkUUUTTK.',
    '.KTTUUkUUkUUTTK.',
    '..KTTUUkkUUTTK..',
    '...KKTTTTTTKK...',
    '.....KKKKKK.....',
    '................',
  ],
  'ampel-go': AMPEL_GO,
  'ampel-stop': [
    '.KKKKKKKKKKKKKK.',
    'KDDDDDDDDDDDDDDK',
    'KDDDDDDRRRDDDDDK',
    'KDDDDDDRRRDDDDDK',
    'KDDDDRRRRRRRDDDK',
    'KDDDDDDRRRRDDDDK',
    'KDDDDDDRRRDDDDDK',
    'KDRRRRRRRRRRRRDK',
    'KDDDDDRRRRRDDDDK',
    'KDDDDDRRRRRDDDDK',
    'KDDDDDRRRRRDDDDK',
    'KDDDDDRRDRRDDDDK',
    'KDDDDDRRDRRDDDDK',
    'KDDDDDDDDDDDDDDK',
    '.KKKKKKKKKKKKKK.',
    '................',
  ],
  'tempelhof-hare': [
    '...KKK....KKK...',
    '...KCK....KCK...',
    '..KCPCK..KCPCK..',
    '..KCPCK..KCPCK..',
    '..KCPCKKKKCPCK..',
    '..KCCCCCCCCCCK..',
    '.KCCCCCCCCCCCCK.',
    '.KCCWkCCCCWkCCK.',
    'KCCCkkCCCCkkCCCK',
    'KCCPCCCPPCCCPCCK',
    'KCCCCCWkkWCCCCCK',
    '.KCCCCWWWWCCCCK.',
    '..KCCCWWWWCCCK..',
    '...KKCCCCCCKK...',
    '.....KKKKKK.....',
    '................',
  ],
  'wild-boar': [
    '................',
    '..KK........KK..',
    '.KtTK......KTtK.',
    '.KttTKKKKKKTttK.',
    '..KttttttttttK..',
    '.KttttttttttttK.',
    'KtttWkttttWktttK',
    'KtttkkttttkktttK',
    'KtPtttTTTTtttPtK',
    '.KttTTTTTTTTttK.',
    '.KtWTkTTTTkTWtK.',
    '..KWTTTTTTTTWK..',
    '...KTTTTTTTTK...',
    '....KKKKKKKK....',
    '................',
    '................',
  ],
  'hooded-crow': [
    '................',
    '......KKKK......',
    '.....KDDDDK.....',
    '....KDDDDDDK....',
    '....KDDDDWkDKKK.',
    '....KDDDDkkDKkkK',
    '....KDDDDPDDKKK.',
    '...KCCDDDDDCK...',
    '..KCCCCCCCCCCK..',
    '.KDCCCCCCCCCCK..',
    'KDDCCCCCCCCCCK..',
    'KDDDCCCCCCCCK...',
    '.KDDDDCCCCCK....',
    '..KKKKKkKkKK....',
    '.......k.k......',
    '................',
  ],
  hedgehog: [
    '..K..K....K..K..',
    '.KtKKtK..KtKKtK.',
    '.KttttKKKKttttK.',
    'KttttttttttttttK',
    'KtttUUUUUUUUtttK',
    'KttUUWkUUWkUUttK',
    'KttUUkkUUkkUUttK',
    'KtUPUUUkkUUUPUtK',
    'KtUUUUUkkUUUUUtK',
    '.KtUUUUUUUUUUtK.',
    '.KttUUUUUUUUttK.',
    '..KttUUUUUUttK..',
    '...KKttttttKK...',
    '.....KKKKKK.....',
    '................',
    '................',
  ],
  dachshund: [
    '................',
    '................',
    '................',
    '...KKKK.........',
    '..KTTTTK........',
    '.KTWkTTTK.....KK',
    'KTTkkTTtK....KTK',
    'KkTTTTKtKKKKKKTK',
    '.KKTPTKRRRRRRRK.',
    '...KKKRWRWRWRRK.',
    '....KRRRRRRRRRK.',
    '....KTKKKKKKKTK.',
    '....KTK.....KTK.',
    '....KKK.....KKK.',
    '................',
    '................',
  ],
  sparrow: [
    '................',
    '................',
    '.....KKKKKK.....',
    '...KKTTTTTTKK...',
    '..KTTTTTTTTTTK..',
    '.KTTUUUUUUUUTTK.',
    '.KTUUWkUUWkUUTK.',
    'KTTUUkkUUkkUUTTK',
    'KTTPUUUGGUUUPTTK',
    'KtTTUUUggUUUTTtK',
    'KttTWWWWWWWWTttK',
    '.KttWWWWWWWWttK.',
    '..KttWWWWWWttK..',
    '...KKKKKKKKKK...',
    '.....O....O.....',
    '................',
  ],
  'night-owl': [
    '................',
    '..KK........KK..',
    '..KTK......KTK..',
    '..KTTKKKKKKTTK..',
    '.KTRRRKYYKRRRTK.',
    '.KTTTTKKKKTTTTK.',
    'KTWWWWTTTTWWWWTK',
    'KTWkkWTTTTWkkWTK',
    'KTWkkWTTTTWkkWTK',
    'KTWWWWTGGTWWWWTK',
    'KTPTTTTggTTTTPTK',
    '.KTUUUUUUUUUUTK.',
    '.KTUTUTUUTUTUTK.',
    '..KTUUUUUUUUTK..',
    '...KKKKKKKKKK...',
    '.....G....G.....',
  ],
  'tv-tower': [
    '.......KK.......',
    '......KRRK......',
    '......KWWK......',
    '......KRRK......',
    '.....KKCCKK.....',
    '...KKCCCCCCKK...',
    '..KCCWCCCCCCCK..',
    '..KCWCCCCCCCCK..',
    '..KBBBBBBBBBBK..',
    '..KCCCCCCCCCCK..',
    '...KKCCCCCCKK...',
    '.....KKCCKK.....',
    '......KCCK......',
    '......KCCK......',
    '.....KCCCCK.....',
    '....KKKKKKKK....',
  ],
  'ubahn-train': [
    '................',
    '....KKKKKKKK....',
    '..KKGGGGGGGGKK..',
    '.KGGGGGGGGGGGGK.',
    '.KGKKKKKKKKKKGK.',
    '.KGKVVVVVVVVKGK.',
    '.KGKVWkVVWkVKGK.',
    '.KGKVkkVVkkVKGK.',
    '.KGKKKKKKKKKKGK.',
    '.KGGGGPGGPGGGGK.',
    '.KGYGGGkkGGGYGK.',
    '.KGGGGGGGGGGGGK.',
    '.KggggggggggggK.',
    '.KKKKKKKKKKKKKK.',
    '..KK........KK..',
    '................',
  ],
  'world-clock': [
    '......KKKK......',
    '.....KGKKGK.....',
    '......KGGK......',
    '.......KK.......',
    '..KKKKKKKKKKKK..',
    '.KCCCCCCCCCCCCK.',
    '.KBRBGBMBRBGBMK.',
    '.KBRBGBMBRBGBMK.',
    '.KCCCCCCCCCCCCK.',
    '..KKKKKKKKKKKK..',
    '......KCCK......',
    '......KCCK......',
    '......KCCK......',
    '.....KCCCCK.....',
    '...KKKKKKKKKK...',
    '................',
  ],
  'wall-piece': [
    '................',
    '...KKKKKKKKKK...',
    '..KCCCCCCCCCCK..',
    '..KSSSSSSSSSSK..',
    '...KCCCCCCCCK...',
    '...KCBBCCCCMK...',
    '...KCCRRCRRCK...',
    '...KCCRRRRRCK...',
    '...KMCCRRRCCK...',
    '...KMCCCRCCBK...',
    '...KCGGCCCBBK...',
    '...KCCCCCCCCK...',
    '..KCCCCCCCCCCK..',
    '..KSSSSSSSSSSK..',
    '..KKKKKKKKKKKK..',
    '................',
  ],
  'market-stall': [
    '.......KK.......',
    '......KRRK......',
    '.....KRWWRK.....',
    '....KRRRRRRK....',
    '...KWWWWWWWWK...',
    '..KRRRRRRRRRRK..',
    '.KKKKKKKKKKKKKK.',
    '.KYRYGYBYRYGYBK.',
    '.KTTTTTTTTTTTTK.',
    '.KTKKKKKKKKKKTK.',
    '.KTKYYYYYYYYKTK.',
    '.KTKRYGYRYGYKTK.',
    '.KTKKKKKKKKKKTK.',
    '.KTTTTTTTTTTTTK.',
    '.KttttttttttttK.',
    '.KKKKKKKKKKKKKK.',
  ],
  'brandenburg-gate': [
    '.......KK.......',
    '.....KKGGKK.....',
    '....KGYGGGgK....',
    '.KKKKKKKKKKKKKK.',
    'KGYGGGGGGGGGGGgK',
    'KggggggggggggggK',
    'KKKKKKKKKKKKKKKK',
    'KGK.KGK..KGK.KGK',
    'KYK.KYK..KYK.KYK',
    'KGK.KGK..KGK.KGK',
    'KGK.KGK..KGK.KGK',
    'KGK.KGK..KGK.KGK',
    'KgK.KgK..KgK.KgK',
    'KKKKKKKKKKKKKKKK',
    'KGGGGGGGGGGGGGgK',
    'KKKKKKKKKKKKKKKK',
  ],
  'victory-column': [
    '.......KK.......',
    '..KK..KGGK..KK..',
    '.KYGK.KGGK.KGYK.',
    '..KYGKGGGGKGYK..',
    '...KKKGGGGKKK...',
    '......KGGK......',
    '.....KKKKKK.....',
    '.....KCCCCK.....',
    '.....KGGGGK.....',
    '.....KCCCCK.....',
    '.....KGGGGK.....',
    '.....KCCCCK.....',
    '....KCCCCCCK....',
    '...KRRRRRRRRK...',
    '..KrrrrrrrrrrK..',
    '..KKKKKKKKKKKK..',
  ],
  'bear-medal': [
    'KRWRK......KRWRK',
    '.KRWRK....KRWRK.',
    '..KRWRK..KRWRK..',
    '...KRWRKKRWRK...',
    '....KRRKKRRK....',
    '.....KKKKKK.....',
    '....KGGGGGGK....',
    '...KGGTGGTGGK...',
    '..KGGTTTTTTGgK..',
    '..KGGTkTTkTGgK..',
    '..KGGTTUUTTGgK..',
    '..KGGGTTTTGGgK..',
    '...KGGGGGGGgK...',
    '....KggggggK....',
    '.....KKKKKK.....',
    '................',
  ],
  'golden-shoe': [
    '................',
    '................',
    '.KK.............',
    'KWWK.KKKK.......',
    'KWWWKGGGGK......',
    '.KWKGWGWGGK.....',
    '..KGGGGGGGGKK...',
    '.KGGGGWWWWGGGK..',
    'KGGGGGGGGGGGGGK.',
    'KYYYYYYYYYYYYYYK',
    'KggggggggggggggK',
    '.KKKKKKKKKKKKKK.',
    '................',
    '................',
    '................',
    '................',
  ],
  'golden-laurel': [
    '................',
    '.....KK..KK.....',
    '...KKYK..KYKK...',
    '..KYGK....KGYK..',
    '.KYGK......KGYK.',
    '.KGYK......KYGK.',
    'KYGK........KGYK',
    'KGYK........KYGK',
    'KYGK........KGYK',
    '.KGYK......KYGK.',
    '.KYGGK....KGGYK.',
    '..KYGGKRRKGGYK..',
    '...KKKRRRRKKK...',
    '.....KRKKRK.....',
    '....KRK..KRK....',
    '....KK....KK....',
  ],
  'golden-ampel': AMPEL_GO.map((r) => r.replace(/L/g, 'G')),
  'disco-ball': [
    '.......KK.......',
    '......KCCK......',
    '.....KKKKKK.....',
    '...KKWCBWCHKK...',
    '..KCWBCWHCWBCK..',
    '.KWBCWHCWBCWHCK.',
    '.KCWHCWBCWHCWBK.',
    'KWHCWBCWHCWBCWHK',
    'KCWBCWHCWBCWHCWK',
    'KBCWHCWBCWHCWBCK',
    '.KWBCWHCWBCWHCK.',
    '.KCWHCWBCWHCWBK.',
    '..KBCWBCWHCWCK..',
    '...KKCWHCWBKK...',
    '.....KKKKKK.....',
    '................',
  ],
  'golden-trophy': stamp(
    [
      '................',
      '..KKKKKKKKKKKK..',
      'KKKGYGGGGGGGgKKK',
      'KGKGYGGGGGGGgKGK',
      'KGKGYGGGGGGGgKGK',
      '.KKGGGGGGGGGgKK.',
      '...KGGGGGGGgK...',
      '....KGGGGGgK....',
      '.....KGGGgK.....',
      '......KGgK......',
      '......KGgK......',
      '.....KKKKKK.....',
      '....KRRRRRRK....',
      '....KrrrrrrK....',
      '...KKKKKKKKKK...',
      '................',
    ],
    3, 2, FACE,
  ),

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
  // the star: icons, the favicon, and (bigger, as TOPPER) the top of the tree
  'star-gold': stamp(stamp([
    '.......KK.......',
    '......KGGK......',
    '.....KGGGGK.....',
    '.....KGGGGK.....',
    '.KKKKGGGGGGKKKK.',
    'KGGGGGGGGGGGGGGK',
    'KGGGGGGGGGGGGGGK',
    '.KGGGGGGGGGGGGK.',
    '..KGGGGGGGGGGK..',
    '..KGGGGGGGGGGK..',
    '.KGGGGGGGGGGGGK.',
    '.KGGGGGKKGGGGGK.',
    'KGGGGGK..KGGGGGK',
    'KGGGK......KGGGK',
    '.KKK........KKK.',
    '................',
  ], 3, 6, FACE), 6, 2, ['W', 'W']),
};

// ---------- the tree ----------

export const TREE_W = 160;
export const TREE_H = 206;
const MID = TREE_W / 2;

/**
 * The star on top of the tree: the same chubby star as the icon, drawn bigger, with the
 * tree's pointed tip tucked between its legs. It's coloured like an ornament
 * (rim light and shade) and laid over the tree after the tree is coloured.
 */
const TOPPER = stamp(stamp([
  '.........KK.........',
  '........KGGK........',
  '.......KGGGGK.......',
  '.......KGGGGK.......',
  '......KGGGGGGK......',
  '.KKKKKKGGGGGGKKKKKK.',
  'KGGGGGGGGGGGGGGGGGGK',
  'KGGGGGGGGGGGGGGGGGGK',
  '.KGGGGGGGGGGGGGGGGK.',
  '..KGGGGGGGGGGGGGGK..',
  '...KGGGGGGGGGGGGK...',
  '...KGGGGGGGGGGGGK...',
  '...KGGGGGGGGGGGGK...',
  '..KGGGGGGGGGGGGGGK..',
  '..KGGGGGGKKGGGGGGK..',
  '.KGGGGGGK..KGGGGGGK.',
  '.KGGGGGK....KGGGGGK.',
  'KGGGGGK......KGGGGGK',
  '.KKKKK........KKKKK.',
], 5, 8, FACE), 8, 2, ['.WW', 'W..', 'W..']);

/** [top row, bottom row, half-width at top, half-width at bottom], drawn bottom tier first. */
const TIERS: [number, number, number, number][] = [
  [115, 168, 36, 77],
  [77, 130, 26, 65],
  [41, 91, 17, 48],
  [13, 53, 2, 31],
];
/** Stable pseudo-random 0–99 per pixel, so texture looks scattered rather than gridded. */
const hash = (x: number, y: number) => (((x * 374761393 + y * 668265263) ^ ((x * 374761393 + y * 668265263) >>> 13)) >>> 0) % 100;
const BOUGH = 12; // width of each drooping bough along a tier's bottom edge
const LIGHTS = ['R', 'G', 'B', 'M', 'P'];

/**
 * Every bulb on the strings of lights: [x, y, colour], its top-left pixel in tree pixels.
 * The tree draws them unlit; PixelTree lays lit bulbs over them that blink.
 */
export const TREE_LIGHTS: [number, number, string][] = [];

function buildTree(): string[] {
  const g: string[][] = Array.from({ length: TREE_H }, () => Array(TREE_W).fill('.'));
  const tier: number[][] = Array.from({ length: TREE_H }, () => Array(TREE_W).fill(-1));
  const inside = (x: number, y: number) => x >= 0 && x < TREE_W && y >= 0 && y < TREE_H;
  const set = (x: number, y: number, c: string) => {
    if (inside(x, y)) g[y][x] = c;
  };

  // trunk, with bark streaks
  for (let y = 163; y < 185; y++)
    for (let x = 70; x < 90; x++) set(x, y, x === 70 || x === 89 ? 'K' : x > 80 || (x * 3 + y) % 7 === 0 ? 'q' : 'Q');

  // pot: rim, gold band, body narrowing toward the base
  for (let y = 178; y < TREE_H; y++) {
    const inset = y < 184 ? 0 : 3 + Math.floor((y - 184) / 5);
    const l = 51 + inset;
    const r = 108 - inset;
    for (let x = l; x <= r; x++) {
      let c = x < MID + 8 ? 'R' : 'r';
      if (x === l || x === r || y === 178 || y === 183 || y === TREE_H - 1) c = 'K';
      else if (y === 179) c = 'W';
      else if (y === 189) c = 'G';
      else if (y === 190) c = 'g';
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
        TREE_LIGHTS.push([x, y + 1, PALETTE[c]]);
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

  // the star lights up the needles just under it: lighter tones, dithered out at the edge
  for (let y = 12; y < 36; y++)
    for (let x = MID - 16; x < MID + 16; x++) {
      if (!'LNnF'.includes(out[y][x])) continue;
      const d = Math.hypot((x + 0.5 - MID) / 14, (y - 17) / 10);
      const even = (x + y) % 2 === 0;
      if (d < 0.6) out[y][x] = out[y][x] === 'F' ? 'N' : 'L';
      else if (d < 1 && even && out[y][x] !== 'F') out[y][x] = 'L';
    }

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
// bulbs are drawn unlit; the lit ones on top blink on and off
for (const [x, y, hex] of TREE_LIGHTS)
  for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) SPRITES.tree[y + dy][x + dx] = tone(hex, -0.45);
// the star goes on after, so it gets the same rim light as the ornaments
colour(TOPPER).forEach((row, y) => row.forEach((c, x) => {
  if (c) SPRITES.tree[y][x + MID - row.length / 2] = c;
}));

/**
 * Where ornaments hang, as centre points in tree pixels. Ornaments are 16×16 and
 * these are spaced so they never overlap.
 */
export const TREE_SLOTS: [number, number][] = [
  // filled in this order, so even a few ornaments spread over the whole tree
  [80, 86],
  [42, 113], [121, 113],
  [56, 149], [109, 149],
  [61, 70], [99, 70],
  [68, 107], [94, 107],
  [30, 154], [133, 154], [82, 151],
  [80, 40],
];

const pathCache = new Map<string, [string, string][]>();

/** One SVG path per colour, built from horizontal runs of same-coloured pixels. */
export function spritePaths(id: string): [string, string][] {
  const hit = pathCache.get(id);
  if (hit) return hit;
  const byColour: Record<string, string> = {};
  (SPRITES[id] ?? []).forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      let n = 1;
      while (x + n < row.length && row[x + n] === c) n++;
      if (c) byColour[c] = (byColour[c] ?? '') + `M${x} ${y}h${n}v1h-${n}z`;
      x += n;
    }
  });
  const out = Object.entries(byColour);
  pathCache.set(id, out);
  return out;
}

/** A sprite as a standalone SVG file, e.g. for the favicon. */
export function spriteSvg(id: string) {
  const rows = SPRITES[id] ?? [];
  const body = spritePaths(id).map(([fill, d]) => `<path fill="${fill}" d="${d}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rows[0]?.length ?? 0} ${rows.length}" shape-rendering="crispEdges">${body}</svg>`;
}
