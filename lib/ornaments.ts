export type Tier = 'basic' | 'special' | 'rare';

export type Ornament = {
  id: string;
  name: string;
  tier: Tier;
  /** One line of flavour text for the ornament directory. */
  blurb: string;
  /** Artwork lives in lib/sprites.ts under the same id. */
};

export const ORNAMENTS: Ornament[] = [
  { id: 'bauble-snow', name: 'Snow Bauble', tier: 'basic', blurb: 'A round little snowball with rosy cheeks.' },
  { id: 'snowflake', name: 'Snowflake', tier: 'basic', blurb: 'No two are alike. This one is smiling.' },
  { id: 'sock', name: 'Wool Sock', tier: 'basic', blurb: 'Hand-knit, hung by the chimney with care.' },
  { id: 'bauble-frost', name: 'Frost Bauble', tier: 'basic', blurb: 'Icy blue glass dusted with snowflakes.' },
  { id: 'hot-cocoa', name: 'Hot Cocoa', tier: 'basic', blurb: 'For the cold walk home after a long run.' },
  { id: 'bauble-cranberry', name: 'Cranberry Bauble', tier: 'basic', blurb: 'A classic red bauble with a gold band.' },

  { id: 'fox', name: 'Advent Runner: Fox', tier: 'special', blurb: 'A quick fox who never skips a morning run.' },
  { id: 'penguin', name: 'Advent Runner: Penguin', tier: 'special', blurb: 'Waddles slowly, but always finishes.' },
  { id: 'reindeer', name: 'Advent Runner: Reindeer', tier: 'special', blurb: 'Trains all year for one very long night.' },
  { id: 'gingerbread-runner', name: 'Gingerbread Runner', tier: 'special', blurb: 'Run, run, as fast as you can.' },
  { id: 'santa-shoe', name: 'Santa-Hat Running Shoe', tier: 'special', blurb: 'A running shoe ready for the Christmas 5K.' },
  { id: 'finish-medal', name: 'Finish Medal', tier: 'special', blurb: 'For every run you finished in the dark.' },
  { id: 'stopwatch', name: 'Lucky Stopwatch', tier: 'special', blurb: 'Brings luck to anyone chasing a PB.' },
  { id: 'running-shoe', name: 'Mint Running Shoe', tier: 'special', blurb: 'Fresh mint trainers, barely broken in.' },

  { id: 'snow-globe', name: 'Snow Globe', tier: 'rare', blurb: 'A tiny winter forest, shaken by every stride.' },
  { id: 'bell-gold', name: 'Golden Bell', tier: 'rare', blurb: 'Rings out when a weekly goal is done.' },
];

export const BY_ID: Record<string, Ornament> = Object.fromEntries(ORNAMENTS.map((o) => [o.id, o]));

/** How each kind of ornament is earned, for the directory and the About page. */
export const HOW_TO_GET: Record<Tier, string> = {
  basic: 'Free for anyone to hang',
  special: 'Behind a daily Advent door',
  rare: 'Prize for a weekly challenge',
};

export const BASIC = ORNAMENTS.filter((o) => o.tier === 'basic');

export const HINTS = ['Cheer', 'Thanks', 'Funny', 'Love'] as const;
export type Hint = (typeof HINTS)[number];
