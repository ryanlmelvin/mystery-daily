// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import { C, SKIN, rect, ell, circ, path, line, dot, bar, g } from './kit.js';
import { doll } from './doll.js';
import * as P from './props.js';

export const pins = {
  bill: [193, 81], flower: [114, 202], tumbler: [218, 210], box: [332, 151],
  aisle: [163, 241], sleeve: [48, 199], horn: [64, 133], camera: [302, 220]
};
export const focus = { bill: [194, 87], sleeve: [47, 196], horn: [49, 142], camera: [305, 218], aisle: [157, 244] };

function phonograph() {
  // A wax cylinder rides on the mandrel. The crank has the same stopped and
  // running motion as the cabinet's cogs, turning about the axle in its base.
  const crank = g('translate(18 4)', '<g class="cog" style="--d:1;--t:2s">' +
    line('M0 0l4 5', 2.5, C.brass) + dot(4, 5, 1.8, C.ink) + '</g>');
  return g('translate(48 158)',
    rect(-19, -2, 39, 12, C.woodDark, 2) + rect(-16, -9, 25, 7, C.wood, 3) +
    ell(9, -5.5, 2.5, 3.3, C.brass) + line('M-10-9l3-6 10-3', 2, C.brassDark) +
    path('M4-16Q13-23 8-30Q4-37-9-41L-17-25Q2-24 0-18Z', C.mustard) +
    ell(-12, -33, 10, 16, C.brass) + ell(-12, -33, 6.6, 12.5, C.woodDark) +
    line('M-14-42q-7 9-2 17', 1.2, C.cream) + crank);
}

function boxCamera() {
  return g('translate(305 217)', line('M0 3l-11 25m10-23 1 22m2-24 11 25', 2.5, C.woodDark) +
    rect(-9, -7, 17, 13, C.woodDark, 2) + path('M8-5l7-3v12l-7-2Z', C.black) +
    rect(15, -8, 3, 12, C.brass, 1) + circ(-4, 0, 2, C.brass));
}

function songSash() {
  const motif = line('M-7-2v-3m12 9v-4', .6) + dot(-8, -1.7, 1.3, C.ink) + dot(4.5, 4, 1.2, C.ink) +
    path('M-1-2l1 1 2-1-1 2 1 1-2-1-2 1 1-2Z', C.mustard);
  return g('translate(0 -54)', path('M-11-8L11 4v5L-12-3Z', C.cream) + motif);
}

function bunch() {
  let flowers = '';
  for (const [x, y] of [[-7, -11], [2, -18], [7, -10], [-1, -8]]) {
    flowers += line(`M1 4L${x} ${y}`, 1.5, C.greenDark);
    flowers += path(`M${x - 4} ${y}q-2-4 1-4 2-4 4-1 5-2 4 2 4 3 0 5-3 4-6 0Z`, C.mustard);
    flowers += dot(x, y, 1.6, C.woodDark);
  }
  return flowers + path('M-4 0l7-2 2 5-8 1Z', C.pink);
}

function checks() {
  let patch = rect(-8, -56, 16, 14, C.cream);
  for (let row = 0; row < 3; row++) {
    for (let col = row % 2; col < 4; col += 2) patch += bar(-8 + col * 4, -56 + row * 4.5, 4, 4.5, C.tealDark);
  }
  return patch;
}

function curtain() {
  return path('M0 19H115Q102 98 70 109Q61 139 69 176Q57 184 48 175Q37 183 28 175Q19 177 15 170Q30 132 45 108Q12 90 0 55Z', '#a93a68') +
    line('M8 24q16 62 43 79m-14-79q12 52 22 72m23-68q-8 46-17 67M29 169l20-49m-5 52l10-49', 1.3, '#722940') +
    path('M44 102l27-3 1 7-28 6Z', C.brass) + line('M67 104q1 13 9 15', 2.5, C.brass);
}

export function draw() {
  let scene = P.room({ wall: '#ffddb0', stripe: '#f5c798', stripeGap: 15, dado: '#9b6970', floor: '#e4aa77' });
  scene += path('M257 187V86q0-40 61-45 70 2 75 46v100Z', C.brass) +
    path('M264 184V90q2-34 55-39 59 1 66 37v96Z', '#773750') +
    line('M267 86q49-49 109-6', 2, C.pink);
  scene += P.playbill(176, 56, 35, 56);
  scene += curtain();
  scene += P.plantStand(48, 193) + phonograph() + g('translate(47 196) rotate(-9)', rect(-11, -5, 20, 10, C.pink, 1) + line('M-7-1H6m-11 3h7', .8));
  scene += doll({ x: 330, y: 195, s: .95, dir: -1, sit: true, body: 'coat', paint: C.navy,
    collar: 'tie', collarColor: C.red, hair: 'part', hairColor: C.grey, whiskers: 'pencil', skin: SKIN[3], pose: 'slump', spring: true });
  scene += path('M259 167Q327 184 399 163V195Q329 220 259 199Z', C.redDark) +
    path('M258 164Q327 181 399 160v7q-72 22-141 6Z', C.brass) +
    line('M266 186q9 11 19 1 11 16 23 4 14 14 25 0 12 10 24-3 11 9 24-6', 1.5, C.brass) +
    ell(366, 96, 12, 19, C.brass) + ell(366, 96, 9, 16, C.glass) + line('M362 97l7-9', 1.1, C.white);
  scene += doll({ x: 117, y: 238, s: 1.12, dir: -1, body: 'dress', paint: '#d05868', hat: 'plume', hatColor: C.mustard, hatBand: C.red,
    skin: SKIN[2], hair: 'curls', hairColor: C.black, pose: 'hold', hold: bunch(), carry: songSash(), nod: [-2, 2, 2] });
  scene += doll({ x: 218, y: 248, s: 1.13, dir: 1, body: 'coat', paint: C.tealDark, legs: C.tealDark, hat: 'bowler',
    hatColor: C.mustard, hair: 'crop', hairColor: '#925c37', collar: 'bow', collarColor: C.pink, skin: SKIN[1],
    pose: 'stand', carry: checks(), rock: [-1, 1, 2] });
  for (const [x, y, angle] of [[253, 244, 73], [260, 257, 94]]) {
    scene += g(`translate(${x} ${y}) rotate(${angle})`, path('M-1-11q-4-7-5-1-1 5 4 9v12h2V-3q3-5-1-8Z', C.pink));
  }
  scene += boxCamera();
  scene += P.paper(157, 246, -7, 20, 8);
  for (let x = 9; x < 400; x += 27) scene += path(`M${x - 4} 278q4-16 8 0Z`, C.mustard);
  return scene;
}
