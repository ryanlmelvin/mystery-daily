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
  for (const id of ['fiddle', 'masks', 'doorcard', 'slip', 'score']) {
    const c = structuredClone(foxes);
    c.exhibits = c.exhibits.filter((e) => e.id !== id);
    assert.ok(proveCase(c).story.stalled.includes('culprit'), id);
  }
});
