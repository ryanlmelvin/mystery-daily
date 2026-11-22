// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// The composer. It builds a whole case from a date: the cast, the facts and their
// tellings, the two plates and the scene. The explanation shown at the end is read off
// the proof (explain.js). Then the case goes through the same gate as a hand-written one
// (lint.js, which runs the telling and the proof); a refused case is tried again with the
// next salt, never patched.
//
// It knows three kinds of crime, and takes them turn about by date:
//
//   the interrupted theft   someone is caught by the keeper of the thing being stolen,
//                           strikes the keeper down, and still has the thing
//                           (glasshouse, library, plate room)
//   the wrong glass         a poison is put in a bottle meant for one man, and another,
//                           who kept helping himself to it, drinks it (dressing room,
//                           kitchen, ship's cabin)
//
//   the mourning brooch     an assault at a memorial supper, then a theft from the body
//                           (station parlour, assembly rooms, hotel)
//
// Within a crime the parts move. No doll's place, pose or face says who did it: in a
// theft it may be the visitor by the door or the servant in the doorway; in the wrong
// glass, the one at the door or the one across the room. The weapon may be either tool on
// the wall or the thing the guilty one is carrying. A chemist's receipt may name the
// poison that was used, or one that sits sealed on the shelf while the one that was used
// stands open beside it. What proved the case one day is a red herring another.
//
// What a player would notice coming round again is not left to chance: the setting, and
// in it the thing stolen, the pair of tools, the poison and the title, are taken in
// rotation, so a setting returns every ninth day with its contents moved on. Everything
// else is chosen by a generator seeded with the date. Either way a date always gives the
// same case. Changing a list or the order of the draws changes every composed case; bump
// COMPOSER when that is intended.

import { MOURNING_ROOMS, buildBrooch } from './brooch.js';
import { told } from './tell.js';
import { lintCase } from './lint.js';
import { explain } from './explain.js';
import { scenePins } from './art/scenes.js';
import { C, SKIN } from './art/kit.js';

export const COMPOSER = 5;
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
const MOODS = ['shock', 'shock', 'shifty', 'stern', 'calm'];

// ---------- lists for the interrupted theft ----------

// A grievance the keeper has of his own: a trap. It is his, and he is the one dead.
const GRIEVANCES = [
  { word: 'wages', tell: 'print: $thing three months unpaid.' },
  { word: 'pension', tell: 'print: his $thing refused.' }
];

// Others on the household list who are not in the room.
const ABSENT = [['groom', MEN], ['coachman', MEN], ['page', MEN], ['laundress', WOMEN], ['scullery maid', WOMEN], ['nurse', WOMEN]];

// The servant in the doorway: what they carry (`held`), the mark it would leave, and how
// it reads when it has not been used (`idle`) and when it has (`used`).
const SERVANTS = {
  housemaid: {
    trade: 'housemaid', women: true, noun: 'woman', sign: 'Cap and apron.',
    carry: 'lamp', a: 'One', mark: 'broad flat bruise', held: 'In her hand, a $thing,', idle: 'lit, its glass unbroken.', used: 'out, its heavy base dark and tacky.',
    pocket: 'In her apron pocket', under: 'Under her apron',
    look: { body: 'dress', paint: C.black, apron: true, hat: 'mob', hatBand: C.teal, hair: 'bun' }
  },
  footman: {
    trade: 'footman', women: false, noun: 'man', sign: 'Livery and white gloves.',
    carry: 'lantern', a: 'One', mark: 'square bruise', held: 'In his hand, a $thing,', idle: 'lit, its glass unbroken.', used: 'out, one corner of its frame dark and tacky.',
    pocket: 'In his coat pocket', under: 'Under his coat',
    look: { body: 'coat', paint: C.plum, legs: '#3b3f4a', collar: 'bow', collarColor: C.white, hair: 'part' }
  },
  cook: {
    trade: 'cook', women: true, noun: 'woman', sign: 'Apron and rolled sleeves, flour to the elbows.',
    carry: 'rolling pin', a: 'One', mark: 'long round bruise', held: 'In her fist, a $thing,', idle: 'white with flour from end to end.', used: 'floured but for one end, dark and tacky.',
    pocket: 'In her apron pocket', under: 'Under her apron',
    look: { body: 'dress', paint: '#8a5a6a', apron: true, hat: 'mob', hatBand: C.red, hair: 'curls', head: 'wide' }
  }
};

// What the visitor by the door carries.
const STICKS = {
  man: { word: 'cane', a: 'One', mark: 'thin straight welt', held: 'On his arm, a $thing,', idle: 'its varnish unmarked.', used: 'its silver knob dark and tacky.' },
  woman: { word: 'parasol', a: 'One', mark: 'thin straight welt', held: 'In her hand, a furled $thing,', idle: 'its silk unmarked.', used: 'its ferrule dark and tacky.' }
};

// Every tool can be the weapon or a bystander. Each says the mark it would leave and how
// it reads either way.
const TOOLS = {
  spade: { a: 'One', mark: 'crescent-shaped gash', used: 'A $thing, its curved blade wiped clean but dark at the socket.', idle: 'A $thing, its curved blade caked in dry earth.' },
  shears: { a: 'A', mark: 'pair of narrow stabs', used: 'On a hook, $thing: the straight blades wiped, but tacky at the pivot.', idle: 'On a hook, $thing: straight blades, thick with dust.' },
  hoe: { a: 'One', mark: 'narrow straight gash', used: 'A $thing, its narrow blade wiped clean but dark at the socket.', idle: 'A $thing, its narrow blade caked in dry earth.' },
  rake: { a: 'A', mark: 'row of small punctures', used: 'Beside it, a $thing, its teeth wiped but one bent and dark.', idle: 'Beside it, a $thing, its teeth hung with cobweb.' },
  poker: { a: 'One', mark: 'long straight welt', used: 'A $thing, wiped clean but dark at the tip.', idle: 'A $thing, grey with ash to the handle.' },
  tongs: { a: 'A', mark: 'pair of pinch marks', used: 'On a hook, the $thing: wiped, but tacky at the jaws.', idle: 'On a hook, the $thing: cold, and furred with soot.' },
  bookend: { a: 'One', mark: 'square-cornered wound', used: 'A bronze $thing, wiped clean but tacky at one corner.', idle: 'A bronze $thing under an even coat of dust.' },
  paperweight: { a: 'One', mark: 'round dent', used: 'Beside it, a glass $thing, rinsed but pink in its flaw.', idle: 'Beside it, a glass $thing under an even coat of dust.' },
  candlestick: { a: 'One', mark: 'ridged dent', used: 'A heavy $thing, wiped clean but dark in the fluting.', idle: 'A heavy $thing, its fluting bright and dusted.' },
  'carving knife': { a: 'One', mark: 'clean deep cut', used: 'Beside it, a $thing out of its case, wiped but dark at the hilt.', idle: 'Beside it, a $thing in its case: bright, and bedded in dust.' },
  decanter: { a: 'One', mark: 'ring-shaped bruise', used: 'A cut-glass $thing, rinsed but pink at the base.', idle: 'A cut-glass $thing, full, its stopper dusty.' },
  corkscrew: { a: 'One', mark: 'small deep puncture', used: 'On a hook, a $thing, wiped but dark in the worm.', idle: 'On a hook, a $thing filmed with dust.' }
};

const SETTINGS = {
  glasshouse: {
    rooms: ['the Fernery', 'the Orchid House', 'the Palm House'],
    trade: 'gardener', listed: 'print: $name, head $key', tradeSign: 'Soil under his nails.',
    keeperLook: { body: 'shirt', paint: C.green, legs: '#6a5034' },
    belongings: [
      ['watch', 'In his waistcoat, a {watch} engraved:', 'Thirty years among the roses'],
      ['snuffbox', 'In his apron, a {snuffbox} engraved:', 'For the best marrow in the county']
    ],
    roster: 'Wage book on the bench',
    servants: ['housemaid', 'footman'],
    loot: [
      ['Ghost Orchid', 'a white orchid, its roots wrapped in wet newspaper', 'the Society'],
      ['Black Tulip', 'a dark tulip, its bulb wrapped in wet newspaper', 'the Society'],
      ['Blue Lotus', 'a blue flower, its stem bound in wet moss', 'the Gardens']
    ],
    stand: { title: 'The empty stand', tell: 'A ring of fresh soil where a pot stood. On the brass plate: | cut: $thing.' },
    exit: 'garden door',
    tools: [['spade', 'shears'], ['hoe', 'rake']],
    toolTitles: ['Tools by the garden door', 'Tools by the garden door']
  },
  library: {
    rooms: ['the Long Library', 'the Map Room', 'the Book Room'],
    trade: 'librarian', listed: 'print: $name, $key', tradeSign: 'Ink on his fingers and a pencil behind his ear.',
    keeperLook: { body: 'coat', paint: '#7a5a3a', legs: '#3b3f4a', collar: 'bow', collarColor: C.teal, specs: true },
    belongings: [
      ['watch', 'In his waistcoat, a {watch} engraved:', 'Forty years among the shelves'],
      ['snuffbox', 'In his pocket, a {snuffbox} engraved:', 'From the Antiquarian Society']
    ],
    roster: 'Household book on the table',
    servants: ['housemaid', 'footman'],
    loot: [
      ['Marrow Psalter', 'a heavy old book, wrapped in a shawl', 'the Museum'],
      ['Thorne Atlas', 'a great flat book of maps, wrapped in a shawl', 'the Museum'],
      ['Black Herbal', 'a small thick book, wrapped in a shawl', 'the Museum']
    ],
    stand: { title: 'The bare reading stand', tell: 'A clean square in the dust where a book lay. On the brass plate: | cut: $thing.' },
    exit: 'hall door',
    tools: [['poker', 'tongs'], ['bookend', 'paperweight']],
    toolTitles: ['Fire irons by the hall door', 'The shelf by the hall door']
  },
  gallery: {
    rooms: ['the Plate Room', 'the Silver Pantry', 'the Trophy Room'],
    trade: 'butler', listed: 'print: $name, $key', tradeSign: 'Silver polish on his cuffs.',
    keeperLook: { body: 'coat', paint: C.black, legs: '#4a4652', collar: 'bow', collarColor: C.white },
    belongings: [
      ['watch', 'In his waistcoat, a {watch} engraved:', 'For faithful service'],
      ['snuffbox', 'In his waistcoat, a {snuffbox} engraved:', 'From a grateful house']
    ],
    roster: 'Plate book on the table',
    servants: ['cook', 'housemaid', 'footman'],
    loot: [
      ['Harvest Cup', 'something silver and two-handled, wrapped in a tablecloth', 'the bank'],
      ['Kelling Salver', 'something flat and silver, wrapped in a tablecloth', 'the bank'],
      ['Regatta Bowl', 'something round and silver, wrapped in a tablecloth', 'the bank']
    ],
    stand: { title: 'The bare velvet stand', tell: 'A ring pressed into the velvet where something stood. On the brass plate: | cut: $thing.' },
    exit: 'yard door',
    tools: [['candlestick', 'carving knife'], ['decanter', 'corkscrew']],
    toolTitles: ['The shelf by the yard door', 'The shelf by the yard door']
  }
};

// ---------- lists for the wrong glass ----------

// Every poison can be the one used or a decoy, and can turn up four ways: named on a
// chemist's receipt, standing on the shelf (sealed, or opened), as an emptied container
// in a pocket, or as a trace on someone.
const POISONS = {
  'prussic acid': { receipt: '$Thing, one phial.', kept: 'phial', empty: 'an empty phial', idle: ['A phial of $thing,', 'sealed with wax.'], used: 'A phial of $thing, its wax broken and half gone.', trace: 'a smell of bitter almonds on {his} gloves' },
  arsenic: { receipt: '$Thing, two ounces.', kept: 'packet', empty: 'an empty paper packet', idle: ['A packet of $thing,', "still tied with the chemist's string."], used: 'A packet of $thing, torn open, white powder spilt beside it.', trace: 'white powder on {his} cuff' },
  strychnine: { receipt: '$Thing, ten grains.', kept: 'phial', empty: 'an empty phial', idle: ['A phial of $thing,', 'its cork still wired down.'], used: 'A phial of $thing, its wire cut and the cork out.', trace: 'a cut loop of cork-wire in {his} pocket' },
  laudanum: { receipt: '$Thing, one phial.', kept: 'phial', empty: 'an empty phial', idle: ['A phial of $thing,', 'full to the cork.'], used: 'A phial of $thing, uncorked and two thirds gone.', trace: 'a brown-stained cork in {his} pocket' },
  'rat poison': { receipt: '$Thing, one tin.', kept: 'tin', empty: 'an empty tin', idle: ['A tin of $thing,', 'its lid rusted shut.'], used: 'A tin of $thing, its lid prised up and grey powder spilt.', trace: 'grey powder on {his} cuff' },
  'weed-killer': { receipt: '$Thing, one can.', kept: 'can', empty: 'a drained flask', idle: ['A can of $thing,', 'its cap sealed with red wax.'], used: 'A can of $thing, the red wax cracked and the cap loose.', trace: 'crumbs of red wax under {his} fingernails' }
};
const MARK = 'foam on his lips';

// In each setting: the one the bottle is for (`lead`), the one who wants his place
// (`second`, at the door), the one who drinks it (`drinker`), a `fourth` at the left, and
// someone on the list who is not in the room. Either the second or the fourth did it.
const SWITCHES = {
  theatre: {
    rooms: ['the Alhambra', 'the Empire', 'the Pavilion'],
    titles: ['Curtain at {room}', 'Last Call at {room}', 'A Bitter Cup at {room}'],
    where: ['A dressing room, ten minutes before the second act', 'A dressing room, just after the interval'],
    roster: 'Playbill on the wall',
    heads: ["Tonight: The Tyrant's Supper.", 'Tonight: The Last Emperor.', 'Tonight: A Throne for Two.'],
    lead: { role: 'the King', sign: 'Robe and {crown}, powdered for the stage.', plate: 'In the crown', title: 'The gentleman in the crown', look: { body: 'robe', paint: C.red, trim: C.white, hat: 'crown', hair: 'curls', head: 'wide' } },
    second: { role: 'understudy', title: 'The young man at the door' },
    drinker: { role: 'prompter', sign: 'A prompt-book under his arm,', look: { body: 'shirt', paint: '#8a5630', legs: '#3b3f4a' } },
    fourth: {
      role: 'wardrobe', women: true, sign: 'Pincushion at her wrist, a half-hemmed cloak over her arm.', plate: 'With the pins', title: 'The woman with the pins', carry: 'cloak', keeps: 'her work-basket',
      grudge: (lede, name, by) => `${lede}, a notice: | hand: ${name}: not required after Saturday. ${by}`,
      look: { body: 'dress', paint: C.teal, hair: 'bun', specs: true }
    },
    absent: { role: 'call-boy', women: false },
    vessel: { word: 'tonic', hue: 'green', colour: C.green, title: 'The green bottle', label: 'print: Throat {tonic}. For Mr $name ONLY. | A bitter smell under the syrup.' },
    threat: (v) => `In his sleeve, a note: | hand: ${v}: touch my {tonic} again and you are sacked.`,
    coveted: { word: 'crown', title: 'Script on the chair', tell: "The King's lines, all underlined. On the cover: | hand: The $thing at last. Tonight." },
    shelf: { title: 'The dressing table' }
  },
  kitchen: {
    rooms: ['the Golden Hind', 'the Grand Hotel', 'the Blue Boar'],
    titles: ['Last Orders at {room}', 'A Bitter Cup at {room}', 'Service at {room}'],
    where: ['The kitchen, an hour before the dinner service', 'The kitchen, just after the fish course'],
    roster: 'Rota on the wall',
    heads: ["Tonight's brigade.", 'Dinner service.', 'Saturday, both sittings.'],
    lead: { role: 'chef', sign: 'Tall white hat, a carving steel at his belt.', plate: 'In the tall hat', title: 'The gentleman in the tall hat', look: { body: 'coat', paint: C.white, legs: '#4a4652', hat: 'toque' } },
    second: { role: 'sous-chef', title: 'The young man at the door' },
    drinker: { role: 'scullion', sign: 'His hands red from the sink,', look: { body: 'shirt', paint: '#6f7f8a', legs: '#3b3f4a' } },
    fourth: {
      role: 'waiter', women: false, sign: 'Tailcoat and white gloves, a tray in both hands.', plate: 'With the tray', title: 'The man with the tray', carry: 'tray', keeps: 'his waistcoat',
      grudge: (lede, name, by) => `${lede}, a note: | hand: ${name}: you are finished here after tonight. ${by}`,
      look: { body: 'coat', paint: C.black, legs: '#3b3f4a', collar: 'bow', collarColor: C.white, hair: 'part' }
    },
    absent: { role: 'pastry-cook', women: true },
    vessel: { word: 'brandy', hue: 'brown', colour: '#8a5630', title: 'The brown bottle', label: 'print: Cooking {brandy}. For Mr $name ONLY. | A bitter smell under the spirit.' },
    threat: (v) => `In his apron, a note: | hand: ${v}: touch my {brandy} again and you are out.`,
    coveted: { word: 'kitchen', title: 'Recipe book on the chair', tell: "The chef's sauces, all copied out. On the cover: | hand: The $thing is mine at last. Tonight." },
    shelf: { title: 'The pantry table' }
  },
  cabin: {
    rooms: ['the Kittiwake', 'the Marigold', 'the Petrel'],
    titles: ['Eight Bells aboard {room}', 'A Bitter Cup aboard {room}', 'Becalmed aboard {room}'],
    where: ["The captain's cabin, the first night out", "The captain's cabin, two days from port"],
    roster: 'Watch bill on the wall',
    heads: ["Ship's company.", 'Watch bill, outward bound.', 'Officers and hands.'],
    lead: { role: 'captain', sign: 'Gold braid on his cuffs and a peaked cap.', plate: 'In the peaked cap', title: 'The gentleman in the peaked cap', look: { body: 'coat', paint: C.navy, legs: '#2f3550', hat: 'peaked', hatColor: C.navy, hatBand: C.mustard } },
    second: { role: 'mate', title: 'The man at the door' },
    drinker: { role: 'steward', sign: 'A napkin still over his arm,', look: { body: 'coat', paint: C.white, legs: '#3b3f4a' } },
    fourth: {
      role: 'bosun', women: false, sign: "A tarred pigtail and a bosun's whistle on a cord.", plate: 'With the whistle', title: 'The man with the whistle', carry: null, keeps: 'his jacket',
      grudge: (lede, name, by) => `${lede}, a note: | hand: ${name}: you are disrated, and go ashore at the next port. ${by}`,
      look: { body: 'shirt', paint: C.navy, legs: '#3b3f4a', hat: 'flat', hatColor: '#3b3f4a' }
    },
    absent: { role: 'cook', women: false },
    vessel: { word: 'rum', hue: 'square', colour: '#c9a15a', title: 'The square bottle', label: 'print: Navy {rum}. For Mr $name ONLY. | A bitter smell under the spirit.' },
    threat: (v) => `In his cuff, a note: | hand: ${v}: tap my {rum} again and I put you ashore.`,
    coveted: { word: 'command', title: 'Log book on the chair', tell: "The captain's courses, copied in another hand. On the flyleaf: | hand: The $thing at last. Tonight." },
    shelf: { title: 'The medicine locker' }
  }
};

export const SETTING_IDS = [...Object.keys(SETTINGS), ...Object.keys(SWITCHES), ...Object.keys(MOURNING_ROOMS)];

// A composed case's id carries the composer's version. A save is kept under the id, so
// when the composer changes and a date gives a different case, the old save is simply
// left behind and never loaded against the new case.
export const composedId = (date) => `day-${date}-c${COMPOSER}`;

const initials = (name) => name.split(' ').map((p) => p[0] + '.').join('');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// The draws for one attempt: a generator seeded with the date, and the ways of using it.
function draws(text) {
  const rnd = seeded(text);
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
  // A face never says who did it: every doll's look, mood included, is drawn by lot.
  const face = () => ({ skin: pick(SKIN), hairColor: pick(HAIR), head: pick(['egg', 'egg', 'ball', 'long']), mood: pick(MOODS) });
  return { pick, chance, shuffled, face };
}

// ---------- the interrupted theft ----------

function buildTheft(date, attempt, turn, { pick, chance, shuffled, face }) {
  // `turn` counts how many times this crime has come round; `visit`, this setting.
  const settingIds = Object.keys(SETTINGS);
  const settingId = settingIds[turn % settingIds.length];
  const visit = Math.floor(turn / settingIds.length);
  const set = SETTINGS[settingId];
  const [tool1, tool2] = set.tools[visit % set.tools.length];
  const [lootName, lootVeiled, lootBound] = set.loot[visit % set.loot.length];
  const motive = MOTIVES[(turn + visit) % MOTIVES.length];
  const room = set.rooms[visit % set.rooms.length];
  const servant = SERVANTS[pick(set.servants)];
  const grievance = chance(0.6) ? pick(GRIEVANCES) : null;
  const belonging = pick(set.belongings);
  const absent = pick(ABSENT);
  const train = pick(TRAINS);
  const visitorIsWoman = chance(0.4);
  const ownerIsWoman = chance(0.6);
  const engraved = chance(0.6); // the keeper's belonging carries his initials
  // The parts that move: who did it, and what with.
  const servantDidIt = chance(0.5);
  const weaponFrom = pick(['tool1', 'tool2', 'carried']);

  // Five people with different first names; the visitor and the owner are family.
  const surnames = shuffled(SURNAMES);
  const firsts = { men: shuffled(MEN), women: shuffled(WOMEN) };
  const first = (women) => (women ? firsts.women : firsts.men).pop();
  const keeper = `${first(false)} ${surnames[0]}`;
  const inDoorway = `${first(servant.women)} ${surnames[1]}`;
  const away = `${first(absent[1] === WOMEN)} ${surnames[2]}`;
  const visitor = `${first(visitorIsWoman)} ${surnames[3]}`;
  const owner = `${first(ownerIsWoman)} ${surnames[3]}`;

  const stick = STICKS[visitorIsWoman ? 'woman' : 'man'];
  const v = visitorIsWoman ? { his: 'her', noun: 'woman' } : { his: 'his', noun: 'man' };
  const thief = servantDidIt ? inDoorway : visitor;
  const relation = ownerIsWoman ? 'aunt' : 'uncle';
  // An innocent servant has had money troubles too, and they are over.
  const settled = MOTIVES[(turn + visit + 1) % MOTIVES.length];

  // The weapon is one of the two tools, or whatever the guilty one is carrying.
  const carried = servantDidIt ? { word: servant.carry, a: servant.a, mark: servant.mark } : stick;
  const weapon = weaponFrom === 'tool1' ? tool1 : weaponFrom === 'tool2' ? tool2 : carried.word;
  const wound = weaponFrom === 'carried' ? carried : TOOLS[weapon];

  const words = {};
  for (const p of [keeper, inDoorway, away, visitor, owner]) words[p] = 'person';
  const things = [tool1, tool2, servant.carry, stick.word, lootName, motive];
  if (!servantDidIt) things.push(settled);
  if (grievance) things.push(grievance.word);
  if (engraved) things.push(belonging[0]);
  for (const w of things) words[w] = 'thing';

  const body = [
    ['fits', 'body', set.trade, set.tradeSign],
    ['dead', 'body', null],
    ['sign', wound.mark, `${wound.a} $mark on his temple.`]
  ];
  if (engraved) body.push(['tag', 'body', { initials: initials(keeper) }, `${belonging[1]} | cut: $name ${belonging[2]}`]);

  const roster = [['listed', keeper, set.trade, `${set.listed}${grievance ? ':' : '.'}`]];
  if (grievance) roster.push(['wants', keeper, grievance.word, grievance.tell]);
  roster.push(['listed', inDoorway, servant.trade, 'print: $name, $key.'], ['listed', away, absent[0], 'print: $name, $key.']);

  // Whatever is in a hand is either the weapon, held by the one who used it, or plainly
  // not used. The same goes for the tools on the wall.
  const inHand = (doll, thing) => (weapon === thing.word
    ? [['has', doll, thing.word, thing.held], ['makes', thing.word, thing.mark, thing.used]]
    : [['untouched', thing.word, `${thing.held} ${thing.idle}`]]);
  const onWall = (tool) => (weapon === tool ? ['makes', tool, TOOLS[tool].mark, TOOLS[tool].used] : ['untouched', tool, TOOLS[tool].idle]);

  const doorway = [['fits', 'doorway', servant.trade, servant.sign], ...inHand('doorway', { ...servant, word: servant.carry })];

  // Dressed for a journey, with a ticket for tonight: coming or going, it does not say.
  const journey = `${visitorIsWoman ? 'Travelling cloak, still fastened. In her glove' : 'Travelling coat, still buttoned. In the pocket'}, a third-class ticket: | print: The ${train[0]}, ${train[1]} line. Tonight only.`;
  const exit = [['lead', 'exit', 'was dressed for a journey', journey], ...inHand('exit', stick)];

  const tools = [onWall(tool1), onWall(tool2)];

  // The same eight exhibits whoever did it: a pocket and a bag, and what is in them.
  // One of the two has the thing and a reason; the other has an answer for how it looks.
  const pocket = servantDidIt
    ? [
      ['wants', 'doorway', motive, "A pawnbroker's letter: | hand: Pay off your $thing by Friday, or I go to the magistrate."],
      ['has', 'doorway', lootName, `${servant.under}, $thing~[${lootVeiled}].`]
    ]
    : [
      ['wants', 'doorway', settled, "A pawnbroker's receipt: | hand: For your $thing:"],
      ['excused', 'doorway', settled, 'hand: paid in full. Nothing owing.']
    ];
  const bag = servantDidIt
    ? [
      ['tag', 'exit', { full: visitor }, `Inside, ${visitorIsWoman ? 'linen, a hairbrush' : 'shirts, a razor'} and a letter: | hand: $name:`],
      ['explained', 'exit', 'was dressed for a journey', `hand: come up by tonight's train, your room is ready. Your ${relation}, {${owner}}.`]
    ]
    : [
      ['has', 'exit', lootName, `Inside, $thing~[${lootVeiled}], and a letter:`],
      ['tag', 'exit', { full: visitor }, 'hand: $name:'],
      ['wants', visitor, motive, `hand: I have paid your $thing for the last time. The {${lootName}} goes to ${lootBound} on Friday. Your ${relation}, {${owner}}.`]
    ];

  const exhibits = [
    { id: 'body', title: 'The man on the floor', facts: body },
    { id: 'roster', title: set.roster, facts: roster },
    { id: 'doorway', title: `The ${servant.noun} in the doorway`, facts: doorway },
    { id: 'pocket', title: servant.pocket, facts: pocket },
    { id: 'exit', title: `The young ${v.noun} by the ${set.exit}`, facts: exit },
    { id: 'bag', title: `Carpet bag at ${v.his} feet`, facts: bag },
    { id: 'stand', title: set.stand.title, facts: [['taken', lootName, set.stand.tell]] },
    { id: 'tools', title: set.toolTitles[visit % set.tools.length], facts: tools }
  ];
  const pins = { body: 'body', roster: 'roster', doorway: 'doorway_head', pocket: 'doorway_chest', exit: 'exit_chest', bag: 'bag', stand: 'stand', tools: 'tools' };

  const panels = [
    { id: 'cast', title: 'The cast', parts: ['On the floor, ', ['person', keeper, 'body'], '. In the doorway, ', ['person', inDoorway, 'doorway'], `. By the ${set.exit}, `, ['person', visitor, 'exit'], '.'] },
    {
      id: 'story', title: 'What happened',
      parts: [['person', thief, 'culprit'], ' struck ', ['person', keeper, 'victim'], ' with the ', ['thing', weapon, 'means'],
        ' when caught stealing the ', ['thing', lootName, 'loot'], ' to pay ', ['thing', motive, 'motive'], '.']
    }
  ];

  // How the dolls are dressed. Their trade fixes the costume; the rest is drawn by lot.
  const scene = {
    kind: 'theft',
    setting: settingId,
    mirror: chance(0.5),
    pins,
    floor: { look: { ...face(), ...set.keeperLook, hair: pick(['bald', 'crop', 'part']), whiskers: pick(['beard', 'walrus', 'mutton', 'handlebar', null]) } },
    doorway: { carry: servant.carry, look: { ...face(), ...servant.look } },
    exit: {
      carry: stick.word,
      look: visitorIsWoman
        ? { ...face(), body: 'dress', paint: pick([C.mustard, '#4d5f8a', C.red, C.tealDark]), hat: 'plume', hatColor: pick(['#5b4636', C.navy, C.redDark]), hatBand: C.mustard, hair: 'bob' }
        : { ...face(), body: 'coat', paint: pick([C.mustard, '#4d5f8a', '#8a7a4a', C.tealDark]), legs: '#5b4636', collar: pick(['bow', 'tie']), collarColor: pick([C.red, C.teal]), hat: pick(['boater', 'bowler', 'top']), hatBand: C.red, hair: pick(['part', 'crop']), whiskers: pick(['pencil', 'handlebar', null]) }
    },
    bag: pick([C.plum, '#7b5235', C.tealDark, C.redDark]),
    tools: [tool1, tool2]
  };
  const where = `${pick(HALLS)}, ${pick(HOURS)}`;
  scene.doorway.look.pose = pick(['hold', 'stand', 'point']);
  scene.exit.look.pose = pick(['hold', 'stand', 'point']);

  return {
    id: composedId(date),
    // Room and wording move on together, so a setting shows nine titles before one returns.
    title: TITLES[Math.floor(visit / set.rooms.length) % TITLES.length].replace('{room}', room),
    where,
    scene,
    composed: { date, attempt, crime: 'theft', setting: settingId, culprit: servantDidIt ? 'doorway' : 'exit', means: weaponFrom === 'carried' ? 'carried' : 'tool' },
    words,
    exhibits,
    panels
  };
}

// ---------- the wrong glass ----------

function buildSwitch(date, attempt, turn, { pick, chance, shuffled, face }) {
  const settingIds = Object.keys(SWITCHES);
  const settingId = settingIds[turn % settingIds.length];
  const visit = Math.floor(turn / settingIds.length);
  const set = SWITCHES[settingId];
  const { lead, second, drinker, fourth, absent, vessel, coveted } = set;
  // The poison used moves on one each time the crime comes round, and each setting sees
  // all six before any returns. The others are drawn from the rest.
  const poisons = Object.keys(POISONS);
  const used = poisons[(turn + 2 * visit) % poisons.length];
  const [spare, other] = shuffled(poisons.filter((x) => x !== used));
  const room = set.rooms[visit % set.rooms.length];
  const head = pick(set.heads);
  // The parts that move: who did it, how the poison shows, and whether the innocent one
  // is carrying a receipt for a poison that was never opened.
  const fourthDidIt = chance(0.5);
  const shows = pick(['receipt', 'shelf', 'pocket']);
  // What the innocent one of the two is carrying: a receipt for a poison that was never
  // opened, a dismissal that was taken back (only the fourth can have one), or nothing.
  const innocent = pick(fourthDidIt ? ['receipt', 'receipt', 'nothing'] : ['receipt', 'receipt', 'mended', 'mended', 'nothing']);
  const decoyReceipt = innocent === 'receipt';

  const surnames = shuffled(SURNAMES);
  const firsts = { men: shuffled(MEN), women: shuffled(WOMEN) };
  const first = (women) => (women ? firsts.women : firsts.men).pop();
  const meant = `${first(false)} ${surnames[0]}`;
  const atDoor = `${first(false)} ${surnames[1]}`;
  const drank = `${first(false)} ${surnames[2]}`;
  const atLeft = `${first(fourth.women)} ${surnames[3]}`;
  const away = `${first(absent.women)} ${surnames[4]}`;
  const poisoner = fourthDidIt ? atLeft : atDoor;
  const f = fourth.women ? 'her' : 'his';
  const by = initials(meant);
  const card = (name) => `${name[0]}. ${name.split(' ')[1]}`;

  const onShelf = shows === 'shelf' ? [used, spare] : [spare, other];
  const words = {};
  for (const p of [meant, atDoor, drank, atLeft, away]) words[p] = 'person';
  for (const w of [...new Set([used, ...onShelf, vessel.word, coveted.word])]) words[w] = 'thing';

  // How the guilty one is tied to the poison: bought it, still has the empty phial, or
  // carries its trace while it stands opened on the shelf.
  const tie = (doll, his, keeps) => {
    if (shows === 'receipt') return [['has', doll, used, `In ${keeps}, a chemist's receipt: | print: ${POISONS[used].receipt}`], ['makes', used, MARK, 'print: Poison.']];
    if (shows === 'pocket') return [['has', doll, used, `In ${keeps}, ${POISONS[used].empty} labelled: | print: $Thing.`], ['makes', used, MARK, 'print: Poison.']];
    return [['has', doll, used, `$thing~[${cap(POISONS[used].trace.replace('{his}', his))}].`]];
  };
  // What the innocent one may be carrying: a receipt for a poison that was never opened.
  const herring = (doll, keeps) => [
    ['has', doll, spare, `In ${keeps}, a chemist's receipt: | print: ${POISONS[spare].receipt}`],
    ['makes', spare, MARK, 'print: Poison.']
  ];

  // The doll at the door. He is always named by a paper he carries.
  const door = [];
  const named = ['tag', 'second', { abbr: card(atDoor) }, 'print: Signed for: $name.'];
  const calling = ['tag', 'second', { abbr: card(atDoor) }, 'In his breast pocket, a card: | print: Mr $name.'];
  if (!fourthDidIt) {
    if (shows === 'receipt') {
      door.push(...tie('second', 'his', 'his pocket'), named);
    } else {
      door.push(calling, ...tie('second', 'his', 'his pocket'));
    }
  } else {
    // He wanted the place, but it is already promised to him: no reason left.
    const promised = (lede) => ['excused', 'second', coveted.word, `${lede}, a letter: | hand: ${surnames[1]}: the $thing is yours from Monday. ${by}`];
    if (decoyReceipt) door.push(...herring('second', 'his pocket'), named, promised('Beside it'));
    else door.push(calling, promised('In his pocket'));
  }

  // The doll at the left. Their trade shows; what else they carry depends on the day.
  const left = [['fits', 'fourth', fourth.role, fourth.sign]];
  if (fourthDidIt) {
    left.push(...tie('fourth', f, fourth.keeps));
    if (shows === 'receipt') left.push(['tag', 'fourth', { abbr: card(atLeft) }, 'print: Signed for: $name.']);
    left.push(['lead', 'fourth', 'had been dismissed', fourth.grudge(shows === 'shelf' ? `In ${fourth.keeps}` : 'With it', surnames[3], by)]);
  } else if (decoyReceipt) {
    left.push(...herring('fourth', fourth.keeps), ['tag', 'fourth', { abbr: card(atLeft) }, 'print: Signed for: $name.']);
  } else if (innocent === 'mended') {
    left.push(
      ['lead', 'fourth', 'had been dismissed', fourth.grudge(`In ${fourth.keeps}`, surnames[3], by)],
      ['explained', 'fourth', 'had been dismissed', `Beneath, in the same hand: | hand: I spoke in temper. Stay. ${by}`]
    );
  }

  // The shelf: whatever stands there, sealed or opened.
  const shelf = [];
  for (const p of onShelf) {
    if (p === used) shelf.push(['makes', p, MARK, POISONS[p].used]);
    else shelf.push(['makes', p, MARK, POISONS[p].idle[0]], ['untouched', p, POISONS[p].idle[1]]);
  }

  const exhibits = [
    {
      id: 'roster', title: set.roster,
      facts: [
        ['listed', meant, lead.role, `print: ${head} $Key: $name.`],
        ['listed', atDoor, second.role, 'print: His $key: $name.'],
        ['listed', drank, drinker.role, 'print: $Key: $name.'],
        ['listed', atLeft, fourth.role, 'print: $Key: $name.'],
        ['listed', away, absent.role, 'print: $Key: $name.']
      ]
    },
    {
      id: 'body', title: 'The man on the floor',
      facts: [
        ['fits', 'body', drinker.role, drinker.sign],
        ['dead', 'body', null],
        ['sign', MARK, `$mark. A ${vessel.hue} bottle in his fist.`]
      ]
    },
    { id: 'vessel', title: vessel.title, facts: [['meantFor', { surname: surnames[0] }, vessel.label]] },
    {
      id: 'lead', title: lead.title,
      facts: [
        ['fits', 'lead', lead.role, lead.sign],
        ['lead', 'lead', 'had threatened the dead man', set.threat(surnames[2])],
        ['tag', 'lead', { initials: by }, 'hand: $name']
      ]
    },
    { id: 'second', title: second.title, facts: door },
    { id: 'book', title: coveted.title, facts: [['wants', { listed: second.role }, coveted.word, coveted.tell]] },
    { id: 'fourth', title: fourth.title, facts: left },
    { id: 'shelf', title: set.shelf.title, facts: shelf }
  ];

  const panels = [
    {
      id: 'cast', title: 'The cast',
      parts: ['On the floor, ', ['person', drank, 'body'], `. ${lead.plate}, `, ['person', meant, 'lead'], '. At the door, ', ['person', atDoor, 'second'], `. ${fourth.plate}, `, ['person', atLeft, 'fourth'], '.']
    },
    {
      id: 'story', title: 'What happened',
      parts: [['person', poisoner, 'culprit'], ' put ', ['thing', used, 'means'], ` in the ${vessel.word} meant for `, ['person', meant, 'intended'], ', but ', ['person', drank, 'victim'], ' drank it.']
    }
  ];

  const scene = {
    kind: 'switch',
    setting: settingId,
    mirror: chance(0.5),
    pins: { roster: 'roster', body: 'body', vessel: 'vessel', lead: 'lead', second: 'door', book: 'book', fourth: 'left', shelf: 'shelf' },
    floor: { look: { ...face(), ...drinker.look, hair: pick(['crop', 'part', 'bald']), whiskers: pick(['goatee', 'pencil', null]) } },
    lead: { look: { ...face(), ...lead.look, whiskers: pick(['walrus', 'handlebar', 'beard']) } },
    door: { look: { ...face(), body: 'coat', paint: pick(['#4d5f8a', '#8a7a4a', C.plum, C.mustard]), legs: '#2f3550', collar: 'tie', collarColor: pick([C.mustard, C.red]), hat: pick(['bowler', 'boater', 'flat']), hair: pick(['part', 'crop']), whiskers: pick(['pencil', null, null]) } },
    left: { carry: fourth.carry, look: { ...face(), ...fourth.look } },
    kept: onShelf.map((p) => POISONS[p].kept),
    bottle: vessel.colour
  };
  const where = pick(set.where);
  const freePoses = ['stand', 'alarm', 'hip', 'point'];
  scene.lead.look.pose = pick(freePoses);
  scene.door.look.pose = pick(freePoses);
  scene.left.look.pose = fourth.carry ? 'carry' : pick(freePoses);

  return {
    id: composedId(date),
    title: set.titles[Math.floor(visit / set.rooms.length) % set.titles.length].replace('{room}', room),
    where,
    scene,
    composed: { date, attempt, crime: 'switch', setting: settingId, culprit: fourthDidIt ? 'left' : 'door', means: shows, herring: innocent === 'nothing' ? null : innocent },
    words,
    exhibits,
    panels
  };
}

// The crimes take turns by date, so two days running never share a shape.
function mourningSupper(date, attempt, turn, draws) {
  const surnames = draws.shuffled(SURNAMES);
  const names = draws.shuffled([...WOMEN, ...MEN]).slice(0, 4).map((first, i) => first + ' ' + surnames[i]);
  return { id: composedId(date), ...buildBrooch(date, attempt, turn, draws, names) };
}

const CRIMES = [['theft', buildTheft], ['switch', buildSwitch], ['brooch', mourningSupper]];

// One attempt at the case for a date. Pure: the same date and attempt give the same case.
export function build(date, attempt) {
  const day = Math.floor(Date.parse(date + 'T00:00:00Z') / 86400000);
  const [crime, make] = CRIMES[day % CRIMES.length];
  const turn = Math.floor(day / CRIMES.length);
  const c = make(date, attempt, turn, draws(`penny-tableau|${COMPOSER}|${crime}|${date}|${attempt}`));
  // The explanation and the tips are read off the proof, whatever shape the case took.
  const { path, traps, tips } = explain(c);
  return { ...c, path, traps, tips };
}

export const crimeOf = (date) => CRIMES[Math.floor(Date.parse(date + 'T00:00:00Z') / 86400000) % CRIMES.length][0];

// What the gate makes of a composed case: the same checks a hand-written case must pass.
export function gate(c) {
  return lintCase(c, scenePins(c.scene)).errors;
}

const made = new Map();

// The case for a date: the first attempt the gate lets through.
export function composeDay(date) {
  if (made.has(date)) return made.get(date);
  let refused = [];
  const why = [];
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    const c = told(build(date, attempt));
    refused = gate(c);
    if (!refused.length) {
      c.composed.refused = why; // what the gate said to each attempt before this one
      made.set(date, c);
      return c;
    }
    why.push(refused[0]);
  }
  throw new Error(`No case for ${date} passed the gate in ${ATTEMPTS} attempts. The last was refused: ${refused.join(' ')}`);
}
