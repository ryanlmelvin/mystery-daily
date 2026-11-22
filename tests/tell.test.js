// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import { tellExhibit, tellErrors, told } from '../src/tell.js';
import { wordsIn } from '../src/engine.js';
import { CASES } from '../src/cases/index.js';
import vicarage from '../src/cases/vicarage.js';
import glasshouse from '../src/cases/glasshouse.js';
import train from '../src/cases/train.js';
import theatre from '../src/cases/theatre.js';
import study from '../src/cases/study.js';

const words = { 'Ann Ash': 'person', 'Bob Birch': 'person', rope: 'thing', vase: 'thing', Marrow: 'place', Ashby: 'place' };
const tell = (facts) => tellExhibit({ words }, { id: 'x', facts });
const text = (facts) => tell(facts).lines.map(([style, t]) => `${style}: ${t}`);

test('the words that carry a clue are written in from the fact', () => {
  assert.deepEqual(text([['tag', 'floor', { initials: 'A.A.' }, 'On his watch: | cut: $name']]), ['see: On his watch:', 'cut: A.A.']);
  assert.deepEqual(text([['tag', 'floor', { full: 'Ann Ash' }, 'hand: Dear $name,']]), ['hand: Dear {Ann Ash},']);
  assert.deepEqual(text([['tag', 'floor', { abbr: 'B. Birch' }, 'print: Signed for: $name.']]), ['print: Signed for: B. Birch.']);
  assert.deepEqual(text([['listed', 'Bob Birch', 'butler', 'print: $Key: Mr $name.']]), ['print: Butler: Mr {Bob Birch}.']);
  assert.deepEqual(text([['explained', 'Bob Birch', 'was dressed for a journey', 'hand: Dear $who, your room is ready.']]), ['hand: Dear {Bob Birch}, your room is ready.']);
  assert.deepEqual(text([['untouched', 'rope', 'The $thing is dusty.']]), ['see: The {rope} is dusty.']);
  assert.deepEqual(text([['makes', 'vase', 'a bruise', '$Thing, heavy. Two $thing[vases].']]), ['see: {vase|Vase}, heavy. Two {vase|vases}.']);
  assert.deepEqual(text([['habit', 'hand', 'left', 'His $value cuff is inked.'], ['died', '9.02', 'Stopped at $time.']]), ['see: His left cuff is inked. Stopped at 9.02.']);
  assert.deepEqual(text([['stops', [['Marrow', '8.40'], ['Ashby', '9.10']], 'print: Down train. $stops']]), ['print: Down train. {Marrow} depart 8.40. {Ashby} arrive 9.10.']);
});

test('facts told in the same hand run on as one line; a new hand starts a new line', () => {
  assert.deepEqual(text([
    ['owner', 'hat', { surname: 'Birch' }, 'hand: Mr $name,'],
    ['wants', { surname: 'Birch' }, 'vase', 'hand: you shall not have the $thing.'],
    ['untouched', 'rope', 'The $thing hangs whole.']
  ]), ['hand: Mr Birch, you shall not have the {vase}.', 'see: The {rope} hangs whole.']);
});

test('a thing can be shown without being named, but only on purpose', () => {
  const veiled = tell([['has', 'door', 'vase', 'In his bag, $thing~[something heavy wrapped in a cloth].']]);
  assert.deepEqual(veiled.errors, []);
  assert.deepEqual(veiled.lines, [['see', 'In his bag, something heavy wrapped in a cloth.']]);
  assert.deepEqual(wordsIn({ lines: veiled.lines }), []);
  const forgot = tell([['has', 'door', 'vase', 'In his bag, something heavy wrapped in a cloth.']]);
  assert.match(forgot.errors[0], /asserts "vase", but the exhibit never shows it/);
});

test('one fact may rely on another in the same exhibit to show its thing', () => {
  const t = tell([['makes', 'rope', 'a weal', 'By the window, the $thing'], ['untouched', 'rope', 'hangs whole.']]);
  assert.deepEqual(t.errors, []);
  assert.deepEqual(t.lines, [['see', 'By the window, the {rope} hangs whole.']]);
});

test('a fact cannot go untold, except the one the scene itself shows', () => {
  assert.match(tell([['untouched', 'rope']]).errors[0], /the untouched fact has no telling/);
  assert.match(tell([['untouched', 'rope', null]]).errors[0], /the untouched fact cannot go untold/);
  assert.match(tell([['explained', 'door', 'had been dismissed', null]]).errors[0], /the explained fact cannot go untold/);
  assert.deepEqual(tell([['dead', 'floor', null], ['sign', 'a bruise', 'A dark $mark.']]).errors, []);
});

test('a tray word may not be mentioned where it cannot be collected', () => {
  const t = tell([['lead', 'door', 'looks shifty', 'He keeps one hand on the rope.']]);
  assert.match(t.errors[0], /"rope" is mentioned but cannot be collected there/);
  assert.deepEqual(tell([['lead', 'door', 'looks shifty', 'He keeps one hand on the {rope}.']]).errors, []);
  assert.deepEqual(tell([['lead', 'door', 'looks shifty', 'A rope-maker by trade.']]).errors, []);
});

test('mistakes in a telling are named', () => {
  assert.match(tell([['untouched', 'rope', 'The $name is dusty.']]).errors[0], /the untouched fact has no \$name to show/);
  assert.match(tell([['has', 'door', 'vase', '$who holds the $thing.']]).errors[0], /\$who is a doll/);
  assert.match(tell([['knows', 'door', 'x']]).errors[0], /"knows" is not a kind of fact/);
  assert.match(tell([]).errors[0], /has no text/);
});

test('a case file writes no text of its own', () => {
  for (const raw of [vicarage, glasshouse, train, theatre, study]) {
    for (const ex of raw.exhibits) assert.equal('lines' in ex, false, `${raw.id}/${ex.id} writes its own lines`);
  }
  const sneaky = { words, exhibits: [{ id: 'x', lines: [['see', 'Bob Birch did it.']], facts: [['untouched', 'rope', 'The $thing is dusty.']] }] };
  assert.deepEqual(told(sneaky).exhibits[0].lines, [['see', 'The {rope} is dusty.']]);
});

for (const c of CASES) {
  test(`${c.id}: every fact is told, and the telling is sound`, () => {
    assert.deepEqual(tellErrors(c), []);
    for (const ex of c.exhibits) {
      assert.ok(ex.lines.length > 0);
      assert.deepEqual(ex.lines, tellExhibit(c, ex).lines);
    }
  });
}
