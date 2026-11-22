// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// The case checker. It does not prove a mystery has one answer: it checks that a case is
// well formed, that the author's chain of deductions reaches every blank, that no exhibit
// is dead weight, and that the case fits the five-minute size budget.

import { blanksOf, wordsIn, segments } from './engine.js';

export const BUDGET = { exhibits: 9, blanks: 9, words: 16, reading: 175, dolls: 4 };
export const KINDS = ['person', 'thing', 'place'];

export function readingWords(c) {
  let count = 0;
  for (const ex of c.exhibits) {
    for (const [, text] of ex.lines) {
      const plain = segments(text).map((p) => p.text).join('');
      count += plain.split(/\s+/).filter(Boolean).length;
    }
  }
  return count;
}

export function lintCase(c, pins = null) {
  const errors = [];
  const warnings = [];
  const blanks = blanksOf(c);
  const exhibitIds = c.exhibits.map((e) => e.id);
  const words = Object.keys(c.words);

  if (new Set(exhibitIds).size !== exhibitIds.length) errors.push('Two exhibits share an id.');
  for (const [w, kind] of Object.entries(c.words)) if (!KINDS.includes(kind)) errors.push(`"${w}" has unknown kind "${kind}".`);

  // Every collectable word is declared, and every declared word can be collected.
  const collectable = new Set();
  for (const ex of c.exhibits) {
    for (const [style] of ex.lines) if (!['see', 'hand', 'print', 'cut'].includes(style)) errors.push(`Exhibit ${ex.id} has unknown line style "${style}".`);
    for (const w of wordsIn(ex)) {
      collectable.add(w);
      if (!(w in c.words)) errors.push(`Exhibit ${ex.id} offers "${w}", which is not in the word list.`);
    }
  }
  for (const w of words) if (!collectable.has(w)) errors.push(`"${w}" is in the word list but no exhibit offers it.`);

  // Every blank can be answered, and has rivals of its own kind.
  blanks.forEach((b, i) => {
    if (c.words[b.answer] !== b.kind) errors.push(`Blank ${i} wants a ${b.kind} but its answer "${b.answer}" is ${c.words[b.answer] || 'missing'}.`);
    const rivals = words.filter((w) => c.words[w] === b.kind && w !== b.answer).length;
    if (rivals < 2) errors.push(`Blank ${i} ("${b.answer}") has only ${rivals} rival word(s) of its kind.`);
  });

  // The author's chain of deductions reaches every blank from real exhibits.
  const reached = new Set();
  const cited = new Set();
  for (const step of c.path) {
    for (const id of step.from) {
      if (!exhibitIds.includes(id)) errors.push(`Step "${step.how}" cites an exhibit that does not exist: ${id}.`);
      cited.add(id);
    }
    for (const i of step.gives) {
      if (!blanks[i]) errors.push(`Step "${step.how}" gives blank ${i}, which does not exist.`);
      reached.add(i);
    }
    if (step.from.length < 2 && step.gives.length > 1) warnings.push(`Step "${step.how}" settles ${step.gives.length} blanks from one exhibit.`);
  }
  blanks.forEach((b, i) => { if (!reached.has(i)) errors.push(`No step in the chain reaches blank ${i} ("${b.answer}").`); });

  // Nothing in the cabinet is dead weight: each exhibit is needed, or is a trap that another exhibit answers.
  for (const trap of c.traps || []) {
    for (const id of [...trap.from, ...trap.against]) {
      if (!exhibitIds.includes(id)) errors.push(`A trap cites an exhibit that does not exist: ${id}.`);
      cited.add(id);
    }
    if (trap.word && !(trap.word in c.words)) errors.push(`A trap names "${trap.word}", which is not in the word list.`);
  }
  for (const id of exhibitIds) if (!cited.has(id)) errors.push(`Exhibit ${id} is neither used by the chain nor part of a trap.`);
  if (!(c.traps || []).length) warnings.push('The case has no trap.');
  if ((c.traps || []).length >= 4) warnings.push('More traps than spare pennies.');

  if (!c.tips || c.tips.length !== 2) errors.push('A case needs exactly two written tips.');

  // Size.
  const stats = {
    exhibits: c.exhibits.length,
    blanks: blanks.length,
    words: words.length,
    reading: readingWords(c),
    guesses: blanks.reduce((n, b) => n * words.filter((w) => c.words[w] === b.kind).length, 1)
  };
  for (const key of ['exhibits', 'blanks', 'words', 'reading']) {
    if (stats[key] > BUDGET[key]) errors.push(`${key}: ${stats[key]} is over the budget of ${BUDGET[key]}.`);
  }

  // Tags: every exhibit has one, inside the window, not on top of another.
  if (pins) {
    for (const id of exhibitIds) if (!pins[id]) errors.push(`Exhibit ${id} has no tag in the scene.`);
    for (const id of Object.keys(pins)) if (!exhibitIds.includes(id)) errors.push(`The scene has a tag for ${id}, which is not an exhibit.`);
    const list = Object.entries(pins);
    for (const [id, [x, y]] of list) if (x < 14 || x > 386 || y < 30 || y > 268) errors.push(`The tag for ${id} is too near the edge of the window.`);
    for (let a = 0; a < list.length; a++) {
      for (let b = a + 1; b < list.length; b++) {
        const d = Math.hypot(list[a][1][0] - list[b][1][0], list[a][1][1] - list[b][1][1]);
        if (d < 27) errors.push(`The tags for ${list[a][0]} and ${list[b][0]} overlap.`);
      }
    }
  }

  return { errors, warnings, stats };
}
