// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import * as E from '../src/engine.js';
import { countdown, dates, readRecord, resultOf, summarise, untilNext } from '../src/record.js';

const LAUNCH = '2026-11-21';
const won = (p = 1) => ({ r: 'won', p, t: 0, s: 60 });
const lost = { r: 'lost', p: 4, t: 0, s: 90 };

test('a finished game is recorded by result, pennies, paid tips and time', () => {
  const toy = {
    id: 'toy', words: { Ann: 'person', Bob: 'person' },
    exhibits: [{ id: 'a', title: 'A', lines: [['see', '{Ann} and {Bob}.']] }],
    panels: [{ id: 'cast', title: 'Cast', parts: [['person', 'Ann']] }, { id: 'story', title: 'Story', parts: [['person', 'Bob']] }],
    tips: ['One.', 'Two.']
  };
  const s = E.newGame(toy);
  assert.equal(resultOf(s), null, 'a game in play has no line yet');
  E.openExhibit(toy, s, 'a', 1000);
  E.place(toy, s, 0, 'Bob', 2000);
  E.place(toy, s, 1, 'Bob', 2000);
  E.takeTip(toy, s, 3000);
  E.dropPenny(toy, s, 4000);
  E.place(toy, s, 0, 'Ann', 5000);
  E.dropPenny(toy, s, 91000);
  assert.deepEqual(resultOf(s), { r: 'won', p: 2, t: 1, s: 90 });
  assert.equal(resultOf(null), null);
});

test('a streak counts editions solved in a row up to today, and waits for today', () => {
  const days = { '2026-11-21': won(2), '2026-11-22': won(1), '2026-11-23': won(3) };
  assert.equal(summarise(days, '2026-11-23', LAUNCH).streak, 3);
  // Today is not played yet: yesterday's run still stands.
  assert.equal(summarise(days, '2026-11-24', LAUNCH).streak, 3);
  // A day missed breaks it.
  assert.equal(summarise(days, '2026-11-25', LAUNCH).streak, 0);
  // So does a loss, today or before.
  assert.equal(summarise({ ...days, '2026-11-24': lost }, '2026-11-24', LAUNCH).streak, 0);
  assert.equal(summarise({ ...days, '2026-11-22': lost }, '2026-11-23', LAUNCH).streak, 1);
  // Catching up on a missed edition from the archive mends the run.
  const gap = { '2026-11-21': won(), '2026-11-23': won() };
  assert.equal(summarise(gap, '2026-11-23', LAUNCH).streak, 1);
  assert.equal(summarise({ ...gap, '2026-11-22': won(4) }, '2026-11-23', LAUNCH).streak, 3);
});

test('the summary counts games, the best run, the pennies each took and what is unplayed', () => {
  const days = {
    '2026-11-21': won(1), '2026-11-22': won(2), '2026-11-23': lost,
    '2026-11-25': won(2), '2026-11-26': won(4), '2026-11-27': won(2)
  };
  assert.deepEqual(summarise(days, '2026-11-28', LAUNCH), {
    played: 6, solved: 5, lost: 1, streak: 3, best: 3, dist: [1, 3, 0, 1], unplayed: 2
  });
  assert.deepEqual(summarise({}, LAUNCH, LAUNCH), { played: 0, solved: 0, lost: 0, streak: 0, best: 0, dist: [0, 0, 0, 0], unplayed: 1 });
  // A line dated outside the run of editions is not counted.
  assert.equal(summarise({ '2026-11-20': won(), '2026-12-25': won() }, '2026-11-22', LAUNCH).played, 0);
});

test('only well-formed lines are read back from storage', () => {
  assert.deepEqual(readRecord(null), { v: 1, days: {} });
  assert.deepEqual(readRecord({ v: 2, days: { '2026-11-21': won() } }), { v: 1, days: {} });
  assert.deepEqual(readRecord({ v: 1, days: 'no' }), { v: 1, days: {} });
  const kept = readRecord({ v: 1, days: {
    '2026-11-21': won(2), '2026-11-22': lost, yesterday: won(), '2026-11-23': { r: 'won', p: 9 },
    '2026-11-24': { r: 'play', p: 1 }, '2026-11-25': null
  } });
  assert.deepEqual(Object.keys(kept.days), ['2026-11-21', '2026-11-22']);
});

test('dates run through month ends, both ends included', () => {
  assert.deepEqual(dates('2026-11-29', '2026-12-02'), ['2026-11-29', '2026-11-30', '2026-12-01', '2026-12-02']);
  assert.deepEqual(dates('2026-11-22', '2026-11-21'), []);
});

test('the next edition opens at midnight UTC', () => {
  const noon = Date.parse('2026-11-22T12:00:00Z');
  assert.equal(untilNext(noon), 12 * 3600000);
  assert.equal(countdown(untilNext(noon)), '12:00:00');
  assert.equal(countdown(untilNext(Date.parse('2026-11-22T23:59:59.400Z'))), '0:00:01');
  assert.equal(countdown(untilNext(Date.parse('2026-11-22T16:38:42Z'))), '7:21:18');
  assert.equal(countdown(-5), '0:00:00');
});
