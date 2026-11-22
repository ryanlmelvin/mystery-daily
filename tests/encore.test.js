// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import encore from '../src/cases/encore.js';
import { proveCase } from '../src/logic.js';

test('the recorded blemish and the take on the machine must both match', () => {
  const sample = proveCase(encore);
  assert.equal(sample.ok, true);
  assert.equal(sample.story.fill.source, 'rehearsal cylinder');
  const trap = sample.story.traps.find((t) => t.value === 'live voice');
  assert.ok(trap.answered && trap.answeredBy.includes('sleeve') && trap.answeredBy.includes('horn'));

  for (const [id, kind, value] of [['aisle', 'heardEncore', 'a different note'], ['horn', 'running', 'C8']]) {
    const c = structuredClone(encore);
    c.exhibits.find((e) => e.id === id).facts.find((f) => f[0] === kind)[1] = value;
    const changed = proveCase(c);
    assert.equal(changed.ok, false);
    assert.equal(changed.story.fill.source, 'live voice');
    assert.equal(changed.story.fill.culprit, sample.story.fill.culprit);
  }
});

test('the box photograph identifies the striker independently of the audible alibi', () => {
  const c = structuredClone(encore);
  const flowers = c.exhibits.find((e) => e.id === 'flower');
  flowers.facts = flowers.facts.filter((f) => f[0] !== 'wornSash');
  const missing = proveCase(c).story;
  assert.ok(missing.stalled.includes('culprit'));
  assert.equal(missing.fill.source, 'rehearsal cylinder');

  c.exhibits.find((e) => e.id === 'tumbler').facts.push(['wornSash', 'tumbler', 'a star between two notes', 'The sash bears $mark.']);
  assert.equal(proveCase(c).story.fill.culprit, 'Kit Plum');
});
