// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
import { tellErrors } from '../src/tell.js';
import { tutorialCase as c } from '../src/tutorial.js';

test('the three tutorial clues share a tray and can be read in any order', () => {
  assert.deepEqual(tellErrors(c), []);
  assert.deepEqual(c.exhibits.map((ex) => [ex.id, E.wordsIn(ex)]), [
    ['luggage', ['bag', 'Ada Finch', 'hatbox', 'Nell Moss']],
    ['note', []],
    ['seats', ['Ada Finch', 'Nell Moss']]
  ]);

  for (const order of [['luggage', 'note', 'seats'], ['seats', 'luggage', 'note']]) {
    const state = E.newGame(c);
    for (const id of [...order, order[0]]) E.openExhibit(c, state, id, 1);
    assert.deepEqual(state.opened, order);
    assert.deepEqual([...state.bank].sort(), ['Ada Finch', 'Nell Moss', 'bag', 'hatbox']);
  }
});

test('a practice penny checks both tutorial gaps together', () => {
  assert.deepEqual(E.blanksOf(c).map((b) => b.kind), ['person', 'thing']);
  const state = E.newGame(c);
  for (const ex of c.exhibits) E.openExhibit(c, state, ex.id, 1);

  for (const [name, luggage, wrong, status] of [
    ['Ada Finch', 'bag', 2, 'play'],
    ['Nell Moss', 'bag', 1, 'play'],
    ['Nell Moss', 'hatbox', 0, 'won']
  ]) {
    assert.ok(E.place(c, state, 0, name, 2).ok);
    assert.ok(E.place(c, state, 1, luggage, 2).ok);
    const result = E.dropPenny(c, state, 3);
    assert.deepEqual(result.attempt.wrong, { story: wrong });
    assert.equal(result.status, status);
  }
});
