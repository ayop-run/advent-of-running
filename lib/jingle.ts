/**
 * Chiptune "Jingle Bells" (J. L. Pierpont, 1857, public domain), synthesised with the
 * Web Audio API so there is no audio file to license or download. Played by the music
 * toggle, and recorded into photo booth videos.
 */
const BPM = 152;
export const BEAT = 60 / BPM;
const N: Record<string, number> = { C3: 48, D3: 50, F3: 53, G3: 55, C5: 72, D5: 74, E5: 76, F5: 77, G5: 79 };
const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

const A: [string, number][] = [
  ['E5', 1], ['E5', 1], ['E5', 2], ['E5', 1], ['E5', 1], ['E5', 2],
  ['E5', 1], ['G5', 1], ['C5', 1.5], ['D5', 0.5], ['E5', 4],
  ['F5', 1], ['F5', 1], ['F5', 1.5], ['F5', 0.5], ['F5', 1], ['E5', 1], ['E5', 1], ['E5', 0.5], ['E5', 0.5],
];
const MELODY: [string, number][] = [
  ...A, ['E5', 1], ['D5', 1], ['D5', 1], ['E5', 1], ['D5', 2], ['G5', 2],
  ...A, ['G5', 1], ['G5', 1], ['F5', 1], ['D5', 1], ['C5', 4],
];
// One root per bar, played as a bouncing root-fifth bass line.
const BASS = ['C3', 'C3', 'C3', 'C3', 'F3', 'C3', 'D3', 'G3', 'C3', 'C3', 'C3', 'C3', 'F3', 'C3', 'G3', 'C3'];
const LOOP_BEATS = MELODY.reduce((n, [, d]) => n + d, 0);

function playNote(ctx: AudioContext, out: GainNode, type: OscillatorType, freq: number, t: number, dur: number, vol: number) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.06, dur * 0.9));
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + dur);
}

/** Schedules one full loop from `start`; returns when it ends. */
export function scheduleLoop(ctx: AudioContext, out: GainNode, start: number) {
  let t = start;
  for (const [n, d] of MELODY) {
    playNote(ctx, out, 'square', hz(N[n]), t, d * BEAT, 0.09);
    t += d * BEAT;
  }
  BASS.forEach((root, bar) => {
    for (let b = 0; b < 4; b++) {
      const m = N[root] + (b % 2 ? 7 : 0);
      playNote(ctx, out, 'triangle', hz(m), start + (bar * 4 + b) * BEAT, BEAT * 0.9, 0.22);
    }
    // sleigh-bell tick on the off-beats
    for (let b = 0; b < 4; b++) {
      playNote(ctx, out, 'square', 2600, start + (bar * 4 + b + 0.5) * BEAT, 0.04, 0.012);
    }
  });
  return start + LOOP_BEATS * BEAT;
}

/** "Jingle bells, jingle bells, jingle all the way": the first 16 beats. */
export const FIRST_PHRASE = 16 * BEAT;
