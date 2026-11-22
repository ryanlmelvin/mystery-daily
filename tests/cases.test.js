// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import { CASES, SAMPLES } from '../src/cases/index.js';
import { lintCase, BUDGET } from '../src/lint.js';
import { scenePins, sceneSvg } from '../src/art/scenes.js';
import * as E from '../src/engine.js';
import { LAUNCH, editionFor, caseForEdition, caseIdForDate, dailyForDate, today } from '../src/daily.js';
import { composeDay } from '../src/compose.js';

for (const c of [...CASES, ...SAMPLES]) {
  test(`${c.id}: passes the case checker`, () => {
    const { errors, stats } = lintCase(c, scenePins(c.scene));
    assert.deepEqual(errors, []);
    assert.ok(stats.reading <= BUDGET.reading);
  });

  test(`${c.id}: its scene draws`, () => {
    const svg = sceneSvg(c.scene);
    assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'));
    assert.equal(svg.includes('NaN'), false);
    assert.equal(svg.includes('undefined'), false);
  });

  test(`${c.id}: reading every tag and setting the answers wins on the first penny`, () => {
    const s = E.newGame(c);
    for (const ex of c.exhibits) E.openExhibit(c, s, ex.id, 1000);
    E.blanksOf(c).forEach((b, i) => assert.equal(E.place(c, s, i, b.answer, 2000).ok, true, `placing ${b.answer}`));
    assert.equal(E.dropPenny(c, s, 3000).status, 'won');
    assert.equal(E.shareText(c, s, LAUNCH).split('\n').length, 2);
  });

  test(`${c.id}: a plausible wrong story does not win`, () => {
    const s = E.newGame(c);
    for (const ex of c.exhibits) E.openExhibit(c, s, ex.id, 1000);
    const blanks = E.blanksOf(c);
    blanks.forEach((b, i) => {
      const rival = Object.keys(c.words).find((w) => c.words[w] === b.kind && w !== b.answer);
      E.place(c, s, i, b.panel === 'story' ? rival : b.answer, 2000);
    });
    const res = E.dropPenny(c, s, 3000);
    assert.equal(res.status, 'play');
    assert.equal(res.attempt.wrong.cast, 0);
    assert.equal(res.attempt.wrong.story, blanks.filter((b) => b.panel === 'story').length);
  });
}

test('case ids and scenes are distinct', () => {
  assert.equal(new Set(CASES.map((c) => c.id)).size, CASES.length);
  assert.equal(new Set(CASES.map((c) => c.scene)).size, CASES.length);
});

test('the checker catches a broken case', () => {
  const broken = structuredClone(CASES[0]);
  broken.exhibits.pop();
  broken.path.find((step) => step.gives.includes(0)).gives = [];
  const { errors } = lintCase(broken, scenePins(broken.scene));
  assert.ok(errors.some((e) => e.includes('no exhibit offers it')));
  assert.ok(errors.some((e) => e.includes('No step in the chain reaches blank 0')));
  assert.ok(errors.some((e) => e.includes('not an exhibit')));
});

test('the first five UTC editions are the five hand-written cabinets in order', () => {
  assert.equal(LAUNCH, '2026-11-21');
  assert.equal(editionFor(LAUNCH), 1);
  for (const [i, c] of CASES.entries()) {
    const date = `2026-11-${21 + i}`;
    assert.deepEqual(today(Date.parse(date + 'T23:59:59.999Z')), { date, edition: i + 1, case: c });
    assert.equal(caseForEdition(i + 1), c);
    assert.equal(caseIdForDate(date), c.id);
  }
});

test('later UTC editions publish the composed cabinet for that date', () => {
  for (const [date, edition] of [['2026-11-26', 6], ['2026-11-27', 7], ['2027-01-01', 42]]) {
    const c = composeDay(date);
    assert.deepEqual(today(Date.parse(date + 'T00:00:00Z')), { date, edition, case: c });
    assert.equal(caseIdForDate(date), c.id);
  }
});

test('pre-launch dates and invalid calendar dates have no edition to open', () => {
  for (const date of ['2026-11-20', '2026-11-31', '2026-2-1', 'abc']) {
    assert.equal(dailyForDate(date), null);
    assert.equal(caseIdForDate(date), null);
  }
});
