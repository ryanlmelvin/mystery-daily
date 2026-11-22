// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
export default {
  id: 'foxes', ruleSet: 'foxes', scene: 'foxes', title: 'Death at the Foxes’ Ball',
  where: 'The Assembly Rooms, midway through the quadrilles',
  words: {
    'Dinah Dove': 'person', 'Pearl Finch': 'person', 'Lionel Jay': 'person',
    Fox: 'thing', Hare: 'thing', Stag: 'thing'
  },
  exhibits: [
    { id: 'doorcard', title: 'The doorkeeper’s dance card', facts: [
      ['maskAtDoor', 'Dinah Dove', 'Fox', 'print: Masks on arrival. $Who came as the $thing.'],
      ['maskAtDoor', 'Pearl Finch', 'Hare', 'print: $Who came as the $thing.'],
      ['maskAtDoor', 'Lionel Jay', 'Stag', 'print: $Who, our host, came as the $thing.']
    ] },
    { id: 'fan', title: 'The guest with the fan', facts: [
      ['tag', 'fan', { initials: 'D.D.' }, 'A peacock feather flickers in her fingers. On her fan, picked out in tiny pearls: | cut: $name']
    ] },
    { id: 'rose', title: 'The guest with the rose', facts: [
      ['tag', 'rose', { surname: 'Finch' }, 'A scarlet rose in her buttonhole. Her little silver pencil is engraved: | cut: Miss $name']
    ] },
    { id: 'host', title: 'The fallen host', facts: [
      ['tag', 'host', { initials: 'L.J.' }, 'Across his sash: | cut: Master of Revels • $name'],
      ['dead', 'host', null]
    ] },
    { id: 'slip', title: 'A slip from the forfeit bowl', facts: [
      ['exchanged', 'Fox', 'Hare', 1, 'The only slip tonight, signed by both guests. | hand: After dance $value we traded masks, $thing for $other. We keep them till midnight.']
    ] },
    { id: 'fiddle', title: 'The fiddler’s account', facts: [
      ['strikingMask', 'white-tipped muzzle', 'hand: I saw the blow fall. The one who struck our host had a $mark. My bow stopped on the string.']
    ] },
    { id: 'masks', title: 'Masks on the floor', facts: [
      ['maskFeature', 'Fox', 'white-tipped muzzle', 'The $thing has a $mark.'],
      ['maskFeature', 'Hare', 'crooked ear', 'The $thing has a $mark.'],
      ['maskFeature', 'Stag', 'gilded antler', 'The $thing has a $mark.']
    ] },
    { id: 'score', title: 'Music on the stand', facts: [
      ['stoppedAt', 2, 'Four quadrilles, numbered in order. A long pencil skid runs off the last note he played. | hand: Dance $value, second strain.']
    ] }
  ],
  panels: [
    { id: 'cast', title: 'The cast', parts: ['With the fan, ', ['person', 'Dinah Dove', 'fan'], '. With the rose, ', ['person', 'Pearl Finch', 'rose'], '. The host, ', ['person', 'Lionel Jay', 'host'], '.'] },
    { id: 'story', title: 'What happened', parts: [['person', 'Pearl Finch', 'culprit'], ' struck ', ['person', 'Lionel Jay', 'victim'], ' in the ', ['thing', 'Fox', 'guise'], ' mask. ', ['person', 'Dinah Dove', 'firstWearer'], ' wore it on arrival.'] }
  ],
  path: [
    { how: 'Initials on the fan', from: ['fan', 'doorcard'], gives: [0], say: 'D.D. on the peacock fan belongs to Dinah Dove.' },
    { how: 'An engraved pencil', from: ['rose', 'doorcard'], gives: [1], say: 'Miss Finch is engraved on the pencil beside the rose. Pearl Finch carries it.' },
    { how: 'The master of revels', from: ['host', 'doorcard'], gives: [2, 4], say: 'The host on the door card is Lionel Jay. His sash bears his initials.' },
    { how: 'A witness at the ball', from: ['fiddle', 'masks', 'doorcard'], gives: [5, 6], say: 'The fiddler saw a Fox with a white-tipped muzzle. Dinah wore that mask when she arrived.' },
    { how: 'One dance later', from: ['slip', 'score', 'doorcard', 'fiddle', 'masks'], gives: [3], say: 'Dinah and Pearl traded after dance one. The fiddler stopped in dance two, with Pearl behind the Fox’s muzzle.' }
  ],
  traps: [
    { word: 'Dinah Dove', from: ['doorcard', 'fiddle'], against: ['slip', 'score'], say: 'The doorkeeper and fiddler both saw the Fox. Between those sightings the signed forfeit put the mask on Pearl Finch.' }
  ],
  tips: ['The fiddler saw a face made of card. Who wore it then?', 'Compare the number on the forfeit slip with the last dance in the fiddler’s score.']
};
