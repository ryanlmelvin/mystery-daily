// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// The planted note: a left-handed man with a pen in his right hand.
export default {
  id: 'study',
  title: 'The Bell-Pull',
  where: 'The study at Hale Court, a little before three',
  scene: 'study',
  words: {
    'Jocelyn Hale': 'person',
    'Felix Hale': 'person',
    'Agnes Wren': 'person',
    'Cornelius Pym': 'person',
    'bell-pull': 'thing',
    'curtain cord': 'thing',
    necktie: 'thing',
    will: 'thing',
    pen: 'thing'
  },
  exhibits: [
    {
      id: 'uncle',
      title: 'The old gentleman at the desk',
      facts: [
        ['link', 'uncle', 'desk', 'Dead at his desk,'],
        ['dead', 'uncle', null],
        ['sign', 'red weal', 'a $mark around his neck.'],
        ['found', 'writing hand', 'right', 'A {pen} is pushed into his $value hand.'],
        ['habit', 'writing hand', 'left', 'His $value cuff is black with years of ink.']
      ]
    },
    {
      id: 'note',
      title: 'Note under his hand',
      facts: [
        ['accused', { surname: 'Wren' }, 'hand: $name has done this'],
        ['habit', 'writing hand', 'left', 'The ink is still wet. The inkwell stands at his $value.']
      ]
    },
    {
      id: 'will',
      title: 'Paper on the desk, unsigned',
      facts: [
        ['owner', 'desk', { full: 'Jocelyn Hale' }, 'print: I, Sir $name,'],
        ['wants', 'Felix Hale', 'will', 'print: by this $thing leave my nephew $who nothing.'],
        ['listed', 'Agnes Wren', 'secretary', 'print: All I own goes to my $key, Miss $name.'],
        ['listed', 'Cornelius Pym', 'solicitor', 'print: Drawn up by my $key, Mr $name.']
      ]
    },
    {
      id: 'bellpull',
      title: 'Bell-pull by the fire',
      facts: [
        ['makes', 'bell-pull', 'red weal', 'The cord of the $thing is cut off short, the cut fresh.'],
        ['makes', 'curtain cord', 'red weal', 'By the window, the $thing'],
        ['untouched', 'curtain cord', 'hangs whole, furred with dust.']
      ]
    },
    {
      id: 'nephew',
      title: 'The young man by the fire',
      facts: [
        ['wrote', 'nephew', 'Fresh ink on the fingers of his right hand.'],
        ['has', 'nephew', 'bell-pull', 'In his coat pocket, $thing~[a coil of tasselled cord].']
      ]
    },
    {
      id: 'portrait',
      title: 'Portrait over the mantel',
      facts: [
        ['tag', 'uncle', { surname: 'Hale' }, 'cut: Sir Jocelyn $name, Bart. | The same red whiskers as the gentleman at the desk,'],
        ['tag', 'nephew', { surname: 'Hale' }, 'and as the young man by the fire.']
      ]
    },
    {
      id: 'secretary',
      title: 'The woman with the notebook',
      facts: [
        ['fits', 'secretary', 'secretary', "Shorthand notebook, pencil behind her ear. Today's page: | hand: 3 o'clock. Mr Pym to witness the signing."]
      ]
    },
    {
      id: 'bag',
      title: 'The gentleman with the bag',
      facts: [
        ['makes', 'necktie', 'red weal', 'His $thing'],
        // Knotted again proves nothing. Silk wrung round a neck stays wrung.
        ['untouched', 'necktie', 'is uncreased silk.'],
        ['tag', 'bag', { surname: 'Pym' }, 'His brief-bag is stamped $name & $name.'],
        ['fits', 'bag', 'solicitor', 'Inside, a seal and a spare copy of the {will}.']
      ]
    }
  ],
  panels: [
    { id: 'cast', title: 'The cast', parts: ['At the desk, ', ['person', 'Jocelyn Hale', 'uncle'], '. By the fire, ', ['person', 'Felix Hale', 'nephew'], '. With the notebook, ', ['person', 'Agnes Wren', 'secretary'], '. With the bag, ', ['person', 'Cornelius Pym', 'bag'], '.'] },
    { id: 'story', title: 'What happened', parts: [['person', 'Felix Hale', 'culprit'], ' strangled his uncle with the ', ['thing', 'bell-pull', 'means'], ', then forged a note to blame ', ['person', 'Agnes Wren', 'framed'], ', before the new ', ['thing', 'will', 'motive'], ' could be signed.'] }
  ],
  path: [
    { how: 'A face in a frame', from: ['portrait', 'uncle', 'will'], gives: [0], say: 'The portrait is named, the whiskers match, and the will on his desk begins "I, Sir Jocelyn Hale".' },
    { how: 'Family likeness', from: ['portrait', 'nephew', 'will'], gives: [1], say: 'The young man has the Hale whiskers: he is the nephew, Felix Hale.' },
    { how: 'Trade', from: ['secretary', 'will'], gives: [2], say: 'Shorthand notebook and the day\'s appointments: the secretary, Agnes Wren.' },
    { how: 'A name on a bag', from: ['bag', 'will'], gives: [3], say: 'The brief-bag is stamped Pym & Pym, and Mr Pym drew up the will.' },
    { how: 'Fit', from: ['uncle', 'bellpull', 'nephew', 'bag'], gives: [5], say: 'A weal around the neck, a bell-pull freshly cut, and a coil of tasselled cord in Felix\'s pocket. The curtain cord hangs whole under its dust, and the solicitor\'s silk necktie has not a crease.' },
    { how: 'The wrong hand', from: ['uncle', 'note', 'nephew'], gives: [4, 6], say: 'He wrote with his left: the cuff, the inkwell. The pen is in his right, the ink is wet, and Felix\'s right fingers are inked. Felix wrote the note, and it names Wren.' },
    { how: 'Motive', from: ['will', 'secretary'], gives: [7], say: 'At three the new will would be signed and Felix would have nothing.' }
  ],
  traps: [
    { word: 'Agnes Wren', from: ['note'], against: ['uncle', 'will'], say: 'The note is forged, and Miss Wren gains everything once the will is signed. She needed him alive until three.' },
    { word: 'necktie', from: ['bag'], against: ['bag', 'bellpull'], say: 'Silk pulled tight round a neck stays wrung, and his necktie has not a crease. The bell-pull is the cord that was cut.' }
  ],
  tips: [
    'Which hand did the old gentleman write with?',
    "His left cuff is inked and the inkwell is at his left, yet the pen is in his right. Now look at the young man's fingers."
  ]
};
