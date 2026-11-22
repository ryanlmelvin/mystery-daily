// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import { archiveCalendar } from '../src/archive.js';

function buttonFor(html, attribute, value) {
  const buttons = html.match(/<button\b[^>]*>[\s\S]*?<\/button>/g) || [];
  const button = buttons.find(tag => tag.includes(`${attribute}="${value}"`));
  assert.ok(button, `Missing ${attribute}="${value}" button`);
  return button;
}

test('only released editions open or trigger a save lookup', () => {
  const lookups = [];
  const html = archiveCalendar({
    month: '2026-11', today: '2026-11-23', selected: null,
    statusFor(date) { lookups.push(date); return null; }
  });
  const released = ['2026-11-21', '2026-11-22', '2026-11-23'];
  assert.deepEqual(lookups, released);
  assert.deepEqual(Array.from(html.matchAll(/data-date="([^"]+)"/g), m => m[1]), released);
  assert.match(buttonFor(html, 'data-month', '2026-10'), /\bdisabled\b/);
  assert.match(buttonFor(html, 'data-month', '2026-12'), /\bdisabled\b/);
});

test('the month arrows cross the year boundary and stop at the current month', () => {
  const render = month => archiveCalendar({ month, today: '2027-01-01', selected: null, statusFor: () => null });
  assert.doesNotMatch(buttonFor(render('2026-12'), 'data-month', '2027-01'), /\bdisabled\b/);
  const january = render('2027-01');
  assert.doesNotMatch(buttonFor(january, 'data-month', '2026-12'), /\bdisabled\b/);
  assert.match(buttonFor(january, 'data-month', '2027-02'), /\bdisabled\b/);
});

test('days identify saved results, the open edition and today', () => {
  const saved = { '2026-11-21': 'won', '2026-11-22': 'lost', '2026-11-23': 'play' };
  const html = archiveCalendar({
    month: '2026-11', today: '2026-11-24', selected: '2026-11-21', statusFor: date => saved[date]
  });
  const day = date => buttonFor(html, 'data-date', date);
  for (const [date, label, mark] of [
    ['2026-11-21', 'Solved', '★'], ['2026-11-22', 'Out of pennies', '×'], ['2026-11-23', 'In play', '•']
  ]) {
    assert.match(day(date), new RegExp(`aria-label="[^"]*${label}`));
    assert.ok(day(date).includes(mark));
  }
  assert.match(day('2026-11-21'), /open edition/);
  assert.doesNotMatch(day('2026-11-21'), /aria-current/);
  assert.match(day('2026-11-24'), /aria-current="date"/);
  assert.match(day('2026-11-24'), /Not played/);
});
