// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// Monday-sized: two men in the same collar, and a herbal that names the poison.
export default {
  id: 'vicarage',
  title: 'Tea at the Vicarage',
  where: "St Mark's vicarage, a quarter past four",
  scene: 'vicarage',
  words: {
    'Osric Thrale': 'person',
    'Ambrose Pell': 'person',
    'Hetty Brill': 'person',
    wolfsbane: 'thing',
    foxglove: 'thing',
    arsenic: 'thing',
    sugar: 'thing',
    'gold watch': 'thing',
    pulpit: 'thing'
  },
  exhibits: [
    {
      id: 'vicar',
      title: 'The gentleman in the armchair',
      facts: [
        ['fits', 'vicar', ['vicar', 'curate'], 'Clerical collar.'],
        ['dead', 'vicar', null],
        ['sign', 'lips are quite blue and his hands are cold', 'His $mark.'],
        ['tag', 'vicar', { initials: 'O.T.' }, 'On his spectacle case: | cut: $name']
      ]
    },
    {
      id: 'cup',
      title: 'Teacup on the carpet',
      facts: [
        ['untouched', 'sugar', 'Fallen from his hand, half drunk. No milk in it and no $thing. It smells bitter, like crushed leaves.']
      ]
    },
    {
      id: 'notice',
      title: 'Parish notice by the door',
      facts: [
        ['listed', 'Osric Thrale', 'vicar', "print: St Mark's. $Key: the Rev. $name."],
        ['listed', 'Ambrose Pell', 'curate', 'print: $Key: Mr $name.'],
        ['listed', 'Hetty Brill', 'housekeeper', 'print: $Key: Mrs $name.']
      ]
    },
    {
      id: 'tray',
      title: 'The woman with the tray',
      facts: [
        ['fits', 'tray', 'housekeeper', 'Cap and apron.'],
        ['untouched', 'sugar', 'On her tray the $thing bowl is full to the brim.'],
        ['wants', 'tray', 'gold watch', "In her pocket, his $thing, with a jeweller's ticket:"],
        ['excused', 'tray', 'gold watch', 'print: To be mended.']
      ]
    },
    {
      id: 'visitor',
      title: 'The gentleman at the window',
      facts: [
        ['fits', 'visitor', ['vicar', 'curate'], 'Clerical collar,'],
        ['link', 'visitor', 'hat', 'hat in hand.'],
        ['has', 'visitor', 'wolfsbane', 'In his coat, a blue bottle, half empty: | print: $Thing liniment. Not to be swallowed.']
      ]
    },
    {
      id: 'letter',
      title: 'Letter inside his hat',
      facts: [
        ['owner', 'hat', { surname: 'Pell' }, 'hand: Mr $name,'],
        ['wants', { surname: 'Pell' }, 'pulpit', "hand: I regret that St Mark's has only the one $thing, and Mr Thrale is in excellent health. Yours, the Bishop."]
      ]
    },
    {
      id: 'herbal',
      title: 'Herbal, open on the shelf',
      facts: [
        ['makes', 'foxglove', 'yellow sight and a slow pulse', 'print: $Thing: the sight turns yellow, the pulse slows.'],
        ['makes', 'wolfsbane', 'lips are quite blue and his hands are cold', 'print: $Thing: the lips turn blue, the hands grow cold.'],
        ['makes', 'arsenic', 'garlic breath', 'print: $Thing: the breath smells of garlic.']
      ]
    }
  ],
  panels: [
    { id: 'cast', title: 'The cast', parts: ['In the armchair, ', ['person', 'Osric Thrale', 'vicar'], '. With the tray, ', ['person', 'Hetty Brill', 'tray'], '. At the window, ', ['person', 'Ambrose Pell', 'visitor'], '.'] },
    { id: 'story', title: 'What happened', parts: [['person', 'Ambrose Pell', 'culprit'], ' put ', ['thing', 'wolfsbane', 'means'], ' in the tea of ', ['person', 'Osric Thrale', 'victim'], ', to have his ', ['thing', 'pulpit', 'motive'], '.'] }
  ],
  path: [
    { how: 'Initials', from: ['vicar', 'notice'], gives: [0, 5], say: 'The spectacle case says O.T. and the notice names the vicar: the man in the armchair is Osric Thrale.' },
    { how: 'Trade', from: ['tray', 'notice'], gives: [1], say: 'Cap, apron and tea tray: the woman is the housekeeper, Hetty Brill.' },
    { how: 'A letter in the pocket', from: ['letter', 'visitor', 'notice'], gives: [2, 3], say: "The Bishop writes to Mr Pell, and the letter is in this man's hat: the second clergyman is the curate, Ambrose Pell." },
    { how: 'Symptoms', from: ['vicar', 'herbal', 'visitor', 'cup'], gives: [4], say: "Blue lips and cold hands are wolfsbane, by the herbal, and the half-empty bottle is in Pell's coat." },
    { how: 'Motive', from: ['letter'], gives: [6], say: 'There is one pulpit, and Thrale was in excellent health. Pell wanted the pulpit.' }
  ],
  traps: [
    { word: 'sugar', from: ['tray'], against: ['cup'], say: 'The sugar was never touched: he took his tea plain.' },
    { word: 'gold watch', from: ['tray'], against: ['tray'], say: 'The watch in her pocket was only going to be mended.' }
  ],
  tips: [
    'Two men wear the same collar. Something small tells them apart.',
    "Set the dead man's lips and hands beside the herbal on the shelf, then look in the other gentleman's coat."
  ]
};
