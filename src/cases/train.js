// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// The alibi: a stopped watch, a timetable and two tickets.
export default {
  id: 'train',
  title: 'The 8.40 Down',
  where: 'A first-class compartment, somewhere before Kelling',
  scene: 'train',
  words: {
    'Edwin Marsh': 'person',
    'Lavinia Stroud': 'person',
    'Dora Bly': 'person',
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
    {
      id: 'timetable',
      title: 'Timetable on the wall',
      facts: [
        ['stops', [['Marrow', '8.40'], ['Thorne', '8.55'], ['Ashby', '9.10'], ['Kelling', '9.30']], 'print: Down train. $stops'],
        ['listed', 'Amos Pike', 'guard', 'print: $Key: Mr $name.']
      ]
    },
    {
      id: 'victim',
      title: 'The gentleman by the window',
      facts: [
        ['dead', 'victim', null],
        ['sign', 'narrow wound', 'A $mark under the ribs.'],
        ['died', '9.02', 'His {watch} is smashed, stopped at $time.'],
        ['tag', 'victim', { full: 'Edwin Marsh' }, 'In his card case: | print: Mr $name, auditor.']
      ]
    },
    {
      id: 'letter',
      title: 'Letter in his open briefcase',
      facts: [
        ['wants', { surname: 'Quill' }, 'ledger', "hand: Marsh: the Dunmore books are £400 short, all of it on $who's rounds."],
        ['taken', 'ledger', 'hand: Put the $thing in front of him at {Kelling}. | The briefcase has been rifled.'],
        ['makes', 'paper-knife', 'narrow wound', 'A $thing lies in it,'],
        ['untouched', 'paper-knife', 'rusted into its sheath.']
      ]
    },
    {
      id: 'lady',
      title: 'The lady in the corner seat',
      facts: [
        // The pins are hers, so they got on where she did. Where they sit clears nothing:
        // a pin can be put back. The timetable clears them.
        ['makes', 'hatpin', 'narrow wound', 'Travelling cloak. Two pearl $thing[hatpins],'],
        ['has', 'lady', 'hatpin', 'both in her hat.'],
        ['fits', 'lady', 'plume', 'Fine wire splints a break in her hat feather.'],
        ['boarded', 'lady', 'Ashby', 'Her ticket: | print: $place to {Kelling}. First class.']
      ]
    },
    {
      id: 'hatbox',
      title: 'Milliner’s hatbox on the rack',
      facts: [
        ['listed', 'Dora Bly', 'brim', 'A milliner’s docket tied to the handle: | hand: Repairs delivered. Mrs $name, reshape $key.'],
        ['listed', 'Lavinia Stroud', 'plume', 'hand: Mrs $name, mend broken $key.']
      ]
    },
    {
      id: 'traveller',
      title: 'The gentleman on his feet',
      facts: [
        ['link', 'traveller', 'sample case', 'A fresh bandage on his thumb, and on his watch-chain the key to a sample case.'],
        ['has', 'traveller', 'ledger', 'Under his coat, a $thing stamped Dunmore & Sons.'],
        ['boarded', 'traveller', 'Marrow', 'His ticket: | print: $place to {Kelling}. Third class.']
      ]
    },
    {
      id: 'samples',
      title: 'Sample case on the rack',
      facts: [
        ['owner', 'sample case', { full: 'Barnaby Quill' }, 'cut: $name. Dunmore & Sons, cutlers.'],
        ['makes', 'carving knife', 'narrow wound', 'Eleven narrow $thing[carving knives].'],
        ['has', 'Barnaby Quill', 'carving knife', 'The twelfth slot is empty.']
      ]
    }
  ],
  panels: [
    { id: 'cast', title: 'The cast', parts: ['By the window, ', ['person', 'Edwin Marsh', 'victim'], '. In the corner seat, ', ['person', 'Lavinia Stroud', 'lady'], '. On his feet, ', ['person', 'Barnaby Quill', 'traveller'], '.'] },
    { id: 'story', title: 'What happened', parts: [['person', 'Barnaby Quill', 'culprit'], ' stabbed ', ['person', 'Edwin Marsh', 'victim'], ' with a ', ['thing', 'carving knife', 'means'], '. The next stop was ', ['place', 'Ashby', 'before'], '. The killer took the ', ['thing', 'ledger', 'loot'], '.'] }
  ],
  path: [
    { how: 'A name on a card', from: ['victim', 'letter'], gives: [0, 4], say: 'His card case and the letter in his briefcase both name him: Edwin Marsh, the auditor.' },
    { how: 'A milliner’s repair', from: ['hatbox', 'lady'], gives: [1], say: 'Wire splints the feather on her hat. The milliner mended Lavinia Stroud’s plume and reshaped Dora Bly’s brim.' },
    { how: 'A name on a case', from: ['samples', 'traveller', 'letter'], gives: [2], say: "He carries the key to a sample case, and the case on the rack belongs to Barnaby Quill. The missing money is on Quill's rounds." },
    { how: 'Alibi', from: ['victim', 'timetable', 'lady', 'traveller'], gives: [6, 3], say: 'The watch stopped at 9.02, after Thorne and before Ashby. The lady only boarded at Ashby; Quill has been aboard since Marrow.' },
    { how: 'Fit', from: ['victim', 'samples', 'letter', 'lady', 'timetable'], gives: [5], say: "A narrow wound, and one narrow carving knife gone from Quill's twelve. The paper-knife is rusted into its sheath, and the hatpins came aboard with the lady at Ashby." },
    { how: 'Motive', from: ['letter', 'traveller'], gives: [7], say: 'Marsh carried the ledger that would ruin Quill. It is under Quill\'s coat now.' }
  ],
  traps: [
    { word: 'hatpin', from: ['lady'], against: ['victim', 'timetable', 'lady'], say: 'A hatpin would leave that wound, but hers came aboard with her at Ashby, eight minutes after his watch stopped.' },
    { word: 'paper-knife', from: ['letter'], against: ['letter'], say: 'The paper-knife is rusted into its sheath. Nobody drew it tonight.' },
    { word: 'Kelling', from: ['timetable'], against: ['victim'], say: 'Kelling was the end of the line. At 9.02 the train still had Ashby to call at first.' }
  ],
  tips: [
    'A stopped watch and a timetable can say who was on the train.',
    'His watch stopped at 9.02. Find that minute on the timetable, then read both tickets.'
  ]
};
