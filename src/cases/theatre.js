// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
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
    { id: 'playbill', title: 'Playbill on the wall', lines: [
      ['print', "Tonight: The Tyrant's Supper. The King: Mr {Hector Bellamy}. His understudy: Mr {Leo Sparrow}. Prompter: Mr {Amos Tull}. Wardrobe: Mrs {Ida Crewe}."]
    ] },
    { id: 'fallen', title: 'The man on the floor', lines: [
      ['see', 'Shirt-sleeves, a prompt-book under his arm, foam on his lips. A green bottle in his fist, nearly empty.']
    ] },
    { id: 'bottle', title: 'The green bottle', lines: [
      ['print', 'Throat {tonic}. For Mr Bellamy ONLY. Hands off.'],
      ['see', 'It smells of bitter almonds.']
    ] },
    { id: 'king', title: 'The gentleman in the crown', lines: [
      ['see', 'Robe and crown, powdered for the stage. Tucked in his sleeve, a note not yet pinned up:'],
      ['hand', 'Tull: drink my tonic once more and I will have you sacked. H.B.']
    ] },
    { id: 'exit', title: 'The young man at the door', lines: [
      ['see', "Street coat, hat already on. In his pocket, a chemist's receipt:"],
      ['print', '{prussic acid|Prussic acid}, one phial. Signed for: L. Sparrow.']
    ] },
    { id: 'script', title: 'Script on the chair', lines: [
      ['see', "Every one of the King's lines is underlined. Pencilled on the cover:"],
      ['hand', 'The {crown} at last. Tonight.']
    ] },
    { id: 'wardrobe', title: 'The woman with the pins', lines: [
      ['see', "Pincushion at her wrist, tape about her neck. Over her arm, the King's second-act cloak, half hemmed."]
    ] },
    { id: 'table', title: 'The dressing table', lines: [
      ['see', 'Greasepaint and powder. A phial of {laudanum}, full to the cork. A tin of {rat poison} for the mice, its lid rusted shut.']
    ] }
  ],
  panels: [
    { id: 'cast', title: 'The cast', parts: ['On the floor, ', ['person', 'Amos Tull'], '. In the crown, ', ['person', 'Hector Bellamy'], '. At the door, ', ['person', 'Leo Sparrow'], '. With the pins, ', ['person', 'Ida Crewe'], '.'] },
    { id: 'story', title: 'What happened', parts: [['person', 'Leo Sparrow'], ' put ', ['thing', 'prussic acid'], ' in the tonic meant for ', ['person', 'Hector Bellamy'], ', but ', ['person', 'Amos Tull'], ' drank it.'] }
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
