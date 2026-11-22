// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import { C, SKIN, circ, dot, ell, g, label, line, path, rect, sway } from './kit.js';
import { doll } from './doll.js';
import * as P from './props.js';

export const pins = {
  judge: [200, 190], scores: [164, 216], catalogue: [348, 75], cage: [109, 80],
  hat: [59, 210], satchel: [331, 208], receipt: [247, 219]
};
export const focus = {
  judge: [200, 157], scores: [179, 201], catalogue: [348, 98], cage: [114, 87],
  hat: [56, 157], satchel: [328, 158], receipt: [236, 203]
};

function canary(feathers, wing) {
  return path('M-5 -3 L-17 -9 L-13 -3 L-6 1Z', wing) +
    path('M-8 -3 Q-6 -9 1 -7 Q4 -14 9 -11 Q14 -8 10 -4 Q9 3 3 5 Q-4 6 -8 -3Z', feathers) +
    path('M-6 -3 Q0 -6 5 -3 Q2 1 -3 1Z', wing) +
    line('M-2 4 v5 m0 -1 l-2 1 m8 -5 v5 m0 -1 l2 1', 1) +
    line('M-1 6 h2', 1.8, C.brass) + path('M10 -8 l5 1 l-4 2Z', C.wood) + dot(8, -8, 0.85, C.ink);
}

function rosette() {
  return path('M-6 4 L-11 22 l5 -3 l3 5 l5 -18Z M2 5 l2 17 l3 -4 l5 1 l-5 -16Z', C.blue) +
    path('M0 -9 l3 2 l4 -1 l1 4 l3 3 l-2 3 l1 4 l-4 1 l-3 3 l-3 -2 l-4 1 l-1 -4 l-3 -3 l2 -3 l-1 -4 l4 -1Z', C.blue) +
    circ(0, 0, 4.6, C.brass) + label(0, 2, 'I', 5);
}

function cage(x, feathers, wing, facing, prize = false) {
  const brass = C.brassDark;
  let s = path('M-28 0 V-25 Q-27 -54 0 -56 Q28 -53 28 -25 V0Z', '#d6eadb');
  s += g('translate(3 -15)', sway(g(`scale(${facing} 1)`, canary(feathers, wing)), -3, 3, 1.9, x / 100));
  s += line('M-21 -6 h43', 2, C.woodDark);
  s += line('M-27 -24 Q-18 -52 0 -55 Q18 -52 27 -24 M-17 0 V-27 Q-16 -44 0 -55 Q16 -45 17 -27 V0 M-6 0 V-28 Q-6 -43 0 -55 Q6 -43 6 -28 V0 M-27 -24 H27', 1.1, brass);
  s += rect(-30, -2, 60, 7, C.tealDark, 2) + circ(0, -59, 2.6, C.brass);
  if (prize) s += g('translate(26,-9) rotate(-10)', rosette());
  return g(`translate(${x},111)`, s);
}

export function draw() {
  let s = P.room({ wall: '#f9dfb0', stripe: '#f6cc9d', dado: '#81b6a0', dadoH: 52, floor: C.woodLight });
  s += P.shelf(69, 120, 242);
  s += cage(111, '#f5d14c', '#ce8c35', 1, true);
  s += cage(190, '#f9e885', '#c8a651', -1);
  s += cage(270, '#f0ad53', '#b76f39', 1);
  s += P.wallNotice(348, 76, 44, 45, C.tealDark);
  s += P.chair(200, 224) + doll({
    x: 200, y: 227, s: 1.06, dir: -1, sit: true, pose: 'slump', spring: true,
    body: 'coat', paint: C.navy, collar: 'bow', collarColor: C.pink, hair: 'bald',
    hairColor: C.grey, whiskers: 'walrus', specs: true, skin: SKIN[2]
  });
  s += P.desk(200, 239, 119) + P.openBook(176, 204, { w: 15 }) + P.paper(238, 204, 8, 20, 9);
  s += g('rotate(8 238 199)', ell(244, 199, 2.8, 2.1, C.redDark));
  s += doll({
    x: 59, y: 244, s: 1.1, dir: 1, body: 'dress', paint: C.plum,
    hat: 'plume', hatColor: C.plum, hatBand: C.mustard, hair: 'curls', hairColor: C.black,
    skin: SKIN[1], mood: 'shock', pose: 'hip', nod: [-2, 3, 2.4]
  });
  s += doll({
    x: 331, y: 246, s: 1.1, dir: -1, body: 'coat', paint: C.tealDark, collar: 'tie',
    collarColor: C.mustard, hat: 'flat', hatColor: C.woodDark, whiskers: 'mutton',
    hair: 'part', hairColor: '#82482c', skin: SKIN[3], mood: 'shock', pose: 'hold',
    hold: line('M-7 6 Q0 -7 7 6', 2.2, C.woodDark) +
      path('M-13 6 Q-1 2 12 6 L14 20 Q2 24 -13 20Z', C.wood) +
      path('M-13 6 Q-1 2 12 6 L8 13 L-8 13Z', C.woodLight) + dot(0, 12, 1.4, C.brass),
    rock: [-1.4, 1, 2.1]
  });
  return s;
}
