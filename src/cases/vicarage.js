// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
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
    { id: 'vicar', title: 'The gentleman in the armchair',
      facts: [
        ['tag', 'vicar', { initials: 'O.T.' }],
        ['fits', 'vicar', 'clergy'],
        ['dead', 'vicar'],
        ['sign', 'blue lips and cold hands']
      ],
      lines: [
      ['see', 'Clerical collar. His lips are quite blue and his hands are cold. On his spectacle case:'],
      ['cut', 'O.T.']
    ] },
    { id: 'cup', title: 'Teacup on the carpet',
      facts: [
        ['untouched', 'sugar']
      ],
      lines: [
      ['see', 'Fallen from his hand, half drunk. No milk in it and no sugar. It smells bitter, like crushed leaves.']
    ] },
    { id: 'notice', title: 'Parish notice by the door',
      facts: [
        ['listed', 'Osric Thrale', 'clergy'],
        ['listed', 'Ambrose Pell', 'clergy'],
        ['listed', 'Hetty Brill', 'housekeeper']
      ],
      lines: [
      ['print', "St Mark's. Vicar: the Rev. {Osric Thrale}. Curate: Mr {Ambrose Pell}. Housekeeper: Mrs {Hetty Brill}."]
    ] },
    { id: 'tray', title: 'The woman with the tray',
      facts: [
        ['fits', 'tray', 'housekeeper'],
        ['untouched', 'sugar'],
        ['wants', 'tray', 'gold watch'],
        ['excused', 'tray', 'gold watch']
      ],
      lines: [
      ['see', "Cap and apron. On her tray the {sugar} bowl is full to the brim. In her pocket, his {gold watch}, with a jeweller's ticket:"],
      ['print', 'To be mended.']
    ] },
    { id: 'visitor', title: 'The gentleman at the window',
      facts: [
        ['fits', 'visitor', 'clergy'],
        ['link', 'visitor', 'hat'],
        ['has', 'visitor', 'wolfsbane']
      ],
      lines: [
      ['see', 'Clerical collar, hat in hand. In his coat, a blue bottle, half empty:'],
      ['print', '{wolfsbane|Wolfsbane} liniment. Not to be swallowed.']
    ] },
    { id: 'letter', title: 'Letter inside his hat',
      facts: [
        ['owner', 'hat', { surname: 'Pell' }],
        ['wants', { surname: 'Pell' }, 'pulpit']
      ],
      lines: [
      ['hand', "Mr Pell, I regret that St Mark's has only the one {pulpit}, and Mr Thrale is in excellent health. Yours, the Bishop."]
    ] },
    { id: 'herbal', title: 'Herbal, open on the shelf',
      facts: [
        ['makes', 'wolfsbane', 'blue lips and cold hands'],
        ['makes', 'foxglove', 'yellow sight and a slow pulse'],
        ['makes', 'arsenic', 'garlic breath']
      ],
      lines: [
      ['print', '{foxglove|Foxglove}: the sight turns yellow, the pulse slows. {wolfsbane|Wolfsbane}: the lips turn blue, the hands grow cold. {arsenic|Arsenic}: the breath smells of garlic.']
    ] }
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
