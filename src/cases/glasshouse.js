// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// The thief dressed to leave, and the tool that fits the wound.
export default {
  id: 'glasshouse',
  title: 'Death in the Glasshouse',
  where: 'Marrow Hall, twenty past nine at night',
  scene: 'glasshouse',
  words: {
    'Silas Crane': 'person',
    'Nell Fisk': 'person',
    'Tobias Ruck': 'person',
    'Jasper Vane': 'person',
    'Cordelia Vane': 'person',
    watch: 'thing',
    wages: 'thing',
    lamp: 'thing',
    'house keys': 'thing',
    debts: 'thing',
    'Ghost Orchid': 'thing',
    spade: 'thing',
    shears: 'thing'
  },
  exhibits: [
    {
      id: 'body',
      title: 'The man on the floor',
      facts: [
        ['fits', 'body', 'gardener', 'Soil under his nails.'],
        ['dead', 'body', null],
        ['sign', 'crescent-shaped gash', 'One $mark behind the ear.'],
        ['tag', 'body', { initials: 'S.C.' }, 'In his waistcoat, a {watch} engraved: | cut: $name Thirty years among the roses']
      ]
    },
    {
      id: 'wagebook',
      title: 'Wage book on the bench',
      facts: [
        ['listed', 'Silas Crane', 'gardener', 'print: $name, head $key:'],
        ['wants', 'Silas Crane', 'wages', 'print: $thing three months unpaid.'],
        ['listed', 'Nell Fisk', 'housemaid', 'print: $name, $key.'],
        ['listed', 'Tobias Ruck', 'groom', 'print: $name, $key.']
      ]
    },
    {
      id: 'maid',
      title: 'The woman in the doorway',
      facts: [
        ['fits', 'maid', 'housemaid', 'Cap and apron. A ring of {house keys} at her belt.'],
        ['untouched', 'lamp', 'Her $thing is lit, its glass unbroken.']
      ]
    },
    {
      id: 'youth',
      title: 'The young man by the garden door',
      facts: [
        ['lead', 'youth', 'dressed to leave tonight', 'Travelling coat, buttoned to leave. In the pocket, a third-class ticket: | print: The 9.40 to London. Tonight only.']
      ]
    },
    {
      id: 'letter',
      title: 'Letter in his breast pocket',
      facts: [
        ['tag', 'youth', { full: 'Jasper Vane' }, 'hand: $name:'],
        ['wants', 'Jasper Vane', 'debts', 'hand: I have paid your $thing for the last time. The {Ghost Orchid} goes to the Society on Friday. Your aunt, {Cordelia Vane}.']
      ]
    },
    {
      id: 'bag',
      title: 'Carpet bag at his feet',
      facts: [
        ['tag', 'youth', { initials: 'J.V.' }, 'The clasp is stamped: | cut: $name'],
        ['has', 'youth', 'Ghost Orchid', 'Inside, $thing~[a white orchid], its roots wrapped in wet newspaper.']
      ]
    },
    {
      id: 'stand',
      title: 'The empty stand',
      facts: [
        ['taken', 'Ghost Orchid', 'A ring of fresh soil where a pot stood. On the brass plate: | cut: $thing. Not to be moved.']
      ]
    },
    {
      id: 'tools',
      title: 'Tools by the garden door',
      facts: [
        ['makes', 'spade', 'crescent-shaped gash', 'A $thing, its curved blade wiped clean but dark at the socket.'],
        ['makes', 'shears', 'a straight cut', 'On a hook, $thing:'],
        ['untouched', 'shears', 'straight blades, thick with dust.']
      ]
    }
  ],
  panels: [
    { id: 'cast', title: 'The cast', parts: ['On the floor, ', ['person', 'Silas Crane', 'body'], '. In the doorway, ', ['person', 'Nell Fisk', 'maid'], '. By the garden door, ', ['person', 'Jasper Vane', 'youth'], '.'] },
    { id: 'story', title: 'What happened', parts: [['person', 'Jasper Vane', 'culprit'], ' struck ', ['person', 'Silas Crane', 'victim'], ' with the ', ['thing', 'spade', 'means'], ' when the gardener caught him stealing the ', ['thing', 'Ghost Orchid', 'loot'], ' to pay his ', ['thing', 'debts', 'motive'], '.'] }
  ],
  path: [
    { how: 'Initials', from: ['body', 'wagebook'], gives: [0, 4], say: 'The watch says S.C. and the wage book has one S.C.: the man on the floor is Silas Crane, the gardener.' },
    { how: 'Trade', from: ['maid', 'wagebook'], gives: [1], say: 'Cap, apron and house keys: the woman is the housemaid, Nell Fisk.' },
    { how: 'A letter in the pocket', from: ['letter', 'bag'], gives: [2], say: 'The letter in his pocket is to Jasper Vane, and his bag is stamped J.V.' },
    { how: 'Fit', from: ['body', 'tools', 'maid'], gives: [5], say: 'A crescent gash fits the curved spade, not the straight, dusty shears or the unbroken lamp.' },
    { how: 'Trace', from: ['stand', 'bag', 'youth'], gives: [6, 3], say: 'The Ghost Orchid is gone from its stand and a white orchid is in his bag, with a ticket out tonight: Jasper is the thief the gardener caught.' },
    { how: 'Motive', from: ['letter', 'wagebook'], gives: [7], say: 'His aunt will not pay his debts again, and the orchid was about to leave the house.' }
  ],
  traps: [
    { word: 'wages', from: ['wagebook'], against: ['bag', 'letter'], say: "The unpaid wages are the gardener's. He was the one who caught the thief." },
    { word: 'shears', from: ['tools'], against: ['body'], say: 'Straight blades thick with dust did not make a crescent wound.' }
  ],
  tips: [
    'Somebody in this glasshouse is dressed to leave. Ask what he is taking with him.',
    'Hold the wound against the two tools by the garden door, then the empty stand against the carpet bag.'
  ]
};
