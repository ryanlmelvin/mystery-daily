// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import { composeDay, gate } from '../src/compose.js';
import { explain } from '../src/explain.js';
import { told } from '../src/tell.js';

test('a carried weapon explains the unused wall tools and cites their tag in the text', () => {
  const c = composeDay('2026-11-27');
  const wall = c.exhibits.find((ex) => ex.id === 'tools');
  const means = c.path.find((s) => s.how === 'With what');
  assert.ok(means.from.includes(wall.id));
  assert.ok(means.say.includes(wall.title));
  for (const [kind, tool] of wall.facts) {
    assert.equal(kind, 'untouched');
    assert.ok(means.say.includes(tool));
  }
});

// A thing that fits the mark and was not used is the answer a player most wants checked.
// "It was plainly untouched" asks to be taken on trust; the playbill quotes the tag instead.
test('a decoy that fits the mark is cleared by quoting what its tag shows', () => {
  const c = composeDay('2026-12-04');
  const shelf = c.exhibits.find((ex) => ex.id === 'shelf');
  const decoys = shelf.facts.filter(([type]) => type === 'untouched').map(([, word]) => word);
  assert.deepEqual(decoys, ['rat poison', 'laudanum']);
  const say = (word) => c.traps.find((t) => t.word === word).say;
  assert.equal(say('rat poison'), 'The rat poison would leave that mark too, but it could not have been used: “A tin of rat poison, its lid rusted shut.” (The dressing table).');
  assert.ok(say('laudanum').includes('“A phial of laudanum, full to its dusty cork.”'));
});

test('one receipt clears the suspect and the apparent motive together', () => {
  const c = composeDay('2026-11-30');
  const receipt = c.exhibits.find((ex) => ex.id === 'pocket');
  const [, doll, paid] = receipt.facts.find(([type]) => type === 'excused');
  const suspect = explain(c).proof.cast.ids[doll];
  const cited = c.traps.filter((t) => /paid in full/i.test(t.say));
  assert.equal(cited.length, 1);
  const [trap] = cited;
  assert.ok(trap.say.includes(suspect));
  assert.ok(trap.say.includes(paid));
  assert.ok(trap.say.includes(receipt.title));
  assert.ok(trap.against.includes(receipt.id));
});

test('removing the invitation leaves a lead unanswered and the gate refuses the case', () => {
  const c = structuredClone(composeDay('2026-12-03'));
  const bag = c.exhibits.find((ex) => ex.id === 'bag');
  bag.facts = bag.facts.filter(([type]) => type !== 'explained');
  const result = explain(c);
  assert.equal(result.proof.ok, false);
  assert.deepEqual(result.path, []);
  assert.ok(gate(told({ ...c, ...result })).some((error) => error.includes('Nothing answers a temptation')));
});
