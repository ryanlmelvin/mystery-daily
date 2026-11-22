// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import { BEAT, pause, pennyLine, pennyShow } from '../src/show.js';

function classes() {
  const set = new Set();
  return { add: (...names) => names.forEach((n) => set.add(n)), remove: (...names) => names.forEach((n) => set.delete(n)), has: (n) => set.has(n) };
}

function cabinet() {
  const parts = { '#drop': { classList: classes() }, '.fall': { classList: classes() } };
  const plates = { cast: { classList: classes() }, story: { classList: classes() } };
  const works = { querySelector: (sel) => parts[sel] || plates[/data-panel="(\w+)"/.exec(sel)?.[1]] || null };
  const glass = { classList: classes() };
  const heard = [];
  const sound = (name, arg) => heard.push(arg === undefined ? name : `${name} ${arg}`);
  return { works, glass, plates, parts, heard, sound };
}

const settle = async () => { for (let i = 0; i < 5; i++) await Promise.resolve(); };
const VERDICTS = [{ panel: 'cast', ok: false }, { panel: 'story', ok: true }];

test('a penny drops, the works strain, and each plate is marked in turn', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { works, glass, plates, parts, heard, sound } = cabinet();
  let done = false;
  const show = pennyShow({ works, glass }, VERDICTS, { sound, signal: new AbortController().signal }).then(() => { done = true; });

  assert.deepEqual(heard, ['coin']);
  assert.ok(parts['#drop'].classList.has('pressed') && parts['.fall'].classList.has('going'));
  assert.ok(!glass.classList.has('lurch'));

  t.mock.timers.tick(BEAT.coin);
  await settle();
  assert.deepEqual(heard, ['coin', 'clunk']);
  assert.ok(glass.classList.has('lurch'));
  assert.ok(!plates.cast.classList.has('stamped'), 'nothing is marked while the works strain');

  t.mock.timers.tick(BEAT.strain);
  await settle();
  assert.deepEqual(heard.slice(2), ['wrong 0']);
  assert.ok(plates.cast.classList.has('stamped') && plates.cast.classList.has('jolts'));
  assert.ok(!plates.story.classList.has('stamped'), 'the second plate waits its turn');

  t.mock.timers.tick(BEAT.verdict);
  await settle();
  assert.deepEqual(heard.slice(3), ['right 1']);
  assert.ok(plates.story.classList.has('stamped') && plates.story.classList.has('locks'));
  assert.equal(done, false);

  t.mock.timers.tick(BEAT.settle);
  await show;
  assert.ok(!glass.classList.has('lurch'), 'the cogs settle when the penny is weighed');
});

test('a tap during the penny stops the show where it stands', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { works, glass, plates, heard, sound } = cabinet();
  const skip = new AbortController();
  const show = pennyShow({ works, glass }, VERDICTS, { sound, signal: skip.signal });
  t.mock.timers.tick(BEAT.coin);
  await settle();
  skip.abort();
  await show;
  t.mock.timers.tick(10000);
  await settle();
  assert.deepEqual(heard, ['coin', 'clunk']);
  assert.ok(!glass.classList.has('lurch'));
  assert.ok(!plates.cast.classList.has('stamped') && !plates.story.classList.has('stamped'));
});

test('a player who asked for no motion gets the result at once, with a knock', async () => {
  const { works, glass, plates, parts, heard, sound } = cabinet();
  await pennyShow({ works, glass }, VERDICTS, { sound, signal: new AbortController().signal, still: true });
  assert.deepEqual(heard, ['clunk', 'wrong 0']);
  assert.ok(!parts['.fall'].classList.has('going') && !plates.cast.classList.has('stamped') && !glass.classList.has('lurch'));

  const right = cabinet();
  await pennyShow(right, [{ panel: 'story', ok: true }], { sound: right.sound, signal: new AbortController().signal, still: true });
  assert.deepEqual(right.heard, ['clunk', 'right 0']);
});

test('a plate locked by an earlier penny is not marked again', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { works, glass, plates, heard, sound } = cabinet();
  const show = pennyShow({ works, glass }, [{ panel: 'story', ok: false }], { sound, signal: new AbortController().signal });
  t.mock.timers.tick(BEAT.coin);
  await settle();
  t.mock.timers.tick(BEAT.strain);
  await settle();
  t.mock.timers.tick(BEAT.settle);
  await show;
  assert.deepEqual(heard, ['coin', 'clunk', 'wrong 0']);
  assert.ok(!plates.cast.classList.has('stamped') && plates.story.classList.has('jolts'));
});

test('a pause ends early when it is skipped, and at once if already skipped', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const skip = new AbortController();
  let done = false;
  const waiting = pause(1000, skip.signal).then(() => { done = true; });
  t.mock.timers.tick(999);
  await settle();
  assert.equal(done, false);
  skip.abort();
  await waiting;
  await pause(1000, skip.signal);
});

test('the machine remarks on a penny in one short line', () => {
  const line = (over) => pennyLine({ wrong: { cast: 1, story: 2 }, before: undefined, locked: [], left: 3, ...over });
  assert.equal(line(), 'Clunk. 3 pennies left.');
  assert.equal(line({ left: 1 }), 'Clunk. One penny left.');
  assert.equal(line({ before: { cast: 2, story: 3 } }), 'Closer. 3 pennies left.');
  assert.equal(line({ before: { cast: 0, story: 1 } }), 'Further off. 3 pennies left.');
  assert.equal(line({ before: { cast: 2, story: 1 } }), 'No nearer. 3 pennies left.');
  assert.equal(line({ wrong: { cast: 0, story: 1 }, before: { cast: 0, story: 2 }, left: 2 }), 'One tile out. 2 pennies left.');
  // A plate that locks is the news, whatever the other plate did.
  assert.equal(line({ wrong: { cast: 0, story: 3 }, before: { cast: 1, story: 1 }, locked: ['cast'], left: 2 }), 'The cast plate locks. 2 pennies left.');
  for (const text of [line(), line({ left: 1 }), line({ before: { cast: 0, story: 1 } }), line({ locked: ['story'] }), line({ wrong: { cast: 1, story: 0 }, left: 1 })]) {
    assert.ok(text.length <= 40, `"${text}" must fit one line of the dock`);
  }
});
