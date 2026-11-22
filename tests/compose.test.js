// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import { composeDay, gate, crimeOf, SETTING_IDS } from '../src/compose.js';
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
  assert.equal(a.title, 'Eight Bells aboard the Kittiwake');
  assert.equal(a.where, "The captain's cabin, two days from port");
  assert.deepEqual(answers(a), ['Osric Tansy', 'Silas Bellamy', 'Mungo Rudge', 'Rufus Vane', 'Mungo Rudge', 'strychnine', 'Silas Bellamy', 'Osric Tansy']);
  const b = composeDay('2026-11-27');
  assert.equal(b.title, 'Death in the Palm House');
  assert.equal(b.where, 'Kelling Court, half past eight in the evening');
  assert.deepEqual(answers(b), ['Quentin Nash', 'Edith Sparrow', 'Ambrose Finch', 'Ambrose Finch', 'Quentin Nash', 'spade', 'Ghost Orchid', 'debts']);
  assert.equal(composeDay('2026-11-26'), a);
});

test('the two crimes take turns, so two days running never share a shape', () => {
  for (let i = 0; i < 30; i++) {
    assert.notEqual(crimeOf(dateAt(i)), crimeOf(dateAt(i + 1)));
    assert.equal(composeDay(dateAt(i)).composed.crime, crimeOf(dateAt(i)));
  }
  const story = (c) => c.panels[1].parts.filter((p) => typeof p === 'string').join('_');
  assert.notEqual(story(composeDay(dateAt(0))), story(composeDay(dateAt(1))));
});

test(`${RUN} days of composed cases all pass the gate`, () => {
  const settings = new Set();
  const loot = new Set();
  const means = new Set();
  let rerolled = 0;
  for (let i = 0; i < RUN; i++) {
    const c = composeDay(dateAt(i));
    assert.deepEqual(gate(c), [], `${dateAt(i)} was let through but does not pass`);
    assert.equal(c.id, 'day-' + dateAt(i));
    assert.ok(Array.isArray(c.composed.refused));
    rerolled += c.composed.refused.length;
    settings.add(c.composed.setting);
    for (const b of E.blanksOf(c)) {
      if (b.key === 'loot') loot.add(b.answer);
      if (b.key === 'means') means.add(b.answer);
    }
  }
  assert.deepEqual([...settings].sort(), [...SETTING_IDS].sort());
  assert.ok(loot.size >= 8, `only ${loot.size} different things stolen`);
  assert.ok(means.size >= 10, `only ${means.size} different means`);
  // A reroll is allowed, but a list that keeps tripping the gate should be mended instead.
  assert.ok(rerolled <= RUN / 10, `${rerolled} attempts were refused; mend the lists`);
});

test('a composed case is proved like any other, with a real trap', () => {
  for (const i of [0, 1, 2, 3, 9, 40, 41]) {
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
  for (const i of [0, 1, 3, 17, 18]) {
    const c = composeDay(dateAt(i));
    const s = E.newGame(c);
    for (const ex of c.exhibits) E.openExhibit(c, s, ex.id, 1000);
    answers(c).forEach((w, n) => assert.equal(E.place(c, s, n, w, 2000).ok, true, `placing ${w}`));
    assert.equal(E.dropPenny(c, s, 3000).status, 'won');
  }
});

test('in the wrong glass, naming the man the bottle was for as the poisoner is wrong', () => {
  const c = composeDay('2026-11-26');
  const blanks = E.blanksOf(c);
  const s = E.newGame(c);
  for (const ex of c.exhibits) E.openExhibit(c, s, ex.id, 1000);
  const meantFor = blanks.find((b) => b.key === 'intended').answer;
  blanks.forEach((b, n) => E.place(c, s, n, b.key === 'culprit' && b.panel === 'story' ? meantFor : b.answer, 2000));
  const res = E.dropPenny(c, s, 3000);
  assert.equal(res.status, 'play');
  assert.deepEqual(res.attempt.wrong, { cast: 0, story: 1 });
});

test('its text is rendered from its facts, and its end screen is filled in', () => {
  for (const i of [4, 5]) {
    const c = composeDay(dateAt(i));
    for (const ex of c.exhibits) assert.deepEqual(ex.lines, tellExhibit(c, ex).lines);
    assert.equal(c.tips.length, 2);
    assert.ok(c.path.every((s) => s.say && !/undefined|\.\.$|\{|\$/.test(s.say)), 'a broken sentence in the explanation');
    assert.ok(c.traps.every((s) => s.say && !/undefined|\{|\$/.test(s.say)));
  }
});

test('its scene has a tag for every exhibit, mirrored or not', () => {
  const seen = {};
  for (let i = 0; i < 40; i++) {
    const c = composeDay(dateAt(i));
    const pins = scenePins(c.scene);
    assert.deepEqual(Object.keys(pins).sort(), c.exhibits.map((e) => e.id).sort());
    const svg = sceneSvg(c.scene);
    assert.ok(svg.startsWith('<svg') && !svg.includes('NaN') && !svg.includes('undefined'));
    (seen[c.composed.crime] ||= {})[c.scene.mirror] = pins.roster[0];
  }
  for (const crime of ['theft', 'switch']) {
    assert.equal(seen[crime].true + seen[crime].false, 400, `${crime} tags do not mirror`);
  }
});

test('a composed case is found by its date, and one in each setting is on trial', () => {
  assert.equal(caseById('day-2026-11-26'), composeDay('2026-11-26'));
  assert.equal(caseById('day-nonsense'), undefined);
  assert.equal(caseById('study'), CASES[4]);
  const trial = trialCases('2026-11-22');
  assert.deepEqual(trial.map((c) => c.composed.setting).sort(), [...SETTING_IDS].sort());
  assert.ok(trial.every((c) => c.composed.date > '2026-11-22'));
});
