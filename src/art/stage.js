// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// Scenes for composed cases. A composed case describes its scene as data (which
// setting, how each doll is dressed, what each carries, which tools hang by the door)
// and this file stages it. Dolls are known by where they stand, never by what they did:
// the same doll in the same place is the culprit one day and a bystander the next, and
// nothing here (pose, face, position) may give that away. The picture never carries a
// clue the text does not state. Half the scenes are mirrored.
//
// The interrupted theft uses one blocking: the record book on a table at one side, a
// servant in the inner doorway, the empty stand in the middle, the body in front, and a
// visitor by the way out with a bag at their feet and the tools beside the door.

import * as brooch from './brooch.js';
import { C, PAPER_DEFS } from './kit.js';
import { doll } from './doll.js';
import * as P from './props.js';

const S = 1.18;

// Where a tag can sit, before mirroring. A case says which of these each exhibit uses.
const SPOTS = {
  body: [236, 262], roster: [51, 160], stand: [226, 152], tools: [384, 142], bag: [360, 236],
  doorway_head: [146, 98], doorway_chest: [146, 188], exit_chest: [316, 192]
};

const thin = `stroke="${C.ink}" stroke-width=".8"`;
const leaning = (slot, inner) => P.g(`translate(${slot.x},${slot.y}) rotate(${slot.deg})`, inner);
const hook = (slot) => P.dot(slot.x, slot.y, 2, C.brass, thin);

// How each tool is drawn. `kind` says where it goes: leaning on the wall, hanging from a
// hook, or sitting on the little shelf.
const TOOLS = {
  spade: { kind: 'lean', draw: (s) => P.spade(s.x, s.y, s.deg) },
  hoe: { kind: 'lean', draw: (s) => leaning(s, P.rect(-1.9, -82, 3.8, 76, C.woodLight, 1.9) + P.path('M-1 -9 H13 V-1 H-1Z', C.grey)) },
  rake: {
    kind: 'lean',
    draw: (s) => leaning(s, P.rect(-1.9, -82, 3.8, 72, C.woodLight, 1.9) + P.rect(-11, -11, 22, 4.4, C.grey, 1) +
      P.line('M-9 -7 v6 M-4.5 -7 v6 M0 -7 v6 M4.5 -7 v6 M9 -7 v6', 1.5))
  },
  poker: {
    kind: 'lean',
    draw: (s) => leaning(s, P.rect(-1.5, -70, 3, 64, C.black, 1.5) + P.circ(0, -73, 3.6, C.brass) + P.path('M0 -7 q7 0 7 -7', 'none', 'stroke-width="2.6"'))
  },
  shears: { kind: 'hang', draw: (s) => P.shearsOnHook(s.x, s.y) },
  tongs: {
    kind: 'hang',
    draw: (s) => hook(s) + P.line(`M${s.x} ${s.y + 3} l-5 27 M${s.x} ${s.y + 3} l5 27`, 2.4, C.black) +
      P.circ(s.x - 5, s.y + 31, 2.4, C.black) + P.circ(s.x + 5, s.y + 31, 2.4, C.black) + P.circ(s.x, s.y + 4, 2.6, C.brass)
  },
  corkscrew: {
    kind: 'hang',
    draw: (s) => hook(s) + P.rect(s.x - 7, s.y + 3, 14, 5, C.woodLight, 2.5) +
      P.line(`M${s.x} ${s.y + 8} l3 3 l-6 3 l6 3 l-6 3 l6 3 l-3 3`, 1.5, '#5f5f66')
  },
  bookend: { kind: 'shelf', draw: (s) => P.path(`M${s.x - 6} ${s.y} v-15 h5 v10 h7 v5Z`, '#b08a4a') },
  paperweight: {
    kind: 'shelf',
    draw: (s) => P.path(`M${s.x - 7} ${s.y} q7 -14 14 0Z`, C.glass) + P.dot(s.x - 2, s.y - 5, 1.6, '#fff', 'opacity=".8"')
  },
  candlestick: {
    kind: 'shelf',
    draw: (s) => P.rect(s.x - 2, s.y - 26, 4, 10, C.white, 1) + P.rect(s.x - 4, s.y - 17, 8, 3, C.brass, 1) +
      P.rect(s.x - 1.6, s.y - 14, 3.2, 10, C.brass, 1) + P.ell(s.x, s.y - 2.5, 7, 2.6, C.brass)
  },
  'carving knife': {
    kind: 'shelf',
    draw: (s) => P.rect(s.x - 8, s.y - 7, 16, 7, '#7b5235', 1.5) + P.line(`M${s.x - 6} ${s.y - 9} l12 -9`, 2, C.grey) +
      P.line(`M${s.x - 6} ${s.y - 9} l3 -2.2`, 3, C.black)
  },
  decanter: {
    kind: 'shelf',
    draw: (s) => P.path(`M${s.x - 2} ${s.y - 22} h4 v6 q6 4 6 16 h-16 q0 -12 6 -16Z`, C.glass) + P.rect(s.x - 2.6, s.y - 26, 5.2, 4.4, C.woodLight, 1.5) +
      P.line(`M${s.x - 5} ${s.y - 6} h10`, 1, '#c97a7a')
  }
};

export const toolKinds = Object.fromEntries(Object.entries(TOOLS).map(([word, t]) => [word, t.kind]));

const SLOTS = {
  lean: [{ x: 373, y: 198, deg: -6 }, { x: 390, y: 198, deg: 5 }],
  hang: [{ x: 384, y: 104 }, { x: 371, y: 104 }],
  shelf: [{ x: 373, y: 130 }, { x: 389, y: 130 }]
};

function drawTools(words) {
  const used = { lean: 0, hang: 0, shelf: 0 };
  let s = '';
  if (words.some((w) => TOOLS[w] && TOOLS[w].kind === 'shelf')) s += P.shelf(363, 130, 35);
  for (const word of words) {
    const tool = TOOLS[word];
    if (!tool) continue;
    const slot = SLOTS[tool.kind][used[tool.kind]++ % 2];
    s += tool.draw(slot);
  }
  return s;
}

// What a doll carries in one hand (drawn around the grip).
const CARRIED = {
  lamp: () => P.lantern(),
  lantern: () => P.lantern(),
  'rolling pin': () => P.g('rotate(72)', P.rect(-13, -2.6, 26, 5.2, C.woodLight, 2.6) + P.rect(-18, -1.4, 5, 2.8, C.woodDark, 1.4) + P.rect(13, -1.4, 5, 2.8, C.woodDark, 1.4)),
  cane: () => P.line('M-7 2 q3.5 -9 7 -2 V23', 3.4, C.ink) + P.line('M-7 2 q3.5 -9 7 -2 V23', 1.7, C.woodLight) + P.dot(0, -1, 2.2, C.grey, thin),
  parasol: () => P.path('M-2.8 0 H2.8 L1.3 21 H-1.3Z', C.red) + P.line('M0 21 v4', 1.5) + P.path('M0 0 q-4.5 -8 -8.5 -1', 'none', 'stroke-width="2"')
};

const table = (x, y, w) => P.rect(x + 6, y - 42, 6, 42, C.woodDark, 1) + P.rect(x + w - 12, y - 42, 6, 42, C.woodDark, 1) +
  P.rect(x + 3, y - 30, w - 6, 5, C.wood, 1) + P.rect(x, y - 49, w, 7, C.woodLight, 2);

const goblet = (x, y, colour = C.grey) => P.path(`M${x - 5} ${y - 14} h10 q0 8 -5 8 q-5 0 -5 -8Z`, colour) + P.rect(x - 1, y - 6, 2, 4, colour, 0.6) + P.ell(x, y - 1.4, 4, 1.4, colour);
const dish = (x, y, colour = C.grey) => P.circ(x, y - 8, 8, colour) + P.circ(x, y - 8, 4.4, P.shade(colour, 0.25), 'stroke-width=".9"');

// The set for each setting: the room, the two doors, the record table and the stand.
const SETS = {
  glasshouse() {
    let s = P.glasshouse();
    s += P.pot(112, 196, 8, 'tall') + P.pot(190, 196, 7, 'fern') + P.pot(270, 196, 8, 'bush');
    s += P.door(146, 196, { w: 46, h: 108, open: true, frame: C.cream });
    s += P.door(338, 196, { w: 44, h: 104, color: C.green, frame: C.cream, knob: -1 });
    s += P.pottingBench(10, 226) + P.openBook(51, 177);
    return s + P.plantStand(226, 230);
  },
  library() {
    let s = P.room({ wall: '#7a3340', stripe: '#6c2b37', dado: '#9a6238', floor: C.wood, rug: { x: 232, y: 256, rx: 122, ry: 20, color: '#2f6b5a', trim: C.mustard } });
    s += P.bookcase(4, 196, 92, 136) + P.bookcase(182, 196, 92, 150);
    s += P.door(146, 196, { w: 46, h: 108, open: true, frame: C.woodLight });
    s += P.door(338, 196, { w: 44, h: 104, color: '#9a6238', frame: C.woodLight, knob: -1 });
    s += table(10, 226, 86) + P.openBook(51, 177) + P.inkwell(84, 177);
    return s + P.plantStand(226, 230);
  },
  gallery() {
    let s = P.room({ wall: '#e2ebe3', stripe: '#cbddd1', dado: '#2f5d5a', floor: C.woodLight });
    s += P.shelf(184, 78, 88) + goblet(198, 78) + dish(228, 78, C.brass) + goblet(258, 78);
    s += P.shelf(184, 118, 88) + dish(200, 118) + goblet(228, 118, C.brass) + dish(256, 118);
    s += P.shelf(14, 96, 74) + goblet(30, 96, C.brass) + dish(52, 96) + goblet(74, 96);
    s += P.door(146, 196, { w: 46, h: 108, open: true, frame: C.cream });
    s += P.door(338, 196, { w: 44, h: 104, color: C.teal, frame: C.cream, knob: -1 });
    s += table(10, 226, 86) + P.openBook(51, 177);
    return s + P.plantStand(226, 230);
  }
};

function theftScene(spec) {
  const set = SETS[spec.setting];
  if (!set) throw new Error(`No setting called ${spec.setting}`);
  const inDoorway = CARRIED[spec.doorway.carry];
  const atExit = CARRIED[spec.exit.carry];
  let s = set();
  s += drawTools(spec.tools);
  s += doll({ x: 146, y: 236, s: S, dir: 1, hold: inDoorway ? inDoorway() : null, rock: [-1.5, 1.5, 1.7], wave: [-3, 3, 1.1], ...spec.doorway.look });
  s += doll({ x: 316, y: 240, s: S, dir: -1, hold: atExit ? atExit() : null, nod: [-5, 4, 2.2], ...spec.exit.look });
  s += P.carpetBag(360, 254, spec.bag);
  s += P.shadow(240, 274, 70, 6);
  s += doll({ x: 176, y: 272, s: S, dir: 1, pose: 'dead', spring: true, ...spec.floor.look });
  return s;
}

// ---------- the wrong glass ----------
// A second blocking, for four dolls: the list on the wall and one doll at the left, the
// one the bottle was meant for beside them, a table of medicines at the
// back, a chair with a book on it, another doll at the door, and the drinker on the
// floor in front with the bottle still in his fist. Either the doll at the left or the
// one at the door may be the poisoner.

const SWITCH_SPOTS = {
  roster: [34, 102], body: [232, 264], vessel: [258, 208], lead: [146, 204],
  door: [352, 204], book: [296, 178], left: [60, 208], shelf: [216, 120]
};

// What stands on the table: one drawing for each way a poison is kept.
const KEPT = {
  phial: (x, y) => P.bottle(x, y, '#7fb0d8', 10),
  tin: (x, y) => P.tin(x, y),
  packet: (x, y) => P.rect(x - 6, y - 8, 12, 8, C.white, 1) + P.line(`M${x - 6} ${y - 4} h12 M${x} ${y - 8} v8`, 0.9, C.woodDark),
  can: (x, y) => P.rect(x - 5.5, y - 12, 11, 12, C.green, 1.5) + P.rect(x - 2, y - 15, 4, 3.4, C.red, 1)
};

// What the fourth doll holds in both hands.
const HELD = {
  cloak: () => P.cloakOverArm(C.red),
  tray: () => P.teaTray()
};

const porthole = (x, y) => P.circ(x, y, 15, C.brass) + P.circ(x, y, 10.5, C.night, 'stroke-width="1.1"') + P.dot(x + 3, y - 3, 1.2, '#f6e9b8');

const SWITCH_SETS = {
  theatre() {
    let s = P.room({ wall: '#efc2ae', dado: '#7a3b63', floor: C.woodLight });
    s += P.playbill(34, 44) + P.dressingTable(216, 196);
    s += P.door(352, 196, { w: 44, h: 106, color: C.teal, frame: C.cream, knob: -1 });
    return { set: s, top: 138 };
  },
  kitchen() {
    let s = P.room({ wall: '#f3ecd6', stripe: '#e6dcc0', stripeGap: 16, dado: '#86b3a2', floor: '#d9c9a3' });
    s += P.wallNotice(34, 52, 30, 40, C.teal);
    s += P.shelf(176, 96, 82) + P.jar(190, 96, C.sky) + P.jar(206, 96, C.pink, 10) + P.jar(222, 96, C.mustard, 14) + P.jar(240, 96, C.white, 11);
    s += P.line('M100 60 H126 M106 60 v14 M113 60 v18 M120 60 v12', 2, C.brassDark) + P.circ(106, 78, 4, C.brass) + P.circ(113, 82, 4.6, C.brass) + P.circ(120, 76, 3.6, C.brass);
    s += table(172, 196, 88);
    s += P.door(352, 196, { w: 44, h: 106, color: '#9a6238', frame: C.cream, knob: -1 });
    return { set: s, top: 147 };
  },
  cabin() {
    let s = P.room({ wall: '#c08a52', dado: '#8a5630', dadoH: 60, floor: C.wood });
    s += P.frame(34, 56, 30, 40, '#f3ecd6');
    s += porthole(118, 78) + porthole(262, 78);
    s += P.shelf(180, 104, 76) + P.rect(188, 88, 60, 16, '#f3ecd6', 1) + P.line('M194 94 h30 M194 99 h44', 0.9, C.grey);
    s += table(172, 196, 88);
    s += P.door(352, 196, { w: 44, h: 106, color: C.tealDark, frame: C.woodLight, knob: -1 });
    return { set: s, top: 147 };
  }
};

function switchScene(spec) {
  const build = SWITCH_SETS[spec.setting];
  if (!build) throw new Error(`No setting called ${spec.setting}`);
  const { set, top } = build();
  const held = HELD[spec.left.carry];
  let s = set;
  spec.kept.forEach((kind, i) => { s += (KEPT[kind] || KEPT.phial)(196 + i * 40, top); });
  s += P.chair(286, 230) + P.scriptBook(286, 200);
  s += doll({ x: 60, y: 246, s: S, dir: 1, carry: held ? held() : null, rock: [-1.3, 1.3, 1.6], ...spec.left.look });
  s += doll({ x: 146, y: 244, s: S, dir: -1, rock: [-2, 2, 1.2], wave: [-5, 5, 0.9], ...spec.lead.look });
  s += doll({ x: 352, y: 244, s: S, dir: -1, nod: [-4, 3, 2.6], ...spec.door.look });
  s += P.shadow(246, 274, 70, 6);
  s += doll({ x: 184, y: 272, s: S, dir: 1, pose: 'dead', spring: true, ...spec.floor.look });
  s += P.spiltBottle(240, 198, spec.bottle, 24);
  return s;
}

export const settingIds = [...Object.keys(SETS), ...Object.keys(SWITCH_SETS), ...brooch.settingIds];

function stagePoints(spec, points) {
  const out = {};
  for (const [id, [x, y]] of Object.entries(points)) out[id] = [spec.mirror ? P.W - x : x, y];
  return out;
}

// Each exhibit names its spot. Leave unknown spots for the gate to flag as missing tags.
export function stagePins(spec) {
  if (spec.kind === 'brooch') return stagePoints(spec, brooch.pins);
  const spots = spec.kind === 'switch' ? SWITCH_SPOTS : SPOTS;
  const points = {};
  for (const [id, spot] of Object.entries(spec.pins || {})) {
    if (spots[spot]) points[id] = spots[spot];
  }
  return stagePoints(spec, points);
}

// Close looks follow the printed props. The tags sit clear of them in the window.
export function stageFocus(spec) {
  if (spec.kind === 'brooch') return stagePoints(spec, brooch.focus);
  if (spec.kind === 'switch') {
    return stagePoints(spec, {
      roster: [34, 72], vessel: [240, 196], book: [286, 197], shelf: [216, 138]
    });
  }
  const leaning = spec.tools.some((word) => toolKinds[word] === 'lean');
  return stagePoints(spec, {
    roster: [51, 173], stand: [226, 199], bag: [360, 241], tools: [380, leaning ? 162 : 120]
  });
}

export function stageSvg(spec) {
  const draw = { brooch: brooch.draw, switch: switchScene, theft: theftScene };
  const s = draw[spec.kind](spec);
  const inner = spec.mirror ? P.g(`translate(${P.W},0) scale(-1,1)`, s) : s;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${P.W} ${P.H}" class="scene" role="img" aria-label="The scene inside the cabinet">${PAPER_DEFS}${inner}${P.valance()}</svg>`;
}
