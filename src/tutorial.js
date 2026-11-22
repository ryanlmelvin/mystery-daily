// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import { told } from './tell.js';
import { blanksOf, newGame } from './engine.js';

export const tutorialCase = told({
  id: 'tutorial',
  title: 'The Missing Ticket',
  where: 'A railway compartment',
  scene: 'tutorial',
  words: { bag: 'thing', hatbox: 'thing', 'Ada Finch': 'person', 'Nell Moss': 'person' },
  exhibits: [
    {
      id: 'luggage',
      title: 'Luggage labels',
      facts: [
        ['has', 'Ada Finch', 'bag', 'print: $Thing — $who /'],
        ['has', 'Nell Moss', 'hatbox', 'print: $Thing — $who']
      ]
    },
    {
      id: 'note',
      title: 'Porter’s note',
      facts: [['found', 'window passenger', 'ticket', 'hand: The window passenger put her $value away in her own luggage.']]
    },
    {
      id: 'seats',
      title: 'Seat cards',
      facts: [
        ['listed', 'Ada Finch', 'aisle', 'print: $Key — $name /'],
        ['listed', 'Nell Moss', 'window', 'print: $Key — $name']
      ]
    }
  ],
  panels: [
    { id: 'cast', title: 'The cast', parts: ['Window seat', ['person', 'Nell Moss', 'window']] },
    { id: 'story', title: 'What happened', parts: ['The ticket was in the ', ['thing', 'hatbox', 'container'], '.'] }
  ],
  path: [{
    from: ['note', 'seats', 'luggage'],
    say: 'The window seat and hatbox both bear Nell’s name.'
  }]
});

export function restoreTutorial(saved) {
  const fresh = newGame(tutorialCase);
  const blanks = blanksOf(tutorialCase);
  const hasGaps = (values) => Array.isArray(values) && values.length === blanks.length;
  if (saved?.id !== fresh.id || saved.v !== fresh.v || !hasGaps(saved.fills) ||
      !['play', 'won', 'lost'].includes(saved.status) ||
      !['bank', 'opened', 'given', 'tries', 'log'].every((key) => Array.isArray(saved[key]))) return fresh;

  const validAttempt = (t) => hasGaps(t?.fills) && hasGaps(t.marks) &&
    t.marks.every((mark, i) => mark === (t.fills[i] === blanks[i].answer)) && Number.isInteger(t.wrong?.story);
  if (!saved.tries.every(validAttempt) || !saved.log.every((row) => typeof row?.[1] === 'string')) return fresh;
  if (saved.tries.every((t) => Object.hasOwn(t.wrong, 'cast'))) return saved;

  // Both gaps used to share one plate. Some old games changed a correct tile
  // after checking it. Refund those practice pennies so the player can keep
  // editing the board they left, including a tile cleared since their last try.
  if (saved.status === 'play') {
    for (const [i, blank] of blanks.entries()) {
      const firstRight = saved.tries.findIndex((t) => t.marks[i]);
      if (firstRight < 0) continue;
      if (saved.fills[i] !== blank.answer || saved.tries.slice(firstRight + 1).some((t) => !t.marks[i])) {
        const log = saved.log.filter(([, event]) => !event.startsWith('penny '));
        return { ...saved, tries: [], log };
      }
    }
  }
  const tries = saved.tries.map((t) => ({
    ...t, wrong: { cast: t.marks[0] ? 0 : 1, story: t.marks[1] ? 0 : 1 }
  }));
  return { ...saved, tries };
}
