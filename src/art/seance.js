// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import { C, SKIN, bar, blob, circ, dot, ell, g, label, line, path, rect, shade } from './kit.js';
import { doll } from './doll.js';
import { armchair, armchairArms, frame, room } from './props.js';

export const pins = {
  medium: [201, 173], left: [77, 202], right: [322, 200], counterfoils: [265, 241],
  cards: [136, 238], slates: [199, 227], letters: [202, 67], bill: [142, 111]
};

export const focus = { cards: [135, 228], counterfoils: [262, 229], slates: [198, 216], letters: [200, 67], bill: [140, 112] };

// A little covered booth, its two halves hooked back now the slates are out.
function booth(x, cloth) {
  const side = path('M-48 -3 H-15 Q-23 40 -35 59 Q-31 86 -27 136 H-48Z', cloth)
    + line('M-39 3 Q-37 29 -40 53 M-24 2 Q-25 23 -36 51 M-40 68 Q-38 95 -38 126', 1.2, shade(cloth, -0.32))
    + path('M-45 57 L-33 53 L-32 59 L-44 64Z', C.mustard)
    + line('M-34 60 q8 8 4 17', 1.4, C.brass);
  return g(`translate(${x},56)`, rect(-49, -4, 98, 145, shade(cloth, -0.25), 4)
    + rect(-44, 0, 88, 135, '#d6c1d5', 1) + side + g('scale(-1,1)', side)
    + rect(-52, -7, 104, 6, C.brass, 2.8) + circ(-53, -4, 3.6, C.mustard) + circ(53, -4, 3.6, C.mustard));
}

function bird(x, y, color) {
  return g(`translate(${x},${y})`, blob('M-7 1 L-10 -2 L-5 -1 Q-2 -1 1 -5 Q0 -2 2 -2 Q4 -5 6 -3 L9 -3 L6 -1 Q3 2 0 2 L-6 5Z', color));
}

function card(x, y, angle, color) {
  return g(`translate(${x},${y}) rotate(${angle})`, rect(-8, -11, 16, 22, color, 1.2)
    + rect(-5.5, -8, 11, 16, C.cream, 0.6) + line('M-3 -3 h6 M-3 0 h4 M-3 3 h5', 0.7, C.woodDark));
}

export function draw() {
  let s = room({ wall: '#f5dabc', stripe: '#f4c9b2', dado: '#68a9a0', floor: C.woodLight });
  s += booth(75, C.plum) + booth(325, C.tealDark);
  s += frame(200, 43, 54, 39, C.cream, false)
    + rect(177, 48, 20, 29, C.white, 0.7) + rect(203, 48, 20, 29, C.white, 0.7)
    + line('M181 54 h12 M181 58 h12 M181 62 h7 M207 54 h12 M207 58 h12 M207 62 h7', 0.9, C.grey)
    + bird(187, 70, C.navy) + ell(214, 69, 3.6, 2.1, C.woodDark) + dot(217, 67.5, 1.8, C.woodDark);
  s += frame(140, 91, 23, 26, '#47696e', false) + label(140, 105, '1s.', 8, C.white)
    + line('M134 110 h12 M135 112 h8', 0.65, C.white) + rect(127, 125, 26, 15, C.woodDark, 2)
    + rect(131, 127, 18, 8, C.brass, 1.4) + bar(135, 130, 10, 1.7, C.ink, 0.6);
  s += armchair(202, 233, C.red)
    + doll({ x: 202, y: 230, s: 1.13, dir: -1, sit: true, body: 'dress', paint: C.navy, hair: 'bun',
      hairColor: C.grey, skin: SKIN[1], specs: true, pose: 'slump', spring: true,
      carry: ell(0, -57, 3.5, 2.7, C.brass) + dot(0, -57, 1.5, C.plum) })
    + armchairArms(202, 233, C.red);
  s += doll({ x: 76, y: 246, s: 1.13, dir: 1, body: 'shirt', paint: C.green, hair: 'curls', hat: 'boater',
    hatBand: C.mustard, skin: SKIN[3], pose: 'hold', nod: [-3, 3, 2.7],
    carry: line('M-3 -44 Q-6 -34 -11 -41', 1.2, C.brass) + g('translate(-7,-53) rotate(-28)', ell(0, -2.2, 1.8, 1.5, C.brass)
      + dot(0, -2.2, .7, C.ink) + line('M0 -.8v4.5h1.6m-1.6-1.5h1.2', 1.4, C.brassDark)) });
  s += doll({ x: 324, y: 245, s: 1.14, dir: -1, body: 'coat', paint: C.blue, collar: 'bow',
    hat: 'top', hair: 'part', whiskers: 'pencil', skin: SKIN[0], pose: 'clutch', rock: [-1, 1, 2.4],
    carry: blob('M4 -56 l2 1.5 l2 -1.8 l-.6 3.2 l-1.6 1.7 l-1.2 -1.3Z', C.mustard) });

  // The slates, copybook and counterfoils sit on violet felt, clear of the dolls.
  s += rect(126, 227, 7, 38, C.woodDark, 1) + rect(267, 227, 7, 38, C.woodDark, 1)
    + path('M126 212 H273 L289 234 L283 248 L273 245 L261 250 L248 246 L236 251 L223 247 L211 251 L197 247 L185 251 L172 246 L159 250 L146 246 L132 249 L115 243 L111 235Z', '#865599')
    + line('M117 234 Q193 242 282 235', 1.7, C.mustard);
  s += g('translate(187,213) rotate(-9)', rect(-16, -10, 32, 21, C.woodDark, 2) + rect(-13, -7, 26, 15, '#47696e', 1))
    + g('translate(209,218) rotate(8)', rect(-17, -11, 34, 22, C.woodLight, 2) + rect(-14, -8, 28, 16, '#47696e', 1)
      + line('M-10 -4 q3 -3 5 0 t6 -1 t7 -1 M-10 -1 q3 -2 6 0 t7 -1', 0.65, C.white) + bird(3, 4, C.white));
  s += g('translate(137,228) rotate(-7)', rect(-15, -10, 30, 20, C.woodDark, 1.4)
    + card(-6, -1, -6, C.sky) + card(7, -1, 6, '#86be68') + rect(13, -2, 4, 5, C.brass, 0.7));
  s += g('translate(261,227) rotate(-7)', rect(-14, -7, 26, 12, C.cream, 0.7)
    + rect(-11, -3, 26, 12, C.white, 0.7) + line('M-6 1 h11 M-6 4 h7 M8 -2 v10', 0.7, C.navy));
  return s;
}
