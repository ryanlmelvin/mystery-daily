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
      ['listed', 'Lionel Jay', 'host', 'print: Masks on arrival. $Key: $name,'],
      ['maskAtDoor', 'Lionel Jay', 'Stag', 'print: the $thing.'],
      ['listed', 'Pearl Finch', 'guest', 'print: $Key: $name,'],
      ['maskAtDoor', 'Pearl Finch', 'Hare', 'print: the $thing.'],
      ['listed', 'Dinah Dove', 'guest', 'print: $Key: $name,'],
      ['maskAtDoor', 'Dinah Dove', 'Fox', 'print: the $thing.']
    ] },
    { id: 'fan', title: 'The guest with the fan', facts: [
      ['link', 'fan', 'bluebell card', 'Inside the peacock fan, the stub of a dance card. Its torn edge cuts a painted bluebell in two.']
    ] },
    { id: 'rose', title: 'The guest with the rose', facts: [
      ['fits', 'rose', 'guest', 'A white ribbon fastens her rose. | print: Guest of the Assembly Rooms']
    ] },
    { id: 'host', title: 'The fallen host', facts: [
      ['fits', 'host', 'host', 'His sash reads HOST. In his glove, half a dance card with half a bluebell,'],
      ['owner', 'bluebell card', { surname: 'Dove' }, 'signed in a round hand: | hand: My first dance is yours. Miss $name.'],
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
    { how: 'Two halves of a dance card', from: ['fan', 'host', 'doorcard'], gives: [0], say: 'Fit the bluebell in the fan to the half in the host’s glove. Miss Dove signed the promise of that first dance. The fan belongs to Dinah Dove.' },
    { how: 'The other guest', from: ['rose', 'doorcard', 'fan', 'host'], gives: [1], say: 'The door card names two guests. Dinah holds the fan, so the guest wearing a rose is Pearl Finch.' },
    { how: 'The host’s sash', from: ['host', 'doorcard'], gives: [2, 4], say: 'The sash marks the fallen man as the host. The doorkeeper entered Lionel Jay in that place.' },
    { how: 'A witness at the ball', from: ['fiddle', 'masks', 'doorcard'], gives: [5, 6], say: 'The fiddler saw a Fox with a white-tipped muzzle. Dinah wore that mask when she arrived.' },
    { how: 'One dance later', from: ['slip', 'score', 'doorcard', 'fiddle', 'masks'], gives: [3], say: 'Dinah and Pearl traded after dance one. The fiddler stopped in dance two, with Pearl behind the Fox’s muzzle.' }
  ],
  traps: [
    { word: 'Dinah Dove', from: ['doorcard', 'fiddle'], against: ['slip', 'score'], say: 'The doorkeeper and fiddler both saw the Fox. Between those sightings the signed forfeit put the mask on Pearl Finch.' }
  ],
  tips: ['The fiddler saw a face made of card. Who wore it then?', 'Compare the number on the forfeit slip with the last dance in the fiddler’s score.']
};
