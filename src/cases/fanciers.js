// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
export default {
  id: 'fanciers',
  title: 'First Prize at the Fanciers’ Hall',
  where: 'The song-canary bench at the Brindlewick show, just after judging',
  scene: 'fanciers',
  ruleSet: 'fanciers',
  words: {
    'Walter Moss': 'person', 'Maud Pike': 'person', 'Ivo Reed': 'person', 'Cora Bell': 'person',
    Halfpenny: 'thing', 'Lemon Drop': 'thing', 'Little Punch': 'thing'
  },
  exhibits: [
    {
      id: 'judge', title: 'The man at the scoring bench',
      facts: [
        ['dead', 'judge', null],
        ['tag', 'judge', { full: 'Walter Moss' }, 'The doctor’s slip rests on his knee: | hand: His heart gave out at the bench. | On his badge: | cut: $name. Song judge, twenty seasons.']
      ]
    },
    {
      id: 'scores', title: 'The judge’s pocketbook',
      facts: [
        ['ringScore', '18', 8, 'hand: Final marks for song. Highest wins. Ring $key, $value marks.'],
        ['ringScore', '27', 9, 'hand: Ring $key, $value. Held the last note till my pencil broke.'],
        ['ringScore', '39', 7, 'hand: Ring $key, $value.']
      ]
    },
    {
      id: 'catalogue', title: 'Catalogue above the bench',
      facts: [
        ['birdEntry', '18', 'Halfpenny', 'Maud Pike', 'print: Song canaries by leg ring. $key. $thing, Mrs $name.'],
        ['birdEntry', '27', 'Lemon Drop', 'Ivo Reed', 'print: $key. $thing, Mr $name.'],
        ['birdEntry', '39', 'Little Punch', 'Cora Bell', 'print: $key. $thing, Miss $name.']
      ]
    },
    {
      id: 'cage', title: 'The cage with the blue rosette',
      facts: [
        ['firstRibbon', '18', 'The blue silk tails brush the perch. Gold letters read FIRST FOR SONG. The canary wears leg ring $key.']
      ]
    },
    {
      id: 'hat', title: 'The woman in the feathered hat',
      facts: [
        ['tag', 'hat', { initials: 'M.P.' }, 'Her hatpin spells $name in seed pearls.'],
        ['exhibitorSeal', 'hat', 'acorn', 'Her brass exhibitor’s seal is cut with an $value.']
      ]
    },
    {
      id: 'satchel', title: 'The man with the seed satchel',
      facts: [
        ['tag', 'satchel', { surname: 'Reed' }, 'His satchel reads: | cut: $name & Sons. Birdseed.'],
        ['exhibitorSeal', 'satchel', 'thistle', 'His exhibitor’s seal bears a $value.']
      ]
    },
    {
      id: 'receipt', title: 'The ribbon clerk’s counterfoil',
      facts: [
        ['ribbonReceipt', '18', 'acorn', 'hand: After the judge fell, the exhibitor pressed this seal here, took the first purse and ordered the blue pinned to ring $key. | In the wax, an $value.']
      ]
    }
  ],
  panels: [
    { id: 'cast', title: 'The cast', parts: ['At the bench, ', ['person', 'Walter Moss', 'judge'], '. In the feathered hat, ', ['person', 'Maud Pike', 'hat'], '. With the seed satchel, ', ['person', 'Ivo Reed', 'satchel'], '.'] },
    { id: 'story', title: 'What happened', parts: [['person', 'Maud Pike', 'claimant'], ' claimed first prize for ', ['thing', 'Halfpenny', 'claimedBird'], '. The winning bird was ', ['thing', 'Lemon Drop', 'winningBird'], ', shown by ', ['person', 'Ivo Reed', 'winner'], '.'] }
  ],
  path: [
    { how: 'Twenty seasons', from: ['judge'], gives: [0], say: 'The song judge wears his name on the badge he earned over twenty seasons.' },
    { how: 'The seed pearls', from: ['hat', 'catalogue'], gives: [1], say: 'M.P. on the hatpin matches Maud Pike in the show catalogue.' },
    { how: 'The seed merchant', from: ['satchel', 'catalogue'], gives: [2], say: 'Reed & Sons is stamped on the satchel. The catalogue names Ivo Reed.' },
    { how: 'A seal in the wax', from: ['receipt', 'hat', 'satchel'], gives: [3], say: 'The clerk took the claimant’s seal in person. The acorn impression matches Maud’s seal. Ivo’s would have left a thistle.' },
    { how: 'The claim', from: ['receipt', 'cage', 'catalogue'], gives: [4], say: 'The counterfoil orders the blue pinned to ring 18. That bird wears the rosette on its cage now. Ring 18 is Halfpenny.' },
    { how: 'The judge’s marks', from: ['scores', 'catalogue'], gives: [5, 6], say: 'Ring 27 earned nine marks, the highest score. The catalogue gives that ring to Lemon Drop, shown by Ivo Reed.' }
  ],
  traps: [
    { word: 'Halfpenny', from: ['cage', 'catalogue'], against: ['scores', 'receipt'], say: 'Ring 18’s blue rosette was pinned up on the exhibitor’s order after the judge fell. Halfpenny earned eight marks. Lemon Drop earned nine.' }
  ],
  tips: [
    'The clerk handed out the purse. The judge heard the birds. Read what each of them wrote.',
    'Look up the highest-scoring ring in the catalogue, then match the wax impression to an exhibitor’s seal.'
  ]
};
