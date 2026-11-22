// The strip of brass cogs under the cabinet window. They twitch while the machine is
// jammed and spin once the plates are right (see .cog in style.css).

import { C } from './kit.js';

function gearPath(r, teeth, depth = 3) {
  const p = Math.PI / teeth;
  const pt = (rad, a) => `${(rad * Math.cos(a)).toFixed(1)} ${(rad * Math.sin(a)).toFixed(1)}`;
  let d = '';
  for (let i = 0; i < teeth; i++) {
    const a = i * 2 * p;
    d += `${i ? 'L' : 'M'}${pt(r, a - 0.5 * p)} L${pt(r + depth, a - 0.26 * p)} L${pt(r + depth, a + 0.26 * p)} L${pt(r, a + 0.5 * p)} `;
  }
  return d + 'Z';
}

function gear(cx, cy, r, teeth, dir, fill) {
  const holes = r > 9 ? [0, 1, 2, 3].map((k) => {
    const a = (k * Math.PI) / 2 + 0.6;
    return `<circle cx="${(r * 0.52 * Math.cos(a)).toFixed(1)}" cy="${(r * 0.52 * Math.sin(a)).toFixed(1)}" r="${(r * 0.2).toFixed(1)}" fill="#3a2414"/>`;
  }).join('') : '';
  return `<g transform="translate(${cx},${cy})"><g class="cog" style="--d:${dir};--t:${(r / 4).toFixed(1)}s">` +
    `<path d="${gearPath(r, teeth)}" fill="${fill}" stroke="${C.ink}" stroke-width="1.2" stroke-linejoin="round"/>` +
    holes + `<circle r="${(r * 0.24).toFixed(1)}" fill="${C.ink}"/></g></g>`;
}

export function cogStrip() {
  const cogs = [
    [22, 15, 12, 12, 1, C.brass], [47, 9, 8, 8, -1, C.brassDark], [70, 17, 13, 13, 1, C.brass],
    [118, 13, 9, 9, -1, C.brassDark], [141, 16, 12, 12, 1, C.brass],
    [200, 14, 14, 14, -1, C.brass], [228, 8, 8, 8, 1, C.brassDark],
    [278, 16, 11, 11, -1, C.brassDark], [303, 11, 10, 10, 1, C.brass],
    [352, 15, 13, 13, -1, C.brass], [379, 10, 8, 8, 1, C.brassDark]
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 22" preserveAspectRatio="xMidYMid slice">${cogs.map((g) => gear(...g)).join('')}</svg>`;
}
