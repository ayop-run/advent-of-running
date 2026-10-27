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
  { id: 'water-bottle', name: 'Water Bottle', tier: 'basic', blurb: 'Stay hydrated, even when it’s freezing.' },
  { id: 'energy-gel', name: 'Energy Gel', tier: 'basic', blurb: 'Orange flavour. Tear here at kilometre 30.' },
  { id: 'race-bib', name: 'Race Bib', tier: 'basic', blurb: 'Number 42, pinned on with four safety pins.' },
  { id: 'sweatband', name: 'Sweatband', tier: 'basic', blurb: 'Keeps the sweat out of your eyes on hill repeats.' },
  { id: 'bobble-beanie', name: 'Bobble Beanie', tier: 'basic', blurb: 'For dark, frosty mornings by the Spree.' },
  { id: 'running-mitten', name: 'Running Mitten', tier: 'basic', blurb: 'One mitten. The other one is still on the trail.' },
  { id: 'running-cap', name: 'Running Cap', tier: 'basic', blurb: 'Keeps the rain off on a grey Berlin long run.' },
  { id: 'race-banana', name: 'Race-Day Banana', tier: 'basic', blurb: 'The best breakfast an hour before the start.' },
  { id: 'headlamp', name: 'Headlamp', tier: 'basic', blurb: 'December sunsets come early. Bring a light.' },
  { id: 'aid-cup', name: 'Aid Station Cup', tier: 'basic', blurb: 'Grab it, squeeze it, drink half, spill half.' },
  { id: 'checkered-flag', name: 'Checkered Flag', tier: 'basic', blurb: 'The finish is just around the corner.' },
  { id: 'berliner', name: 'Pfannkuchen', tier: 'basic', blurb: 'Berliners just call it a Pfannkuchen. Jam inside.' },
  { id: 'pretzel', name: 'Pretzel', tier: 'basic', blurb: 'Salty, soft and perfect after a cold run.' },
  { id: 'lebkuchen-heart', name: 'Gingerbread Heart', tier: 'basic', blurb: 'From the Christmas market, iced with love.' },
  { id: 'gluehwein', name: 'Glühwein Mug', tier: 'basic', blurb: 'Warms your hands at the Christmas market.' },
  { id: 'ubahn-sign', name: 'U-Bahn Sign', tier: 'basic', blurb: 'Too tired to run home? Take the U.' },
  { id: 'sbahn-sign', name: 'S-Bahn Sign', tier: 'basic', blurb: 'The Ringbahn loop is 37 km. Fancy running it?' },
  { id: 'berlin-bauble', name: 'Berlin Bauble', tier: 'basic', blurb: 'Red, white and red, like the Berlin flag.' },
  { id: 'currywurst', name: 'Currywurst', tier: 'basic', blurb: 'Recovery food, Berlin style.' },
  { id: 'spree-duck', name: 'Spree Duck', tier: 'basic', blurb: 'Paddles along the river while you run beside it.' },

  { id: 'fox', name: 'Advent Runner: Fox', tier: 'special', blurb: 'A quick fox who never skips a morning run.' },
  { id: 'penguin', name: 'Advent Runner: Penguin', tier: 'special', blurb: 'Waddles slowly, but always finishes.' },
  { id: 'reindeer', name: 'Advent Runner: Reindeer', tier: 'special', blurb: 'Trains all year for one very long night.' },
  { id: 'gingerbread-runner', name: 'Gingerbread Runner', tier: 'special', blurb: 'Run, run, as fast as you can.' },
  { id: 'santa-shoe', name: 'Santa-Hat Running Shoe', tier: 'special', blurb: 'A running shoe ready for the Christmas 5K.' },
  { id: 'finish-medal', name: 'Finish Medal', tier: 'special', blurb: 'For every run you finished in the dark.' },
  { id: 'stopwatch', name: 'Lucky Stopwatch', tier: 'special', blurb: 'Brings luck to anyone chasing a PB.' },
  { id: 'running-shoe', name: 'Mint Running Shoe', tier: 'special', blurb: 'Fresh mint trainers, barely broken in.' },
  { id: 'berlin-bear', name: 'Advent Runner: Berlin Bear', tier: 'special', blurb: 'The city’s bear, headband on, ready to run.' },
  { id: 'ampel-go', name: 'Green Ampel Man', tier: 'special', blurb: 'Berlin’s little crossing-light man. Green means go.' },
  { id: 'ampel-stop', name: 'Red Ampel Man', tier: 'special', blurb: 'Red means stop. Even runners need a rest day.' },
  { id: 'tempelhof-hare', name: 'Advent Runner: Tempelhof Hare', tier: 'special', blurb: 'Lives on the old airfield. Fastest on the runway.' },
  { id: 'wild-boar', name: 'Advent Runner: Wild Boar', tier: 'special', blurb: 'Trains in the Grunewald forest. Do not race it.' },
  { id: 'hooded-crow', name: 'Advent Runner: Hooded Crow', tier: 'special', blurb: 'Grey vest, black hood, Berlin’s cheekiest bird.' },
  { id: 'hedgehog', name: 'Advent Runner: Hedgehog', tier: 'special', blurb: 'Small steps, big heart, never gives up.' },
  { id: 'dachshund', name: 'Advent Runner: Dachshund', tier: 'special', blurb: 'Short legs, long body, very long runs.' },
  { id: 'sparrow', name: 'Advent Runner: Sparrow', tier: 'special', blurb: 'A cheeky Berlin Spatz who steals your pretzel crumbs.' },
  { id: 'night-owl', name: 'Advent Runner: Night Owl', tier: 'special', blurb: 'Runs after dark with a headlamp on.' },
  { id: 'gps-watch', name: 'GPS Watch', tier: 'special', blurb: 'If it isn’t on Strava, did it even happen?' },
  { id: 'super-shoe', name: 'Carbon Super Shoe', tier: 'special', blurb: 'Bouncy foam and a carbon plate, saved for race day.' },
  { id: 'trail-shoe', name: 'Trail Shoe', tier: 'special', blurb: 'Big grippy lugs for muddy forest paths.' },
  { id: 'foam-roller', name: 'Foam Roller', tier: 'special', blurb: 'It hurts so good after a long run.' },
  { id: 'pacer-balloon', name: 'Pacer Balloon', tier: 'special', blurb: 'Follow the balloon and you’ll hit your goal time.' },
  { id: 'race-singlet', name: 'Race Singlet', tier: 'special', blurb: 'Light, fast and far too cold for December.' },
  { id: 'foil-cape', name: 'Finisher Foil Cape', tier: 'special', blurb: 'Wrapped up warm and shiny after the finish line.' },
  { id: 'tv-tower', name: 'TV Tower', tier: 'special', blurb: 'You can see it from almost every run in the city.' },
  { id: 'ubahn-train', name: 'Yellow U-Bahn', tier: 'special', blurb: 'Berlin’s yellow train, always racing you to the next stop.' },
  { id: 'world-clock', name: 'World Clock', tier: 'special', blurb: 'Meet at the clock at Alex for the group run.' },
  { id: 'wall-piece', name: 'Wall Piece', tier: 'special', blurb: 'A painted piece of history from the East Side Gallery run.' },
  { id: 'market-stall', name: 'Christmas Market Hut', tier: 'special', blurb: 'Fairy lights, gingerbread and a warm drink.' },

  { id: 'snow-globe', name: 'Snow Globe', tier: 'rare', blurb: 'A tiny winter forest, shaken by every stride.' },
  { id: 'bell-gold', name: 'Golden Bell', tier: 'rare', blurb: 'Rings out when a weekly goal is done.' },
  { id: 'brandenburg-gate', name: 'Golden Brandenburg Gate', tier: 'rare', blurb: 'The last few hundred metres of every great Berlin race.' },
  { id: 'victory-column', name: 'Victory Column', tier: 'rare', blurb: 'Berliners call her Goldelse. She cheers every runner who passes.' },
  { id: 'bear-medal', name: 'Bear Medal', tier: 'rare', blurb: 'A gold medal with the Berlin bear on it.' },
  { id: 'golden-shoe', name: 'Winged Golden Shoe', tier: 'rare', blurb: 'For the week your legs felt like flying.' },
  { id: 'golden-laurel', name: 'Golden Laurel', tier: 'rare', blurb: 'A winner’s wreath for a week of hard work.' },
  { id: 'golden-ampel', name: 'Golden Ampel Man', tier: 'rare', blurb: 'Every light turned green for you this week.' },
  { id: 'disco-ball', name: 'Disco Ball', tier: 'rare', blurb: 'For the night after the long run. Berlin never sleeps.' },
  { id: 'golden-trophy', name: 'Golden Trophy', tier: 'rare', blurb: 'First place in the Advent of Running.' },
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
