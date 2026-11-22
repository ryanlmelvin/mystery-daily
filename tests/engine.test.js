// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';

// A small case of its own, so these tests do not depend on any shipped mystery.
const toy = {
  id: 'toy',
  words: { Ann: 'person', Bob: 'person', Cy: 'person', rope: 'thing', vase: 'thing', key: 'thing' },
  exhibits: [
    { id: 'a', title: 'A', lines: [['see', 'Here is {Ann} with a {rope}.'], ['print', '{Bob} owns the {vase|vases}.']] },
    { id: 'b', title: 'B', lines: [['hand', '{Cy} lost a {key}. {Ann} again.']] }
  ],
  panels: [
    { id: 'cast', title: 'The cast', parts: ['Left, ', ['person', 'Ann'], '. Right, ', ['person', 'Bob'], '.'] },
    { id: 'story', title: 'What happened', parts: [['person', 'Bob'], ' used the ', ['thing', 'rope'], '.'] }
  ],
  tips: ['Look at the rope.', 'Compare A with B.']
};

const openAll = (s) => { for (const ex of toy.exhibits) E.openExhibit(toy, s, ex.id, 1000); };
const fill = (s, words) => words.forEach((w, i) => { if (w) assert.equal(E.place(toy, s, i, w, 2000).ok, true, `placing ${w}`); });

test('blanks are read cast first, then story', () => {
  assert.deepEqual(E.blanksOf(toy).map((b) => [b.panel, b.kind, b.answer]), [
    ['cast', 'person', 'Ann'], ['cast', 'person', 'Bob'], ['story', 'person', 'Bob'], ['story', 'thing', 'rope']
  ]);
});

test('an exhibit offers each marked word once, by its token', () => {
  assert.deepEqual(E.wordsIn(toy.exhibits[0]), ['Ann', 'rope', 'Bob', 'vase']);
  assert.deepEqual(E.segments('{Bob} owns the {vase|vases}.'), [
    { text: 'Bob', word: 'Bob' }, { text: ' owns the ' }, { text: 'vases', word: 'vase' }, { text: '.' }
  ]);
});

test('opening an exhibit banks its words once and starts the clock', () => {
  const s = E.newGame(toy);
  assert.equal(s.t0, null);
  E.openExhibit(toy, s, 'a', 5000);
  E.openExhibit(toy, s, 'a', 6000);
  E.openExhibit(toy, s, 'b', 7000);
  assert.deepEqual(s.bank, ['Ann', 'rope', 'Bob', 'vase', 'Cy', 'key']);
  assert.deepEqual(s.opened, ['a', 'b']);
  assert.equal(s.t0, 5000);
  assert.equal(E.openExhibit(toy, s, 'nope', 8000), false);
});

test('a tile only goes in a gap of its own kind, and only once found', () => {
  const s = E.newGame(toy);
  assert.equal(E.place(toy, s, 0, 'Ann', 1).why, 'unknown');
  openAll(s);
  assert.deepEqual(E.place(toy, s, 0, 'rope', 1), { ok: false, why: 'kind', kind: 'person' });
  assert.equal(E.place(toy, s, 0, 'Ann', 1).ok, true);
  assert.equal(E.clearBlank(toy, s, 0, 2), true);
  assert.equal(s.fills[0], null);
});

test('a penny needs every gap filled and reports wrong tiles per plate', () => {
  const s = E.newGame(toy);
  openAll(s);
  fill(s, ['Bob', 'Ann', 'Bob']);
  assert.equal(E.dropPenny(toy, s, 3000).why, 'unfilled');
  fill(s, [null, null, null, 'vase']);
  const res = E.dropPenny(toy, s, 3000);
  assert.deepEqual(res.attempt.wrong, { cast: 2, story: 1 });
  assert.deepEqual(res.attempt.marks, [false, false, true, false]);
  assert.equal(res.status, 'play');
  assert.equal(E.dropPenny(toy, s, 3100).why, 'same');
  assert.equal(s.tries.length, 1);
});

test('a plate with nothing wrong locks; the rest stays open', () => {
  const s = E.newGame(toy);
  openAll(s);
  fill(s, ['Ann', 'Bob', 'Cy', 'key']);
  E.dropPenny(toy, s, 3000);
  assert.deepEqual([...E.lockedPanels(toy, s)], ['cast']);
  assert.equal(E.place(toy, s, 0, 'Cy', 3100).why, 'fixed');
  assert.equal(E.place(toy, s, 2, 'Bob', 3100).ok, true);
});

test('the right plates win, and the clock stops', () => {
  const s = E.newGame(toy);
  openAll(s);
  fill(s, ['Ann', 'Bob', 'Bob', 'rope']);
  const res = E.dropPenny(toy, s, 61000);
  assert.equal(res.status, 'won');
  assert.equal(E.seconds(s, 999999), 60);
  assert.equal(E.clock(60), '1:00');
  assert.equal(E.dropPenny(toy, s, 62000).why, 'over');
  assert.equal(E.place(toy, s, 0, 'Cy', 62000).why, 'over');
});

test('four wrong pennies lose', () => {
  const s = E.newGame(toy);
  openAll(s);
  const wrongs = [['Cy', 'Cy', 'Cy', 'key'], ['Cy', 'Ann', 'Cy', 'key'], ['Bob', 'Ann', 'Cy', 'vase'], ['Bob', 'Cy', 'Ann', 'vase']];
  let status;
  for (const w of wrongs) { fill(s, w); status = E.dropPenny(toy, s, 4000).status; }
  assert.equal(status, 'lost');
  assert.equal(s.tries.length, E.PENNIES);
});

test('tips: two written ones, then the attendant sets a story tile', () => {
  const s = E.newGame(toy);
  openAll(s);
  assert.deepEqual(E.takeTip(toy, s, 1), { tier: 1, text: 'Look at the rope.' });
  assert.equal(E.paidTips(s), 1);
  assert.equal(E.takeTip(toy, s, 2).text, 'Compare A with B.');
  assert.equal(E.paidTips(s), 2);
  const third = E.takeTip(toy, s, 3);
  assert.equal(third.tier, 3);
  assert.equal(third.blank, 2);
  assert.match(third.text, /Bob/);
  assert.equal(s.fills[2], 'Bob');
  assert.equal(E.isFixed(toy, s, 2), true);
  assert.equal(E.paidTips(s), 3);
  fill(s, ['Ann', 'Bob', null, 'rope']);
  assert.equal(E.takeTip(toy, s, 4).text, 'Every tile is already right.');
  assert.equal(E.paidTips(s), 3);
});

test('older saves only keep the first tip free if it was already taken', () => {
  for (const [previousTips, previousMarks] of [[0, 0], [1, 0], [2, 1]]) {
    const s = E.newGame(toy);
    delete s.firstTipPaid;
    s.tips = previousTips;
    assert.equal(E.paidTips(s), previousMarks);
    E.takeTip(toy, s, 1);
    assert.equal(E.paidTips(JSON.parse(JSON.stringify(s))), previousMarks + 1);
  }
});

test('the shared playbill dates the case and puts each tip on the penny that used it', () => {
  const s = E.newGame(toy);
  openAll(s);
  fill(s, ['Ann', 'Cy', 'Bob', 'key']);
  E.takeTip(toy, s, 3000);
  E.dropPenny(toy, s, 3000);
  E.takeTip(toy, s, 3000);
  E.takeTip(toy, s, 3000);
  E.dropPenny(toy, s, 4000);
  fill(s, [null, 'Bob']);
  E.dropPenny(toy, s, 5000);
  const text = E.shareText(toy, s, '2026-11-21', 'https://example.test/');
  assert.equal(text, [
    'The Penny Murders · Saturday 11/21/2026',
    '🟩⬛ 🟩⬛ 💡',
    '🟩⬛ 🟩🟩 💡💡',
    '🟩🟩 🟩🟩',
    'https://example.test/'
  ].join('\n'));
  for (const w of Object.keys(toy.words)) assert.equal(text.includes(w), false);

  // A practice save from before the first tip was charged.
  delete s.firstTipPaid;
  assert.equal(E.shareText(toy, s, null), [
    'The Penny Murders · Practice',
    '🟩⬛ 🟩⬛',
    '🟩⬛ 🟩🟩 💡💡',
    '🟩🟩 🟩🟩'
  ].join('\n'));
});
