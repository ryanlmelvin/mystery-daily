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
      ['listed', 'Jules Moss', 'impresario', 'print: $name, $key, presents'],
      ['listed', 'Kit Plum', 'double act', 'print: the Marigold $key! Miss $name'],
      ['listed', 'Effie Pike', 'double act', 'print: and Miss $name. Songs and tumbles. | Above the pair, two marigolds on one stalk.']
    ] },
    { id: 'flower', title: 'The lady in marigolds', facts: [
      ['fits', 'flower', 'double act', 'Beneath her bouquet, an enamel brooch. Two marigolds grow from one stalk.'],
      ['wornSash', 'flower', 'a star between two notes', 'Across her back, a satin sash embroidered with $mark.']
    ] },
    { id: 'tumbler', title: 'The woman in checks', facts: [
      ['link', 'tumbler', 'shoe bells', 'A row of little bells is stitched to the toes of her tumbling shoes.']
    ] },
    { id: 'box', title: 'The gentleman in the box', facts: [
      ['fits', 'box', 'impresario', 'Slumped over his accounts. Out of tonight’s takings he has paid both performers and the ushers.'],
      ['dead', 'box', null]
    ] },
    { id: 'aisle', title: 'The aisle usher’s account', facts: [
      ['heardAs', 'live voice', 'hand: Curtain shut. I’d have sworn it was her $thing.'],
      ['heardEncore', 'Tillie-ACHOO', 'hand: Twice through verse two. Both times she sang “$mark!”']
    ] },
    { id: 'sleeve', title: 'The record sleeve', facts: [
      ['recordedMatinee', 'rehearsal cylinder', 'Tillie-ACHOO', 'B7', 'hand: Matinée usher’s note. $Thing, take $value. Verse two: “$mark!” PLAY THROUGH SNEEZE.'],
      ['owner', 'shoe bells', { surname: 'Plum' }, 'hand: Miss $name’s shoe bells came through beautifully.']
    ] },
    { id: 'horn', title: 'Behind the curtain', facts: [
      ['running', 'B7', 'The {piano roll} is tied in ribbon. A brass horn hums. Its needle lifts from the last groove of take $value.']
    ] },
    { id: 'camera', title: 'The photographer’s plate', facts: [
      ['boxPhotograph', 'a star between two notes', 'The flash caught the blow in the box mirror. Across the striker’s back, a satin sash bearing $mark.']
    ] }
  ],
  panels: [
    { id: 'cast', title: 'The cast', parts: ['In marigolds, ', ['person', 'Effie Pike', 'flower'], '. In checks, ', ['person', 'Kit Plum', 'tumbler'], '. In the box, ', ['person', 'Jules Moss', 'box'], '.'] },
    { id: 'story', title: 'What happened', parts: ['The audience heard a ', ['thing', 'rehearsal cylinder', 'source'], ' while ', ['person', 'Effie Pike', 'culprit'], ' struck ', ['person', 'Jules Moss', 'victim'], ' in his box.'] }
  ],
  path: [
    { how: 'Bells on the recording', from: ['tumbler', 'sleeve', 'bill'], gives: [1], say: 'The matinée usher heard Miss Plum’s shoe bells. The woman in checks wears the jingling shoes. She is Kit Plum.' },
    { how: 'The other half of the act', from: ['flower', 'bill', 'tumbler', 'sleeve'], gives: [0], say: 'The marigold pin belongs to the double act on the bill. Kit wears the bell shoes, leaving Effie Pike with the bouquet.' },
    { how: 'The evening’s takings', from: ['box', 'bill'], gives: [2, 5], say: 'The dead man paid the hall’s performers and ushers. His name on the bill as impresario is Jules Moss.' },
    { how: 'The repeated sneeze', from: ['aisle', 'sleeve', 'horn'], gives: [3], say: 'The matinée take caught Effie sneezing on “Tillie.” Its cylinder was turning behind the curtain at the encore. The aisle usher really did hear Effie’s voice.' },
    { how: 'The flash in the box', from: ['camera', 'flower'], gives: [4], say: 'The flash caught the attacker’s back in the box mirror. The star between two notes matches Effie’s sash.' }
  ],
  traps: [
    { word: 'live voice', from: ['aisle'], against: ['sleeve', 'horn'], say: 'The aisle usher recognised Effie. The identical sneeze, the sleeve and the working horn explain how her voice reached the hall.' }
  ],
  tips: ['What went wrong in precisely the same place each time?', 'Read the sleeve beside the horn. Then look for something in the box photograph that you’ve seen on stage.']
};
