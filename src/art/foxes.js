// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import { C, SKIN, rect, ell, circ, path, line, dot, g, sway } from './kit.js';
import { doll } from './doll.js';
import * as P from './props.js';

export const pins = { doorcard: [34, 88], fan: [115, 202], rose: [280, 197], host: [215, 260], slip: [204, 153], fiddle: [49, 178], score: [346, 142], masks: [350, 249] };
export const focus = { doorcard: [36, 85], slip: [202, 163], fiddle: [47, 172], score: [351, 151], masks: [346, 241] };

function ballroomMirror(x) {
  const outline = 'M-29 138V81a29 29 0 0 1 58 0v57Z';
  return g(`translate(${x} 0)`, path(outline, C.brass) + path('M-25 134V81a25 25 0 0 1 50 0v53Z', C.sky) +
    line('M-21 91l26-27m-23 44l34-35m-10 51l13-14', 2, C.white) + line('M0 57v76M-23 97h46', 1, C.brass));
}

function peacockFan() {
  const leaf = path('M0 1Q-10-4-15-17Q-12-22-7-21Q-5-26 0-23Q5-26 9-21Q16-22 18-15Q12-5 0 1Z', C.teal);
  const rays = [-11, -5, 1, 7, 13].map(x =>
    line(`M0 0L${x} -16`, .8, C.brass) + dot(x, -16, 2, C.navy)).join('');
  return leaf + rays + circ(0, 0, 1.7, C.brass);
}

function rose() {
  return line('M-2 4l6-18', 1.6, C.greenDark) + path('M1-6q-10 2-9-6 7 0 9 6Z', C.green) +
    path('M1-13q-6-3-2-7 2-5 6-2 7-2 6 4 2 7-5 7Z', C.red) + line('M1-17q5-5 6-1l-3 2', 1, C.redDark);
}

function droppedMasks() {
  const fox = path('M-15-7l1-12 10 8 9 1 10-8-1 13-11 12Z', '#d96a32') +
    path('M-9-2L2 2l8-3-8 7Z', C.cream) + line('M-9-7l5 2m7 0l5-1', 1.6) + dot(2, 5, 1.8, C.ink);
  const hare = path('M-9 1q-5-7 2-10-9-16-4-19 4-2 10 16 2-20 6-19 5 2-1 21 8 6 2 11Z', '#d8bcc9') +
    line('M-6-7l4 1m3 0l4-2', 1.4) + dot(0, 0, 1.2, C.ink);
  const stag = path('M-9-6l-5-4 7 1 8-1 5-2-1 7-6 9Z', C.wood) +
    line('M-8-7l-4-9 1-5m-1 7-4-2m17 7 6-9-1-4m0 8 6-4', 2.5, C.mustard) + dot(1, 2, 1.1, C.ink);
  return g('translate(322 243) rotate(-28)', stag) + g('translate(343 244) rotate(9)', fox) + g('translate(365 243) rotate(32)', hare);
}

function fiddle() {
  const body = path('M-4-10q-10-5-11 2-1 5 4 6-2 4-5 4-7 11 5 14 12 4 15-4 2-5-2-8 2-5 5-6 3-6-5-9Z', C.wood);
  return g('translate(49 168) rotate(-16)', body + rect(-2, -32, 4, 39, C.woodDark) + circ(0, -32, 4, C.wood) +
    line('M0-32v40', .7, C.white) + line('M9-30L15 18', 1.6, C.cream));
}

export function draw() {
  let scene = P.room({ wall: '#f3d2bf', stripe: '#efbdaf', dado: '#67a4a0', floor: '#dfb47d' });
  for (const x of [98, 200, 303]) scene += ballroomMirror(x);
  scene += line('M200 13v23', 1.7) + g('translate(200 35)', sway(
    path('M-29 2q7 15 28 7 18 8 30-7-7 21-29 14Q-22 23-29 2Z', C.brass) +
    [-26, 0, 26].map(x => rect(x - 2, -7, 4, 12, C.cream) + path(`M${x} -7q-5-3 1-9 4 7-1 9Z`, C.mustard)).join(''),
    -.8, .8, 2.6));
  scene += P.wallNotice(36, 71, 29, 37, C.teal);
  scene += P.chair(48, 202) + fiddle();
  scene += P.plantStand(202, 200) + path('M183 159q3 17 19 18 16-1 20-18Z', C.brass) +
    ell(202, 159, 19, 4, C.brassDark) + P.paper(202, 159, -13, 15, 6);
  scene += rect(349, 145, 4, 62, C.woodDark) + line('M351 197l-15 10m15-10l13 10', 3, C.woodDark) +
    P.openBook(350, 152, { w: 18 });
  scene += doll({ x: 116, y: 237, s: 1.14, dir: -1, body: 'dress', paint: C.plum, hat: 'plume', hatColor: C.plum, hatBand: C.teal,
    hair: 'curls', hairColor: C.black, skin: SKIN[3], pose: 'hold', hold: peacockFan(), wave: [-3, 3, 1.6] });
  scene += doll({ x: 277, y: 233, s: 1.12, dir: 1, body: 'coat', paint: C.blue, collar: 'bow', collarColor: C.red,
    hair: 'bun', hairColor: '#85462d', skin: SKIN[1], pose: 'clutch', hold: rose(), nod: [-2, 2, 1.8] });
  scene += P.shadow(190, 275, 66, 4) + doll({ x: 143, y: 270, s: 1.05, dir: 1, body: 'robe', paint: C.tealDark, trim: C.cream,
    hair: 'bald', hairColor: C.grey, whiskers: 'walrus', skin: SKIN[2], pose: 'dead', spring: true });
  scene += droppedMasks();
  return scene;
}
