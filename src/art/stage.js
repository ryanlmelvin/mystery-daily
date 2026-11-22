// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// Scenes for composed cases. A composed case describes its scene as data (which
// setting, how each doll is dressed, which tools hang by the door) and this file stages
// it. Every interrupted theft uses one blocking: the record book on a table at one side,
// a witness in the inner doorway, the empty stand in the middle, the body in front, and
// the thief by the way out with a bag and the tools beside the door. Half of them are
// mirrored. The picture never carries a clue the text does not state.

import { C } from './kit.js';
import { doll } from './doll.js';
import * as P from './props.js';

const S = 1.18;

// Where each exhibit's tag sits, before mirroring.
const PINS = {
  body: [236, 262], roster: [51, 160], witness: [146, 188], thief: [316, 94],
  letter: [316, 192], bag: [360, 236], stand: [226, 152], tools: [384, 142]
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

// What a witness carries in the raised hand (drawn around the grip).
const CARRIED = {
  lamp: () => P.lantern(),
  lantern: () => P.lantern(),
  'rolling pin': () => P.g('rotate(72)', P.rect(-13, -2.6, 26, 5.2, C.woodLight, 2.6) + P.rect(-18, -1.4, 5, 2.8, C.woodDark, 1.4) + P.rect(13, -1.4, 5, 2.8, C.woodDark, 1.4))
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

export const settingIds = Object.keys(SETS);

export function stagePins(spec) {
  const out = {};
  for (const [id, [x, y]] of Object.entries(PINS)) out[id] = [spec.mirror ? P.W - x : x, y];
  return out;
}

export function stageSvg(spec) {
  const set = SETS[spec.setting];
  if (!set) throw new Error(`No setting called ${spec.setting}`);
  const carried = CARRIED[spec.witness.carry];
  let s = set();
  s += drawTools(spec.tools);
  s += doll({ x: 146, y: 236, s: S, dir: 1, mood: 'shock', pose: 'hold', hold: carried ? carried() : null, rock: [-1.5, 1.5, 1.7], wave: [-3, 3, 1.1], ...spec.witness.look });
  s += doll({ x: 316, y: 240, s: S, dir: -1, mood: 'shifty', pose: 'hip', nod: [-5, 4, 2.2], ...spec.thief.look });
  s += P.carpetBag(360, 254, spec.bag);
  s += P.shadow(240, 274, 70, 6);
  s += doll({ x: 176, y: 272, s: S, dir: 1, pose: 'dead', spring: true, ...spec.keeper.look });
  const inner = spec.mirror ? P.g(`translate(${P.W},0) scale(-1,1)`, s) : s;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${P.W} ${P.H}" class="scene" role="img" aria-label="The scene inside the cabinet">${inner}${P.valance()}</svg>`;
}
