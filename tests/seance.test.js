// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import seance from '../src/cases/seance.js';
import { proveCase } from '../src/logic.js';

test('the invitation, signature and accusation follow separate clues', () => {
  const { story, errors } = proveCase(seance);
  assert.deepEqual(errors, []);
  assert.deepEqual(story.fill, { spirit: 'Maud Bell', culprit: 'Jasper Dove', blamed: 'Hector Crow' });

  const changed = structuredClone(seance);
  const slate = changed.exhibits.find((e) => e.id === 'slates');
  slate.facts.find((f) => f[0] === 'slateLine')[1] = 'my little radish';
  slate.facts.find((f) => f[0] === 'slateSeal')[1] = 'wren';
  slate.facts.find((f) => f[0] === 'slateCharge')[1] = 'fox';
  assert.deepEqual(proveCase(changed).story.fill, { spirit: 'Esther Bell', culprit: 'Hector Crow', blamed: 'Jasper Dove' });
});

test('each link in the séance test needs its own observation', () => {
  for (const [kind, role] of [
    ['privateDraw', 'culprit'], ['drawStub', 'culprit'], ['slateLine', 'culprit'],
    ['testLine', 'culprit'], ['slateSeal', 'spirit'], ['letterSeal', 'spirit'],
    ['slateCharge', 'blamed'], ['wearsPin', 'blamed']
  ]) {
    const changed = structuredClone(seance);
    for (const e of changed.exhibits) e.facts = e.facts.filter((f) => f[0] !== kind);
    changed.exhibits = changed.exhibits.filter((e) => e.facts.length);
    const proof = proveCase(changed);
    assert.equal(proof.ok, false, kind);
    assert.ok(proof.story.stalled.includes(role), kind);
  }
});
