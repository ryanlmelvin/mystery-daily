// The alibi: a stopped watch, a timetable and two tickets.
export default {
  id: 'train',
  title: 'The 8.40 Down',
  where: 'A first-class compartment, somewhere before Kelling',
  scene: 'train',
  words: {
    'Edwin Marsh': 'person',
    'Lavinia Stroud': 'person',
    'Barnaby Quill': 'person',
    'Amos Pike': 'person',
    hatpin: 'thing',
    'carving knife': 'thing',
    'paper-knife': 'thing',
    ledger: 'thing',
    watch: 'thing',
    Marrow: 'place',
    Thorne: 'place',
    Ashby: 'place',
    Kelling: 'place'
  },
  exhibits: [
    { id: 'timetable', title: 'Timetable on the wall', lines: [
      ['print', 'Down train. {Marrow} depart 8.40. {Thorne} 8.55. {Ashby} 9.10. {Kelling} arrive 9.30. Guard: Mr {Amos Pike}.']
    ] },
    { id: 'victim', title: 'The gentleman by the window', lines: [
      ['see', 'A narrow wound under the ribs. His {watch} is smashed, stopped at 9.02. In his card case:'],
      ['print', 'Mr {Edwin Marsh}, auditor.']
    ] },
    { id: 'letter', title: 'Letter in his open briefcase', lines: [
      ['hand', "Marsh: the Dunmore books are £400 short, all of it on Quill's rounds. Put the {ledger} in front of him at Kelling."],
      ['see', 'The briefcase has been rifled. A silver {paper-knife} lies in it, clean.']
    ] },
    { id: 'lady', title: 'The lady in the corner seat', lines: [
      ['see', 'Travelling cloak. Two pearl {hatpin|hatpins}, both still in her hat. Her ticket:'],
      ['print', 'Ashby to Kelling. First class.']
    ] },
    { id: 'hatbox', title: 'Hatbox on the rack above her', lines: [
      ['print', 'Mrs {Lavinia Stroud}, Kelling.'],
      ['see', 'Empty. The hat it carried is on her head.']
    ] },
    { id: 'traveller', title: 'The gentleman on his feet', lines: [
      ['see', 'Worn cuffs, a fresh bandage on his thumb. Under his coat, a {ledger} stamped Dunmore & Sons. His ticket:'],
      ['print', 'Marrow to Kelling. Third class.']
    ] },
    { id: 'samples', title: 'Sample case on the rack', lines: [
      ['cut', '{Barnaby Quill}. Dunmore & Sons, cutlers.'],
      ['see', 'Twelve slots for {carving knife|carving knives}. One slot is empty.']
    ] }
  ],
  panels: [
    { id: 'cast', title: 'The cast', parts: ['By the window, ', ['person', 'Edwin Marsh'], '. In the corner seat, ', ['person', 'Lavinia Stroud'], '. On his feet, ', ['person', 'Barnaby Quill'], '.'] },
    { id: 'story', title: 'What happened', parts: [['person', 'Barnaby Quill'], ' stabbed ', ['person', 'Edwin Marsh'], ' with a ', ['thing', 'carving knife'], ' before the train reached ', ['place', 'Ashby'], ', and took the ', ['thing', 'ledger'], '.'] }
  ],
  path: [
    { how: 'A name on a card', from: ['victim', 'letter'], gives: [0, 4], say: 'His card case and the letter in his briefcase both name him: Edwin Marsh, the auditor.' },
    { how: 'A label', from: ['hatbox', 'lady'], gives: [1], say: 'The hatbox above her is labelled Mrs Lavinia Stroud, and its hat is on her head.' },
    { how: 'A name on a case', from: ['samples', 'traveller', 'letter'], gives: [2], say: "The sample case he is reaching for belongs to Barnaby Quill, and the missing money is on Quill's rounds." },
    { how: 'Alibi', from: ['victim', 'timetable', 'lady', 'traveller'], gives: [6, 3], say: 'The watch stopped at 9.02, after Thorne and before Ashby. The lady only boarded at Ashby; Quill has been aboard since Marrow.' },
    { how: 'Fit', from: ['victim', 'samples', 'lady', 'letter'], gives: [5], say: 'A narrow wound, and one carving knife missing from twelve. Both hatpins are in her hat and the paper-knife is clean.' },
    { how: 'Motive', from: ['letter', 'traveller'], gives: [7], say: 'Marsh carried the ledger that would ruin Quill. It is under Quill\'s coat now.' }
  ],
  traps: [
    { word: 'hatpin', from: ['lady'], against: ['lady', 'timetable'], say: 'Both hatpins are still in her hat, and she was not yet on the train.' },
    { word: 'Kelling', from: ['timetable'], against: ['victim'], say: 'He was dead at 9.02, long before Kelling.' }
  ],
  tips: [
    'A stopped watch and a timetable can say who was on the train.',
    'His watch stopped at 9.02. Find that minute on the timetable, then read both tickets.'
  ]
};
