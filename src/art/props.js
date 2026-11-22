// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// Stage sets and props, cut from printed card like the dolls. Positions are in scene units
// (400 by 280); for anything standing on the floor, y is where it touches the boards.

import { C, rect, ell, circ, path, line, blob, dot, bar, g, sway, gloss, shadow, shade, label } from './kit.js';

export const W = 400;
export const H = 280;
export const FLOOR = 196;

const thin = `stroke="${C.ink}" stroke-width=".8"`;

function boards(top, colour, step = 36) {
  let s = bar(0, top, W, H - top, colour);
  const seam = shade(colour, -0.2);
  for (let i = -4; i <= 15; i++) {
    const x1 = i * step + 2;
    const x2 = 200 + (x1 - 200) * 1.6;
    s += line(`M${x1} ${top} L${x2.toFixed(1)} ${H}`, 1, seam);
  }
  return s + line(`M0 ${top} H${W}`);
}

// An indoor room: wall, optional stripes, optional dado panelling, skirting and floorboards.
export function room({ wall = C.cream, stripe = null, stripeGap = 22, dado = null, dadoH = 52, floor = C.wood, rug = null } = {}) {
  let s = bar(0, 0, W, FLOOR, wall);
  if (stripe) for (let x = 6; x < W; x += stripeGap) s += bar(x, 0, 7, FLOOR, stripe);
  if (dado) {
    s += bar(0, FLOOR - dadoH, W, dadoH, dado) + line(`M0 ${FLOOR - dadoH} H${W}`);
    for (let x = 10; x < W; x += 48) s += rect(x, FLOOR - dadoH + 9, 30, dadoH - 24, shade(dado, 0.12), 2, 'stroke-width="1"');
  }
  s += bar(0, FLOOR - 8, W, 8, shade(floor, -0.35)) + line(`M0 ${FLOOR - 8} H${W}`, 1);
  s += boards(FLOOR, floor);
  if (rug) s += ell(rug.x, rug.y, rug.rx, rug.ry, rug.color) + ell(rug.x, rug.y, rug.rx - 9, rug.ry - 4.5, 'none', `stroke="${rug.trim || C.cream}" stroke-width="2.2" stroke-dasharray="1 5"`);
  return s;
}

// The glasshouse: night through the panes, a brick footing, stone flags.
export function glasshouse() {
  const sill = FLOOR - 30;
  let s = bar(0, 0, W, sill, C.night);
  s += circ(338, 36, 13, '#f6e9b8') + dot(334, 32, 2.4, '#e2d294') + dot(343, 41, 1.6, '#e2d294');
  for (const [x, y] of [[30, 22], [78, 44], [140, 18], [196, 50], [250, 24], [292, 62], [372, 78], [108, 80]]) s += dot(x, y, 1.2, '#f6e9b8');
  s += blob(`M0 ${sill} V136 Q40 118 80 132 Q130 150 180 128 Q230 108 280 132 Q330 152 400 124 V${sill}Z`, '#1b4a4f');
  s += bar(0, 0, W, sill, '#bfe6df', 0, 'opacity=".13"');
  for (let x = 0; x <= W; x += 57) s += rect(x - 2.5, -3, 5, sill + 3, C.cream, 0, 'stroke-width="1.1"');
  s += rect(-3, 60, W + 6, 5, C.cream, 0, 'stroke-width="1.1"');
  s += rect(-3, sill, W + 6, 30, '#c9694d', 0);
  const mortar = shade('#c9694d', -0.25);
  s += line(`M0 ${sill + 10} H${W} M0 ${sill + 20} H${W}`, 1, mortar);
  for (let x = 12; x < W; x += 34) s += line(`M${x} ${sill} v10 M${x + 17} ${sill + 10} v10 M${x} ${sill + 20} v10`, 1, mortar);
  s += boards(FLOOR, '#dccfb3', 44);
  s += line(`M0 222 H${W} M0 254 H${W}`, 1, shade('#dccfb3', -0.2));
  return s;
}

export function door(x, y, { w = 42, h = 106, color = C.teal, frame = C.woodDark, knob = 1, open = false } = {}) {
  let s = rect(x - w / 2 - 5, y - h - 5, w + 10, h + 5, frame, 2);
  if (open) return s + rect(x - w / 2, y - h, w, h, '#3b2d36', 1);
  s += rect(x - w / 2, y - h, w, h, color, 1);
  const inset = shade(color, 0.14);
  s += rect(x - w / 2 + 6, y - h + 7, w - 12, h * 0.4, inset, 2, 'stroke-width="1"');
  s += rect(x - w / 2 + 6, y - h * 0.5 + 2, w - 12, h * 0.42, inset, 2, 'stroke-width="1"');
  s += dot(x + knob * (w / 2 - 5), y - h * 0.52, 2.4, C.brass, thin);
  return s;
}

export function windowPane(x, y, { w = 58, h = 82, night = true, curtain = null } = {}) {
  let s = rect(x - w / 2 - 4, y - h - 4, w + 8, h + 8, C.white, 2);
  s += rect(x - w / 2, y - h, w, h, night ? C.night : C.sky, 1);
  if (night) s += circ(x + w * 0.2, y - h * 0.7, 6, '#f6e9b8') + dot(x - w * 0.25, y - h * 0.8, 1, '#f6e9b8') + dot(x - w * 0.1, y - h * 0.45, 1, '#f6e9b8');
  s += line(`M${x} ${y - h} V${y} M${x - w / 2} ${y - h / 2} H${x + w / 2}`, 2.2, C.white) + line(`M${x} ${y - h} V${y} M${x - w / 2} ${y - h / 2} H${x + w / 2}`, 0.8);
  if (curtain) {
    const cw = w * 0.36;
    s += path(`M${x - w / 2 - 7} ${y - h - 6} h${cw + 7} q-2 ${h * 0.5} -${cw} ${h + 12} h-7Z`, curtain);
    s += path(`M${x + w / 2 + 7} ${y - h - 6} h-${cw + 7} q2 ${h * 0.5} ${cw} ${h + 12} h7Z`, curtain);
    s += rect(x - w / 2 - 10, y - h - 10, w + 20, 5, C.brass, 2.5);
  }
  return s;
}

export function pot(x, y, r = 8, plant = 'fern') {
  let s = '';
  if (plant === 'fern') for (const a of [-52, -24, 0, 24, 52]) s += g(`translate(${x},${y - r * 1.6}) rotate(${a})`, ell(0, -r * 1.25, r * 0.36, r * 1.25, C.green));
  if (plant === 'bush') s += circ(x - r * 0.5, y - r * 2.3, r * 0.8, C.green) + circ(x + r * 0.5, y - r * 2.3, r * 0.8, C.green) + circ(x, y - r * 2.9, r * 0.9, C.green);
  if (plant === 'tall') s += line(`M${x} ${y - r * 1.6} V${y - r * 5}`, 2, C.greenDark) + ell(x - r * 0.6, y - r * 3.4, r * 0.7, r * 0.3, C.green) + ell(x + r * 0.6, y - r * 4.2, r * 0.7, r * 0.3, C.green) + circ(x, y - r * 5.2, r * 0.55, C.red);
  if (plant === 'orchid') s += line(`M${x} ${y - r * 1.6} Q${x - 3} ${y - r * 3.4} ${x + 4} ${y - r * 4.6}`, 1.6, C.greenDark) + circ(x + 4, y - r * 4.7, r * 0.5, C.white) + circ(x - 1, y - r * 3.7, r * 0.45, C.white);
  s += path(`M${x - r} ${y - r * 1.5} H${x + r} L${x + r * 0.72} ${y} H${x - r * 0.72}Z`, '#d2714f');
  s += rect(x - r * 1.12, y - r * 1.75, r * 2.24, r * 0.42, '#d2714f', 1);
  return s;
}

export function pottingBench(x, y, w = 86) {
  let s = rect(x + 5, y - 42, 6, 42, C.woodDark, 1) + rect(x + w - 11, y - 42, 6, 42, C.woodDark, 1);
  s += rect(x + 3, y - 18, w - 6, 5, C.wood, 1);
  s += pot(x + 26, y - 18, 6, 'none') + pot(x + 44, y - 18, 7, 'bush') + pot(x + 64, y - 18, 5.5, 'none');
  s += rect(x, y - 49, w, 7, C.woodLight, 2);
  return s;
}

export function openBook(x, y, { w = 15, color = C.white } = {}) {
  return rect(x - w, y - 9, w, 9, color, 1) + rect(x, y - 9, w, 9, color, 1) +
    line(`M${x - w + 3} ${y - 6} h${w - 6} M${x - w + 3} ${y - 3.4} h${w - 7} M${x + 3} ${y - 6} h${w - 6} M${x + 3} ${y - 3.4} h${w - 8}`, 0.8, C.grey);
}

// An empty display stand with a brass plate.
export function plantStand(x, y) {
  return ell(x, y - 1.5, 13, 4, C.wood) + rect(x - 5, y - 58, 10, 57, C.woodLight, 2) +
    rect(x - 4, y - 40, 8, 6, C.brass, 1, 'stroke-width="1"') +
    ell(x, y - 58, 17, 5, C.woodLight) + ell(x, y - 59, 9.5, 2.6, 'none', `stroke="${C.woodDark}" stroke-width="1.6" stroke-dasharray="2 2.4"`);
}

export function spade(x, y, lean = 9) {
  return g(`translate(${x},${y}) rotate(${lean})`,
    rect(-1.9, -78, 3.8, 62, C.woodLight, 1.9) + rect(-6, -84, 12, 6, C.woodLight, 3) +
    path('M-7.5 -17 H7.5 V-6 Q0 5 -7.5 -6Z', C.grey) + blob('M-3 -14 V-6 Q0 -2 0 -2 Z', shade(C.grey, -0.35), 'opacity=".5"'));
}

export function shearsOnHook(x, y) {
  return dot(x, y, 2, C.brass, thin) + g(`translate(${x},${y + 3}) rotate(8)`,
    path('M-1 0 L-4 26 L0 22Z', C.grey) + path('M1 0 L4 26 L0 22Z', C.grey) +
    circ(-4, -4, 4, 'none', `stroke="${C.red}" stroke-width="2.6"`) + circ(4, -4, 4, 'none', `stroke="${C.red}" stroke-width="2.6"`) +
    circ(-4, -4, 5.3, 'none', 'stroke-width=".9"') + circ(4, -4, 5.3, 'none', 'stroke-width=".9"') + dot(0, 3, 1.3, C.ink));
}

export function carpetBag(x, y, color = C.plum) {
  let s = path(`M${x - 9} ${y - 20} q9 -11 18 0`, 'none', 'stroke-width="3.4"') + line(`M${x - 9} ${y - 20} q9 -11 18 0`, 1.6, C.woodLight);
  s += path(`M${x - 17} ${y} L${x - 15} ${y - 19} Q${x} ${y - 25} ${x + 15} ${y - 19} L${x + 17} ${y}Z`, color);
  for (const dx of [-9, 0, 9]) s += path(`M${x + dx} ${y - 15} l4 5 l-4 5 l-4 -5Z`, C.mustard, 'stroke-width=".9"');
  s += rect(x - 4, y - 23.5, 8, 5, C.brass, 1, 'stroke-width="1"');
  return s;
}

// A lantern hanging from the hand (drawn around the grip at the origin).
export function lantern() {
  return dot(0, 12, 15, '#ffe58f', 'opacity=".42"') + line('M-4 4 Q0 -3 4 4', 1.4) +
    path('M-5 4 H5 L6.5 8 H-6.5Z', C.black) + rect(-5.5, 8, 11, 12, '#ffd75e', 2) + line('M0 8 V20', 0.9) +
    rect(-6.5, 20, 13, 3.4, C.black, 1) + dot(0, 14, 2.4, '#fff3c4');
}

export function hatInHand(color = C.black) {
  return g('translate(0,3)', ell(0, 2, 11, 2.8, color) + path('M-7 2 Q-7.5 -8 0 -8 Q7.5 -8 7 2Z', color));
}

// ---------- furniture and small props ----------

// Back and seat, drawn behind the sitter; the arms go on afterwards, in front.
export function armchair(x, y, color = C.red) {
  return rect(x - 32, y - 100, 64, 86, color, 17) +
    [-13, 0, 13].map((dx) => dot(x + dx, y - 70, 1.7, shade(color, -0.35))).join('') +
    rect(x - 27, y - 34, 54, 26, shade(color, 0.12), 5);
}

export function armchairArms(x, y, color = C.red) {
  return rect(x - 42, y - 58, 15, 52, color, 7) + rect(x + 27, y - 58, 15, 52, color, 7) +
    rect(x - 37, y - 7, 8, 8, C.woodDark, 2) + rect(x + 29, y - 7, 8, 8, C.woodDark, 2);
}

// A tea tray carried in both hands (drawn in the doll's own space).
export function teaTray() {
  return ell(-8, -51, 7.5, 6, C.white) + line('M-13 -52 h10', 1.6, C.blue) + path('M-0.8 -52 q6 -1 6.5 -6', 'none') + dot(-8, -57.6, 1.4, C.blue, thin) +
    rect(6, -52, 8, 7, C.white, 2) + rect(15, -50, 5, 5, C.white, 1.5) +
    rect(-21, -45, 42, 4.4, C.grey, 2.2);
}

export function fallenCup(x, y) {
  return `<ellipse cx="${x + 11}" cy="${y + 2}" rx="14" ry="3.6" fill="#8a5a34" opacity=".5"/>` +
    g(`translate(${x},${y}) rotate(-72)`, path('M-5.5 -6 H5.5 L4 3.4 Q0 5.6 -4 3.4Z', C.white) + path('M5.5 -4 q5.5 1 1.6 5.4', 'none') + line('M-4.6 -3 H4.6', 1.4, C.blue));
}

export function wallNotice(x, y, w = 24, h = 30, head = C.red) {
  return rect(x - w / 2, y, w, h, C.white, 1) + bar(x - w / 2 + 3, y + 4, w - 6, 3.6, head, 1) +
    line(`M${x - w / 2 + 3} ${y + 12} h${w - 6} M${x - w / 2 + 3} ${y + 16.5} h${w - 8} M${x - w / 2 + 3} ${y + 21} h${w - 6} M${x - w / 2 + 3} ${y + 25.5} h${w - 11}`, 0.9, C.grey) +
    dot(x, y + 1.4, 1.6, C.brass, thin);
}

export function shelf(x, y, w) {
  return path(`M${x + 6} ${y + 4} v8 l8 -8Z M${x + w - 6} ${y + 4} v8 l-8 -8Z`, C.woodDark) + rect(x, y, w, 4.5, C.woodLight, 1.5);
}

export function jar(x, y, color = C.sky, h = 13) {
  return rect(x - 4.5, y - h, 9, h, color, 2) + rect(x - 3, y - h - 3, 6, 3.4, C.woodLight, 1);
}

export function bottle(x, y, color = C.green, h = 15) {
  return rect(x - 4, y - h, 8, h, color, 2.4) + rect(x - 1.8, y - h - 5, 3.6, 5.4, color, 1) + rect(x - 2.2, y - h - 7.4, 4.4, 2.8, C.woodLight, 1) +
    bar(x - 2.6, y - h + 4, 5.2, 5, C.white, 1);
}

export function tin(x, y, color = C.mustard) {
  return rect(x - 6, y - 9, 12, 9, color, 1.5) + rect(x - 6.6, y - 11, 13.2, 3, shade(color, -0.25), 1.2);
}

// ---------- the railway compartment ----------

export function compartment() {
  const wall = '#c98a52';
  let s = bar(0, 0, W, 226, wall);
  for (const [x, w] of [[112, 132], [258, 130]]) s += rect(x, 40, w, 76, shade(wall, 0.14), 5, 'stroke-width="1"');
  s += bar(0, 226, W, H - 226, '#7a3340');
  for (let x = 14; x < W; x += 28) for (let y = 238; y < H; y += 18) s += dot(x + ((y / 18) % 2) * 14, y, 1.6, '#9a4a55');
  return s + line(`M0 226 H${W}`);
}

export function bench(y = 226) {
  let s = rect(16, y - 104, 368, 80, C.teal, 9);
  for (let x = 46; x < 372; x += 44) for (const dy of [-84, -56]) s += dot(x + (dy === -56 ? 22 : 0), y + dy, 1.9, C.tealDark);
  s += rect(10, y - 30, 380, 22, shade(C.teal, -0.16), 7);
  s += rect(18, y - 9, 364, 9, C.woodDark, 0);
  return s;
}

export function luggageRack(x, y, w) {
  let s = '';
  for (let dx = 6; dx < w; dx += 8) s += line(`M${x + dx} ${y} l-5 9 M${x + dx - 5} ${y} l5 9`, 0.8, C.brassDark);
  s += rect(x, y - 2, w, 3.6, C.brass, 1.8) + line(`M${x} ${y + 9} H${x + w}`, 1.6, C.brassDark);
  s += path(`M${x + 4} ${y + 9} q-1 9 -8 11`, 'none') + path(`M${x + w - 4} ${y + 9} q1 9 8 11`, 'none');
  return s;
}

export function hatbox(x, y, color = C.pink) {
  return rect(x - 15, y - 17, 30, 17, color, 3) + rect(x - 17, y - 22, 34, 7, shade(color, -0.15), 3) +
    line(`M${x} ${y - 22} V${y}`, 2, C.white) + rect(x - 5, y - 12, 10, 6, C.white, 1, 'stroke-width="1"');
}

export function sampleCase(x, y, color = '#7b5235') {
  return path(`M${x - 6} ${y - 18} q6 -8 12 0`, 'none', 'stroke-width="2.4"') +
    rect(x - 22, y - 18, 44, 18, color, 3) + rect(x - 8, y - 12, 16, 7, C.brass, 1, 'stroke-width="1"') +
    dot(x - 17, y - 14, 1.4, C.brass, thin) + dot(x + 17, y - 14, 1.4, C.brass, thin);
}

export function openBriefcase(x, y, color = '#5b3d2b') {
  return path(`M${x - 17} ${y - 10} L${x - 13} ${y - 30} H${x + 13} L${x + 17} ${y - 10}Z`, shade(color, 0.12)) +
    g(`translate(${x + 2},${y - 14}) rotate(-12)`, rect(-8, -6, 14, 9, C.white, 1, 'stroke-width="1"')) +
    g(`translate(${x - 6},${y - 13}) rotate(9)`, rect(-6, -5, 12, 8, C.white, 1, 'stroke-width="1"')) +
    rect(x - 17, y - 11, 34, 11, color, 2);
}

export function frame(x, y, w, h, inner = C.white, lines = true) {
  let s = rect(x - w / 2 - 3, y - 3, w + 6, h + 6, C.woodDark, 2) + rect(x - w / 2, y, w, h, inner, 1, 'stroke-width="1"');
  if (lines) for (let ly = y + 5; ly < y + h - 2; ly += 4.6) s += line(`M${x - w / 2 + 4} ${ly} h${w - 8}`, 0.9, C.grey);
  return s;
}

// ---------- the dressing room ----------

export function dressingTable(x, y) {
  let s = rect(x - 33, y - 122, 66, 62, C.woodDark, 6) + rect(x - 26, y - 115, 52, 48, C.glass, 3) +
    blob(`M${x - 20} ${y - 74} l22 -36 h8 l-22 36Z`, '#fff', 'opacity=".5"');
  for (const [dx, dy] of [[-33, -110], [-33, -91], [-33, -72], [33, -110], [33, -91], [33, -72], [-17, -122], [0, -122], [17, -122]]) {
    s += dot(x + dx, y + dy, 5.5, '#ffe58f', 'opacity=".5"') + dot(x + dx, y + dy, 3, '#fff3c4', thin);
  }
  s += rect(x - 40, y - 46, 6, 46, C.woodDark, 1) + rect(x + 34, y - 46, 6, 46, C.woodDark, 1);
  s += rect(x - 44, y - 40, 88, 16, C.wood, 2) + dot(x - 18, y - 32, 1.8, C.brass, thin) + dot(x + 18, y - 32, 1.8, C.brass, thin);
  s += rect(x - 46, y - 58, 92, 7, C.woodLight, 2);
  return s;
}

export function playbill(x, y, w = 30, h = 46) {
  return rect(x - w / 2, y, w, h, C.cream, 1) + bar(x - w / 2 + 3, y + 4, w - 6, 8, C.red, 1) + bar(x - w / 2 + 6, y + 15, w - 12, 3, C.ink, 1) +
    line(`M${x - w / 2 + 4} ${y + 23} h${w - 8} M${x - w / 2 + 4} ${y + 28} h${w - 8} M${x - w / 2 + 4} ${y + 33} h${w - 8} M${x - w / 2 + 4} ${y + 38} h${w - 12}`, 1, C.grey);
}

export function chair(x, y, color = C.woodLight) {
  return rect(x - 14, y - 60, 5, 60, color, 2) + rect(x + 9, y - 60, 5, 60, color, 2) +
    rect(x - 14, y - 60, 28, 7, color, 2) + rect(x - 14, y - 47, 28, 5, color, 2) +
    rect(x - 17, y - 30, 34, 7, shade(color, -0.12), 2);
}

export function scriptBook(x, y) {
  return g(`translate(${x},${y}) rotate(-8)`, rect(-11, -6, 22, 6, C.white, 1) + bar(-11, -6, 5, 6, C.red, 1) + line('M-4 -3 h12', 0.9, C.grey));
}

// A cloak folded over both arms (drawn in the doll's own space).
export function cloakOverArm(color = C.red) {
  return path('M-20 -45 Q0 -50 20 -45 L17 -14 Q9 -20 4 -13 Q-3 -20 -9 -12 Q-14 -19 -18 -14Z', color) +
    line('M-9 -44 L-10 -18 M4 -45 L3 -18', 1, shade(color, -0.3)) + path('M-20 -45 Q0 -50 20 -45 l-.6 5 Q0 -45 -19.4 -40Z', C.white);
}

// A bottle lying on the floor.
export function spiltBottle(x, y, color = C.green, turn = 78) {
  return g(`translate(${x},${y}) rotate(${turn})`, rect(-4.4, -9, 8.8, 17, color, 2.6) + rect(-2, -14.5, 4, 6, color, 1) + bar(-2.8, -4, 5.6, 7, C.white, 1));
}

// ---------- the study ----------

export function fireplace(x, y) {
  let s = rect(x - 38, y - 78, 76, 78, '#eadfc8', 2) + path(`M${x - 23} ${y} V${y - 40} Q${x} ${y - 62} ${x + 23} ${y - 40} V${y}Z`, '#3b2d36');
  s += path(`M${x - 14} ${y - 2} Q${x - 16} ${y - 20} ${x - 7} ${y - 30} Q${x - 6} ${y - 18} ${x} ${y - 36} Q${x + 6} ${y - 18} ${x + 8} ${y - 28} Q${x + 16} ${y - 18} ${x + 14} ${y - 2}Z`, C.red);
  s += path(`M${x - 7} ${y - 2} Q${x - 8} ${y - 12} ${x} ${y - 22} Q${x + 8} ${y - 12} ${x + 7} ${y - 2}Z`, C.mustard, 'stroke-width="1"');
  s += rect(x - 45, y - 86, 90, 9, '#f4ecd8', 2);
  return s;
}

// A framed portrait: `sitter` is doll-head markup.
export function portrait(x, y, w, h, sitter, coat = C.navy) {
  return rect(x - w / 2 - 5, y - 5, w + 10, h + 10, C.brass, 3) + rect(x - w / 2, y, w, h, '#2f5d5a', 1, 'stroke-width="1"') +
    `<svg x="${x - w / 2}" y="${y}" width="${w}" height="${h}" viewBox="${-w / 2} ${-h + 8} ${w} ${h}">` +
    path('M-17 12 Q-17 -4 -6 -6 L6 -6 Q17 -4 17 12Z', coat) + g('translate(0,-6) scale(1.02)', sitter) + '</svg>';
}

export function bellPull(x, top, len, cut = false) {
  let s = rect(x - 3.6, top, 7.2, len, C.red, 1);
  for (let y = top + 7; y < top + len - 3; y += 9) s += path(`M${x} ${y - 3} l2.4 3 l-2.4 3 l-2.4 -3Z`, C.mustard, 'stroke-width=".7"');
  if (cut) return s + line(`M${x - 3.6} ${top + len} l1.2 4 M${x - 1} ${top + len} l.6 5 M${x + 1.6} ${top + len} l1.4 4 M${x + 3.6} ${top + len} l.4 3`, 1.1, C.redDark);
  return s + path(`M${x - 4.6} ${top + len} h9.2 l2 13 q-6.6 5 -13.2 0Z`, C.mustard) + line(`M${x - 3} ${top + len + 5} v8 M${x} ${top + len + 5} v9 M${x + 3} ${top + len + 5} v8`, 0.9, C.brassDark);
}

export function curtainCord(x, top, len) {
  return line(`M${x} ${top} V${top + len}`, 2.2, C.mustard) + line(`M${x} ${top} V${top + len}`, 0.7) +
    path(`M${x - 3.2} ${top + len} h6.4 l1.4 10 q-4.6 4 -9.2 0Z`, C.mustard, 'stroke-width="1"');
}

export function desk(x, y, w = 104) {
  let s = rect(x - w / 2 + 5, y - 28, w - 10, 28, C.wood, 2);
  s += rect(x - w / 2 + 11, y - 22, (w - 28) / 2, 15, shade(C.wood, 0.12), 2, 'stroke-width="1"') + rect(x + 3, y - 22, (w - 28) / 2, 15, shade(C.wood, 0.12), 2, 'stroke-width="1"');
  s += dot(x - w / 4 + 2, y - 14.5, 1.8, C.brass, thin) + dot(x + w / 4 - 2, y - 14.5, 1.8, C.brass, thin);
  s += rect(x - w / 2, y - 35, w, 8, C.woodLight, 2);
  return s;
}

export function paper(x, y, turn = 0, w = 20, h = 6.5) {
  return g(`translate(${x},${y}) rotate(${turn})`, rect(-w / 2, -h, w, h, C.white, 1, 'stroke-width="1"') + line(`M${-w / 2 + 3} ${-h + 2.4} h${w - 6} M${-w / 2 + 3} ${-h + 4.6} h${w - 9}`, 0.7, C.grey));
}

export function inkwell(x, y) {
  return rect(x - 4, y - 6, 8, 6, C.navy, 1.5) + rect(x - 2.4, y - 8, 4.8, 2.6, C.brass, 1) + line(`M${x + 2} ${y - 7} l7 -11`, 1.3) + path(`M${x + 9} ${y - 18} q3 -6 1 -9 q-4 3 -3 8Z`, C.white, 'stroke-width=".9"');
}

export function bookcase(x, y, w, h) {
  let s = rect(x, y - h, w, h, C.woodDark, 2);
  const cols = [C.red, C.teal, C.mustard, C.plum, C.blue, C.green, C.cream];
  let k = 0;
  for (let sy = y - h + 6; sy < y - 8; sy += 26) {
    for (let bx = x + 4; bx < x + w - 6; bx += 6.5) s += rect(bx, sy, 5.4, 19, cols[k++ % cols.length], 1, 'stroke-width=".8"');
    s += rect(x + 2, sy + 19, w - 4, 3, C.wood, 0, 'stroke-width=".8"');
  }
  return s;
}

// A brief-bag hanging from the hand.
export function briefBag(color = '#5b3d2b') {
  return path('M-5 3 q5 -6 10 0', 'none', 'stroke-width="2"') + rect(-13, 3, 26, 18, color, 3) + rect(-13, 3, 26, 6, shade(color, -0.2), 3) + rect(-3.4, 6.5, 6.8, 5, C.brass, 1, 'stroke-width="1"');
}

// A shorthand notebook held to the chest.
export function notebook() {
  return g('rotate(12)', rect(-7, -2, 14, 17, C.white, 1.5) + line('M-4 3 h8 M-4 6.5 h8 M-4 10 h6', 0.8, C.grey) + line('M-5 -2 v-2 M-1.6 -2 v-2 M1.8 -2 v-2 M5 -2 v-2', 1.1));
}

// The cabinet's own dressing, the same on every scene: a swagged pelmet with gold fringe.
export function valance() {
  const n = 8;
  const w = W / n;
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = i * w;
    s += path(`M${x} -3 H${x + w} V8 Q${x + w / 2} 27 ${x} 8Z`, i % 2 ? C.red : C.redDark);
    s += line(`M${x + 2} 9.5 Q${x + w / 2} 27 ${x + w - 2} 9.5`, 2.2, C.mustard);
  }
  for (let i = 0; i <= n; i++) s += path(`M${i * w - 2.4} 6 h4.8 l1 9 q-3.4 4 -6.8 0Z`, C.mustard, 'stroke-width="1"');
  return s;
}

export { rect, ell, circ, path, line, blob, dot, bar, g, sway, gloss, shadow, shade, label, thin };
