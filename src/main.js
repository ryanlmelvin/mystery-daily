// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// The cabinet front: window, numbered tags, brass plates, tile tray and coin lever.
// All rules live in engine.js; this file draws the state and turns taps into moves.

import '@fontsource/abril-fatface/latin-400.css';
import '@fontsource-variable/fraunces/wght.css';
import '@fontsource-variable/fraunces/wght-italic.css';
import '@fontsource/cinzel/latin-700.css';
import '@fontsource/caveat/latin-600.css';
import './style.css';
import { CASES, caseById, trialCases } from './cases/index.js';
import { today } from './daily.js';
import * as E from './engine.js';
import { sceneSvg, scenePins, sceneFocus } from './art/scenes.js';
import { cogStrip } from './art/cogs.js';
import * as P from './pwa.js';

const KIND = { person: 'who', thing: 'what', place: 'where' };
const TRAY = { person: 'People', thing: 'Things', place: 'Places' };
const ORDINAL = ['First', 'Second', 'Third', 'Fourth'];
const STORE = 'penny:v1:';
// Keep the shadow on the paper alone, including when the exhibit above it is moving.
const PAPER_BACK = '<span class="paper" aria-hidden="true"></span>';

const app = document.getElementById('app');
const daily = today();
const params = new URLSearchParams(location.search);

let c; // the case in the cabinet
let state; // its saved game
let practice = false; // true when the cabinet is not today's edition
const ui = { sel: null, open: null, fresh: [], message: '', won: false, dialog: null, hideUpdate: false };
const RELEASE = typeof __RELEASE__ === 'string' ? __RELEASE__ : 'dev';

const esc = (t) => String(t).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const $ = (sel) => app.querySelector(sel);

function read(key) {
  try { return JSON.parse(localStorage.getItem(STORE + key)); } catch { return null; }
}
// Returns whether the write stuck, so an update can refuse to reload over unsaved play.
function write(key, value) {
  try {
    const text = JSON.stringify(value);
    localStorage.setItem(STORE + key, text);
    return localStorage.getItem(STORE + key) === text;
  } catch { return false; /* private window: play on without saving */ }
}
const save = () => write('game:' + c.id, state);

function load(id) {
  c = caseById(id) || daily.case;
  practice = c.id !== daily.case.id;
  const saved = read('game:' + c.id);
  state = saved && saved.v === 1 && saved.id === c.id && saved.fills.length === E.blanksOf(c).length ? saved : E.newGame(c);
  Object.assign(ui, { sel: null, open: null, fresh: [], message: '', won: false });
  frame();
}

// ---------- drawing ----------

function frame() {
  const pins = scenePins(c.scene);
  const date = new Date(daily.date + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  app.innerHTML = `
  <div class="cabinet">
    <h1 class="sr-only">Penny Tableau, ${practice ? 'practice cabinet' : `No. ${daily.edition}, ${esc(date)}`}</h1>
    <section class="stage">
      <div class="updatebar" id="updatebar" role="status" hidden></div>
      <header class="top">
        <button class="knob install" id="install" aria-label="Install Penny Tableau" title="Install" hidden>${INSTALL_ICON}</button>
        <div class="marquee paper"><h2>${esc(c.title)}</h2><p class="sr-only">${esc(c.where)}</p></div>
        <button class="knob" id="menu" aria-label="Menu">?</button>
      </header>
      <div class="window paper" id="window">
        <div class="glass">
          ${sceneSvg(c.scene)}
          <div class="pins">${c.exhibits.map((ex, i) => {
            const [x, y] = pins[ex.id] || [20 + i * 30, 40];
            return `<button class="pin" data-ex="${ex.id}" style="left:${x / 4}%;top:${(y / 280) * 100}%" aria-label="Tag ${i + 1}: ${esc(ex.title)}">${i + 1}</button>`;
          }).join('')}</div>
          <div class="glare" aria-hidden="true"></div>
          <div class="banner" id="banner" hidden></div>
        </div>
        <div class="cogs" aria-hidden="true">${cogStrip()}</div>
      </div>
    </section>
    <section class="works" id="works"></section>
  </div>
  <dialog id="dialog"></dialog>`;
  // Closing a dialog hands focus back to whatever opened it (the Install knob, say).
  document.getElementById('dialog').addEventListener('close', () => {
    ui.dialog = null;
    if (ui.returnFocus?.isConnected) ui.returnFocus.focus();
  });
  draw();
  chrome();
  if (!read('seen')) { write('seen', 1); howTo(); }
}

const INSTALL_ICON = '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M10 2.5v9.2M6 8l4 4 4-4M3.5 13.5v3h13v-3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// The install knob and the update bar sit outside draw() because the installer and the
// service worker change them on their own schedule.
function chrome() {
  const install = $('#install');
  if (install) install.hidden = P.isInstalled();
  const bar = $('#updatebar');
  if (bar) {
    const html = updateControls('bar');
    bar.hidden = !html || ui.hideUpdate;
    bar.innerHTML = html;
  }
  // A dialog covers the bar, so every dialog carries its own copy of the controls.
  const inDialog = document.getElementById('dialog-update');
  if (inDialog) {
    const html = updateControls('dialog');
    inDialog.hidden = !html;
    inDialog.innerHTML = html;
  }
  const help = document.getElementById('install-help');
  if (help) help.hidden = P.isInstalled();
}

function updateControls(where) {
  const { state, error } = P.update;
  const recovery = '<a href="./update.html">recovery page</a>';
  if (state === 'ready') return `<span>A new version is ready.</span><button class="lever small" data-update="now">Update now</button>`;
  if (state === 'working') return `<span>Updating…</span><button class="lever small" disabled>Update now</button>`;
  if (state === 'reload') return `<span>A new version was installed.</span><button class="lever small" data-update="reload">Reload</button>`;
  if (state === 'failed' && error === 'savefail') {
    return `<span>Your game could not be saved, so updating now would lose it.</span><button class="lever small" data-update="anyway">Update anyway</button>${where === 'bar' ? '<button class="plain small" data-update="later">Not now</button>' : ''}`;
  }
  if (state === 'failed') return `<span>The update stalled. Try again, or use the ${recovery}.</span><button class="lever small" data-update="now">Try again</button>`;
  return '';
}

function draw() {
  const over = state.status !== 'play';
  $('#window').classList.toggle('running', state.status === 'won');
  $('#window').classList.toggle('stopped', state.status === 'lost');
  for (const pin of app.querySelectorAll('.pin')) {
    pin.classList.toggle('read', state.opened.includes(pin.dataset.ex));
    pin.classList.toggle('on', ui.open === pin.dataset.ex);
  }
  const banner = $('#banner');
  banner.hidden = !over;
  if (over) banner.textContent = state.status === 'won' ? 'The machine runs' : 'Out of pennies';
  $('#works').innerHTML = ui.open ? card() : over ? plates() + playbill() : plates() + tray() + coinbar();
}

function plates() {
  const blanks = E.blanksOf(c);
  const last = state.tries[state.tries.length - 1];
  let i = 0;
  const slot = (part) => {
    const k = i++;
    const shown = state.status === 'lost' ? blanks[k].answer : state.fills[k];
    const fixed = state.status !== 'play' || E.isFixed(c, state, k);
    const cls = ['slot', 'k-' + part[0], shown ? 'filled' : 'empty', ui.sel === k ? 'sel' : '', fixed ? 'fixed' : ''].join(' ');
    return `<button class="${cls}" data-i="${k}" ${fixed ? 'disabled' : ''} aria-label="${shown ? esc(shown) : 'Empty gap: ' + KIND[part[0]]}">${shown ? esc(shown) : KIND[part[0]]}</button>`;
  };
  return `<div class="plates">${c.panels.map((panel) => {
    const first = i;
    let body;
    if (panel.id === 'cast') {
      // The cast plate is a row of name slots, each under where that doll stands.
      const cells = [];
      panel.parts.forEach((part, n) => {
        if (typeof part === 'string') return;
        const where = String(panel.parts[n - 1] || '').replace(/^[\s.,]+|[\s.,]+$/g, '');
        cells.push(`<div class="who"><span class="where">${esc(where)}</span>${slot(part)}</div>`);
      });
      body = `<div class="castgrid n${cells.length}">${cells.join('')}</div>`;
    } else {
      body = `<p>${panel.parts.map((part) => (typeof part === 'string' ? esc(part) : slot(part))).join('')}</p>`;
    }
    let flag = '';
    if (last && state.status === 'play') {
      const wrong = last.wrong[panel.id];
      const stale = last.fills.slice(first, i).some((w, n) => w !== state.fills[first + n]);
      flag = wrong === 0
        ? '<span class="flag ok">All right</span>'
        : `<span class="flag bad${stale ? ' stale' : ''}">${stale ? 'was ' : ''}${wrong} wrong</span>`;
    }
    return `<div class="plate" data-panel="${panel.id}">${PAPER_BACK}<div class="plate-head"><h3>${esc(panel.title)}</h3>${flag}</div>${body}</div>`;
  }).join('')}</div>`;
}

function tray() {
  if (!state.bank.length) return '<div class="tray empty"><p>Tap the numbered tags in the window. The words you find drop in here.</p></div>';
  const want = ui.sel === null ? null : E.blanksOf(c)[ui.sel].kind;
  const rows = Object.keys(TRAY).map((kind) => {
    const words = state.bank.filter((w) => c.words[w] === kind);
    if (!words.length) return '';
    return `<div class="tray-row${want && want !== kind ? ' dim' : ''}"><span class="tray-label">${TRAY[kind]}</span>${words.map((w) =>
      `<button class="tile k-${kind}${ui.fresh.includes(w) ? ' fresh' : ''}" data-w="${esc(w)}">${esc(w)}</button>`).join('')}</div>`;
  }).join('');
  return `<div class="tray">${rows}</div>`;
}

function coinbar() {
  const left = E.PENNIES - state.tries.length;
  const coins = Array.from({ length: E.PENNIES }, (_, n) => `<span class="coin${n < left ? '' : ' spent'}"></span>`).join('');
  const log = state.tries.map((t, n) =>
    `<li><b>${ORDINAL[n]} penny</b> ${c.panels.map((p) => `${p.id}: ${t.wrong[p.id] ? t.wrong[p.id] + ' wrong' : 'all right'}`).join(' · ')}</li>`).join('');
  // The log scrolls with the page; the dock (status, coins, lever) stays pinned to the
  // bottom of the screen so the lever is always in reach, however big the case.
  return `${log ? `<ol class="log">${log}</ol>` : ''}
    <div class="dock">
      ${PAPER_BACK}
      <p class="status" role="status">${esc(ui.message)}</p>
      <div class="coinbar">
        <div class="coins" aria-label="${left} pennies left">${coins}</div>
        <button class="lever" id="drop">Drop a penny</button>
        <button class="knob small" id="tip" aria-label="Ask the attendant for a tip">Tip</button>
      </div>
    </div>`;
}

// A close look into the window at the exhibit: the same live scene, reframed, so the
// dolls keep swaying in the card (and the dead keep still). A person is framed on their
// head, found from the doll under their tag in the window; a fallen doll whole; anything
// else centred on its tag, or on the scene's own focus point for it.
const CLOSE_W = 150;
const CLOSE_H = 75;
function closeFocus(ex) {
  const [x, y] = scenePins(c.scene)[ex.id] || [200, 140];
  const person = c.panels[0].parts.some((p) => Array.isArray(p) && p[2] === ex.id);
  const dolls = person ? [...document.querySelectorAll('#window .scene g[filter="url(#lift)"]')] : [];
  let best = null;
  for (const el of dolls) {
    const b = el.getBBox();
    const inside = x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
    const d = Math.hypot(x - (b.x + b.width / 2), y - (b.y + b.height / 2)) - (inside ? 1000 : 0);
    if (!best || d < best.d) best = { b, d };
  }
  if (!best) return sceneFocus(c.scene)[ex.id] || [x, y];
  const { b } = best;
  if (b.width > b.height) return [b.x + b.width / 2, b.y + b.height / 2];
  return [b.x + b.width / 2, b.y + CLOSE_H / 2 - 4];
}

function closeup(ex) {
  const [fx, fy] = closeFocus(ex);
  const vx = Math.round(Math.min(Math.max(fx - CLOSE_W / 2, 0), 400 - CLOSE_W));
  const vy = Math.round(Math.min(Math.max(fy - CLOSE_H / 2, 0), 280 - CLOSE_H));
  const svg = sceneSvg(c.scene)
    .replace('viewBox="0 0 400 280"', `viewBox="${vx} ${vy} ${CLOSE_W} ${CLOSE_H}" preserveAspectRatio="xMidYMid slice"`)
    .replace(' role="img" aria-label="The scene inside the cabinet"', '');
  return `<div class="closeup" aria-hidden="true">${svg}</div>`;
}

function card() {
  const ex = c.exhibits.find((e) => e.id === ui.open);
  if (!ex) return '';
  const n = c.exhibits.indexOf(ex) + 1;
  const lines = ex.lines.map(([style, text]) => `<p class="line ${style}">${E.segments(text).map((part) =>
    part.word ? `<mark class="k-${c.words[part.word]}">${esc(part.text)}</mark>` : esc(part.text)).join('')}</p>`).join('');
  return `<div class="card" role="dialog" aria-label="${esc(ex.title)}">
      ${PAPER_BACK}
      <div class="card-details">
        <div class="card-head"><span class="badge">${n}</span><h3>${esc(ex.title)}</h3><button class="close" id="close" aria-label="Put it back">×</button></div>
        <div class="card-body">${lines}</div>
        ${ui.fresh.length ? `<p class="got"><span>Words added</span>${ui.fresh.map((w) => `<i class="k-${c.words[w]}">${esc(w)}</i>`).join('')}</p>` : ''}
        <div class="card-foot">
          <button class="plain wide" id="back">Back</button>
        </div>
      </div>
      ${closeup(ex)}
    </div>`;
}

function playbill() {
  const blanks = E.blanksOf(c);
  const won = state.status === 'won';
  const secs = E.seconds(state, Date.now());
  const paid = E.paidTips(state);
  const grid = state.tries.map((t) => `<div class="grid-row">${t.marks.map((ok, i) =>
    `<i class="${ok ? 'ok' : 'no'}${i > 0 && blanks[i].panel !== blanks[i - 1].panel ? ' gap' : ''}"></i>`).join('')}</div>`).join('');
  const how = c.path.map((s) => `<li><b>${esc(s.how)}.</b> ${esc(s.say)}</li>`).join('');
  const traps = (c.traps || []).map((t) => `<li>${esc(t.say)}</li>`).join('');
  const date = new Date(daily.date + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  return `<div class="playbill">
      ${PAPER_BACK}
      <div class="canopy" aria-hidden="true"></div>
      <p class="playbill-sign">Penny Tableau</p>
      <div class="stub"><span>Tonight's bill</span><span>${practice ? 'Practice' : `No. ${daily.edition} · ${esc(date)}`}</span></div>
      <h3>${won ? `Solved for ${state.tries.length === 1 ? 'one penny' : state.tries.length + ' pennies'}` : 'The machine keeps your pennies'}</h3>
      <div class="grid" aria-label="Your pennies, one row each">${grid}</div>
      <p class="meta">${E.clock(secs)} · ${paid ? paid + (paid === 1 ? ' tip' : ' tips') : 'no tips'}</p>
      <div class="actions">
        <button class="lever" id="share">Copy playbill</button>
        <button class="plain" id="again">Play again</button>
        <button class="plain" id="others">Other cabinets</button>
      </div>
      <p class="status" role="status">${esc(ui.message)}</p>
      <h4>How it was done</h4>
      <ol class="how">${how}</ol>
      ${traps ? `<h4>What it was not</h4><ul class="how">${traps}</ul>` : ''}
    </div>`;
}

// ---------- dialogs ----------

function dialog(html) {
  const d = document.getElementById('dialog');
  d.removeAttribute('aria-labelledby');
  d.innerHTML = html + '<div class="updatebar in-dialog" id="dialog-update" role="status" hidden></div>';
  chrome();
  if (!d.open) {
    ui.returnFocus = document.activeElement;
    d.showModal();
  }
}

function howTo() {
  ui.dialog = 'how';
  dialog(`<p class="dialog-sign">Penny Tableau</p>
    <h3>How to play</h3>
    <ol class="steps">
      <li><b>Inspect.</b> The machine has jammed at the fatal moment. Tap the numbered tags to look closer. Words you find drop into your tray.</li>
      <li><b>Set the plates.</b> Tap a gap on a brass plate, then a tile. Name the cast, then say what happened.</li>
      <li><b>Drop a penny.</b> The machine tells you only how many tiles are wrong on each plate. You have four pennies.</li>
    </ol>
    <div class="actions"><button class="lever" data-close>Play</button><button class="plain" id="others">Other cabinets</button></div>`);
}

function others() {
  const date = new Date(daily.date + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  ui.dialog = 'menu';
  dialog(`<p class="dialog-sign">Penny Tableau</p>
    <p class="edition">No. ${daily.edition} · ${esc(date)}</p>
    <h3>The arcade</h3>
    <p class="small">Today's cabinet is marked. The others are for practice.</p>
    <ul class="arcade">${CASES.map((k, n) => {
      const g = read('game:' + k.id);
      const mark = !g ? 'Not played' : g.status === 'won' ? `Solved, ${g.tries.length} of ${E.PENNIES}` : g.status === 'lost' ? 'Out of pennies' : 'In play';
      return `<li><button class="plain row" data-case="${k.id}"><span><b>${n + 1}. ${esc(k.title)}</b>${k.id === daily.case.id ? ' <em>today</em>' : ''}</span><span>${mark}</span></button></li>`;
    }).join('')}</ul>
    <button class="plain row trial" id="trials"><span><b>On trial</b></span><span>Built from a date</span></button>
    <div class="actions"><button class="plain" data-close>Close</button><button class="plain" id="how">How to play</button><button class="plain" id="install-help"${P.isInstalled() ? ' hidden' : ''}>Install</button></div>
    <p class="about">By <a href="https://ryanlmelvin.com" target="_blank" rel="noopener">Ryan L. Melvin</a> · Release ${esc(RELEASE)} · <a href="./update.html">Update help</a></p>`);
}

// Cabinets the composer built from a date. They are on trial: not yet in the daily run.
function trials() {
  ui.dialog = 'menu';
  dialog(`<h3>On trial</h3>
    <p class="small">These cabinets were built by the composer from a date, and proved before you see them. They are not part of the daily run yet.</p>
    <ul class="arcade">${trialCases(daily.date).map((k) => {
      const g = read('game:' + k.id);
      const mark = !g ? 'Not played' : g.status === 'won' ? `Solved, ${g.tries.length} of ${E.PENNIES}` : g.status === 'lost' ? 'Out of pennies' : 'In play';
      return `<li><button class="plain row" data-case="${k.id}"><span><b>${esc(k.title)}</b></span><span>${mark}</span></button></li>`;
    }).join('')}</ul>
    <div class="actions"><button class="plain" id="others">Back</button><button class="plain" data-close>Close</button></div>`);
}

function installDialog() {
  ui.dialog = 'install';
  dialog(`<h3 id="install-title">Install Penny Tableau</h3>
    <p class="small">Put the cabinet on your home screen. It opens full screen and plays offline.</p>
    <div class="platforms">
      <details open><summary>iPhone or iPad</summary><ol>
        <li>Open Penny Tableau in Safari.</li>
        <li>Tap Share (the square with an up arrow). You may need to open the … menu first.</li>
        <li>Choose Add to Home Screen. If it is missing, look under Edit Actions.</li>
        <li>Turn on Open as Web App if it is shown, then tap Add.</li></ol></details>
      <details open><summary>Android</summary><ol>
        <li>Open Penny Tableau in Chrome.</li>
        <li>Tap the ⋮ menu, then Add to home screen or Install app.</li>
        <li>Choose Install if offered and follow the prompts.</li></ol></details>
      <details><summary>Computer</summary><ol>
        <li>In Chrome or Edge, look for Install in the address bar or the browser menu.</li>
        <li>On a Mac in Safari, choose File → Add to Dock.</li></ol></details>
    </div>
    <div class="actions"><button class="plain" data-close>Close</button></div>`);
  document.getElementById('dialog').setAttribute('aria-labelledby', 'install-title');
}

async function install() {
  if (P.canPrompt()) { await P.promptInstall(); return chrome(); }
  installDialog();
}

function startUpdate(discard = false) {
  ui.hideUpdate = false;
  // Saves are written on every move; write once more and check it stuck before reloading.
  P.applyUpdate(() => (c ? save() : true), { discard }).catch(() => chrome());
  chrome();
}

function tipDialog() {
  ui.dialog = 'tip';
  const next = state.tips;
  const offer = next === 0
    ? 'The first tip is free.'
    : next === 1
      ? 'A second, blunter tip will be marked on your playbill.'
      : 'The attendant can set one tile for you. It will be marked on your playbill.';
  const told = c.tips.slice(0, Math.min(next, 2)).map((t) => `<li>${esc(t)}</li>`).join('');
  dialog(`<h3>Ask the attendant</h3>
    ${told ? `<ul class="told">${told}</ul>` : ''}
    <p class="small">${offer}</p>
    <div class="actions"><button class="lever" id="take-tip">${next === 0 ? 'Free tip' : next === 1 ? 'Second tip' : 'Set a tile'}</button><button class="plain" data-close>Not now</button></div>`);
}

// ---------- moves ----------

function openExhibit(id) {
  const before = state.bank.length;
  E.openExhibit(c, state, id, Date.now());
  ui.fresh = state.bank.slice(before);
  ui.open = id;
  ui.message = '';
  save();
  draw();
  $('.card-details').scrollIntoView({ block: 'nearest' });
}

function tapSlot(i) {
  if (ui.sel === i && state.fills[i]) {
    E.clearBlank(c, state, i, Date.now());
    save();
  } else {
    ui.sel = i;
  }
  ui.message = '';
  draw();
}

function tapTile(word) {
  ui.fresh = [];
  if (ui.sel === null) {
    const kind = c.words[word];
    const blanks = E.blanksOf(c);
    const free = blanks.findIndex((b, i) => b.kind === kind && !state.fills[i] && !E.isFixed(c, state, i));
    if (free < 0) { ui.message = 'Tap a gap on a plate first.'; return draw(); }
    ui.sel = free;
  }
  const res = E.place(c, state, ui.sel, word, Date.now());
  if (!res.ok) {
    ui.message = res.why === 'kind' ? `That gap wants a ${KIND[res.kind]} tile.` : 'That tile will not go there.';
    return draw();
  }
  const blanks = E.blanksOf(c);
  let next = null;
  for (let n = 1; n <= blanks.length; n++) {
    const k = (ui.sel + n) % blanks.length;
    if (!state.fills[k] && !E.isFixed(c, state, k)) { next = k; break; }
  }
  ui.sel = next;
  ui.message = '';
  save();
  draw();
}

function drop() {
  const res = E.dropPenny(c, state, Date.now());
  if (!res.ok) {
    ui.message = res.why === 'unfilled' ? 'Fill every gap on both plates first.' : res.why === 'same' ? 'Nothing has changed since your last penny.' : '';
    return draw();
  }
  ui.sel = null;
  ui.fresh = [];
  const left = E.PENNIES - state.tries.length;
  ui.message = res.status === 'play' ? `Clunk. ${left === 1 ? 'One penny' : left + ' pennies'} left.` : '';
  save();
  draw();
  if (res.status !== 'play') $('#works').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function share() {
  const link = location.origin + location.pathname;
  const text = E.shareText(c, state, practice ? 'practice' : daily.edition, link.startsWith('http://localhost') || link.startsWith('http://127.') ? '' : link);
  try {
    await navigator.clipboard.writeText(text);
    ui.message = 'Playbill copied.';
  } catch {
    ui.message = text;
  }
  draw();
}

app.addEventListener('click', (ev) => {
  const el = ev.target.closest('button');
  if (!el) return;
  if (el.dataset.close !== undefined) return document.getElementById('dialog').close();
  if (el.dataset.update) {
    const u = el.dataset.update;
    if (u === 'now') return startUpdate();
    if (u === 'anyway') return startUpdate(true);
    if (u === 'reload') return P.reloadNow();
    if (u === 'later') { ui.hideUpdate = true; return chrome(); }
  }
  if (el.dataset.case) { document.getElementById('dialog').close(); return load(el.dataset.case); }
  if (el.dataset.ex) return ui.open === el.dataset.ex ? (ui.open = null, draw()) : openExhibit(el.dataset.ex);
  if (el.dataset.i !== undefined) return tapSlot(Number(el.dataset.i));
  if (el.dataset.w) return tapTile(el.dataset.w);
  switch (el.id) {
    case 'close': case 'back': ui.open = null; ui.fresh = []; return draw();
    case 'drop': return drop();
    case 'tip': return tipDialog();
    case 'take-tip': {
      const tip = E.takeTip(c, state, Date.now());
      save();
      document.getElementById('dialog').close();
      if (tip) { ui.message = tip.text; ui.sel = null; }
      return draw();
    }
    case 'share': return share();
    case 'again': state = E.newGame(c); save(); Object.assign(ui, { sel: null, open: null, fresh: [], message: '' }); return draw();
    case 'others': case 'menu': return others();
    case 'trials': return trials();
    case 'install': return install();
    case 'install-help': return installDialog();
    case 'how': return howTo();
    default: return undefined;
  }
});

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && ui.open) { ui.open = null; draw(); }
});

P.initUpdates(chrome);
P.initInstall(chrome, () => {
  const d = document.getElementById('dialog');
  if (d.open && ui.dialog === 'install') d.close();
  chrome();
});

// ?case=study opens a hand-made cabinet; ?date=2026-11-26 opens the one composed for that date.
const wanted = params.get('date') ? 'day-' + params.get('date') : params.get('case');
load(wanted && (caseById(wanted) || CASES[Number(wanted) - 1]) ? (caseById(wanted) || CASES[Number(wanted) - 1]).id : daily.case.id);
