// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import foxes from '../src/cases/foxes.js';
import { proveCase } from '../src/logic.js';

test('the mask at the blow identifies its current wearer and its opening wearer', () => {
  const first = proveCase(foxes);
  assert.equal(first.ok, true);
  assert.equal(first.story.fill.culprit, 'Pearl Finch');
  const trap = first.story.traps.find((t) => t.value === 'Dinah Dove');
  assert.deepEqual(trap.answeredBy, ['slip', 'score']);

  const differentMask = structuredClone(foxes);
  differentMask.exhibits.find((e) => e.id === 'fiddle').facts[0][1] = 'crooked ear';
  assert.deepEqual(proveCase(differentMask).story.fill, {
    guise: 'Hare', firstWearer: 'Pearl Finch', culprit: 'Dinah Dove', victim: 'Lionel Jay'
  });
  const earlierBlow = structuredClone(foxes);
  earlierBlow.exhibits.find((e) => e.id === 'score').facts[0][1] = 1;
  const earlier = proveCase(earlierBlow).story;
  assert.equal(earlier.fill.culprit, 'Dinah Dove');
  assert.equal(earlier.fill.firstWearer, 'Dinah Dove');
});

test('the blow, mask, entry, exchange and timing all matter', () => {
  for (const kind of ['strikingMask', 'maskFeature', 'maskAtDoor', 'exchanged', 'stoppedAt']) {
    const c = structuredClone(foxes);
    for (const exhibit of c.exhibits) exhibit.facts = exhibit.facts.filter((f) => f[0] !== kind);
    c.exhibits = c.exhibits.filter((e) => e.facts.length);
    assert.ok(proveCase(c).story.stalled.includes('culprit'), kind);
  }
});

test('either guest can hold the fan without its matching dance card', () => {
  const c = structuredClone(foxes);
  const host = c.exhibits.find((e) => e.id === 'host');
  host.facts = host.facts.filter((f) => f[0] !== 'owner');
  const { cast } = proveCase(c);
  assert.deepEqual(cast.stalled, ['fan', 'rose']);
  assert.equal(cast.solutions.length, 2);
});
