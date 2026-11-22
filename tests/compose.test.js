// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import { composeDay, gate, SETTING_IDS } from '../src/compose.js';
import { caseById, trialCases, CASES } from '../src/cases/index.js';
import { tellExhibit } from '../src/tell.js';
import { proveCase } from '../src/logic.js';
import { scenePins, sceneSvg } from '../src/art/scenes.js';
import * as E from '../src/engine.js';

const RUN = 120;
const dateAt = (i) => new Date(Date.UTC(2026, 10, 26 + i)).toISOString().slice(0, 10);
const answers = (c) => E.blanksOf(c).map((b) => b.answer);

// If this fails after a deliberate change to the composer's lists or draws, bump COMPOSER
// in src/compose.js and write the new cases here. It is here so a change is never silent.
test('a date always gives the same case', () => {
  const a = composeDay('2026-11-26');
  assert.equal(a.title, 'Death in the Plate Room');
  assert.equal(a.where, 'Ashby Grange, just before midnight');
  assert.deepEqual(answers(a), ['Mortimer Hale', 'Cordelia Vane', 'Ezra Sparrow', 'Ezra Sparrow', 'Mortimer Hale', 'candlestick', 'Kelling Salver', 'rent']);
  const b = composeDay('2027-03-01');
  assert.equal(b.title, 'Found in the Glasshouse');
  assert.equal(b.scene.mirror, true);
  assert.deepEqual(answers(b), ['Hector Nash', 'Horace Lark', 'Sybil Quill', 'Sybil Quill', 'Hector Nash', 'hoe', 'Black Tulip', 'rent']);
  assert.equal(composeDay('2026-11-26'), a);
});

test(`${RUN} days of composed cases all pass the gate`, () => {
  const settings = new Set();
  const loot = new Set();
  const means = new Set();
  for (let i = 0; i < RUN; i++) {
    const c = composeDay(dateAt(i));
    assert.deepEqual(gate(c), [], `${dateAt(i)} was let through but does not pass`);
    assert.equal(c.id, 'day-' + dateAt(i));
    settings.add(c.composed.setting);
    const story = E.blanksOf(c).filter((b) => b.panel === 'story');
    loot.add(story.find((b) => b.key === 'loot').answer);
    means.add(story.find((b) => b.key === 'means').answer);
  }
  assert.deepEqual([...settings].sort(), [...SETTING_IDS].sort());
  assert.ok(loot.size >= 8, `only ${loot.size} different things stolen`);
  assert.ok(means.size >= 6, `only ${means.size} different weapons`);
});

test('a composed case is proved like any other, with a real trap', () => {
  for (const i of [0, 1, 2, 9, 40]) {
    const c = composeDay(dateAt(i));
    const p = proveCase(c);
    assert.deepEqual(p.errors, []);
    assert.equal(p.cast.solutions.length, 1);
    assert.equal(p.story.solutions.length, 1);
    assert.ok(p.story.traps.some((t) => t.answered && !t.self), 'no real trap');
    assert.ok(Object.values(p.exhibits).every((role) => role !== 'idle'));
  }
});

test('a composed case plays: reading every tag and setting the answers wins', () => {
  for (const i of [0, 3, 17]) {
    const c = composeDay(dateAt(i));
    const s = E.newGame(c);
    for (const ex of c.exhibits) E.openExhibit(c, s, ex.id, 1000);
    answers(c).forEach((w, n) => assert.equal(E.place(c, s, n, w, 2000).ok, true, `placing ${w}`));
    assert.equal(E.dropPenny(c, s, 3000).status, 'won');
  }
});

test('its text is rendered from its facts, and its end screen is filled in', () => {
  const c = composeDay(dateAt(5));
  for (const ex of c.exhibits) assert.deepEqual(ex.lines, tellExhibit(c, ex).lines);
  assert.equal(c.tips.length, 2);
  assert.ok(c.path.every((s) => s.say && !/undefined|\.\.$|\{|\$/.test(s.say)), 'a broken sentence in the explanation');
  assert.ok(c.traps.every((s) => s.say && !/undefined|\{|\$/.test(s.say)));
});

test('its scene has a tag for every exhibit, mirrored or not', () => {
  const seen = { true: false, false: false };
  for (let i = 0; i < 20; i++) {
    const c = composeDay(dateAt(i));
    const pins = scenePins(c.scene);
    assert.deepEqual(Object.keys(pins).sort(), c.exhibits.map((e) => e.id).sort());
    const svg = sceneSvg(c.scene);
    assert.ok(svg.startsWith('<svg') && !svg.includes('NaN') && !svg.includes('undefined'));
    seen[c.scene.mirror] = true;
  }
  assert.ok(seen.true && seen.false);
  const plain = composeDay('2026-11-26');
  const flipped = composeDay('2027-03-01');
  assert.equal(scenePins(plain.scene).roster[0] + scenePins(flipped.scene).roster[0], 400);
});

test('a composed case is found by its date, and three are on trial', () => {
  assert.equal(caseById('day-2026-11-26'), composeDay('2026-11-26'));
  assert.equal(caseById('day-nonsense'), undefined);
  assert.equal(caseById('study'), CASES[4]);
  const trial = trialCases('2026-11-22');
  assert.deepEqual(trial.map((c) => c.composed.setting).sort(), [...SETTING_IDS].sort());
  assert.ok(trial.every((c) => c.composed.date > '2026-11-22'));
});
