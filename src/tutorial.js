// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import { told } from './tell.js';

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
  panels: [{
    id: 'story',
    title: 'What happened',
    parts: [['person', 'Nell Moss', 'owner'], ' put the ticket in her ', ['thing', 'hatbox', 'container'], '.']
  }],
  path: [{
    from: ['note', 'seats', 'luggage'],
    say: 'The window seat and hatbox both bear Nell’s name.'
  }]
});
