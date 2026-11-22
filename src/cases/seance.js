// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
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
      ['privateDraw', 'The attendant’s log: | hand: Gave each nephew a blank slate. Both opened their invitations alone. The curtains stayed shut until their slates slid back underneath.']
    ] },
    { id: 'left', title: 'The sitter at the left curtain', facts: [
      ['tag', 'left', { initials: 'H.C.' }, 'A watch-chain engraved $name'],
      ['wearsPin', 'left', 'rook', 'A $key pin in his lapel.'],
      ['lead', 'left', 'has chalk on his fingers', 'White chalk in the creases of his fingers.']
    ] },
    { id: 'right', title: 'The sitter at the right curtain', facts: [
      ['tag', 'right', { initials: 'J.D.' }, 'Silver cufflinks in the shape of letters: $name'],
      ['wearsPin', 'right', 'fox', 'A $key pin in his lapel.']
    ] },
    { id: 'counterfoils', title: 'Signed invitation counterfoils', facts: [
      ['drawStub', 'Hector Crow', 'blue', 'hand: $Value invitation received. $name.'],
      ['drawStub', 'Jasper Dove', 'green', 'hand: $Value invitation received. $name.']
    ] },
    { id: 'cards', title: 'The medium’s locked copybook', facts: [
      ['testLine', 'green', 'my little turnip', 'Her private notes: | hand: Pet names I invented for tonight’s invitations. $Key: $value.'],
      ['testLine', 'blue', 'my little radish', 'hand: $Key: $value.']
    ] },
    { id: 'slates', title: 'Two slates on the table', facts: [
      ['slateLine', 'my little turnip', 'One blank. On the other: | hand: Listen, $value.'],
      ['slateCharge', 'rook', 'hand: The man with the $key pin took my ring!'],
      ['slateSeal', 'swallow', 'Instead of a signature, a chalk $key.']
    ] },
    { id: 'letters', title: 'Framed family letters', facts: [
      ['letterSeal', 'Maud Bell', 'swallow', 'Their late aunts signed letters with birds. The engraved key: | cut: $name — a $key.'],
      ['letterSeal', 'Esther Bell', 'wren', 'cut: $name — a $key.']
    ] },
    { id: 'bill', title: 'Chalkboard beside the till', facts: [
      ['explained', 'Hector Crow', 'has chalk on his fingers', 'Fresh white lettering: | hand: One shilling a sitting. Board lettered today by $who.']
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
    { how: 'Two sets of initials', from: ['left', 'right', 'counterfoils'], gives: [1, 2], say: 'The signatures give the names behind the initials. H.C. on the watch-chain is Hector Crow. J.D. on the cufflinks is Jasper Dove.' },
    { how: 'A private invitation', from: ['medium', 'counterfoils', 'cards', 'slates'], gives: [3], say: 'Dora invented “my little turnip” for the green invitation. Dove signed for green. The sitters stayed apart until they returned their slates, so only Dove had those words to copy in his booth.' },
    { how: 'A borrowed signature', from: ['letters', 'slates'], gives: [4], say: 'The chalk swallow is Aunt Maud Bell’s signature. Aunt Esther used a wren.' },
    { how: 'The finger points', from: ['slates', 'left'], gives: [5], say: 'The slate accuses the man with the rook pin. Crow wears the rook, and Dove wears the fox.' }
  ],
  traps: [
    { word: 'Hector Crow', from: ['left'], against: ['bill'], say: 'Crow chalked the price on the board by the till. The pet name on his own invitation was “my little radish.”' }
  ],
  tips: [
    'The medium made up the pet names. Who could have known the one on the slate?',
    'Find “my little turnip” in the copybook, then look for the signature on that colour’s counterfoil. The bird and the lapel pin answer different questions.'
  ]
};
