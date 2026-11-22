// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
export default {
  id: 'encore', ruleSet: 'encore', scene: 'encore', title: 'An Encore for Nobody',
  where: 'The Marigold Music Hall, last house',
  words: {
    'Effie Pike': 'person', 'Kit Plum': 'person', 'Jules Moss': 'person',
    'live voice': 'thing', 'rehearsal cylinder': 'thing', 'piano roll': 'thing'
  },
  exhibits: [
    { id: 'bill', title: 'Tonight’s bill', facts: [
      ['listed', 'Effie Pike', 'songstress', 'print: The Marigold presents $name, our $key.'],
      ['listed', 'Kit Plum', 'comic', 'print: $name, tumbling $key.'],
      ['listed', 'Jules Moss', 'impresario', 'print: $name, $key.']
    ] },
    { id: 'flower', title: 'The lady in marigolds', facts: [
      ['fits', 'flower', 'songstress', 'A bouquet under one arm. A silver treble clef holds her curls in place.'],
      ['wornSash', 'flower', 'a star between two notes', 'Across her back, a satin sash embroidered with $mark.']
    ] },
    { id: 'tumbler', title: 'The man in checks', facts: [
      ['fits', 'tumbler', 'comic', 'Checks from neck to ankle. Two enormous shoes curl up like smiles. His juggling clubs lie scattered.']
    ] },
    { id: 'box', title: 'The gentleman in the box', facts: [
      ['tag', 'box', { initials: 'J.M.' }, 'Slumped against his velvet cushion. His watch case reads: | cut: $name'],
      ['dead', 'box', null]
    ] },
    { id: 'aisle', title: 'The aisle usher’s account', facts: [
      ['heardAs', 'live voice', 'hand: Curtain shut. I’d have sworn it was her $thing.'],
      ['heardEncore', 'Tillie-ACHOO', 'hand: Twice through verse two. Both times she sang “$mark!”']
    ] },
    { id: 'sleeve', title: 'The record sleeve', facts: [
      ['recordedMatinee', 'rehearsal cylinder', 'Tillie-ACHOO', 'B7', 'hand: Matinée usher’s note. $Thing, take $value. Verse two: “$mark!” PLAY THROUGH SNEEZE.']
    ] },
    { id: 'horn', title: 'Behind the curtain', facts: [
      ['running', 'B7', 'The {piano roll} is tied up in ribbon. Behind the curtain a brass horn hums. Its needle is lifting from the last groove of take $value.']
    ] },
    { id: 'camera', title: 'The photographer’s plate', facts: [
      ['boxPhotograph', 'a star between two notes', 'The flash caught the blow in the box mirror. The striker has a satin sash across their back. At its centre is $mark.']
    ] }
  ],
  panels: [
    { id: 'cast', title: 'The cast', parts: ['In marigolds, ', ['person', 'Effie Pike', 'flower'], '. In checks, ', ['person', 'Kit Plum', 'tumbler'], '. In the box, ', ['person', 'Jules Moss', 'box'], '.'] },
    { id: 'story', title: 'What happened', parts: ['The audience heard a ', ['thing', 'rehearsal cylinder', 'source'], ' while ', ['person', 'Effie Pike', 'culprit'], ' struck ', ['person', 'Jules Moss', 'victim'], ' in his box.'] }
  ],
  path: [
    { how: 'Flowers and music', from: ['bill', 'flower'], gives: [0], say: 'The woman with the bouquet and treble clefs is Effie Pike, the billed songstress.' },
    { how: 'The tumbling act', from: ['bill', 'tumbler'], gives: [1], say: 'Kit Plum is billed as the tumbling comic. Those are his curling shoes and juggling clubs.' },
    { how: 'A monogram in the box', from: ['bill', 'box'], gives: [2, 5], say: 'The initials on the dead gentleman’s watch are J.M., for Jules Moss, the impresario.' },
    { how: 'The repeated sneeze', from: ['aisle', 'sleeve', 'horn'], gives: [3], say: 'The matinée take caught Effie sneezing on “Tillie.” Its cylinder was turning behind the curtain at the encore. The aisle usher really did hear Effie’s voice.' },
    { how: 'The flash in the box', from: ['camera', 'flower'], gives: [4], say: 'The flash caught the attacker’s back in the box mirror. The star between two notes matches Effie’s sash.' }
  ],
  traps: [
    { word: 'live voice', from: ['aisle'], against: ['sleeve', 'horn'], say: 'The aisle usher recognised Effie. The identical sneeze, the sleeve and the working horn explain how her voice reached the hall.' }
  ],
  tips: ['What went wrong in precisely the same place each time?', 'Read the sleeve beside the horn. Then look for something in the box photograph that you’ve seen on stage.']
};
