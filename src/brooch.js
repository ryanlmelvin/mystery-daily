// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// The same three mourners can take any of the three parts: assailant, latecomer,
// bystander. Their positions, colours and admission tickets are visible in every case.
import { C } from './art/kit.js';

export const MOURNING_ROOMS = {
  station: ['the Station Parlour', 'the Junction Rooms', 'the Royal Waiting Room'],
  assembly: ['the Assembly Rooms', 'the Crescent Ballroom', 'the Octagon'],
  hotel: ['the Winter Hotel', 'the Swan Hotel', 'the Crown Hotel']
};
const JEWELS = ['jet brooch', 'pearl star', 'coral cameo'];
const PLACES = [
  { id: 'window', label: 'At the window', title: 'The mourner at the window' },
  { id: 'clock', label: 'By the clock', title: 'The mourner by the clock' },
  { id: 'door', label: 'At the door', title: 'The mourner at the door' }
];
const COATS = [['plum', C.plum], ['navy', C.navy], ['green', C.green]];
const CLOCKS = [
  ['7.35', '7.50', '8.05', '8.20'], ['8.10', '8.25', '8.35', '8.50'], ['7.10', '7.25', '7.40', '7.55']
];

export function buildBrooch(date, attempt, turn, { pick, shuffled, chance, face }, names) {
  const settings = Object.keys(MOURNING_ROOMS);
  const setting = settings[turn % settings.length];
  const visit = Math.floor(turn / settings.length);
  const room = MOURNING_ROOMS[setting][visit % 3];
  const jewels = JEWELS.map((_, i) => JEWELS[(i + visit) % JEWELS.length]);
  const [loot, keepsake, chain] = jewels;
  const [victim, ...guests] = names;
  const killer = pick(PLACES);
  const thief = pick(PLACES.filter((place) => place !== killer));
  const stamps = shuffled(['17', '24', '31', '46', '52', '68']).slice(0, 3);
  const coats = shuffled(COATS);
  const [first, second, examined, late] = pick(CLOCKS);
  const earlier = shuffled([first, second]);
  const site = pick(['collar', 'lapel']);
  const body = { id: 'body', title: 'The guest on the floor', facts: [
    ['dead', 'body', null],
    ['tag', 'body', { initials: victim.split(' ').map((p) => p[0] + '.').join('') }, 'Inside the coat: | cut: $name'],
    ['bare', site, 'Black crape torn at the $key. Two empty pinholes.'],
    ['grippedButton', stamps[PLACES.indexOf(killer)], 'Clenched in one fist, a brass cuff button stamped $mark.']
  ] };
  const roster = { id: 'roster', title: 'Cloakroom book', facts: [
    ['listed', victim, 'host', 'hand: Memorial supper. $Key, $name.'],
    ...guests.map((name, i) => ['listed', name, coats[i][0], i === 0 ? 'hand: Loan coats. $Key, $name.' : 'hand: $Key, $name.'])
  ] };
  const witness = { id: 'witness', title: 'The porter’s deposition', facts: [
    ['witnessedButton', 'hand: I saw the blow land. The guest caught the attacker’s cuff and tore off a button before falling.']
  ] };
  const record = { id: 'inventory', title: 'The constable’s inventory', facts: [
    ['inventory', site, loot, examined, 'hand: $time. Examined the dead guest. On the $key, a $thing, still firmly pinned.'],
    ['untouched', keepsake, 'Sealed in the property tray, the $thing'],
    ['untouched', chain, 'and the $thing.']
  ] };
  const scene = { kind: 'brooch', setting, mirror: chance(0.5), floor: { look: { ...face(), body: 'coat', paint: C.black, collar: 'bow' } } };
  const suspects = PLACES.map((place, i) => {
    const [colour, paint] = coats[i];
    scene[place.id] = { look: { ...face(), body: 'coat', paint, collar: 'tie', hat: pick(['bowler', 'flat', null]), pose: pick(['stand', 'hip', 'alarm']) } };
    const facts = [
      ['fits', place.id, colour, `A ${colour} loan coat.`],
      ['cuffNumber', place.id, stamps[i], place === killer ? 'One cuff button gone. Its mate bears $mark.' : 'Cuff buttons stamped $mark.'],
      ['admitted', place.id, place === thief ? late : earlier.pop(), 'The doorkeeper punched the entry ticket: | print: First admission $time.']
    ];
    if (place === thief) facts.push(['has', place.id, loot, 'Hidden inside one glove, the $thing. Black crape caught in its pin.']);
    return { id: place.id, title: place.title, facts };
  });
  const cast = ['On the floor, ', ['person', victim, 'body']];
  PLACES.forEach((place, i) => cast.push(`. ${place.label}, `, ['person', guests[i], place.id]));
  cast.push('.');
  const shortTitles = {
    station: ['The Mourning Brooch', 'The Pearl Star', 'The Coral Cameo'],
    assembly: ['Jet at the Ball', 'A Star for the Last Dance', 'The Cameo Quadrille'],
    hotel: ['Jet in the Lobby', 'Pearls at Reception', 'The Cloakroom Cameo']
  };
  const titles = [
    shortTitles[setting],
    ['The Brooch at ', 'The Star at ', 'The Cameo at '],
    ['Mourning at ', 'A Late Caller at ', 'Black Crape at ']
  ];
  const round = Math.floor(visit / 3) % 3;
  const title = titles[round][visit % 3] + (round ? room : '');
  return {
    ruleSet: 'brooch', title, where: `A memorial supper in ${room}`, scene,
    composed: { date, attempt, setting, crime: 'brooch', culprit: killer.id, thief: thief.id },
    words: Object.fromEntries([...names.map((n) => [n, 'person']), ...jewels.map((j) => [j, 'thing'])]),
    exhibits: [roster, body, witness, ...suspects, record],
    panels: [
      { id: 'cast', title: 'The cast', parts: cast },
      { id: 'story', title: 'What happened', parts: [
        ['person', guests[PLACES.indexOf(killer)], 'culprit'], ' killed ', ['person', victim, 'victim'], '. Afterward, ',
        ['person', guests[PLACES.indexOf(thief)], 'thief'], ' took the ', ['thing', loot, 'loot'], '.'
      ] }
    ]
  };
}
