// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// Draws the app icons (a copper penny under the striped awning) straight to PNG, so no
// image tools are needed. Run `node scripts/make-icons.mjs` after changing the design;
// the PNGs in public/icons are committed.

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const C = {
  teal: hex('#1f7f7c'), tealDeep: hex('#0f4544'), red: hex('#d5362d'), cream: hex('#f7edd6'),
  ink: hex('#2b1b17'), copper: hex('#c9783f'), copperLight: hex('#e7a36c'), copperDark: hex('#9a5426'),
};
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

// One design in a 512-unit square. `mask` drops the awning and keeps the penny inside
// the maskable safe zone.
function paint(x, y, mask) {
  const cx = 256;
  const cy = mask ? 256 : 292;
  const R = mask ? 150 : 178;
  if (!mask) {
    // Awning: stripes 64 wide, a band to y=64, then a scallop under each stripe.
    const stripe = Math.floor(x / 64);
    const sx = stripe * 64 + 32;
    const colour = stripe % 2 ? C.cream : C.red;
    if (y < 64) return colour;
    if ((x - sx) ** 2 + (y - 64) ** 2 < 32 ** 2) return colour;
    // A soft shadow under the scallops.
    if ((x - sx) ** 2 + (y - 70) ** 2 < 33 ** 2) return mix(C.teal, C.tealDeep, 0.5);
  }
  const d = Math.hypot(x - cx, y - cy);
  // Drop shadow below the coin.
  if (d > R && Math.hypot(x - cx, y - cy - 12) < R) return C.tealDeep;
  if (d > R) return C.teal;
  if (d > R - 13) return C.ink;
  // Copper face, lit from the upper left.
  const lit = Math.max(0, Math.min(1, Math.hypot(x - (cx - R * 0.35), y - (cy - R * 0.4)) / (R * 1.5)));
  let face = mix(C.copperLight, C.copper, Math.min(1, lit * 1.4));
  if (lit > 0.75) face = mix(face, C.copperDark, (lit - 0.75) * 1.6);
  const ring = R * 0.68;
  if (Math.abs(d - ring) < 6) return C.copperDark;
  if (Math.abs(d - ring - 7) < 2.5) return C.copperLight;
  // A raised star of eight beads inside the ring.
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 - Math.PI / 2;
    const bx = cx + Math.cos(a) * R * 0.42;
    const by = cy + Math.sin(a) * R * 0.42;
    if (Math.hypot(x - bx, y - by) < R * 0.07) return C.copperDark;
  }
  if (d < R * 0.16) return C.copperDark;
  return face;
}

function render(size, mask) {
  const ss = 4;
  const rows = [];
  for (let py = 0; py < size; py++) {
    const row = Buffer.alloc(1 + size * 4);
    for (let px = 0; px < size; px++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const [cr, cg, cb] = paint(((px + (sx + 0.5) / ss) / size) * 512, ((py + (sy + 0.5) / ss) / size) * 512, mask);
          r += cr; g += cg; b += cb;
        }
      }
      const n = ss * ss;
      row.set([Math.round(r / n), Math.round(g / n), Math.round(b / n), 255], 1 + px * 4);
    }
    rows.push(row);
  }
  return png(size, size, Buffer.concat(rows));
}

const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function png(w, h, raw) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]);
}

const out = new URL('../public/icons/', import.meta.url);
mkdirSync(out, { recursive: true });
for (const [name, size, mask] of [['icon-192.png', 192, false], ['icon-512.png', 512, false], ['maskable-512.png', 512, true], ['apple-touch-icon.png', 180, false]]) {
  writeFileSync(new URL(name, out), render(size, mask));
  console.log('wrote public/icons/' + name);
}
