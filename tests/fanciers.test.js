// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import fanciers from '../src/cases/fanciers.js';
import { pins } from '../src/art/fanciers.js';
import { told } from '../src/tell.js';
import { lintCase } from '../src/lint.js';
import { proveCase } from '../src/logic.js';

test('the May Day nest slip and the seed scales each need a catalogue entry', () => {
  for (const [key, doll] of [['May Day', 'hat'], ['seed merchant', 'satchel']]) {
    const c = structuredClone(fanciers);
    const catalogue = c.exhibits.find((e) => e.id === 'catalogue');
    catalogue.facts = catalogue.facts.filter(([kind, , entry]) => kind !== 'listed' || entry !== key);
    assert.deepEqual(proveCase(c).cast.stalled, [doll]);
  }
});

test('Fanciers’ Hall proves the prize claim and refutes the displayed winner', () => {
  const result = lintCase(told(fanciers), pins);
  assert.deepEqual(result.errors, []);
  const ribbon = result.proof.story.traps.find((t) => t.role === 'winningBird' && t.value === 'Halfpenny');
  assert.ok(ribbon.answeredBy.includes('scores'));
  for (const id of ['receipt', 'scores', 'catalogue']) {
    const c = { ...fanciers, exhibits: fanciers.exhibits.filter((e) => e.id !== id) };
    assert.equal(proveCase(c).ok, false, id);
  }
});

test('the highest score and the seal impressions determine the answers independently', () => {
  const c = structuredClone(fanciers);
  const scores = c.exhibits.find((e) => e.id === 'scores').facts;
  scores.find(([, ring]) => ring === '39')[2] = 10;
  const receipt = c.exhibits.find((e) => e.id === 'receipt').facts[0];
  receipt[2] = 'thistle';
  assert.deepEqual(proveCase(c).story.fill, {
    winningBird: 'Little Punch', winner: 'Cora Bell', claimedBird: 'Halfpenny', claimant: 'Ivo Reed'
  });
});

test('a shared first score leaves two winning birds', () => {
  const c = structuredClone(fanciers);
  c.exhibits.find((e) => e.id === 'scores').facts.find(([, ring]) => ring === '39')[2] = 9;
  assert.equal(proveCase(c).story.solutions.length, 2);
});
