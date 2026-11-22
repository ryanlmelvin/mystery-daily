// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import { C } from './kit.js';
import { doll } from './doll.js';
import * as P from './props.js';

export const pins = {
  roster: [126, 187], body: [221, 261], witness: [247, 70],
  window: [58, 204], clock: [191, 194], door: [337, 201], inventory: [286, 161]
};
export const focus = { roster: [120, 188], witness: [247, 80], inventory: [279, 168] };

function regulator() {
  const face = P.circ(190, 66, 14, C.brass) + P.circ(190, 66, 11, C.cream) +
    P.line('M190 57 v9 l6 3 M180 66 h2 M198 66 h2 M190 74 v2', 1.3, C.ink);
  return P.rect(182, 75, 16, 33, C.woodDark, 2) + P.rect(186, 78, 8, 25, C.sky, 3) +
    P.line('M190 77 v17', 1.4, C.brass) + P.circ(190, 98, 3, C.brass) + face;
}

function propertyTray() {
  return P.desk(278, 208, 63) + P.paper(265, 174, -9, 18, 8) +
    P.rect(273, 162, 23, 9, C.brass, 3) + P.rect(275, 163, 19, 6, C.plum, 1) +
    P.dot(281, 166, 2.2, C.cream) + P.dot(287, 165, 1.9, C.red);
}

const rooms = {
  station: () => P.room({ wall: '#c6dfda', stripe: '#accbc8', dado: C.teal, floor: C.woodLight }) +
    P.luggageRack(90, 78, 65) + P.hatbox(122, 78, C.plum),
  assembly: () => P.room({ wall: '#edc4b5', stripe: '#e8b5aa', dado: C.plum, rug: { x: 227, y: 248, rx: 102, ry: 18, color: C.red, trim: C.mustard } }) +
    P.pot(125, 122, 11, 'fern') + P.shelf(109, 122, 34),
  hotel: () => P.room({ wall: '#f3ddb3', stripe: '#e9cca1', dado: C.navy, floor: C.woodLight }) +
    P.rect(100, 62, 46, 38, C.wood, 3) +
    [111, 123, 135].map((x) => P.circ(x, 75, 3.2, C.brass) +
      P.line(`M${x} 78 v12 h4 m-4 -4 h3`, 1.8, C.brass)).join('')
};

export const settingIds = Object.keys(rooms);

export function draw(spec) {
  let s = rooms[spec.setting]() + P.windowPane(59, 146, { w: 57, h: 78, curtain: C.plum }) +
    regulator() + P.wallNotice(247, 65, 26, 32, C.teal) + P.door(337, 196, { color: C.tealDark }) +
    P.desk(120, 227, 53) + P.openBook(120, 192, { w: 18 }) + propertyTray();
  const places = { window: [59, 241], clock: [191, 233], door: [337, 242] };
  for (const [id, [x, y]] of Object.entries(places)) {
    s += doll({ ...spec[id].look, x, y, s: 1.13, dir: id === 'window' ? 1 : -1, rock: [-1.5, 1.5, 1.9] });
  }
  return s + P.shadow(224, 273, 72, 6) +
    doll({ ...spec.floor.look, x: 163, y: 273, s: 1.13, dir: 1, pose: 'dead', spring: true });
}
