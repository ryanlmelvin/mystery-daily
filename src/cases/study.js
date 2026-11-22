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
    { id: 'uncle', title: 'The old gentleman at the desk', lines: [
      ['see', 'Dead in his chair, a red weal around his neck. A {pen} is pushed into his right hand. His left cuff is black with years of ink.']
    ] },
    { id: 'note', title: 'Note under his hand', lines: [
      ['hand', 'Wren has done this'],
      ['see', 'The ink is still wet. The inkwell stands at his left.']
    ] },
    { id: 'will', title: 'Paper on the desk, unsigned', lines: [
      ['print', 'I, Sir {Jocelyn Hale}, leave my nephew {Felix Hale} nothing. All I own goes to my secretary, Miss {Agnes Wren}. Drawn up by Mr {Cornelius Pym}.']
    ] },
    { id: 'bellpull', title: 'Bell-pull by the fire', lines: [
      ['see', 'The cord of the {bell-pull} has been cut off short, and the cut is fresh. By the window, the {curtain cord} hangs whole.']
    ] },
    { id: 'nephew', title: 'The young man by the fire', lines: [
      ['see', 'Fresh ink on the fingers of his right hand. In his coat pocket, a coil of tasselled cord.']
    ] },
    { id: 'portrait', title: 'Portrait over the mantel', lines: [
      ['cut', 'Sir Jocelyn Hale, Bart.'],
      ['see', 'The same red whiskers as the gentleman at the desk, and as the young man by the fire.']
    ] },
    { id: 'secretary', title: 'The woman with the notebook', lines: [
      ['see', "Shorthand notebook, pencil behind her ear. Today's page:"],
      ['hand', "3 o'clock. Mr Pym to witness the signing."]
    ] },
    { id: 'bag', title: 'The gentleman with the bag', lines: [
      ['see', 'His {necktie} is neatly knotted. His brief-bag is stamped Pym & Pym. Inside, a seal and a spare copy of the {will}.']
    ] }
  ],
  panels: [
    { id: 'cast', title: 'The cast', parts: ['At the desk, ', ['person', 'Jocelyn Hale'], '. By the fire, ', ['person', 'Felix Hale'], '. With the notebook, ', ['person', 'Agnes Wren'], '. With the bag, ', ['person', 'Cornelius Pym'], '.'] },
    { id: 'story', title: 'What happened', parts: [['person', 'Felix Hale'], ' strangled his uncle with the ', ['thing', 'bell-pull'], ', then forged a note to blame ', ['person', 'Agnes Wren'], ', before the new ', ['thing', 'will'], ' could be signed.'] }
  ],
  path: [
    { how: 'A face in a frame', from: ['portrait', 'uncle', 'will'], gives: [0], say: 'The portrait is named, the whiskers match, and the will on his desk begins "I, Sir Jocelyn Hale".' },
    { how: 'Family likeness', from: ['portrait', 'nephew', 'will'], gives: [1], say: 'The young man has the Hale whiskers: he is the nephew, Felix Hale.' },
    { how: 'Trade', from: ['secretary', 'will'], gives: [2], say: 'Shorthand notebook and the day\'s appointments: the secretary, Agnes Wren.' },
    { how: 'A name on a bag', from: ['bag', 'will'], gives: [3], say: 'The brief-bag is stamped Pym & Pym, and Mr Pym drew up the will.' },
    { how: 'Fit', from: ['uncle', 'bellpull', 'nephew', 'bag'], gives: [5], say: 'A weal around the neck, a bell-pull freshly cut, and a coil of tasselled cord in Felix\'s pocket. The curtain cord and the necktie are untouched.' },
    { how: 'The wrong hand', from: ['uncle', 'note', 'nephew'], gives: [4, 6], say: 'He wrote with his left: the cuff, the inkwell. The pen is in his right, the ink is wet, and Felix\'s right fingers are inked. Felix wrote the note, and it names Wren.' },
    { how: 'Motive', from: ['will', 'secretary'], gives: [7], say: 'At three the new will would be signed and Felix would have nothing.' }
  ],
  traps: [
    { word: 'Agnes Wren', from: ['note'], against: ['uncle', 'will'], say: 'The note is forged, and Miss Wren gains everything once the will is signed. She needed him alive until three.' },
    { word: 'necktie', from: ['bag'], against: ['bellpull'], say: 'The necktie is neatly knotted; the bell-pull is the cord that was cut.' }
  ],
  tips: [
    'Which hand did the old gentleman write with?',
    "His left cuff is inked and the inkwell is at his left, yet the pen is in his right. Now look at the young man's fingers."
  ]
};
