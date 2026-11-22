// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// The cabinet's noises. Nothing is recorded: each sound is built from a few oscillators
// and bursts of filtered noise at the moment it is needed, so no audio files ship. Every
// sound answers something the player just did; the cabinet is silent when left alone.

let ctx = null;
let out = null; // every voice ends here: the master volume
let bus = null; // long sounds (the tune) pass through this, so leaving can hush them
let hiss = null; // one second of white noise, shared by every burst
let enabled = true;

export const soundOn = () => enabled;

export function setSound(on) {
  enabled = !!on;
  if (!enabled) hush();
}

// Use a given context. wake() does this for the page; the tests bring their own.
// There is no compressor: it flattened the knocks into the quiet sounds. The levels below
// are set so that the loudest sound peaks near a quarter of full scale, with room for
// two or three to overlap.
export function attach(context) {
  ctx = context;
  out = ctx.createGain();
  out.gain.value = 0.5;
  out.connect(ctx.destination);
  bus = null;
  hiss = null;
  return ctx;
}

// Browsers only start audio from a tap. Call this from one, before the first sound.
export function wake() {
  if (!enabled) return null;
  if (!ctx) {
    const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Context) return null;
    try { attach(new Context({ latencyHint: 'interactive' })); } catch { return null; }
  }
  if (ctx.state === 'suspended' || ctx.state === 'interrupted') ctx.resume?.().catch?.(() => {});
  return ctx;
}

// Stop whatever is still ringing: the tune must not play on over another cabinet.
export function hush() {
  if (!ctx || !bus) return;
  const old = bus;
  bus = null;
  const t = ctx.currentTime;
  old.gain.cancelScheduledValues(t);
  old.gain.setValueAtTime(old.gain.value, t);
  old.gain.linearRampToValueAtTime(0, t + 0.06);
  setTimeout(() => old.disconnect(), 200);
}

function longBus() {
  if (!bus) {
    bus = ctx.createGain();
    bus.gain.value = 1;
    bus.connect(out);
  }
  return bus;
}

// A struck sound's loudness: up in `a` seconds, held for `hold`, then dying away. `d` is
// how long it takes to fall to a tenth, which is about how long it is heard; it is
// silent after three.
const TAIL = 3;
function shaped(t, gain, a, d, dest, hold = 0) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + a);
  if (hold) g.gain.setValueAtTime(gain, t + a + hold);
  g.gain.exponentialRampToValueAtTime(gain / 1000, t + a + hold + d * TAIL);
  g.connect(dest || out);
  return g;
}

// One pitched voice. `to` bends the pitch over the note.
function tone(t, f, { to = 0, type = 'sine', gain = 0.2, a = 0.004, d = 0.2, hold = 0, dest = null } = {}) {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(f, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + a + hold + d);
  osc.connect(shaped(t, gain, a, d, dest, hold));
  osc.start(t);
  osc.stop(t + a + hold + d * TAIL + 0.03);
}

// One burst of noise through a filter: paper, a ratchet tooth, the thud of a mechanism.
function burst(t, f, { to = 0, q = 1, type = 'bandpass', gain = 0.2, a = 0.002, d = 0.05, dest = null } = {}) {
  if (!hiss) {
    hiss = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = hiss.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = hiss;
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(f, t);
  if (to) filter.frequency.exponentialRampToValueAtTime(to, t + a + d);
  src.connect(filter);
  filter.connect(shaped(t, gain, a, d, dest));
  src.start(t, Math.random() * 0.5);
  src.stop(t + a + d * TAIL + 0.03);
}

// A struck bar: a fundamental and the unharmonic partials that make it ring like metal.
function bell(t, f, { gain = 0.2, ring = 0.3, dest = null } = {}) {
  tone(t, f, { gain, a: 0.002, d: ring, dest });
  tone(t, f * 2.76, { gain: gain * 0.34, a: 0.002, d: ring * 0.42, dest });
  tone(t, f * 5.4, { gain: gain * 0.16, a: 0.001, d: ring * 0.2, dest });
}

// A tooth of the comb in a musical box: a pure note with a small bright tick on it.
function pluck(t, f, { gain = 0.16, ring = 0.3, dest = null } = {}) {
  tone(t, f, { gain, a: 0.003, d: ring, dest });
  tone(t, f * 2, { gain: gain * 0.2, a: 0.002, d: ring * 0.3, dest });
  tone(t, f * 6.27, { gain: gain * 0.07, a: 0.001, d: 0.025, dest });
}

// One tooth of a ratchet passing its pawl.
const tooth = (t, f, gain, dest = null) => burst(t, f, { q: 5, gain, a: 0.001, d: 0.007, dest });

const hz = (semitone) => 261.63 * 2 ** (semitone / 12); // semitones above middle C

// What the works play when they run: a rising chord, a turn and home again. Each note is
// [semitones above middle C, when in sixteenths]. Original, twelve notes, three seconds.
const TUNE = [
  [12, 0], [16, 1], [19, 2], [24, 3], [19, 5], [21, 6], [17, 7], [14, 8], [19, 9], [16, 11], [14, 12], [12, 13]
];
const UNDER = [[0, 0], [5, 6], [7, 9], [0, 13], [4, 13], [7, 13]];
const STEP = 0.165;

const SOUNDS = {
  // A tag turned over: a card flicked up, then settling on the plates.
  paper(t) {
    burst(t, 2600, { to: 5200, q: 0.8, gain: 0.32, a: 0.006, d: 0.03 });
    burst(t + 0.075, 1500, { q: 0.7, gain: 0.18, a: 0.004, d: 0.022 });
  },
  // A word dropped in the tray. Later words in the same tag step up a scale.
  word(t, n = 0) {
    const scale = [19, 21, 24, 26, 28, 31];
    pluck(t, hz(scale[n % scale.length]), { gain: 0.15, ring: 0.1 });
  },
  // A tile pressed into its gap.
  tile(t) {
    tone(t, 560, { to: 330, gain: 0.24, a: 0.002, d: 0.028, type: 'triangle' });
    burst(t, 3200, { q: 1.2, gain: 0.2, a: 0.001, d: 0.008 });
  },
  // A tile lifted out again.
  lift(t) {
    tone(t, 330, { to: 480, gain: 0.17, a: 0.003, d: 0.03, type: 'triangle' });
  },
  // The machine will not take that move.
  deny(t) {
    tone(t, 196, { gain: 0.2, a: 0.004, d: 0.04, type: 'triangle' });
    tone(t + 0.1, 165, { gain: 0.2, a: 0.004, d: 0.055, type: 'triangle' });
  },
  // The penny leaves the thumb and rings on the brass.
  coin(t) {
    burst(t, 6000, { type: 'highpass', gain: 0.18, a: 0.001, d: 0.006 });
    tone(t, 2217, { gain: 0.1, a: 0.001, d: 0.1 });
    tone(t, 3520, { gain: 0.07, a: 0.001, d: 0.075 });
    tone(t, 5274, { gain: 0.04, a: 0.001, d: 0.045 });
    tone(t + 0.21, 2637, { gain: 0.05, a: 0.001, d: 0.05 });
  },
  // It lands in the works, and the cogs take up the strain.
  clunk(t) {
    tone(t, 150, { to: 52, gain: 0.4, a: 0.003, d: 0.07 });
    burst(t, 700, { type: 'lowpass', gain: 0.5, a: 0.002, d: 0.025 });
    for (let i = 0; i < 7; i++) tooth(t + 0.1 + i * 0.048, 1900 + i * 130, 0.5);
  },
  // A plate with something wrong on it: the works catch and stop dead.
  wrong(t) {
    tone(t, 118, { to: 70, gain: 0.34, a: 0.003, d: 0.06, type: 'triangle' });
    tone(t + 0.075, 96, { to: 58, gain: 0.28, a: 0.003, d: 0.07, type: 'triangle' });
    burst(t, 520, { type: 'lowpass', gain: 0.4, a: 0.002, d: 0.03 });
  },
  // A plate with nothing wrong: it locks, and a bell says so. The second rings higher.
  right(t, n = 0) {
    tooth(t, 2400, 0.4);
    bell(t + 0.01, hz(n ? 31 : 24), { gain: 0.2, ring: 0.3 });
  },
  // Both plates right: the ratchet runs up to speed and the musical box plays.
  win(t) {
    const dest = longBus();
    for (let i = 0; i < 12; i++) tooth(t + 0.5 * (i / 12) ** 0.7, 2200 + i * 90, 0.36, dest);
    const start = t + 0.34;
    for (const [note, at] of TUNE) pluck(start + at * STEP, hz(note), { gain: 0.16, ring: at === 13 ? 0.6 : 0.3, dest });
    for (const [note, at] of UNDER) pluck(start + at * STEP, hz(note), { gain: 0.07, ring: at === 13 ? 0.6 : 0.4, dest });
  },
  // The last penny gone: the works run down and stop.
  lose(t) {
    const dest = longBus();
    tone(t, 233, { to: 62, gain: 0.15, a: 0.01, hold: 0.72, d: 0.05, type: 'triangle', dest });
    for (let i = 0; i < 6; i++) tooth(t + 0.1 + 0.62 * (i / 6) ** 1.6, 1700 - i * 150, 0.4, dest);
    tone(t + 0.86, 110, { to: 48, gain: 0.34, a: 0.003, d: 0.08, dest });
    burst(t + 0.86, 480, { type: 'lowpass', gain: 0.4, a: 0.002, d: 0.03, dest });
  },
  // A doll flicked with a finger rocks on its wooden base and settles.
  rattle(t) {
    [0, 0.12, 0.22, 0.3, 0.36].forEach((at, i) => {
      tone(t + at, 410 - i * 22, { to: 250, gain: 0.2 * 0.72 ** i, a: 0.002, d: 0.02, type: 'triangle' });
      burst(t + at, 2400, { q: 1.5, gain: 0.16 * 0.72 ** i, a: 0.001, d: 0.007 });
    });
  },
  // The attendant's desk bell.
  bell(t) {
    bell(t, hz(33), { gain: 0.13, ring: 0.25 });
  },
  // The playbill is handed over.
  bill(t) {
    burst(t, 1800, { to: 3800, q: 0.7, gain: 0.3, a: 0.012, d: 0.05 });
  }
};

export const soundNames = Object.keys(SOUNDS);

// The knocks are also felt, where the phone can do it: milliseconds of buzz.
const FELT = { clunk: 14, wrong: 22, right: 10, win: [12, 70, 12, 70, 26], lose: 40 };

// Play a sound by name. `arg` is the sound's own (which word, which plate); `delay` in
// seconds puts it later on the audio clock, in step with whatever else is scheduled.
export function play(name, arg, delay = 0) {
  if (!enabled || !SOUNDS[name]) return false;
  if (!wake() || ctx.state === 'closed') return false;
  try {
    SOUNDS[name](ctx.currentTime + 0.012 + delay, arg);
    if (FELT[name]) buzz(FELT[name]);
    return true;
  } catch {
    return false; // a sound is never worth breaking a move for
  }
}

// A short buzz in the hand where the phone can do it. It follows the sound switch.
export function buzz(pattern) {
  const nav = globalThis.navigator;
  // Browsers refuse (and complain) before the first tap on the page.
  if (!enabled || !nav?.vibrate || nav.userActivation?.hasBeenActive === false) return;
  try { nav.vibrate(pattern); } catch { /* not allowed here */ }
}
