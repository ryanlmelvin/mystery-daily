// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// The cast: turned wooden automaton dolls with painted faces and riveted arms.
// A doll is drawn in its own space, base at the origin, head up the negative y axis,
// about 105 units tall before its hat: a third of that is head, as on a peg doll. Everything a clue relies on (cap, apron, crown, whiskers)
// is a named option here, so a case can describe its cast in data.

import { C, SKIN, rect, ell, circ, path, line, dot, bar, g, sway, gloss, shadow, shade } from './kit.js';

const DEFAULTS = {
  x: 0, y: 0, s: 1, dir: 1,
  body: 'coat', // coat | shirt | dress | robe
  paint: C.navy,
  trim: C.white,
  legs: C.black,
  skin: SKIN[0],
  head: 'egg', // egg | ball | long | wide
  hair: null, // part | crop | bald | bun | bob | curls
  hairColor: '#5a3a22',
  hat: null, // top | bowler | mob | plume | crown | flat | boater
  hatColor: C.black,
  hatBand: C.red,
  whiskers: null, // handlebar | walrus | pencil | mutton | beard | goatee
  specs: false,
  cheeks: true,
  mood: 'calm', // calm | shock | shifty | stern | dead
  mouth: null, // smile | o | flat | frown (defaults from mood)
  collar: null, // clerical | bow | tie
  collarColor: C.red,
  apron: false,
  pose: 'stand', // stand | alarm | hold | carry | point | hip | reach | clutch | dead | slump
  sit: false,
  tilt: 0,
  hold: null, // svg held in the acting hand, kept level
  carry: null, // svg held in front of the body with both hands
  rock: null, // [a, b, seconds]: the whole doll rocks on its feet
  nod: null, // [a, b, seconds]: the head
  wave: null, // [a, b, seconds]: the acting arm
  spring: false // a sprung coil: this doll has stopped for good
};

// Shoulder and elbow angles, in degrees away from hanging straight down.
const POSES = {
  stand: { act: [6, 4], off: [6, 4] },
  alarm: { act: [148, 16], off: [148, 16] },
  hold: { act: [38, 62], off: [6, 4] },
  carry: { act: [16, -98], off: [16, -98] },
  point: { act: [84, 8], off: [8, 6] },
  hip: { act: [44, -112], off: [6, 4] },
  reach: { act: [163, 6], off: [8, 4] },
  clutch: { act: [30, -128], off: [6, 4] },
  dead: { act: [126, 22], off: [58, 38] },
  slump: { act: [3, 2], off: [3, 2] }
};

const thin = `stroke="${C.ink}" stroke-width=".8"`;
const rivet = (x, y) => dot(x, y, 1.9, C.brass, thin);

// A riveted paddle arm: shoulder at the origin, elbow part way down, a ball for a hand.
function arm(side, [a1, a2], sleeve, skin, held, wave) {
  const fore =
    rect(-3.4, -2, 6.8, 16, sleeve, 3.4) +
    circ(0, 15.5, 4.3, skin) +
    (held ? g(`translate(0,18) rotate(${side * (a1 + a2)})`, held) : '');
  let inner =
    rect(-3.9, -3, 7.8, 18, sleeve, 3.9) +
    g(`translate(0,13.5) rotate(${-side * a2})`, fore + rivet(0, 0)) +
    rivet(0, 0);
  if (wave) inner = sway(inner, wave[0], wave[1], wave[2], wave[3] || 0);
  return g(`translate(${side * 15.5},-55) rotate(${-side * a1})`, inner);
}

const HEADS = { egg: [12.5, 14.5], ball: [13.5, 13.5], long: [10.5, 16], wide: [15, 12.5] };

function hair(style, col) {
  switch (style) {
    case 'part':
      return path('M-12.6 -17 Q-13 -31 0 -30.5 Q13 -31 12.6 -17 Q9 -25 1 -24.5 Q-7 -24 -12.6 -17Z', col);
    case 'crop':
      return path('M-12.4 -19 Q-12 -30.5 0 -30.2 Q12 -30.5 12.4 -19 Q6 -23.5 0 -23.5 Q-6 -23.5 -12.4 -19Z', col);
    case 'bald':
      return circ(-12.2, -15, 3.2, col) + circ(12.2, -15, 3.2, col);
    case 'bun':
      return circ(0, -33, 5.2, col) +
        path('M-12.6 -16 Q-13.5 -31 0 -30.5 Q13.5 -31 12.6 -16 Q8 -24.5 0 -24.5 Q-8 -24.5 -12.6 -16Z', col);
    case 'bob':
      return path('M-13.5 -6 Q-17 -32 0 -31 Q17 -32 13.5 -6 Q12.5 -18 7 -24 Q0 -26.5 -7 -24 Q-12.5 -18 -13.5 -6Z', col);
    case 'curls':
      return [[-11, -21], [-6.5, -27.5], [0, -30], [6.5, -27.5], [11, -21]].map(([x, y]) => circ(x, y, 4.4, col)).join('');
    default:
      return '';
  }
}

function whiskers(style, col) {
  switch (style) {
    case 'handlebar':
      return path('M0 -9.6 Q-4 -12.5 -9.5 -8.2 Q-10 -5.5 -12 -6.5 Q-9 -4 -6 -6.5 Q-3 -6.2 0 -8 Q3 -6.2 6 -6.5 Q9 -4 12 -6.5 Q10 -5.5 9.5 -8.2 Q4 -12.5 0 -9.6Z', col);
    case 'walrus':
      return path('M-8.5 -10 Q0 -13.5 8.5 -10 Q10 -3 6.5 -1.5 Q4 -6.5 0 -6.5 Q-4 -6.5 -6.5 -1.5 Q-10 -3 -8.5 -10Z', col);
    case 'pencil':
      return line('M-5 -9.3 Q0 -10.8 5 -9.3', 1.9, col);
    case 'mutton':
      return path('M-12.4 -19 Q-15 -8 -8.5 -2 Q-5 -3.5 -6.5 -8 Q-9.5 -12 -9.8 -19Z', col) +
        path('M12.4 -19 Q15 -8 8.5 -2 Q5 -3.5 6.5 -8 Q9.5 -12 9.8 -19Z', col);
    case 'beard':
      return path('M-11.8 -11 Q-11 3.5 0 5 Q11 3.5 11.8 -11 Q7 -3.5 0 -3.5 Q-7 -3.5 -11.8 -11Z', col);
    case 'goatee':
      return path('M-3.5 -3.6 Q0 -5 3.5 -3.6 L0 4.5Z', col);
    default:
      return '';
  }
}

function hat(style, col, band) {
  switch (style) {
    case 'top':
      return rect(-9.5, -47, 19, 21, col, 1.5) + bar(-9.5, -31.5, 19, 4, band) + ell(0, -26.5, 15, 3.2, col);
    case 'bowler':
      return path('M-10.5 -26.5 Q-11.5 -41 0 -41 Q11.5 -41 10.5 -26.5Z', col) + ell(0, -26.5, 15, 3, col);
    case 'mob':
      return path('M-13 -23 Q-18.5 -41.5 0 -41.5 Q18.5 -41.5 13 -23 Q0 -28.5 -13 -23Z', C.white) +
        line('M-12.4 -26.4 Q0 -31.8 12.4 -26.4', 2.4, band);
    case 'plume':
      return path('M6 -34 Q15 -52 25 -41 Q17 -41 12 -30Z', band) +
        path('M-9 -27 Q-9 -37.5 0 -37.5 Q9 -37.5 9 -27Z', col) + ell(0, -27, 17, 4, col);
    case 'crown':
      return path('M-11.5 -25.5 L-13.5 -39.5 L-6.5 -32 L0 -43 L6.5 -32 L13.5 -39.5 L11.5 -25.5Z', C.mustard) +
        dot(0, -30, 1.7, C.red, thin) + dot(-7, -29, 1.3, C.teal, thin) + dot(7, -29, 1.3, C.teal, thin) +
        dot(-13.5, -39.5, 1.6, C.white, thin) + dot(0, -43, 1.6, C.white, thin) + dot(13.5, -39.5, 1.6, C.white, thin);
    case 'flat':
      return path('M-13.2 -24.5 Q-13.5 -34.5 0 -34 Q12.5 -34 13.2 -27 L18 -24.5 Q8 -22.5 -13.2 -24.5Z', col);
    case 'boater':
      return rect(-9, -36, 18, 9.5, '#f3df9c', 1) + bar(-9, -31, 18, 3.4, band) + ell(0, -26.5, 15.5, 3, '#f3df9c');
    default:
      return '';
  }
}

// The head, drawn around the neck joint at the origin. Exported for portraits.
export function head(opts) {
  const d = { ...DEFAULTS, ...opts };
  const [rx, ry] = HEADS[d.head] || HEADS.egg;
  const cy = -15;
  const fit = (inner) => g(`translate(0,${cy}) scale(${(rx / 12.5).toFixed(3)},${(ry / 14.5).toFixed(3)}) translate(0,${-cy})`, inner);
  const ex = rx * 0.4;
  const ey = cy - 2;
  const dead = d.mood === 'dead';

  let s = rect(-4, -5, 8, 9, shade(d.skin, -0.16), 2);
  if (d.hair === 'bob' || d.hair === 'bun') s += ''; // drawn over the head below
  s += ell(0, cy, rx, ry, d.skin);
  s += gloss(-rx * 0.45, cy - ry * 0.48, 2.6, 4.6);
  if (d.cheeks && !dead) s += dot(-rx * 0.64, cy + 5, 3, C.pink, 'opacity=".7"') + dot(rx * 0.64, cy + 5, 3, C.pink, 'opacity=".7"');
  if (d.hair) s += fit(hair(d.hair, d.hairColor));

  // eyes
  for (const sx of [-1, 1]) {
    const x = sx * ex;
    if (dead) {
      s += line(`M${x - 2.5} ${ey - 2.5} l5 5 M${x + 2.5} ${ey - 2.5} l-5 5`, 1.7);
    } else if (d.mood === 'shock') {
      s += circ(x, ey, 3.6, C.white, 'stroke-width="1.1"') + dot(x, ey, 1.4, C.ink);
      s += line(`M${x - 3.2} ${ey - 6} Q${x} ${ey - 8.6} ${x + 3.2} ${ey - 6}`, 1.2);
    } else if (d.mood === 'shifty') {
      s += circ(x, ey, 3.1, C.white, 'stroke-width="1.1"') + dot(x + d.dir * 1.5, ey + 0.2, 1.4, C.ink);
      s += line(`M${x - 3.4} ${ey - 5.2} L${x + 3.4} ${ey - 5.2 - sx * d.dir * 1.2}`, 1.2);
    } else {
      s += dot(x, ey, 1.9, C.ink) + dot(x - 0.6, ey - 0.7, 0.55, '#fff');
      if (d.mood === 'stern') s += line(`M${x - sx * 3.4} ${ey - 5.6} L${x + sx * 2.6} ${ey - 3.6}`, 1.3);
    }
  }
  s += dot(0, cy + 2.6, 2, shade(d.skin, -0.22));

  const mouth = d.mouth || { calm: 'smile', shock: 'o', shifty: 'flat', stern: 'frown', dead: 'flat' }[d.mood] || 'smile';
  const my = cy + 8;
  if (mouth === 'o') s += ell(0, my, 2.4, 3, '#7a1f1f', 'stroke-width="1"');
  else if (mouth === 'smile') s += line(`M-4 ${my - 1} Q0 ${my + 2.8} 4 ${my - 1}`, 1.3);
  else if (mouth === 'frown') s += line(`M-4 ${my + 1.2} Q0 ${my - 2.2} 4 ${my + 1.2}`, 1.3);
  else s += line(`M-3.6 ${my} H3.6`, 1.3);

  if (d.whiskers) s += fit(whiskers(d.whiskers, d.hairColor));
  if (d.specs) {
    const lens = `fill="rgba(255,255,255,.35)" stroke="${C.ink}" stroke-width="1.1"`;
    s += `<circle cx="${-ex}" cy="${ey}" r="4" ${lens}/><circle cx="${ex}" cy="${ey}" r="4" ${lens}/>` +
      line(`M${-ex + 4} ${ey} H${ex - 4} M${-ex - 4} ${ey} L${-rx} ${ey - 1} M${ex + 4} ${ey} L${rx} ${ey - 1}`, 1.1);
  }
  const lift = -(ry - 14.5);
  if (d.hat) s += g(`translate(0,${lift.toFixed(1)})`, hat(d.hat, d.hatColor, d.hatBand));
  if (d.spring) {
    const t = cy - ry;
    s += line(`M3 ${t + 1} l4 -3 l-7 -3 l7 -3 l-7 -3 l7 -3 l-3 -2.6`, 1.3, '#5f5f66') + dot(4, t - 17.6, 1.7, C.brass, thin);
  }
  return s;
}

// The turned body above the waist. `hem` is where it stops (lower when the doll stands).
function upper(d) {
  const p = d.paint;
  const buttons = (ys, col = C.brass) => ys.map((y) => dot(0, y, 1.4, col, thin)).join('');
  const sheen = bar(-11.5, -57, 3, 24, '#fff', 1.5, 'opacity=".18"');
  if (d.body === 'dress') {
    let s = path('M-11.5 -41 Q-15 -62 -6 -64 L6 -64 Q15 -62 11.5 -41 Q0 -39 -11.5 -41Z', p) + sheen;
    s += path('M-5.5 -63.6 Q0 -57 5.5 -63.6', C.white);
    if (d.apron) s += rect(-6, -57, 12, 17, C.white, 2);
    return s;
  }
  if (d.body === 'robe') return '';
  const shape = 'M-14.8 -27 L-15 -44 Q-15 -62 -6 -64 L6 -64 Q15 -62 15 -44 L14.8 -27 Q0 -24.5 -14.8 -27Z';
  let s;
  if (d.body === 'shirt') {
    s = path(shape, C.white);
    s += path('M-12 -62 L-4.5 -63.5 L0 -49 L4.5 -63.5 L12 -62 L13.4 -28.5 Q0 -26.5 -13.4 -28.5Z', p);
    s += buttons([-43, -36]);
  } else {
    s = path(shape, p) + sheen;
    if (d.collar === 'clerical') s += rect(-6.5, -66.5, 13, 4.4, C.white, 2.2) + buttons([-53, -45, -37, -30], C.black);
    else s += path('M-4.6 -63.6 L4.6 -63.6 L0 -50Z', C.white) + buttons([-44, -37, -30.5]);
  }
  if (d.collar === 'bow') s += path('M0 -61 L-5.5 -64.5 V-57.5Z M0 -61 L5.5 -64.5 V-57.5Z', d.collarColor);
  if (d.collar === 'tie') s += path('M-2 -63.4 H2 L3 -53 L0 -49.5 L-3 -53Z', d.collarColor);
  return s;
}

// Everything below the waist, and the round base the doll is mounted on.
function lower(d) {
  const p = d.paint;
  // The slot in the stage floor the doll slides in, then its turned base.
  const base = line('M-31 2.6 H31', 2.6, '#3a2a22', 'opacity=".45"') + ell(0, 2.4, 9, 2.3, '#3a2a22', 'stroke-width="1"') + ell(0, -1.6, 18.5, 4.8, C.woodLight) +
    line('M-12 -0.6 Q0 2.4 12 -0.6', 0.9, C.wood);
  const shoes = ell(-6.6, -5, 6.4, 3.3, C.black) + ell(6.6, -5, 6.4, 3.3, C.black);
  if (d.body === 'robe') {
    let s = base + path('M-23 -5 L-15 -46 Q-15 -62 -6 -64 L6 -64 Q15 -62 15 -46 L23 -5 Q0 -1 -23 -5Z', p);
    s += rect(-5, -60, 10, 56, d.trim, 0);
    for (let y = -52; y < -10; y += 11) s += line(`M-1.6 ${y} l3.2 3.4`, 1.6);
    s += path('M-14.6 -59 Q0 -50 14.6 -59 L15.2 -50 Q0 -39 -15.2 -50Z', d.trim) + line('M-8 -51 l2 3 M-1 -48 l2 3 M7 -51 l2 3', 1.5);
    return s;
  }
  if (d.body === 'dress') {
    const fold = shade(p, -0.25);
    if (d.sit) {
      return path('M-13 -30 L13 -30 Q26 -20 22 -5 Q0 -1 -22 -5 Q-26 -20 -13 -30Z', p) +
        (d.apron ? path('M-8.5 -30 L8.5 -30 L12 -8 Q0 -5.5 -12 -8Z', C.white) : line('M-6 -25 Q-9 -16 -9.5 -7 M6 -25 Q9 -16 9.5 -7', 1, fold));
    }
    return base + path('M-11.5 -42 L11.5 -42 Q25 -28 23 -5 Q0 -1 -23 -5 Q-25 -28 -11.5 -42Z', p) +
      (d.apron ? path('M-8 -42 L8 -42 L13 -8 Q0 -5.5 -13 -8Z', C.white) : line('M-6 -36 Q-9 -22 -10 -7 M6 -36 Q9 -22 10 -7', 1, fold));
  }
  if (d.sit) {
    return rect(-11, -22, 8, 17, d.legs, 3) + rect(3, -22, 8, 17, d.legs, 3) +
      ell(-7, -4.5, 6.4, 3.3, C.black) + ell(7, -4.5, 6.4, 3.3, C.black);
  }
  return base + path('M-14.8 -28 L14.8 -28 L14 -5 Q0 -2 -14 -5Z', d.legs) + line('M0 -27 V-4', 1, shade(d.legs, -0.4)) + shoes;
}

export function doll(opts) {
  const d = { ...DEFAULTS, ...opts };
  const pose = POSES[d.pose] || POSES.stand;
  const sleeve = d.body === 'shirt' ? C.white : d.paint;
  const fallen = d.pose === 'dead';
  const slumped = d.pose === 'slump';
  if (fallen || slumped) d.mood = 'dead';

  const tilt = d.tilt || (slumped ? d.dir * 28 : 0);
  let headSvg = head(d);
  if (d.nod) headSvg = sway(headSvg, d.nod[0], d.nod[1], d.nod[2], d.nod[3] || 0);

  const top =
    upper(d) +
    arm(-d.dir, pose.off, sleeve, d.skin, null, null) +
    arm(d.dir, pose.act, sleeve, d.skin, d.hold, d.wave) +
    (d.carry ? d.carry : '') +
    g(`translate(0,-64) rotate(${tilt}) scale(1.32)`, headSvg);
  const knees = d.sit && d.body !== 'dress' ? circ(-7, -23, 6.6, d.legs) + circ(7, -23, 6.6, d.legs) : '';

  let body = lower(d) + g(`translate(0,${d.sit ? 12 : 0}) rotate(${slumped ? d.dir * 8 : 0} 0 -28)`, top) + knees;
  if (d.rock) body = sway(body, d.rock[0], d.rock[1], d.rock[2], d.rock[3] || 0);

  if (fallen) return g(`translate(${d.x},${d.y - 16}) rotate(${d.dir * 90}) scale(${d.s})`, body);
  return g(`translate(${d.x},${d.y}) scale(${d.s})`, (d.sit ? '' : shadow(0, 3, 24, 5)) + body);
}
