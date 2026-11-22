// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
import { tellErrors } from '../src/tell.js';
import { restoreTutorial, tutorialCase as c } from '../src/tutorial.js';

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

const oldCase = { ...c, panels: [{ id: 'story', parts: c.panels.flatMap((panel) => panel.parts) }] };

function readClues(puzzle) {
  const state = E.newGame(puzzle);
  for (const ex of puzzle.exhibits) E.openExhibit(puzzle, state, ex.id, 1);
  return state;
}

function check(puzzle, state, name, luggage) {
  for (const [i, word] of [name, luggage].entries()) {
    if (state.fills[i] !== word) assert.ok(E.place(puzzle, state, i, word, 2).ok);
  }
  const result = E.dropPenny(puzzle, state, 3);
  assert.ok(result.ok);
  return result.attempt.wrong;
}

test('either practice plate can lock while the other still needs a correction', () => {
  assert.deepEqual(E.blanksOf(c).map((b) => [b.panel, b.kind]), [['cast', 'person'], ['story', 'thing']]);
  for (const [name, luggage, wrong, locked] of [
    ['Nell Moss', 'bag', { cast: 0, story: 1 }, 'cast'],
    ['Ada Finch', 'hatbox', { cast: 1, story: 0 }, 'story']
  ]) {
    const state = readClues(c);
    assert.deepEqual(check(c, state, 'Ada Finch', 'bag'), { cast: 1, story: 1 });
    assert.deepEqual(check(c, state, name, luggage), wrong);
    assert.deepEqual([...E.lockedPanels(c, state)], [locked]);
    assert.equal(restoreTutorial(state), state);
    assert.deepEqual(check(c, state, 'Nell Moss', 'hatbox'), { cast: 0, story: 0 });
    assert.equal(state.status, 'won');
  }
});

test('restoring a one-plate game scores its existing checks on the two plates', () => {
  const saved = readClues(oldCase);
  check(oldCase, saved, 'Ada Finch', 'bag');
  check(oldCase, saved, 'Nell Moss', 'bag');
  const migrated = restoreTutorial(saved);
  assert.deepEqual(migrated.tries.map((t) => t.wrong), [{ cast: 1, story: 1 }, { cast: 0, story: 1 }]);
  assert.deepEqual(migrated.fills, saved.fills);
  assert.equal(E.isFixed(c, migrated, 0), true);
  assert.deepEqual(check(c, migrated, 'Nell Moss', 'hatbox'), { cast: 0, story: 0 });
});

test('incompatible one-plate guesses are refunded and the current board stays editable', () => {
  const saved = readClues(oldCase);
  check(oldCase, saved, 'Ada Finch', 'hatbox');
  E.clearBlank(oldCase, saved, 1, 4);
  const refund = () => ({ ...saved, tries: [], log: saved.log.filter(([, event]) => !event.startsWith('penny ')) });
  assert.deepEqual(restoreTutorial(saved), refund());

  // The correct hatbox was moved for another check and put back without a penny.
  check(oldCase, saved, 'Nell Moss', 'bag');
  E.place(oldCase, saved, 1, 'hatbox', 5);
  const migrated = restoreTutorial(saved);
  assert.deepEqual(migrated, refund());
  assert.deepEqual(check(c, migrated, 'Nell Moss', 'hatbox'), { cast: 0, story: 0 });
  assert.deepEqual(migrated.log.map(([, event]) => event).filter((event) => event.startsWith('penny ')), ['penny 1 0/0']);
});

test('a finished one-plate game keeps its pennies even if its guesses changed correct tiles', () => {
  const saved = readClues(oldCase);
  check(oldCase, saved, 'Nell Moss', 'bag');
  check(oldCase, saved, 'Ada Finch', 'hatbox');
  check(oldCase, saved, 'Nell Moss', 'hatbox');
  const migrated = restoreTutorial(saved);
  assert.equal(migrated.status, 'won');
  assert.deepEqual(migrated.tries.map((t) => t.wrong), [
    { cast: 0, story: 1 }, { cast: 1, story: 0 }, { cast: 0, story: 0 }
  ]);
});

test('missing or incompatible tutorial saves open a fresh game', () => {
  const fresh = E.newGame(c);
  for (const saved of [null, {}, { ...fresh, fills: [null] }, { ...fresh, tries: [null] }]) {
    assert.deepEqual(restoreTutorial(saved), fresh);
  }
});
