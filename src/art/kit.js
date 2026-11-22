// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// Paint box and drawing primitives for the cabinet scenes.
// Every helper returns SVG markup; a scene is a string of them, painted back to front.
// The look: a cut-paper working model. Each outlined shape is a piece cut from
// printed card: a white scissor margin, a crisp shadow on whatever lies beneath,
// bright hand-tinted colour, engraver's hatching and a fine ink line. Paint with
// no outline (dots, lines, blobs) is printed straight onto the piece.

export const C = {
  ink: '#2b1b17',
  cream: '#f7edd6',
  white: '#fffaf0',
  red: '#e0322a',
  redDark: '#b3221c',
  mustard: '#f2b51c',
  teal: '#1fa39a',
  tealDark: '#147a73',
  sky: '#9fd8f0',
  night: '#1d3378',
  navy: '#1b2f7a',
  pink: '#ff9a8a',
  wood: '#d98f4a',
  woodDark: '#8a5630',
  woodLight: '#e6b97e',
  brass: '#d7ae52',
  brassDark: '#9c7628',
  black: '#2a2024',
  green: '#2f9a4a',
  greenDark: '#1f6e35',
  plum: '#6a3fa0',
  grey: '#b9b3a6',
  blue: '#2f62c8',
  glass: '#cfe9e4',
  shadow: 'rgba(43,27,23,.2)'
};

export const SKIN = ['#f6d7b3', '#eebd90', '#d39a67', '#9a6541', '#f9e3cb'];

const n = (v) => Math.round(v * 10) / 10;

export const OUT = `stroke="${C.ink}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"`;

// The hatching every piece is printed with. A scene's <svg> carries it once.
export const PAPER_DEFS = '<defs>' +
  '<pattern id="hatch" width="2.6" height="2.6" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><path d="M0 0V2.6" stroke="#2b1b17" stroke-width=".42"/></pattern>' +
  // The shadow a whole doll casts on the set behind it.
  '<filter id="lift" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="2.4" dy="3.2" stdDeviation="2" flood-color="#280a05" flood-opacity=".5"/></filter>' +
  '</defs>';

const MARGIN = '#fffaf0';
const CAST = 'rgba(40,10,5,.24)';
const CAST_SOFT = 'rgba(40,10,5,.12)';

// One cut piece. `geo` is the shape's geometry attributes; `edge` the scissor margin,
// kept small on small pieces so an eye or a button does not turn into a sticker.
// A see-through or unfilled shape is drawn plain: there is no card to cut.
function piece(tag, geo, fill, extra, edge = 2.6) {
  if (fill === 'none' || /(^|\s)opacity=/.test(extra) || /^rgba|transparent/.test(fill)) {
    return `<${tag} ${geo} fill="${fill}" ${OUT} ${extra}/>`;
  }
  const e = Math.max(0.8, Math.min(2.6, edge));
  // A soft shadow without a filter (the scene keeps moving, and filters would be redrawn
  // every frame): a faint wide halo and a firmer core, both dropped down and right.
  return `<${tag} ${geo} fill="${CAST_SOFT}" stroke="${CAST_SOFT}" stroke-width="4" stroke-linejoin="round" transform="translate(2.6 3.6)"/>` +
    `<${tag} ${geo} fill="${CAST}" transform="translate(2 2.9)"/>` +
    `<${tag} ${geo} fill="${MARGIN}" stroke="${MARGIN}" stroke-width="${n(e)}" stroke-linejoin="round"/>` +
    `<${tag} ${geo} fill="${fill}"/>` +
    `<${tag} ${geo} fill="url(#hatch)" opacity=".4"/>` +
    `<${tag} ${geo} fill="none" stroke="${C.ink}" stroke-width=".8" stroke-linejoin="round" ${extra.replace(/stroke-width="[^"]*"/, '')}/>`;
}

export const rect = (x, y, w, h, fill, r = 0, extra = '') =>
  piece('rect', `x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${r}"`, fill, extra, Math.min(w, h) * 0.4);

export const ell = (cx, cy, rx, ry, fill, extra = '') =>
  piece('ellipse', `cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}"`, fill, extra, Math.min(rx, ry) * 0.6);

export const circ = (cx, cy, r, fill, extra = '') => ell(cx, cy, r, r, fill, extra);

export const path = (d, fill = 'none', extra = '') => piece('path', `d="${d}"`, fill, extra);

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

// Paper has no gloss. Kept so older drawings still call it.
export const gloss = () => '';

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
