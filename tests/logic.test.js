// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import { proveCase, matches } from '../src/logic.js';
import { CASES, caseById } from '../src/cases/index.js';

// A small case of its own: the butler holds the vase that fits the bruise, and wants the key.
const toy = () => ({
  id: 'toy',
  words: { 'Ann Ash': 'person', 'Bob Birch': 'person', 'Cy Cole': 'person', 'Di Dove': 'person', rope: 'thing', vase: 'thing', key: 'thing', purse: 'thing' },
  exhibits: [
    { id: 'body', facts: [['tag', 'floor', { initials: 'A.A.' }], ['dead', 'floor'], ['sign', 'a bruise']] },
    { id: 'list', facts: [['listed', 'Bob Birch', 'butler'], ['listed', 'Cy Cole', 'cook']] },
    { id: 'door', facts: [['fits', 'door', 'butler'], ['has', 'door', 'vase']] },
    { id: 'stove', facts: [['fits', 'stove', 'cook']] },
    { id: 'shelf', facts: [['makes', 'vase', 'a bruise'], ['makes', 'rope', 'a bruise'], ['untouched', 'rope']] },
    { id: 'note', facts: [['wants', 'Bob Birch', 'key']] }
  ],
  panels: [
    { id: 'cast', parts: ['', ['person', 'Ann Ash', 'floor'], '', ['person', 'Bob Birch', 'door'], '', ['person', 'Cy Cole', 'stove']] },
    { id: 'story', parts: [['person', 'Bob Birch', 'culprit'], '', ['thing', 'vase', 'means'], '', ['thing', 'key', 'motive']] }
  ]
});
const exhibit = (c, id) => c.exhibits.find((e) => e.id === id);
const drop = (c, id, type) => { const ex = exhibit(c, id); ex.facts = ex.facts.filter((f) => f[0] !== type); };
const has = (p, text) => p.errors.some((e) => e.includes(text));

test('name patterns', () => {
  assert.equal(matches('Silas Crane', { initials: 'S.C.' }), true);
  assert.equal(matches('Silas Crane', { initials: 'S.K.' }), false);
  assert.equal(matches('Leo Sparrow', { abbr: 'L. Sparrow' }), true);
  assert.equal(matches('Ida Sparrow', { abbr: 'L. Sparrow' }), false);
  assert.equal(matches('Cornelius Pym', { surname: 'Pym' }), true);
  assert.equal(matches('Cornelius Pym', { full: 'Cornelius Pym' }), true);
});

test('a sound case proves, in the order a person would reason', () => {
  const p = proveCase(toy());
  assert.deepEqual(p.errors, []);
  assert.deepEqual(p.cast.ids, { floor: 'Ann Ash', door: 'Bob Birch', stove: 'Cy Cole' });
  assert.deepEqual(p.story.steps.map((s) => [s.round, s.role, s.value]), [[1, 'means', 'vase'], [2, 'culprit', 'Bob Birch'], [3, 'motive', 'key']]);
  assert.deepEqual(p.story.traps.map((t) => [t.value, t.answered, t.self]), [['rope', true, true]]);
  assert.equal(p.exhibits.shelf, 'needed');
  assert.equal(p.exhibits.door, 'needed');
});

test('two complete stories are a second answer', () => {
  const c = toy();
  // Give the cook the rope and a motive of his own, and let nothing rule the rope out.
  exhibit(c, 'stove').facts.push(['has', 'stove', 'rope'], ['wants', 'stove', 'purse']);
  drop(c, 'shelf', 'untouched');
  const p = proveCase(c);
  assert.ok(has(p, '2 stories fit the facts'));
  assert.ok(has(p, 'culprit: Cy Cole'));
});

test('an answer that only falls out by trying the others is flagged', () => {
  const c = toy();
  // Nothing rules the rope out; only the lack of anyone holding it does.
  drop(c, 'shelf', 'untouched');
  const p = proveCase(c);
  assert.equal(p.story.solutions.length, 1);
  assert.ok(has(p, 'cannot be settled one step at a time'));
});

test('a doll nothing names leaves the cast open', () => {
  const c = toy();
  drop(c, 'stove', 'fits');
  exhibit(c, 'stove').facts.push(['untouched', 'purse']);
  const p = proveCase(c);
  assert.ok(has(p, 'The cast can be named 2 ways'));
  assert.ok(has(p, 'stove: Di Dove'));
});

test('someone who looks guilty must be cleared by something', () => {
  const c = toy();
  exhibit(c, 'stove').facts.push(['wants', 'stove', 'purse']);
  let p = proveCase(c);
  assert.ok(has(p, 'Nothing answers a temptation: culprit = Cy Cole'));
  exhibit(c, 'list').facts.push(['excused', 'stove', 'purse']);
  p = proveCase(c);
  assert.deepEqual(p.errors, []);
  assert.equal(p.story.traps.find((t) => t.value === 'Cy Cole').self, false);
});

test('an explanation answers the lead about the person it names', () => {
  const c = toy();
  exhibit(c, 'stove').facts.push(['lead', 'stove', 'was dressed for a journey']);
  const unanswered = 'Nothing answers a temptation: culprit = Cy Cole';
  assert.ok(has(proveCase(c), unanswered));

  const invitation = ['explained', 'Bob Birch', 'was dressed for a journey'];
  exhibit(c, 'note').facts.push(invitation);
  assert.ok(has(proveCase(c), unanswered));

  invitation[1] = 'Cy Cole';
  const p = proveCase(c);
  assert.deepEqual(p.errors, []);
  const trap = p.story.traps.find((t) => t.role === 'culprit' && t.value === 'Cy Cole');
  assert.equal(trap.answered, true);
  assert.deepEqual(trap.why, ['was dressed for a journey']);
  assert.deepEqual(trap.how, ['an innocent reason']);
  assert.deepEqual(trap.answeredBy, ['note']);

  exhibit(c, 'stove').facts.push(['lead', 'stove', 'had been dismissed']);
  assert.ok(has(proveCase(c), unanswered));
  exhibit(c, 'list').facts.push(['explained', 'Cy Cole', 'had been dismissed']);
  assert.deepEqual(proveCase(c).errors, []);
});

test('explaining a lead leaves evidence of holding the weapon in play', () => {
  const c = toy();
  exhibit(c, 'stove').facts.push(['lead', 'stove', 'had been dismissed'], ['has', 'stove', 'vase']);
  exhibit(c, 'note').facts.push(['explained', 'stove', 'had been dismissed'], ['wants', 'stove', 'purse']);
  const p = proveCase(c);
  assert.ok(has(p, '2 stories fit the facts'));
  assert.ok(p.story.solutions.some((s) => s.culprit === 'Cy Cole' && s.means === 'vase' && s.motive === 'purse'));
  assert.ok(has(p, 'Nothing answers a temptation: culprit = Cy Cole'));
});

test('a name written at the scene accuses, unless the scene is staged', () => {
  const c = toy();
  c.exhibits.push({ id: 'wall', facts: [['accused', { surname: 'Cole' }]] });
  assert.ok(has(proveCase(c), 'Nothing answers a temptation: culprit = Cy Cole'));
  exhibit(c, 'body').facts.push(['habit', 'writing hand', 'left']);
  exhibit(c, 'wall').facts.push(['found', 'writing hand', 'right']);
  const p = proveCase(c);
  assert.deepEqual(p.errors, []);
  assert.deepEqual(p.story.traps.find((t) => t.value === 'Cy Cole').how, ['the scene was staged']);
});

test('the timetable gives an alibi to whoever boarded after the death', () => {
  const c = toy();
  exhibit(c, 'stove').facts.push(['has', 'stove', 'vase']);
  assert.ok(has(proveCase(c), 'Nothing answers a temptation: culprit = Cy Cole'));
  exhibit(c, 'body').facts.push(['died', '9.02']);
  exhibit(c, 'list').facts.push(['stops', [['Early', '8.40'], ['Late', '9.10']]]);
  exhibit(c, 'stove').facts.push(['boarded', 'stove', 'Late']);
  const p = proveCase(c);
  assert.deepEqual(p.errors, []);
  assert.deepEqual(p.story.traps.find((t) => t.value === 'Cy Cole').how, ['not yet aboard']);
});

// A thing in the hands of someone who was not there cannot have done it, wherever it sits
// now. "Both still in her hat" cleared the hatpins on the train only by looking put away.
test('what a latecomer holds came aboard with them', () => {
  const c = toy();
  // The cook holds a rope that fits the bruise, and nothing shows it unused.
  drop(c, 'shelf', 'untouched');
  exhibit(c, 'stove').facts.push(['has', 'stove', 'rope']);
  assert.ok(has(proveCase(c), 'Nothing answers a temptation: means = rope'));
  exhibit(c, 'body').facts.push(['died', '9.02']);
  exhibit(c, 'list').facts.push(['stops', [['Early', '8.40'], ['Late', '9.10']]]);
  exhibit(c, 'stove').facts.push(['boarded', 'stove', 'Late']);
  const p = proveCase(c);
  assert.deepEqual(p.errors, []);
  const rope = p.story.traps.find((t) => t.role === 'means' && t.value === 'rope');
  assert.deepEqual(rope.how, ['came aboard too late']);
  assert.equal(rope.self, false);
  assert.deepEqual(p.story.traps.find((t) => t.value === 'Cy Cole').ruled, ['not yet aboard']);
  // A second rope in the hands of someone who was there all along is not cleared by it.
  exhibit(c, 'door').facts.push(['has', 'door', 'rope']);
  assert.ok(has(proveCase(c), 'Nothing answers a temptation: means = rope'));
  exhibit(c, 'door').facts.pop();
  // And had the cook been aboard from the start, his rope would have no such answer.
  exhibit(c, 'stove').facts.pop();
  exhibit(c, 'stove').facts.push(['boarded', 'stove', 'Early']);
  assert.ok(has(proveCase(c), 'Nothing answers a temptation: means = rope'));
});

test('train: the hatpins are cleared by the timetable, not by where they sit', () => {
  const pin = proveCase(caseById('train')).story.traps.find((t) => t.role === 'means' && t.value === 'hatpin');
  assert.deepEqual(pin.how, ['came aboard too late']);
  assert.ok(pin.answeredBy.includes('timetable') && pin.answeredBy.includes('victim'));
  assert.equal(pin.self, false);
  const c = structuredClone(caseById('train'));
  drop(c, 'lady', 'boarded');
  assert.ok(has(proveCase(c), 'Nothing answers a temptation: means = hatpin'));
});

test('an exhibit whose facts change nothing is called idle', () => {
  const c = toy();
  c.exhibits.push({ id: 'poster', facts: [['listed', 'Di Dove', 'dancer']] });
  assert.ok(has(proveCase(c), 'Exhibit poster is idle'));
  c.exhibits.push({ id: 'blank', facts: [] });
  assert.ok(has(proveCase(c), 'Exhibit blank states no facts'));
});

for (const c of CASES) {
  test(`${c.id}: the proof finds exactly the case's own answer`, () => {
    const p = proveCase(c);
    assert.deepEqual(p.errors, []);
    assert.equal(p.cast.solutions.length, 1);
    assert.equal(p.story.solutions.length, 1);
    assert.ok(p.story.traps.every((t) => t.answered));
    assert.ok(Object.values(p.exhibits).every((role) => role !== 'idle'));
  });
}

// The first run of the proof found this: only the picture tied the standing man to the
// sample case, so the facts let him be the guard. The text now says he carries its key.
test('train: without the key to the sample case, the standing man could be the guard', () => {
  const c = structuredClone(caseById('train'));
  drop(c, 'traveller', 'link');
  const p = proveCase(c);
  assert.ok(p.cast.solutions.some((s) => s.traveller === 'Amos Pike'));
  assert.ok(p.cast.stalled.includes('traveller'));
  assert.ok(caseById('train').exhibits.find((e) => e.id === 'traveller').lines[0][1].includes('key to a sample case'));
});

test('the two collars need the bishop’s letter, the two hat repairs need the feather', () => {
  const parish = structuredClone(caseById('vicarage'));
  drop(parish, 'visitor', 'link');
  const collars = proveCase(parish).cast.solutions;
  assert.deepEqual(new Set(collars.map((s) => s.vicar)), new Set(['Osric Thrale', 'Ambrose Pell']));
  assert.equal(collars.length, 2);

  const train = structuredClone(caseById('train'));
  drop(train, 'lady', 'fits');
  assert.ok(proveCase(train).cast.solutions.some((s) => s.lady === 'Dora Bly'));
});

test('the brooch needs evidence for both the fatal struggle and the later theft', () => {
  const sample = caseById('brooch');
  for (const [tag, fact, role] of [
    ['witness', 'witnessedButton', 'culprit'], ['body', 'grippedButton', 'culprit'],
    [sample.composed.culprit, 'cuffNumber', 'culprit'], ['body', 'bare', 'loot'],
    ['inventory', 'inventory', 'loot'], [sample.composed.thief, 'admitted', 'thief'],
    [sample.composed.thief, 'has', 'thief']
  ]) {
    const c = structuredClone(sample);
    drop(c, tag, fact);
    c.exhibits = c.exhibits.filter((ex) => ex.facts.length);
    const p = proveCase(c);
    assert.equal(p.ok, false, fact);
    assert.ok(p.story.stalled.includes(role), fact);
  }
});
