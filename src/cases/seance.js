// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
export default {
  id: 'seance',
  title: 'The Shilling Séance',
  where: 'The tea-room at Mallow Fair, as the booth curtains open',
  scene: 'seance',
  ruleSet: 'seance',
  words: {
    'Dora Gale': 'person', 'Hector Crow': 'person', 'Jasper Dove': 'person',
    'Maud Bell': 'person', 'Esther Bell': 'person'
  },
  exhibits: [
    { id: 'medium', title: 'The woman in the armchair', facts: [
      ['dead', 'medium', 'The fair doctor’s slip: | hand: Her heart failed as the curtains opened.'],
      ['tag', 'medium', { full: 'Dora Gale' }, 'On her brooch: | cut: $name, Medium.'],
      ['privateDraw', 'The attendant’s log: | hand: Gave each nephew a blank slate. Each opened his invitation alone. I read the message as the slates slid back under the shut curtains.']
    ] },
    { id: 'left', title: 'The sitter at the left curtain', facts: [
      ['fits', 'left', 'signwriter', 'Chisel-edged lettering chalk on his watch-chain.'],
      ['wearsPin', 'left', 'key', 'A $key-shaped pin in his lapel.'],
      ['lead', 'left', 'has chalk on his fingers', 'White chalk in his finger creases.']
    ] },
    { id: 'right', title: 'The sitter at the right curtain', facts: [
      ['link', 'right', 'sun counterfoil', 'Under his cuff, a paper corner bearing half a gilt sun.'],
      ['wearsPin', 'right', 'fox', 'A $key pin in his lapel.']
    ] },
    { id: 'counterfoils', title: 'Signed invitation counterfoils', facts: [
      ['drawStub', 'Jasper Dove', 'green', 'hand: $Value invitation received. $name.'],
      ['owner', 'sun counterfoil', { full: 'Jasper Dove' }, 'One corner torn through a gilt sun.'],
      ['drawStub', 'Hector Crow', 'blue', 'hand: $Value invitation received. $name.']
    ] },
    { id: 'cards', title: 'The medium’s locked copybook', facts: [
      ['testLine', 'green', 'my little turnip', 'Her private notes: | hand: Pet names I invented for tonight’s invitations. $Key: $value.'],
      ['testLine', 'blue', 'my little radish', 'hand: $Key: $value.']
    ] },
    { id: 'slates', title: 'Two slates on the table', facts: [
      ['slateLine', 'my little turnip', 'One blank. On the other: | hand: Listen, $value.'],
      ['slateCharge', 'key', 'hand: The man with the $key-shaped pin took my ring!'],
      ['slateSeal', 'swallow', 'Instead of a signature, a chalk $key.']
    ] },
    { id: 'letters', title: 'Framed family letters', facts: [
      ['letterSeal', 'Maud Bell', 'swallow', 'Their late aunts’ signatures: | cut: $name — a $key.'],
      ['letterSeal', 'Esther Bell', 'wren', 'cut: $name — a $key.']
    ] },
    { id: 'bill', title: 'Chalkboard beside the till', facts: [
      ['explained', { listed: 'signwriter' }, 'has chalk on his fingers', 'Fresh chalk on the board: | hand: One shilling a sitting.'],
      ['listed', 'Hector Crow', 'signwriter', 'hand: Lettered this morning by $name, fair $key.']
    ] }
  ],
  panels: [
    { id: 'cast', title: 'The cast', parts: [
      'In the armchair, ', ['person', 'Dora Gale', 'medium'], '. By the left curtain, ', ['person', 'Hector Crow', 'left'],
      '. By the right curtain, ', ['person', 'Jasper Dove', 'right'], '.'
    ] },
    { id: 'story', title: 'What happened', parts: [
      ['person', 'Jasper Dove', 'culprit'], ' passed off the message as the words of Aunt ', ['person', 'Maud Bell', 'spirit'],
      ', accusing ', ['person', 'Hector Crow', 'blamed'], ' of taking her ring.'
    ] }
  ],
  path: [
    { how: 'The medium’s brooch', from: ['medium'], gives: [0], say: 'The brooch names the woman who held the sitting, Dora Gale.' },
    { how: 'A trade', from: ['left', 'bill'], gives: [1], say: 'The man at the left carries flat lettering chalk. The fresh price board names the fair’s signwriter, Hector Crow.' },
    { how: 'A torn sun', from: ['right', 'counterfoils'], gives: [2], say: 'The scrap under the right sitter’s cuff completes the gilt sun on the counterfoil signed by Jasper Dove.' },
    { how: 'A private invitation', from: ['medium', 'counterfoils', 'cards', 'slates'], gives: [3], say: 'Dora invented “my little turnip” for the green invitation. Dove signed for green. The attendant read the greeting as the slate came out. Only Dove had those words in his booth.' },
    { how: 'A borrowed signature', from: ['letters', 'slates'], gives: [4], say: 'The chalk swallow is Aunt Maud Bell’s signature. Aunt Esther used a wren.' },
    { how: 'The finger points', from: ['slates', 'left'], gives: [5], say: 'The slate says the wearer of the key-shaped pin took the ring. Crow wears the key and Dove wears the fox.' }
  ],
  traps: [
    { word: 'Hector Crow', from: ['left'], against: ['bill'], say: 'Crow chalked the price on the board by the till. The pet name on his own invitation was “my little radish.”' }
  ],
  tips: [
    'The medium made up the pet names. Who could have known the one on the slate?',
    'Find “my little turnip” in the copybook, then look for the signature on that colour’s counterfoil. The bird and the lapel pin answer different questions.'
  ]
};
