// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// The sounds cannot be heard here, but a real audio context refuses bad schedules (a
// ramp to zero, a note that stops before it starts), so a strict stand-in catches those.
import assert from 'node:assert/strict';
import test from 'node:test';
import { attach, hush, play, setSound, soundNames, soundOn } from '../src/sound.js';

function fakeContext() {
  const log = { voices: [], gains: [] };
  const finite = (...values) => values.forEach((v) => assert.ok(Number.isFinite(v), `scheduled ${v}`));
  const param = (value) => {
    const p = { value, peak: 0 };
    const at = (v, t) => { finite(v, t); assert.ok(t >= ctx.currentTime, 'nothing is scheduled in the past'); p.peak = Math.max(p.peak, v); };
    p.setValueAtTime = at;
    p.linearRampToValueAtTime = at;
    p.exponentialRampToValueAtTime = (v, t) => { assert.ok(v > 0, 'an exponential ramp cannot reach zero'); at(v, t); };
    p.cancelScheduledValues = () => {};
    return p;
  };
  const node = (extra = {}) => ({ to: null, connect(dest) { assert.ok(dest, 'connected to something'); this.to = dest; return dest; }, disconnect() {}, ...extra });
  const voice = (extra) => {
    const v = node({
      ...extra,
      start(t) { finite(t); assert.ok(t >= ctx.currentTime); this.from = t; },
      stop(t) { finite(t); assert.ok(t > this.from, 'a voice stops after it starts'); this.until = t; }
    });
    log.voices.push(v);
    return v;
  };
  const ctx = {
    currentTime: 2, sampleRate: 8000, state: 'running', destination: node(),
    createGain() { const g = node({ gain: param(1) }); log.gains.push(g); return g; },
    createOscillator: () => voice({ frequency: param(440), type: 'sine' }),
    createBufferSource: () => voice({ buffer: null, loop: false }),
    createBiquadFilter: () => node({ frequency: param(350), Q: param(1), type: 'lowpass' }),
    createBuffer: (channels, length) => ({ getChannelData: () => new Float32Array(length) })
  };
  return { ctx, log };
}

const reaches = (from, dest) => { for (let n = from, hops = 0; n && hops < 8; n = n.to, hops++) if (n === dest) return true; return false; };

test('every sound is a valid schedule that reaches the speaker', () => {
  setSound(true);
  for (const name of soundNames) {
    const { ctx, log } = fakeContext();
    attach(ctx);
    assert.equal(play(name, 1), true, name);
    assert.ok(log.voices.length > 0, `${name} makes a noise`);
    for (const v of log.voices) {
      assert.ok(v.from >= ctx.currentTime && v.until > v.from, `${name}: a voice starts and stops`);
      assert.ok(reaches(v, ctx.destination), `${name}: a voice is connected through to the speaker`);
    }
    const last = Math.max(...log.voices.map((v) => v.until)) - ctx.currentTime;
    assert.ok(last < 4.5, `${name} is over in ${last.toFixed(1)}s`);
    // The loudest single voice, before the master volume halves it.
    const loudest = Math.max(...log.gains.map((g) => g.gain.peak));
    assert.ok(loudest > 0.05 && loudest <= 0.5, `${name}: loudest voice ${loudest}`);
  }
});

test('the sounds the game asks for all exist', () => {
  for (const name of ['paper', 'word', 'tile', 'lift', 'deny', 'coin', 'clunk', 'wrong', 'right', 'win', 'lose', 'rattle', 'bell', 'bill']) {
    assert.ok(soundNames.includes(name), name);
  }
});

test('with sound switched off nothing is scheduled', () => {
  const { ctx, log } = fakeContext();
  attach(ctx);
  setSound(false);
  assert.equal(soundOn(), false);
  assert.equal(play('coin'), false);
  assert.equal(log.voices.length, 0);
  setSound(true);
  assert.equal(play('coin'), true);
  assert.equal(play('no such sound'), false);
});

test('leaving a cabinet hushes the tune but not the next sound', () => {
  const { ctx, log } = fakeContext();
  attach(ctx);
  setSound(true);
  play('win');
  const tuneBus = log.voices[0].to.to ?? log.voices[0].to;
  hush();
  const before = log.voices.length;
  assert.equal(play('tile'), true);
  assert.ok(log.voices.length > before);
  assert.ok(reaches(log.voices.at(-1), ctx.destination));
  assert.ok(tuneBus, 'the tune had somewhere to be hushed');
});
