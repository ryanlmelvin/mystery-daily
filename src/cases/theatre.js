// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// The switch: the bottle was meant for somebody else.
export default {
  id: 'theatre',
  title: 'Curtain at the Alhambra',
  where: 'A dressing room, ten minutes before the second act',
  scene: 'theatre',
  words: {
    'Hector Bellamy': 'person',
    'Leo Sparrow': 'person',
    'Amos Tull': 'person',
    'Ida Crewe': 'person',
    'prussic acid': 'thing',
    'rat poison': 'thing',
    laudanum: 'thing',
    tonic: 'thing',
    crown: 'thing'
  },
  exhibits: [
    {
      id: 'playbill',
      title: 'Playbill on the wall',
      facts: [
        ['listed', 'Hector Bellamy', 'the King', "print: Tonight: The Tyrant's Supper. $Key: Mr $name."],
        ['listed', 'Leo Sparrow', 'understudy', 'print: His $key: Mr $name.'],
        ['listed', 'Amos Tull', 'prompter', 'print: $Key: Mr $name.'],
        ['listed', 'Ida Crewe', 'wardrobe', 'print: $Key: Mrs $name.']
      ]
    },
    {
      id: 'fallen',
      title: 'The man on the floor',
      facts: [
        ['fits', 'fallen', 'prompter', 'Shirt-sleeves, a prompt-book under his arm,'],
        ['dead', 'fallen', null],
        ['sign', 'foam on his lips', '$mark. A green bottle in his fist, nearly empty.']
      ]
    },
    {
      id: 'bottle',
      title: 'The green bottle',
      facts: [
        ['meantFor', { surname: 'Bellamy' }, 'print: Throat {tonic}. For Mr $name ONLY. Hands off. | It smells of bitter almonds.']
      ]
    },
    {
      id: 'king',
      title: 'The gentleman in the crown',
      facts: [
        ['fits', 'king', 'the King', 'Robe and {crown}, powdered for the stage.'],
        ['lead', 'king', 'threatened the dead man', 'Tucked in his sleeve, a note not yet pinned up: | hand: Tull: drink my {tonic} once more and I will have you sacked.'],
        ['tag', 'king', { initials: 'H.B.' }, 'hand: $name']
      ]
    },
    {
      id: 'exit',
      title: 'The young man at the door',
      facts: [
        ['has', 'exit', 'prussic acid', "Street coat, hat already on. In his pocket, a chemist's receipt: | print: $Thing, one phial."],
        ['makes', 'prussic acid', 'foam on his lips', 'print: Poison.'],
        ['tag', 'exit', { abbr: 'L. Sparrow' }, 'print: Signed for: $name.']
      ]
    },
    {
      id: 'script',
      title: 'Script on the chair',
      facts: [
        ['wants', { listed: 'understudy' }, 'crown', "Every one of the King's lines is underlined. Pencilled on the cover: | hand: The $thing at last. Tonight."]
      ]
    },
    {
      id: 'wardrobe',
      title: 'The woman with the pins',
      facts: [
        ['fits', 'wardrobe', 'wardrobe', "Pincushion at her wrist, tape about her neck. Over her arm, the King's second-act cloak, half hemmed."]
      ]
    },
    {
      id: 'table',
      title: 'The dressing table',
      facts: [
        ['makes', 'laudanum', 'foam on his lips', 'Greasepaint and powder. A phial of $thing,'],
        ['untouched', 'laudanum', 'full to the cork.'],
        ['makes', 'rat poison', 'foam on his lips', 'A tin of $thing for the mice,'],
        ['untouched', 'rat poison', 'its lid rusted shut.']
      ]
    }
  ],
  panels: [
    { id: 'cast', title: 'The cast', parts: ['On the floor, ', ['person', 'Amos Tull', 'fallen'], '. In the crown, ', ['person', 'Hector Bellamy', 'king'], '. At the door, ', ['person', 'Leo Sparrow', 'exit'], '. With the pins, ', ['person', 'Ida Crewe', 'wardrobe'], '.'] },
    { id: 'story', title: 'What happened', parts: [['person', 'Leo Sparrow', 'culprit'], ' put ', ['thing', 'prussic acid', 'means'], ' in the tonic meant for ', ['person', 'Hector Bellamy', 'intended'], ', but ', ['person', 'Amos Tull', 'victim'], ' drank it.'] }
  ],
  path: [
    { how: 'Trade', from: ['fallen', 'playbill'], gives: [0, 7], say: 'A prompt-book under his arm: the man on the floor is the prompter, Amos Tull.' },
    { how: 'Costume', from: ['king', 'playbill'], gives: [1], say: 'The King is played by Hector Bellamy, and the note in his sleeve is signed H.B.' },
    { how: 'A name on a receipt', from: ['exit', 'playbill'], gives: [2], say: "The chemist's receipt in his pocket is signed L. Sparrow: Leo Sparrow, the understudy." },
    { how: 'Trade', from: ['wardrobe', 'playbill'], gives: [3], say: 'Pins, tape and a half-hemmed cloak: wardrobe, Ida Crewe.' },
    { how: 'The switch', from: ['bottle', 'king'], gives: [6], say: "The tonic was for Bellamy only, and Bellamy's own note says Tull kept drinking it. The poison was meant for Bellamy." },
    { how: 'The means', from: ['bottle', 'exit', 'table'], gives: [5], say: 'Sparrow signed for prussic acid. The laudanum is full and the rat poison is rusted shut.' },
    { how: 'Motive', from: ['script', 'exit'], gives: [4], say: "The understudy has learned every line of the King's. With Bellamy gone, the crown is his." }
  ],
  traps: [
    { word: 'Hector Bellamy', from: ['king'], against: ['bottle'], say: 'Bellamy threatened Tull, but he would not poison his own tonic.' },
    { word: 'rat poison', from: ['table'], against: ['table', 'exit'], say: 'The tin is rusted shut. Nothing came out of it tonight.' }
  ],
  tips: [
    'Ask whose bottle it is before you ask who drank from it.',
    "The label says who the tonic was for. The note in the King's sleeve says who kept drinking it."
  ]
};
