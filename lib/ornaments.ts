export type Tier = 'basic' | 'special' | 'rare';

export type Ornament = {
  id: string;
  name: string;
  tier: Tier;
  img: string;
  /** 16 = 16px sprite (drawn at 2x on the tree), 32 = 32px sprite (drawn at 1x). */
  grid: 16 | 32;
};

export const ORNAMENTS: Ornament[] = [
  { id: 'bauble-snow', name: 'Snow Bauble', tier: 'basic', img: '/ornaments/bauble-snow.png', grid: 16 },
  { id: 'snowflake', name: 'Snowflake', tier: 'basic', img: '/ornaments/snowflake.png', grid: 16 },
  { id: 'sock', name: 'Wool Sock', tier: 'basic', img: '/ornaments/sock.png', grid: 16 },
  { id: 'bauble-frost', name: 'Frost Bauble', tier: 'basic', img: '/ornaments/bauble-frost.png', grid: 16 },
  { id: 'hot-cocoa', name: 'Hot Cocoa', tier: 'basic', img: '/ornaments/hot-cocoa.png', grid: 32 },
  { id: 'bauble-cranberry', name: 'Cranberry Bauble', tier: 'basic', img: '/ornaments/bauble-cranberry.png', grid: 16 },

  { id: 'fox', name: 'Advent Runner: Fox', tier: 'special', img: '/ornaments/fox.png', grid: 32 },
  { id: 'penguin', name: 'Advent Runner: Penguin', tier: 'special', img: '/ornaments/penguin.png', grid: 32 },
  { id: 'reindeer', name: 'Advent Runner: Reindeer', tier: 'special', img: '/ornaments/reindeer.png', grid: 32 },
  { id: 'gingerbread-runner', name: 'Gingerbread Runner', tier: 'special', img: '/ornaments/gingerbread-runner.png', grid: 32 },
  { id: 'santa-shoe', name: 'Santa-Hat Running Shoe', tier: 'special', img: '/ornaments/santa-shoe.png', grid: 32 },
  { id: 'finish-medal', name: 'Finish Medal', tier: 'special', img: '/ornaments/finish-medal.png', grid: 32 },
  { id: 'stopwatch', name: 'Lucky Stopwatch', tier: 'special', img: '/ornaments/stopwatch.png', grid: 32 },
  { id: 'running-shoe', name: 'Mint Running Shoe', tier: 'special', img: '/ornaments/running-shoe.png', grid: 16 },

  { id: 'star-gold', name: 'Golden Star', tier: 'rare', img: '/ornaments/star-gold.png', grid: 16 },
  { id: 'bell-gold', name: 'Golden Bell', tier: 'rare', img: '/ornaments/bell-gold.png', grid: 16 },
];

export const BY_ID: Record<string, Ornament> = Object.fromEntries(ORNAMENTS.map((o) => [o.id, o]));

export const BASIC = ORNAMENTS.filter((o) => o.tier === 'basic');

export const TIER_LABEL: Record<Tier, string> = { basic: 'Basic', special: 'Special', rare: 'Rare' };

export const HINTS = ['Cheer', 'Thanks', 'Funny', 'Love'] as const;
export type Hint = (typeof HINTS)[number];
