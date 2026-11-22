// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// The composer. It builds a whole case from a date: the cast, the facts and their
// tellings, the two plates, the explanation shown at the end, and the scene. Then it
// puts the case through the same gate as a hand-written one (lint.js, which runs the
// telling and the proof) and tries again with the next salt if the gate refuses it.
//
// So far it knows one kind of crime, the interrupted theft: a thief, dressed to leave,
// is caught by the keeper of the thing being stolen, strikes the keeper down, and is
// still holding the thing when the machine jams. It tells that story in three settings.
//
// Everything is chosen from the lists below by a generator seeded with the date, so a
// date always gives the same case. Changing a list or the order of the draws changes
// every composed case; bump COMPOSER when that is intended.

import { told } from './tell.js';
import { lintCase } from './lint.js';
import { scenePins } from './art/scenes.js';
import { C, SKIN } from './art/kit.js';

export const COMPOSER = 1;
const ATTEMPTS = 40;

// A small seeded generator (xmur3 into mulberry32): the same text gives the same draws.
function seeded(text) {
  let h = 1779033703 ^ text.length;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  let a = (h ^ (h >>> 16)) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MEN = ['Silas', 'Jasper', 'Tobias', 'Edwin', 'Barnaby', 'Amos', 'Hector', 'Leo', 'Felix', 'Cornelius', 'Osric', 'Ambrose', 'Rufus', 'Gideon', 'Percival', 'Ezra', 'Horace', 'Linus', 'Mungo', 'Caspar', 'Dorian', 'Elias', 'Godfrey', 'Ignatius', 'Lionel', 'Mortimer', 'Quentin', 'Rupert', 'Thaddeus', 'Wilfred'];
const WOMEN = ['Nell', 'Cordelia', 'Lavinia', 'Ida', 'Agnes', 'Hetty', 'Tamsin', 'Odile', 'Maud', 'Edith', 'Flora', 'Ginevra', 'Hester', 'Isolde', 'Judith', 'Kitty', 'Lettice', 'Minerva', 'Nora', 'Olive', 'Prudence', 'Rosalind', 'Sybil', 'Thea', 'Ursula', 'Violet', 'Winifred'];
const SURNAMES = ['Crane', 'Fisk', 'Ruck', 'Vane', 'Marsh', 'Stroud', 'Quill', 'Pike', 'Bellamy', 'Sparrow', 'Tull', 'Crewe', 'Hale', 'Wren', 'Pym', 'Thrale', 'Pell', 'Brill', 'Ash', 'Birch', 'Cole', 'Dove', 'Finch', 'Garth', 'Holt', 'Jessop', 'Kemp', 'Lark', 'Moss', 'Nash', 'Peel', 'Rudge', 'Voss', 'Wade', 'Tansy', 'Gill', 'Hobb'];
const HALLS = ['Marrow Hall', 'Kelling Court', 'Thorne Abbey', 'Ashby Grange', 'Yarrow House', 'Slade Priory', 'Orme Park'];
const HOURS = ['twenty past nine at night', 'a little after ten at night', 'just before midnight', 'half past eight in the evening'];
const TRAINS = [['9.40', 'London'], ['10.15', 'Dover'], ['11.05', 'Liverpool'], ['8.50', 'Bristol']];
const MOTIVES = ['debts', 'creditors', 'rent'];
const TITLES = ['Death in {room}', 'A Dark Night in {room}', 'Found in {room}'];
const HAIR = ['#5a3a22', '#3a2a22', '#2a2024', '#c7862e', '#8a8178', '#c2542a', '#7a4a2a'];

// A grievance the keeper has of his own: the trap. It is his, and he is the one dead.
const GRIEVANCES = [
  { word: 'wages', tell: 'print: $thing three months unpaid.', say: 'The unpaid wages are' },
  { word: 'pension', tell: 'print: his $thing refused.', say: 'The refused pension is' }
];

// Others on the household list who are not in the room.
const ABSENT = [['groom', MEN], ['coachman', MEN], ['page', MEN], ['laundress', WOMEN], ['scullery maid', WOMEN], ['nurse', WOMEN]];

const WITNESSES = {
  housemaid: {
    trade: 'housemaid', names: WOMEN, noun: 'woman', sign: 'Cap and apron. A ring of {house keys} at her belt.', short: 'Cap, apron and house keys',
    extra: ['house keys'], carry: 'lamp', carryTell: 'Her $thing is lit, its glass unbroken.',
    look: { body: 'dress', paint: C.black, apron: true, hat: 'mob', hatBand: C.teal, hair: 'bun' }
  },
  footman: {
    trade: 'footman', names: MEN, noun: 'man', sign: 'Livery and white gloves.', short: 'Livery and white gloves',
    extra: [], carry: 'lantern', carryTell: 'His $thing is lit, its glass unbroken.',
    look: { body: 'coat', paint: C.plum, legs: '#3b3f4a', collar: 'bow', collarColor: C.white, hair: 'part' }
  },
  cook: {
    trade: 'cook', names: WOMEN, noun: 'woman', sign: 'Apron and rolled sleeves, flour to the elbows.', short: 'Apron, rolled sleeves and flour',
    extra: [], carry: 'rolling pin', carryTell: 'Her $thing is white with flour from end to end.',
    look: { body: 'dress', paint: '#8a5a6a', apron: true, hat: 'mob', hatBand: C.red, hair: 'curls', head: 'wide' }
  }
};

// A tool set: [word, the mark it leaves, how it is told]; the decoy adds how it is seen
// to be untouched, and that same remark in short for the end screen.
const SETTINGS = {
  glasshouse: {
    rooms: ['the Glasshouse', 'the Orchid House', 'the Palm House'],
    trade: 'gardener', listed: 'print: $name, head $key:', tradeSign: 'Soil under his nails.', tradeShort: 'Soil under his nails',
    keeperLook: { body: 'shirt', paint: C.green, legs: '#6a5034' },
    belongings: [
      ['watch', 'In his waistcoat, a {watch} engraved:', 'Thirty years among the roses'],
      ['snuffbox', 'In his apron, a {snuffbox} engraved:', 'For the best marrow in the county']
    ],
    roster: { title: 'Wage book on the bench', noun: 'wage book' },
    witnesses: ['housemaid', 'footman'],
    loot: [
      ['Ghost Orchid', 'a white orchid, its roots wrapped in wet newspaper', 'a white orchid', 'the Society'],
      ['Black Tulip', 'a dark tulip, its bulb wrapped in wet newspaper', 'a dark tulip', 'the Society'],
      ['Blue Lotus', 'a blue flower, its stem bound in wet moss', 'a blue flower', 'the Gardens']
    ],
    stand: { title: 'The empty stand', noun: 'stand', tell: 'A ring of fresh soil where a pot stood. On the brass plate: | cut: $thing. Not to be moved.' },
    exit: 'garden door',
    tools: [
      {
        title: 'Tools by the garden door', where: 'by the garden door',
        means: ['spade', 'crescent-shaped gash', 'A $thing, its curved blade wiped clean but dark at the socket.'],
        decoy: ['shears', 'a straight cut', 'On a hook, $thing:', 'straight blades, thick with dust.', 'Straight blades thick with dust']
      },
      {
        title: 'Tools by the garden door', where: 'by the garden door',
        means: ['hoe', 'narrow straight gash', 'A $thing, its narrow blade wiped clean but dark at the socket.'],
        decoy: ['rake', 'a row of small punctures', 'Beside it, a $thing:', 'its teeth hung with cobweb.', 'Teeth hung with cobweb']
      }
    ]
  },
  library: {
    rooms: ['the Long Library', 'the Map Room', 'the Book Room'],
    trade: 'librarian', listed: 'print: $name, $key:', tradeSign: 'Ink on his fingers and a pencil behind his ear.', tradeShort: 'Ink on his fingers',
    keeperLook: { body: 'coat', paint: '#7a5a3a', legs: '#3b3f4a', collar: 'bow', collarColor: C.teal, specs: true },
    belongings: [
      ['watch', 'In his waistcoat, a {watch} engraved:', 'Forty years among the shelves'],
      ['snuffbox', 'In his pocket, a {snuffbox} engraved:', 'From the Antiquarian Society']
    ],
    roster: { title: 'Household book on the table', noun: 'household book' },
    witnesses: ['housemaid', 'footman'],
    loot: [
      ['Marrow Psalter', 'a heavy old book, wrapped in a shawl', 'a heavy old book', 'the Museum'],
      ['Thorne Atlas', 'a great flat book of maps, wrapped in a shawl', 'a book of maps', 'the Museum'],
      ['Black Herbal', 'a small thick book, wrapped in a shawl', 'a small thick book', 'the Museum']
    ],
    stand: { title: 'The bare reading stand', noun: 'reading stand', tell: 'A clean square in the dust where a book lay. On the brass plate: | cut: $thing. Not to be moved.' },
    exit: 'hall door',
    tools: [
      {
        title: 'Fire irons by the hall door', where: 'by the hall door',
        means: ['poker', 'long straight welt', 'A $thing, wiped clean but dark at the tip.'],
        decoy: ['tongs', 'a pair of pinch marks', 'On a hook, the $thing:', 'cold, and furred with soot.', 'Cold and furred with soot']
      },
      {
        title: 'The shelf by the hall door', where: 'on the shelf by the hall door',
        means: ['bookend', 'square-cornered wound', 'A bronze $thing, wiped clean but tacky at one corner.'],
        decoy: ['paperweight', 'a round dent', 'Beside it, a glass $thing', 'under an even coat of dust.', 'Under an even coat of dust']
      }
    ]
  },
  gallery: {
    rooms: ['the Plate Room', 'the Silver Pantry', 'the Trophy Room'],
    trade: 'butler', listed: 'print: $name, $key:', tradeSign: 'Silver polish on his cuffs.', tradeShort: 'Silver polish on his cuffs',
    keeperLook: { body: 'coat', paint: C.black, legs: '#4a4652', collar: 'bow', collarColor: C.white },
    belongings: [
      ['watch', 'In his waistcoat, a {watch} engraved:', 'For faithful service'],
      ['snuffbox', 'In his waistcoat, a {snuffbox} engraved:', 'From a grateful house']
    ],
    roster: { title: 'Plate book on the table', noun: 'plate book' },
    witnesses: ['cook', 'housemaid', 'footman'],
    loot: [
      ['Harvest Cup', 'something silver and two-handled, wrapped in a tablecloth', 'a silver cup', 'the bank'],
      ['Kelling Salver', 'something flat and silver, wrapped in a tablecloth', 'a silver tray', 'the bank'],
      ['Regatta Bowl', 'something round and silver, wrapped in a tablecloth', 'a silver bowl', 'the bank']
    ],
    stand: { title: 'The bare velvet stand', noun: 'velvet stand', tell: 'A ring pressed into the velvet where something stood. On the brass plate: | cut: $thing. Not to be moved.' },
    exit: 'yard door',
    tools: [
      {
        title: 'The shelf by the yard door', where: 'on the shelf by the yard door',
        means: ['candlestick', 'round dent', 'A heavy $thing, wiped clean but dark in the fluting.'],
        decoy: ['carving knife', 'a clean cut', 'Beside it, a $thing in its case:', 'bright, and bedded in dust.', 'Bright and bedded in dust']
      },
      {
        title: 'The shelf by the yard door', where: 'on the shelf by the yard door',
        means: ['decanter', 'ring-shaped bruise', 'A cut-glass $thing, rinsed but pink at the base.'],
        decoy: ['corkscrew', 'a small deep puncture', 'On a hook, a $thing', 'filmed with dust.', 'Filmed with dust']
      }
    ]
  }
};

export const SETTING_IDS = Object.keys(SETTINGS);

const initials = (name) => name.split(' ').map((p) => p[0] + '.').join('');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// One attempt at the case for a date. Pure: the same date and attempt give the same case.
function build(date, attempt) {
  const rnd = seeded(`penny-tableau|${COMPOSER}|${date}|${attempt}`);
  const pick = (list) => list[Math.floor(rnd() * list.length)];
  const chance = (p) => rnd() < p;
  const shuffled = (list) => {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };

  const settingId = pick(SETTING_IDS);
  const set = SETTINGS[settingId];
  const witness = WITNESSES[pick(set.witnesses)];
  const tools = pick(set.tools);
  const loot = pick(set.loot);
  const grievance = pick(GRIEVANCES);
  const motive = pick(MOTIVES);
  const belonging = pick(set.belongings);
  const absent = pick(ABSENT);
  const train = pick(TRAINS);
  const thiefIsWoman = chance(0.4);
  const ownerIsWoman = chance(0.6);
  const engraved = chance(0.7); // the keeper's belonging carries his initials
  const labelled = chance(0.4); // the bag has a luggage label, not a stamped clasp
  const room = pick(set.rooms);

  // Five people with different first names; the thief and the owner are family.
  const surnames = shuffled(SURNAMES);
  const firsts = { men: shuffled(MEN), women: shuffled(WOMEN) };
  const first = (women) => (women ? firsts.women : firsts.men).pop();
  const keeper = `${first(false)} ${surnames[0]}`;
  const seen = `${first(witness.names === WOMEN)} ${surnames[1]}`;
  const away = `${first(absent[1] === WOMEN)} ${surnames[2]}`;
  const thief = `${first(thiefIsWoman)} ${surnames[3]}`;
  const owner = `${first(ownerIsWoman)} ${surnames[3]}`;
  const people = [keeper, seen, away, thief, owner];

  const t = thiefIsWoman ? { he: 'she', him: 'her', his: 'her', noun: 'woman' } : { he: 'he', him: 'him', his: 'his', noun: 'man' };
  const relation = ownerIsWoman ? 'aunt' : 'uncle';
  const [means, mark, meansTell] = tools.means;
  const [decoy, decoyMark, decoyTell, decoyUntouched, decoyShort] = tools.decoy;
  const [lootName, lootVeiled, lootShort, lootBound] = loot;
  const label = `${thief[0]}. ${surnames[3]}`;

  const words = {};
  for (const p of people) words[p] = 'person';
  const things = [means, decoy, lootName, motive, grievance.word, witness.carry, ...witness.extra];
  if (engraved) things.push(belonging[0]);
  for (const w of things) words[w] = 'thing';

  const body = [
    ['fits', 'body', set.trade, set.tradeSign],
    ['dead', 'body', null],
    ['sign', mark, 'One $mark behind the ear.']
  ];
  if (engraved) body.push(['tag', 'body', { initials: initials(keeper) }, `${belonging[1]} | cut: $name ${belonging[2]}`]);

  const exhibits = [
    { id: 'body', title: 'The man on the floor', facts: body },
    {
      id: 'roster', title: set.roster.title,
      facts: [
        ['listed', keeper, set.trade, set.listed],
        ['wants', keeper, grievance.word, grievance.tell],
        ['listed', seen, witness.trade, 'print: $name, $key.'],
        ['listed', away, absent[0], 'print: $name, $key.']
      ]
    },
    {
      id: 'witness', title: `The ${witness.noun} in the doorway`,
      facts: [
        ['fits', 'witness', witness.trade, witness.sign],
        ['untouched', witness.carry, witness.carryTell]
      ]
    },
    {
      id: 'thief', title: `The young ${t.noun} by the ${set.exit}`,
      facts: [[
        'lead', 'thief', 'dressed to leave tonight',
        `${thiefIsWoman ? 'Travelling cloak, fastened to leave. In her glove' : 'Travelling coat, buttoned to leave. In the pocket'}, a third-class ticket: | print: The ${train[0]} to ${train[1]}. Tonight only.`
      ]]
    },
    {
      id: 'letter', title: thiefIsWoman ? 'Letter in her sleeve' : 'Letter in his breast pocket',
      facts: [
        ['tag', 'thief', { full: thief }, 'hand: $name:'],
        ['wants', thief, motive, `hand: I have paid your $thing for the last time. The {${lootName}} goes to ${lootBound} on Friday. Your ${relation}, {${owner}}.`]
      ]
    },
    {
      id: 'bag', title: `Carpet bag at ${t.his} feet`,
      facts: [
        labelled
          ? ['tag', 'thief', { abbr: label }, 'On the handle, a luggage label: | print: $name, passenger.']
          : ['tag', 'thief', { initials: initials(thief) }, 'The clasp is stamped: | cut: $name'],
        ['has', 'thief', lootName, `Inside, $thing~[${lootVeiled}].`]
      ]
    },
    { id: 'stand', title: set.stand.title, facts: [['taken', lootName, set.stand.tell]] },
    {
      id: 'tools', title: tools.title,
      facts: [
        ['makes', means, mark, meansTell],
        ['makes', decoy, decoyMark, decoyTell],
        ['untouched', decoy, decoyUntouched]
      ]
    }
  ];

  const panels = [
    { id: 'cast', title: 'The cast', parts: ['On the floor, ', ['person', keeper, 'body'], '. In the doorway, ', ['person', seen, 'witness'], `. By the ${set.exit}, `, ['person', thief, 'thief'], '.'] },
    {
      id: 'story', title: 'What happened',
      parts: [['person', thief, 'culprit'], ' struck ', ['person', keeper, 'victim'], ' with the ', ['thing', means, 'means'],
        ` when the ${set.trade} caught ${t.him} stealing the `, ['thing', lootName, 'loot'], ` to pay ${t.his} `, ['thing', motive, 'motive'], '.']
    }
  ];

  // The explanation shown at the end. The gate checks it rests on exhibits the proof uses.
  const path = [
    {
      how: engraved ? 'Initials' : 'Trade', from: ['body', 'roster'], gives: [0, 4],
      say: engraved
        ? `The ${belonging[0]} says ${initials(keeper)} and the ${set.roster.noun} has one ${initials(keeper)}: the man on the floor is ${keeper}, the ${set.trade}.`
        : `${set.tradeShort}: the man on the floor is the ${set.trade}, ${keeper}.`
    },
    { how: 'Trade', from: ['witness', 'roster'], gives: [1], say: `${witness.short}: the ${witness.noun} in the doorway is the ${witness.trade}, ${seen}.` },
    {
      how: 'A letter in the pocket', from: ['letter', 'bag'], gives: [2],
      say: `The letter ${thiefIsWoman ? 'in her sleeve' : 'in his pocket'} is to ${thief}, and ${labelled ? `the label on ${t.his} bag reads ${label}.` : `${t.his} bag is stamped ${initials(thief)}`}`
    },
    { how: 'Fit', from: ['body', 'tools', 'witness'], gives: [5], say: `A ${mark} fits the ${means}, not the ${decoy} or the ${witness.carry}.` },
    {
      how: 'Trace', from: ['stand', 'bag', 'thief'], gives: [6, 3],
      say: `The ${lootName} is gone from its ${set.stand.noun} and ${lootShort} is in ${t.his} bag, with a ticket out tonight: ${thief} is the thief the ${set.trade} caught.`
    },
    { how: 'Motive', from: ['letter', 'roster'], gives: [7], say: `${cap(t.his)} ${relation} will not pay ${t.his} ${motive} again, and the ${lootName} was about to leave the house.` }
  ];
  const traps = [
    { word: grievance.word, from: ['roster'], against: ['bag', 'letter'], say: `${grievance.say} the ${set.trade}'s. He was the one who caught the thief.` },
    { word: decoy, from: ['tools'], against: ['body'], say: `${decoyShort}: the ${decoy} did not make a ${mark}.` }
  ];
  const tips = [
    `Somebody here is dressed to leave. Ask what ${t.he} is taking with ${t.him}.`,
    `Hold the wound against the two things ${tools.where}, then the empty ${set.stand.noun} against the bag.`
  ];

  // How the dolls are dressed. Their trade fixes the costume; the rest is drawn by lot.
  const face = () => ({ skin: pick(SKIN), hairColor: pick(HAIR), head: pick(['egg', 'egg', 'ball', 'long']) });
  const scene = {
    kind: 'theft',
    setting: settingId,
    mirror: chance(0.5),
    keeper: { look: { ...set.keeperLook, ...face(), hair: pick(['bald', 'crop', 'part']), whiskers: pick(['beard', 'walrus', 'mutton', 'handlebar', null]) } },
    witness: { carry: witness.carry, look: { ...face(), ...witness.look } },
    thief: {
      look: thiefIsWoman
        ? { ...face(), body: 'dress', paint: pick([C.mustard, '#4d5f8a', C.red, C.tealDark]), hat: 'plume', hatColor: pick(['#5b4636', C.navy, C.redDark]), hatBand: C.mustard, hair: 'bob' }
        : { ...face(), body: 'coat', paint: pick([C.mustard, '#4d5f8a', '#8a7a4a', C.tealDark]), legs: '#5b4636', collar: pick(['bow', 'tie']), collarColor: pick([C.red, C.teal]), hat: pick(['boater', 'bowler', 'top']), hatBand: C.red, hair: pick(['part', 'crop']), whiskers: pick(['pencil', 'handlebar', null]) }
    },
    bag: pick([C.plum, '#7b5235', C.tealDark, C.redDark]),
    tools: [means, decoy]
  };

  return {
    id: `day-${date}`,
    title: pick(TITLES).replace('{room}', room),
    where: `${pick(HALLS)}, ${pick(HOURS)}`,
    scene,
    composed: { date, attempt, crime: 'theft', setting: settingId },
    words,
    exhibits,
    panels,
    path,
    traps,
    tips
  };
}

// What the gate makes of a composed case: the same checks a hand-written case must pass.
export function gate(c) {
  return lintCase(c, scenePins(c.scene)).errors;
}

const made = new Map();

// The case for a date: the first attempt the gate lets through.
export function composeDay(date) {
  if (made.has(date)) return made.get(date);
  let refused = [];
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    const c = told(build(date, attempt));
    refused = gate(c);
    if (!refused.length) {
      made.set(date, c);
      return c;
    }
  }
  throw new Error(`No case for ${date} passed the gate in ${ATTEMPTS} attempts. The last was refused: ${refused.join(' ')}`);
}
