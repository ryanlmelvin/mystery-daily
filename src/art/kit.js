// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// Paint box and drawing primitives for the cabinet scenes.
// Every helper returns SVG markup; a scene is a string of them, painted back to front.
// The look: turned and painted wooden toys. Flat enamel colours, one warm outline,
// a little gloss, no gradients, no textures.

export const C = {
  ink: '#2b1b17',
  cream: '#f7edd6',
  white: '#fffaf0',
  red: '#d5362d',
  redDark: '#a2251f',
  mustard: '#e9ad2f',
  teal: '#1f7f7c',
  tealDark: '#145957',
  sky: '#a9d6cf',
  night: '#27365e',
  navy: '#1f2a4d',
  pink: '#f09a8f',
  wood: '#cf9457',
  woodDark: '#8a5630',
  woodLight: '#e6b97e',
  brass: '#d7ae52',
  brassDark: '#9c7628',
  black: '#2a2024',
  green: '#4f9b58',
  greenDark: '#2f6b3a',
  plum: '#7a3b63',
  grey: '#b9b3a6',
  blue: '#3f6fb5',
  glass: '#cfe9e4',
  shadow: 'rgba(43,27,23,.2)'
};

export const SKIN = ['#f6d7b3', '#eebd90', '#d39a67', '#9a6541', '#f9e3cb'];

const n = (v) => Math.round(v * 10) / 10;

export const OUT = `stroke="${C.ink}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"`;

export const rect = (x, y, w, h, fill, r = 0, extra = '') =>
  `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${r}" fill="${fill}" ${OUT} ${extra}/>`;

export const ell = (cx, cy, rx, ry, fill, extra = '') =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}" ${OUT} ${extra}/>`;

export const circ = (cx, cy, r, fill, extra = '') => ell(cx, cy, r, r, fill, extra);

export const path = (d, fill = 'none', extra = '') => `<path d="${d}" fill="${fill}" ${OUT} ${extra}/>`;

// A stroke with no fill: creases, grain, painted lines.
export const line = (d, w = 1.4, color = C.ink, extra = '') =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;

// Paint with no outline: stripes, cheeks, highlights.
export const blob = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
export const dot = (cx, cy, r, fill, extra = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${r}" fill="${fill}" ${extra}/>`;
export const bar = (x, y, w, h, fill, r = 0, extra = '') =>
  `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${r}" fill="${fill}" ${extra}/>`;

export const g = (transform, inner, extra = '') => `<g transform="${transform}" ${extra}>${inner}</g>`;

// A part that rocks on its pivot (the local origin). CSS drives it; see .sway in style.css.
export const sway = (inner, a, b, dur = 2.4, delay = 0) =>
  `<g class="sway" style="--a:${a}deg;--b:${b}deg;--dur:${dur}s;--delay:${delay}s">${inner}</g>`;

export const gloss = (cx, cy, rx, ry, rot = -20, op = 0.38) =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${rx}" ry="${ry}" fill="#fff" opacity="${op}" transform="rotate(${rot} ${n(cx)} ${n(cy)})"/>`;

export const shadow = (cx, cy, rx, ry = 4.5) =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${rx}" ry="${ry}" fill="${C.shadow}"/>`;

// Darken (amt < 0) or lighten (amt > 0) a #rrggbb colour.
export function shade(hex, amt) {
  const v = parseInt(hex.slice(1), 16);
  const ch = (c) => {
    const t = amt < 0 ? 0 : 255;
    return Math.round(c + (t - c) * Math.abs(amt));
  };
  const r = ch((v >> 16) & 255);
  const gr = ch((v >> 8) & 255);
  const b = ch(v & 255);
  return '#' + ((1 << 24) | (r << 16) | (gr << 8) | b).toString(16).slice(1);
}

// Small lettering painted on a prop. Decorative only: never the place a clue is read.
export const label = (x, y, text, size = 5, color = C.ink, extra = '') =>
  `<text x="${n(x)}" y="${n(y)}" font-size="${size}" fill="${color}" text-anchor="middle" font-family="Cinzel, serif" font-weight="700" ${extra}>${text}</text>`;
