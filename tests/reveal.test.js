// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import { revealSolution } from '../src/reveal.js';

function cabinet() {
  const reading = { textContent: '' };
  const slots = ['At left, Ada', 'At right, Nell', 'bag'].map((label) => {
    const attributes = new Map([['aria-label', label]]);
    return {
      classList: new Set(),
      setAttribute: (name, value) => attributes.set(name, value),
      getAttribute: (name) => attributes.get(name),
      removeAttribute: (name) => attributes.delete(name),
    };
  });
  const cast = {
    querySelectorAll: () => slots.slice(0, 2),
    querySelector: (selector) => selector === 'h3' ? { textContent: 'Cast' } : null,
  };
  const story = {
    querySelectorAll: () => slots.slice(2),
    querySelector: (selector) => ({ textContent: selector === 'h3' ? 'Story' : 'She took the bag.' }),
  };
  const plates = {
    ownerDocument: { getElementById: () => reading }, classList: new Set(),
    querySelectorAll: (selector) => selector === '.slot' ? slots : [cast, story],
  };
  return { plates, slots, reading };
}

test('the reveal sets the cast and story in order and holds the finished plates for reading', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { plates, slots, reading } = cabinet();
  const shown = () => slots.filter((slot) => slot.classList.has('seated')).map((slot) => slot.getAttribute('aria-label'));
  let done = false;
  const result = revealSolution(plates, new AbortController().signal)
    .then(() => { done = true; });
  assert.deepEqual(shown(), []);
  assert.ok(slots.every((slot) => slot.getAttribute('aria-hidden') === 'true'));
  t.mock.timers.tick(450);
  await Promise.resolve();
  assert.deepEqual(shown(), ['At left, Ada']);
  t.mock.timers.tick(700);
  await Promise.resolve();
  assert.equal(reading.textContent, 'Cast. At left, Ada. At right, Nell');
  t.mock.timers.tick(1600);
  await Promise.resolve();
  assert.deepEqual(shown(), ['At left, Ada', 'At right, Nell', 'bag']);
  assert.ok(slots.every((slot) => !slot.getAttribute('aria-hidden')));
  assert.equal(reading.textContent, 'Story. She took the bag.');
  t.mock.timers.tick(3999);
  await Promise.resolve();
  assert.equal(done, false);
  t.mock.timers.tick(1);
  await result;
  assert.equal(done, true);
});

test('leaving during the reveal cancels all remaining tile changes', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { plates, slots, reading } = cabinet();
  const controller = new AbortController();
  const result = revealSolution(plates, controller.signal);
  t.mock.timers.tick(450);
  await Promise.resolve();
  controller.abort();
  await result;
  t.mock.timers.tick(10000);
  assert.deepEqual(slots.map((slot) => slot.classList.has('seated')), [true, false, false]);
  assert.equal(reading.textContent, '');
});
