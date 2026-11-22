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
        ['fits', 'body', 'gardener', 'Soil under his nails. The back of his {watch} reads: | cut: Thirty years among the roses.'],
        ['dead', 'body', null],
        ['sign', 'crescent-shaped gash', 'One $mark behind the ear.']
      ]
    },
    {
      id: 'wagebook',
      title: 'Estate accounts on the bench',
      facts: [
        ['listed', 'Jasper Vane', 'nephew', 'hand: Allowance paid to $name, {Cordelia Vane}’s $key.'],
        ['listed', 'Nell Fisk', 'housemaid', 'print: $name, $key.'],
        ['listed', 'Tobias Ruck', 'groom', 'print: $name, $key.'],
        ['listed', 'Silas Crane', 'gardener', 'print: $name, head $key:'],
        ['wants', 'Silas Crane', 'wages', 'print: $thing three months unpaid.']
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
        ['wants', 'youth', 'debts', 'hand: I have paid your $thing for the last time. The {Ghost Orchid} goes to the Society on Friday.'],
        ['fits', 'youth', 'nephew', 'hand: Your affectionate aunt, {Cordelia Vane}.']
      ]
    },
    {
      id: 'bag',
      title: 'Carpet bag at his feet',
      facts: [
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
    { id: 'story', title: 'What happened', parts: [['person', 'Jasper Vane', 'culprit'], ' struck ', ['person', 'Silas Crane', 'victim'], ' with the ', ['thing', 'spade', 'means'], ' when caught stealing the ', ['thing', 'Ghost Orchid', 'loot'], ' to pay off ', ['thing', 'debts', 'motive'], '.'] }
  ],
  path: [
    { how: 'Thirty years among the roses', from: ['body', 'wagebook'], gives: [0, 4], say: 'Soil under his nails and a watch marking thirty years among the roses point to the gardener. The estate pays Silas Crane to tend the gardens.' },
    { how: 'Trade', from: ['maid', 'wagebook'], gives: [1], say: 'Cap, apron and house keys: the woman is the housemaid, Nell Fisk.' },
    { how: 'A letter in the pocket', from: ['letter', 'wagebook'], gives: [2], say: 'Cordelia signs the letter in the young man’s pocket as his aunt. The estate pays an allowance to her nephew, Jasper Vane.' },
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
