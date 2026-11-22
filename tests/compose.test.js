// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import { composeDay, composedId, gate, crimeOf, SETTING_IDS, COMPOSER } from '../src/compose.js';
import { caseById, trialCases, CASES } from '../src/cases/index.js';
import { tellExhibit } from '../src/tell.js';
import { proveCase } from '../src/logic.js';
import { sceneFocus, scenePins, sceneSvg } from '../src/art/scenes.js';
import * as E from '../src/engine.js';

const RUN = 120;
const dateAt = (i) => new Date(Date.UTC(2026, 10, 26 + i)).toISOString().slice(0, 10);
const answers = (c) => E.blanksOf(c).map((b) => b.answer);

function culpritAndMeans(c) {
  const blanks = E.blanksOf(c);
  const culprit = blanks.find((b) => b.key === 'culprit').answer;
  return {
    doll: blanks.find((b) => b.panel === 'cast' && b.answer === culprit).key,
    means: blanks.find((b) => b.key === 'means').answer
  };
}

// If this fails after a deliberate change to the composer's lists or draws, bump COMPOSER
// in src/compose.js and write the new cases here. It is here so a change is never silent.
test('a date always gives the same case', () => {
  const a = composeDay('2026-11-26');
  assert.equal(a.title, 'Becalmed aboard the Marigold');
  assert.equal(a.id, 'day-2026-11-26-c4');
  assert.equal(a.where, "The captain's cabin, the first night out");
  assert.deepEqual(answers(a), ['Amos Thrale', 'Dorian Voss', 'Godfrey Tull', 'Elias Hobb', 'Elias Hobb', 'arsenic', 'Dorian Voss', 'Amos Thrale']);
  const b = composeDay('2026-11-27');
  assert.equal(b.title, 'Found in the Palm House');
  assert.equal(b.id, 'day-2026-11-27-c4');
  assert.equal(b.where, 'Yarrow House, half past eight in the evening');
  assert.deepEqual(answers(b), ['Gideon Crane', 'Hester Moss', 'Odile Tull', 'Odile Tull', 'Gideon Crane', 'spade', 'Blue Lotus', 'rent']);
  assert.equal(composeDay('2026-11-26'), a);
});

// What a player would notice coming round again is rotated, not drawn: a proofread of a
// year found 49 cases repeating a setting with the same things as one the week before.
test('a setting returns only every sixth day, and its contents have moved on', () => {
  const last = {};
  const titles = {};
  for (let i = 0; i < RUN; i++) {
    const c = composeDay(dateAt(i));
    const { setting } = c.composed;
    for (let back = 1; back <= 5 && i - back >= 0; back++) {
      assert.notEqual(composeDay(dateAt(i - back)).composed.setting, setting, `${dateAt(i)} repeats ${setting} within six days`);
    }
    const things = Object.fromEntries(E.blanksOf(c).filter((b) => b.kind !== 'person').map((b) => [b.key, b.answer]));
    if (last[setting]) {
      if (things.loot) {
        assert.notDeepEqual(c.scene.tools, last[setting].tools, `${setting} repeated its wall tools`);
        assert.notEqual(things.loot, last[setting].loot, `${setting} lost ${things.loot} twice running`);
      } else {
        assert.notEqual(things.means, last[setting].means, `${setting} used ${things.means} twice running`);
      }
      assert.notEqual(c.title, last[setting].title, `${setting} repeated its title`);
    }
    last[setting] = { ...things, tools: c.scene.tools, title: c.title };
    (titles[setting] ||= new Set()).add(c.title);
  }
  for (const setting of SETTING_IDS) assert.ok(titles[setting].size >= 9, `${setting} has only ${titles[setting].size} titles`);
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
    assert.equal(c.id, composedId(dateAt(i)));
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
  assert.ok(means.size >= 23, `only ${means.size} different means`);
  // A reroll is allowed, but a list that keeps tripping the gate should be mended instead.
  assert.ok(rerolled <= RUN / 10, `${rerolled} attempts were refused; mend the lists`);
});

test('either thief can use either wall tool or the thing they carry, with the same eight tags', () => {
  const sources = { exit: new Set(), doorway: new Set() };
  const plateText = new Map();
  const used = new Set();
  const untouched = new Set();
  const carried = new Set();
  for (let i = 0; i < RUN; i++) {
    const c = composeDay(dateAt(i));
    if (c.composed.crime !== 'theft') continue;
    const exhibits = Object.fromEntries(c.exhibits.map((e) => [e.id, e.facts]));
    assert.deepEqual(Object.keys(exhibits), ['body', 'roster', 'doorway', 'pocket', 'exit', 'bag', 'stand', 'tools']);
    // The empty plate must read the same whichever suspect did it.
    const wording = c.panels[1].parts.filter((p) => typeof p === 'string');
    const setting = c.composed.setting;
    if (plateText.has(setting)) assert.deepEqual(wording, plateText.get(setting), c.id);
    else plateText.set(setting, wording);
    const { doll, means: weapon } = culpritAndMeans(c);
    const index = c.scene.tools.indexOf(weapon);
    if (index === -1) {
      assert.equal(weapon, c.scene[doll].carry, c.id);
      carried.add(weapon);
      sources[doll].add('carried');
    } else {
      sources[doll].add(index);
    }
    for (const tool of c.scene.tools) {
      const kind = tool === weapon ? 'makes' : 'untouched';
      assert.ok(exhibits.tools.some(([type, word]) => type === kind && word === tool), c.id);
      (tool === weapon ? used : untouched).add(tool);
    }
    if (doll === 'doorway') assert.ok(exhibits.bag.some(([type, who]) => type === 'explained' && who === 'exit'), c.id);
    else assert.ok(exhibits.pocket.some(([type, who]) => type === 'excused' && who === 'doorway'), c.id);
  }
  for (const positions of Object.values(sources)) assert.deepEqual(positions, new Set([0, 1, 'carried']));
  assert.deepEqual(used, untouched);
  assert.deepEqual(carried, new Set(['lamp', 'lantern', 'rolling pin', 'cane', 'parasol']));
});

test('either poisoner can leave a receipt, an empty container, or a trace from the open shelf poison', () => {
  const clues = { second: new Set(), fourth: new Set() };
  const herrings = new Set();
  for (let i = 0; i < RUN; i++) {
    const c = composeDay(dateAt(i));
    if (c.composed.crime !== 'switch') continue;
    const { doll, means: poison } = culpritAndMeans(c);
    const guilty = c.exhibits.find((e) => e.id === doll);
    const shelf = c.exhibits.find((e) => e.id === 'shelf');
    const innocent = c.exhibits.find((e) => e.id === (doll === 'second' ? 'fourth' : 'second'));
    const tie = guilty.facts.find(([type, holder, word]) => type === 'has' && holder === doll && word === poison);
    assert.ok(tie, c.id);
    if (E.wordsIn(shelf).includes(poison)) {
      assert.ok(!shelf.facts.some(([type, word]) => type === 'untouched' && word === poison), c.id);
      clues[doll].add('shelf');
    } else if (tie[3].includes('receipt')) {
      clues[doll].add('receipt');
    } else {
      assert.match(tie[3], /empty|drained/, c.id);
      clues[doll].add('pocket');
    }
    const decoyReceipt = innocent.facts.find(([type]) => type === 'has');
    if (decoyReceipt) {
      assert.match(decoyReceipt[3], /receipt/, c.id);
      assert.ok(shelf.facts.some(([type, word]) => type === 'untouched' && word === decoyReceipt[2]), c.id);
      herrings.add('receipt');
    } else if (innocent.facts.some(([type]) => type === 'explained')) {
      assert.ok(innocent.facts.some(([type, , why]) => type === 'lead' && why === 'had been dismissed'), c.id);
      herrings.add('dismissal');
    }
  }
  for (const forms of Object.values(clues)) assert.deepEqual(forms, new Set(['receipt', 'pocket', 'shelf']));
  assert.deepEqual(herrings, new Set(['receipt', 'dismissal']));
});

test('a composed case has one solution and answers each temptation', () => {
  for (const i of [0, 1, 2, 3, 9, 40, 41]) {
    const c = composeDay(dateAt(i));
    const p = proveCase(c);
    assert.deepEqual(p.errors, []);
    assert.equal(p.cast.solutions.length, 1);
    assert.equal(p.story.solutions.length, 1);
    assert.ok(p.story.traps.length > 0 && p.story.traps.every((t) => t.answered), c.id);
    // A servant's pawn receipt can raise and settle their money troubles on the same tag.
    if (c.composed.crime === 'switch' || c.composed.culprit === 'doorway') {
      assert.ok(p.story.traps.some((t) => !t.self), c.id);
    }
    assert.ok(Object.values(p.exhibits).every((role) => role !== 'idle'));
  }
});

test('the same poses and expressions turn up on guilty and innocent dolls', () => {
  for (const part of ['doorway', 'exit', 'door', 'left']) {
    const guilty = { pose: new Set(), mood: new Set() };
    const innocent = { pose: new Set(), mood: new Set() };
    for (let i = 0; i < RUN; i++) {
      const c = composeDay(dateAt(i));
      const doll = c.scene[part];
      if (!doll) continue;
      const looks = c.composed.culprit === part ? guilty : innocent;
      looks.pose.add(doll.look.pose);
      looks.mood.add(doll.look.mood);
    }
    for (const feature of ['pose', 'mood']) {
      const common = [...guilty[feature]].filter((v) => v && innocent[feature].has(v));
      assert.ok(common.length > 1, `${part} has fewer than two shared ${feature}s`);
    }
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
  assert.equal(caseById(composeDay('2026-11-26').id), composeDay('2026-11-26'));
  assert.equal(caseById('day-nonsense'), undefined);
  assert.equal(caseById('study'), CASES[4]);
  const trial = trialCases('2026-11-22');
  assert.deepEqual(trial.map((c) => c.composed.setting).sort(), [...SETTING_IDS].sort());
  assert.ok(trial.every((c) => c.composed.date > '2026-11-22'));
});

test('composed close looks frame the printed props on either side of the window', () => {
  for (let i = 0; i < SETTING_IDS.length; i++) {
    const { scene } = composeDay(dateAt(i));
    const focus = sceneFocus({ ...scene, mirror: false });
    const mirrored = sceneFocus({ ...scene, mirror: true });
    const items = scene.kind === 'switch' ? ['roster', 'book', 'shelf', 'vessel'] : ['roster', 'stand', 'bag', 'tools'];
    for (const id of items) {
      const [x, y] = focus[id];
      assert.deepEqual(mirrored[id], [400 - x, y], `${scene.setting} ${id}`);
    }
    if (scene.kind === 'switch') {
      // A 75-unit-high close look must include the top of the playbill (44)
      // and the bottom of the cabin notice's frame (99).
      const [, y] = focus.roster;
      assert.ok(y - 37.5 <= 44 && y + 37.5 >= 99, 'wall notice cropped');
    } else {
      const [, y] = focus.stand;
      assert.ok(y - 37.5 <= 167 && y + 37.5 >= 233, 'empty stand cropped');
    }
  }
});

// A save is kept under the case's id. When the composer changes, a date gives a different
// case, so the id must change with it or an old save would be loaded against a new case.
test('a composed case carries the composer version in its id', () => {
  assert.equal(composeDay('2026-11-26').id, `day-2026-11-26-c${COMPOSER}`);
  assert.notEqual(composeDay('2026-11-26').id, 'day-2026-11-26');
});
