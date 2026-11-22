// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// The cabinet front: window, numbered tags, brass plates, tile tray and coin lever.
// All rules live in engine.js; this file draws the state and turns taps into moves.

import '@fontsource/abril-fatface/latin-400.css';
import '@fontsource-variable/fraunces/wght.css';
import '@fontsource-variable/fraunces/wght-italic.css';
import '@fontsource/cinzel/latin-700.css';
import '@fontsource/caveat/latin-600.css';
import './style.css';
import './archive.css';
import { CASES, caseById } from './cases/index.js';
import { restoreTutorial, tutorialCase } from './tutorial.js';
import { LAUNCH, caseIdForDate, dailyForDate, utcDate } from './daily.js';
import { archiveCalendar } from './archive.js';
import * as E from './engine.js';
import { revealSolution } from './reveal.js';
import { pause, pennyLine, pennyShow } from './show.js';
import * as R from './record.js';
import * as Sound from './sound.js';
import { sceneSvg, scenePins, sceneFocus } from './art/scenes.js';
import { cogStrip } from './art/cogs.js';
import * as P from './pwa.js';

const KIND = { person: 'who', thing: 'what', place: 'where' };
const TRAY = { person: 'People', thing: 'Things', place: 'Places' };
const ORDINAL = ['First', 'Second', 'Third', 'Fourth'];
const STORE = 'penny:v1:';
// Keep the shadow on the paper alone, including when the exhibit above it is moving.
const PAPER_BACK = '<span class="paper" aria-hidden="true"></span>';

const BILL_HEADING = `<p class="bill-title">The Penny Murders</p>
  <p class="small">A daily clockwork mystery.</p>`;

const app = document.getElementById('app');
const shortDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

let c; // the case in the cabinet
let state; // its saved game
let edition; // the selected dated edition, or null for practice
let returnTo = null; // the cabinet set aside while the practice penny is in play
// What the cabinet is in the middle of showing, if anything. `phase` is 'judging' while
// a penny is being weighed, 'celebrating' while the solved machine runs, 'reveal' while
// the last penny sets the right tiles. Each phase has its own `ctl`: aborting it skips
// to the next phase. `cancelled` stops the whole show (the player went elsewhere).
let show = null;
const ui = { sel: null, open: null, fresh: [], message: '', admiring: false, dialog: null, hideUpdate: false, refused: '', flying: new Set() };
// How long the solved machine has the stage to itself before the playbill is handed over.
const CELEBRATION = 3300;
const FLIGHT = 190; // a tile's trip from the tray to its gap, in milliseconds
const RELEASE = typeof __RELEASE__ === 'string' ? __RELEASE__ : 'dev';

const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
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
const saveKey = (id, official) => (official ? 'edition:' : 'practice:') + id;

function save() {
  if (returnTo) {
    // A second open tab may already have finished the tutorial.
    return !returnTo.firstRun || read('seen') === 1 || write('seen', { tutorial: state });
  }
  return write(saveKey(c.id, edition), state);
}

function savedGame(id, official) {
  // Before the archive there was one save per cabinet. Only the hand-made
  // cabinets were daily editions. Leave those saves intact for returning players.
  const legacy = !official || CASES.some((k) => k.id === id);
  const g = read(saveKey(id, official)) ?? (legacy ? read('game:' + id) : null);
  return g?.v === 1 && g.id === id ? g : null;
}

function editionLabel() {
  if (!edition) return 'Practice';
  return `No. ${edition.edition} · ${shortDate.format(new Date(edition.date + 'T00:00:00Z'))}`;
}

function loadLocation(firstVisit = false) {
  cancelShow();
  returnTo = null;
  const params = new URLSearchParams(location.search);
  const latest = utcDate();
  const date = params.get('edition');
  const wanted = params.has('date') ? 'day-' + params.get('date') : params.get('case');
  const sample = !date && wanted && (caseById(wanted) || CASES[Number(wanted) - 1]);
  const requested = date && date <= latest ? dailyForDate(date) : null;
  edition = sample ? null : requested ?? dailyForDate(latest);
  c = sample || edition?.case || CASES[0];
  const saved = savedGame(c.id, edition);
  state = saved?.fills?.length === E.blanksOf(c).length ? saved : E.newGame(c);
  E.collectReadWords(c, state);
  Object.assign(ui, { sel: null, open: null, fresh: [], message: '', admiring: false, dialog: null });
  if (firstVisit) startTutorial(true);
  else frame();
}

function startTutorial(firstRun = false) {
  cancelShow();
  returnTo = { c, state, sel: ui.sel, open: ui.open, fresh: ui.fresh, message: ui.message, admiring: ui.admiring, firstRun };
  c = tutorialCase;
  const saved = firstRun && read('seen')?.tutorial;
  state = restoreTutorial(saved);
  E.collectReadWords(c, state);
  Object.assign(ui, { sel: null, open: null, fresh: [], message: '', admiring: false, dialog: null });
  frame();
}

function leaveTutorial() {
  cancelShow();
  const previous = returnTo;
  returnTo = null;
  write('seen', 1);
  c = previous.c;
  state = previous.state;
  Object.assign(ui, { sel: previous.sel, open: previous.open, fresh: previous.fresh, message: previous.message, admiring: previous.admiring });
  frame();
  (previous.firstRun ? $('.pin') : $('#menu')).focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

function navigate(search) {
  const url = location.pathname + search;
  if (url !== location.pathname + location.search) history.pushState(null, '', url);
  loadLocation();
  window.scrollTo(0, 0);
  $('#menu').focus({ preventScroll: true });
}

// ---------- drawing ----------

function frame() {
  const pins = scenePins(c.scene);
  app.innerHTML = `
  <div class="cabinet${returnTo ? ' tutorial' : ''}">
    <h1 class="sr-only">The Penny Murders, ${returnTo ? 'tutorial' : editionLabel()}</h1>
    <section class="stage">
      <div class="updatebar" id="updatebar" role="status" hidden></div>
      <header class="top">
        <button class="knob install" id="install" aria-label="Install The Penny Murders" title="Install" hidden>${INSTALL_ICON}</button>
        <div class="marquee paper"><h2>${esc(c.title)}</h2><p class="sr-only">${esc(c.where)}</p></div>
        ${returnTo ? '<button class="skip-tutorial">Skip tutorial</button>' : '<button class="knob" id="menu" aria-label="Menu">?</button>'}
      </header>
      <div class="window paper" id="window">
        <div class="glass">
          ${sceneSvg(c.scene)}
          <div class="pins">${c.exhibits.map((ex, i) => {
            const [x, y] = pins[ex.id] || [20 + i * 30, 40];
            return `<button class="pin" data-ex="${ex.id}" style="left:${x / 4}%;top:${(y / 280) * 100}%" aria-label="Tag ${i + 1}: ${esc(ex.title)}">${i + 1}</button>`;
          }).join('')}</div>
          <div class="glare" aria-hidden="true"></div>
          ${returnTo ? '<p class="tag-prompt" id="tag-prompt">Read all three tags</p>' : ''}
          <div class="banner" id="banner" hidden></div>
        </div>
        <div class="cogs" aria-hidden="true">${cogStrip()}</div>
      </div>
    </section>
    <section class="works" id="works"></section>
    <div class="flights" aria-hidden="true"></div>
  </div>
  <dialog id="dialog"></dialog>`;
  // Closing a dialog hands focus back to whatever opened it (the Install knob, say).
  document.getElementById('dialog').addEventListener('close', () => {
    ui.dialog = null;
    if (ui.returnFocus?.isConnected) ui.returnFocus.focus();
  });
  ui.flying.clear();
  draw();
  chrome();
  fitTitle();
}

// A long title is set in smaller type so the slip stays one line. A second line pushes
// the window down, and the last row of the tray slides under the penny dock. Below the
// smallest size it is left to wrap after all (a very narrow screen and a very long title).
const TITLE_SMALLEST = 12;

function fitTitle() {
  const h = document.querySelector('.marquee h2');
  if (!h) return;
  h.style.fontSize = '';
  const style = getComputedStyle(h);
  const line = parseFloat(style.lineHeight);
  for (let size = parseFloat(style.fontSize); h.offsetHeight > line * 1.5 && size > TITLE_SMALLEST;) {
    size = Math.max(TITLE_SMALLEST, size - 0.5);
    h.style.fontSize = size + 'px';
  }
}

const INSTALL_ICON ='<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M10 2.5v9.2M6 8l4 4 4-4M3.5 13.5v3h13v-3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

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

// Cues follow the player's moves. The tutor never checks which word belongs in a gap.
function tutorialMove() {
  if (state.status !== 'play') return 'done';
  if (ui.open) return 'clue';
  if (state.opened.length < c.exhibits.length) return 'inspect';
  if (ui.sel !== null) return 'word';
  const last = state.tries.at(-1);
  if (!E.ready(state) || last?.fills.every((w, i) => state.fills[i] === w)) return 'gap';
  return 'penny';
}

function draw() {
  const phase = show?.phase || '';
  // While a penny is being weighed the cabinet looks as it did before the result.
  const judging = phase === 'judging';
  const move = !returnTo ? '' : judging ? 'wait' : tutorialMove();
  const over = state.status !== 'play' && !judging;
  $('#window').classList.toggle('running', over && state.status === 'won');
  $('#window').classList.toggle('stopped', over && state.status === 'lost');
  $('#works').classList.toggle('judging', judging);
  for (const pin of app.querySelectorAll('.pin')) {
    pin.disabled = judging || phase === 'reveal';
    pin.classList.toggle('read', state.opened.includes(pin.dataset.ex));
    pin.classList.toggle('on', ui.open === pin.dataset.ex);
    if (move === 'inspect') pin.setAttribute('aria-describedby', 'tag-prompt');
    else pin.removeAttribute('aria-describedby');
  }
  const banner = $('#banner');
  banner.hidden = !over || ui.admiring;
  if (over) banner.textContent = state.status === 'won' ? 'The machine runs' : 'Out of pennies';
  if (returnTo) {
    $('#tag-prompt').hidden = move !== 'inspect';
    $('.tutorial').dataset.move = move;
    $('.skip-tutorial').hidden = over && !ui.open;
  }
  hangSign(over && phase !== 'reveal');
  if (phase === 'reveal') {
    $('#works').innerHTML = plates() + '<p class="sr-only" id="reveal-reading" role="status" tabindex="-1">Out of pennies. Revealing the correct plates.</p>' +
      '<div class="actions"><button class="plain" id="skip-reveal">Skip to playbill</button></div>';
  } else if (phase === 'celebrating') {
    $('#works').innerHTML = plates();
  } else if (ui.admiring) {
    $('#works').innerHTML = plates() + (ui.open ? card() : '') +
      '<div class="actions"><button class="plain" id="back-to-playbill">Back to playbill</button></div>';
  } else if (ui.open) $('#works').innerHTML = card();
  else if (over && !returnTo) $('#works').innerHTML = plates() + playbill();
  else $('#works').innerHTML = plates(move) + (over ? '' : tray(move)) + coinbar(move);
  if (returnTo) {
    const targets = { inspect: '.pin:not(.read)', gap: '.slot:enabled', word: '.tray-row:not(.dim) .tile', penny: '#drop', done: '#leave-tutorial' };
    const target = ui.open ? $('.card') : $(targets[move]);
    target?.focus({ preventScroll: true });
    if (target && (move === 'word' || move === 'gap')) {
      const choices = target.closest('.tray-row') || target;
      choices.style.scrollMarginBottom = `${$('.dock').offsetHeight + 4}px`;
      choices.scrollIntoView({ block: 'nearest' });
    }
  }
}

function plates(move) {
  const blanks = E.blanksOf(c);
  const last = state.tries[state.tries.length - 1];
  const judging = show?.phase === 'judging';
  // A penny being weighed has not locked anything yet, as far as the player can see.
  const live = state.status === 'play' || judging;
  const locked = judging ? show.lockedBefore : E.lockedPanels(c, state);
  const isFixed = (k) => !live || state.given.includes(k) || locked.has(blanks[k].panel);
  const promptedPlate = move === 'gap' && blanks.find((_, k) => !isFixed(k))?.panel;
  let i = 0;
  let first = 0;
  const slot = (part, where = '') => {
    const k = i++;
    const shown = live ? state.fills[k] : blanks[k].answer;
    const fixed = isFixed(k);
    const cls = ['slot', 'k-' + part[0], shown ? 'filled' : 'empty', ui.sel === k ? 'sel' : '', fixed ? 'fixed' : '',
      ui.flying.has(k) ? 'incoming' : '', ui.refused === 'unfilled' && !shown ? 'nudge' : ''].filter(Boolean).join(' ');
    const described = move === 'gap' && !fixed ? ` aria-describedby="gap-prompt${last ? ' guess-' + blanks[k].panel : ''}"` : '';
    const label = (where ? where + ', ' : '') + (shown || 'Empty gap: ' + KIND[part[0]]);
    return `<button class="${cls}" data-i="${k}" style="--n:${k - first}" ${fixed ? 'disabled' : ''}${described} aria-label="${esc(label)}">${shown ? esc(shown) : KIND[part[0]]}</button>`;
  };
  return `<div class="plates">${c.panels.map((panel) => {
    first = i;
    let body;
    if (panel.id === 'cast') {
      // The cast plate is a row of name slots, each under where that doll stands.
      const cells = [];
      panel.parts.forEach((part, n) => {
        if (typeof part === 'string') return;
        const where = String(panel.parts[n - 1] || '').replace(/^[\s.,]+|[\s.,]+$/g, '');
        cells.push(`<div class="who"><span class="where">${esc(where)}</span>${slot(part, where)}</div>`);
      });
      body = `<div class="castgrid n${cells.length}">${cells.join('')}</div>`;
    } else {
      body = `<p>${panel.parts.map((part) => (typeof part === 'string' ? esc(part) : slot(part))).join('')}</p>`;
    }
    let flag = '';
    if (returnTo && state.status === 'lost' && !judging) {
      flag = '<span class="flag ok">Solution</span>';
    } else if (last && (live || returnTo || show?.phase === 'celebrating')) {
      const wrong = last.wrong[panel.id];
      const stale = last.fills.slice(first, i).some((w, n) => w !== state.fills[first + n]);
      flag = wrong === 0
        ? '<span class="flag ok">All right</span>'
        : `<span class="flag bad${stale ? ' stale' : ''}">${stale ? 'was ' : ''}${wrong} wrong</span>`;
    }
    const cue = panel.id === promptedPlate ? `<span class="move-prompt" id="gap-prompt">${last ? 'Change a tile' : 'Choose a gap'}</span>` : '';
    const result = returnTo && flag ? `<span id="guess-${panel.id}">${flag}</span>` : flag;
    const reason = move === 'done' && panel.id === 'story' ? `<p class="ticket-answer" id="ticket-answer">${esc(c.path[0].say)}</p>` : '';
    // A plate an earlier penny locked keeps its mark while this penny is weighed.
    const kept = judging && locked.has(panel.id) ? ' stamped' : '';
    return `<div class="plate${kept}" data-panel="${panel.id}" role="group" aria-labelledby="plate-${panel.id}">${PAPER_BACK}<div class="plate-head"><h3 id="plate-${panel.id}">${esc(panel.title)}</h3>${cue}${result}</div>${body}${reason}</div>`;
  }).join('')}</div>`;
}

function tray(move) {
  if (!state.bank.length) return returnTo ? '' : '<div class="tray empty"><p>Open tags to collect words.</p></div>';
  const want = ui.sel === null ? null : E.blanksOf(c)[ui.sel].kind;
  const rows = Object.keys(TRAY).map((kind) => {
    const words = state.bank.filter((w) => c.words[w] === kind);
    if (!words.length) return '';
    const label = move === 'word' && want === kind ? '<span class="move-prompt">Choose a word</span>' : `<span class="tray-label">${TRAY[kind]}</span>`;
    return `<div class="tray-row${want && want !== kind ? ' dim' : ''}">${label}${words.map((w) =>
      `<button class="tile k-${kind}${ui.fresh.includes(w) ? ' fresh' : ''}" data-w="${esc(w)}">${esc(w)}</button>`).join('')}</div>`;
  }).join('');
  return `<div class="tray">${rows}</div>`;
}

function coinbar(move) {
  const left = E.PENNIES - state.tries.length;
  const judging = show?.phase === 'judging';
  // The lever says when a penny is the last one, and goes on saying so while it drops.
  const last = left + (judging ? 1 : 0) === 1;
  // The penny just spent is drawn over its empty place until it has dropped.
  const coins = Array.from({ length: E.PENNIES }, (_, n) =>
    `<span class="coin${n < left ? '' : ' spent'}">${judging && n === left ? '<i class="fall"></i>' : ''}</span>`).join('');
  const log = state.tries.map((t, n) =>
    `<li><b>${ORDINAL[n]} penny</b> ${c.panels.map((p) => `${p.id}: ${t.wrong[p.id] ? t.wrong[p.id] + ' wrong' : 'all right'}`).join(' · ')}</li>`).join('');
  // The log scrolls with the page; the dock (status, coins, lever) stays pinned to the
  // bottom of the screen so the lever is always in reach, however big the case.
  return `${log && !returnTo ? `<ol class="log">${log}</ol>` : ''}
    <div class="dock">
      ${PAPER_BACK}
      <p class="status" role="status">${esc(ui.message)}</p>
      <div class="coinbar">
        <div class="coins" role="img" aria-label="${left} pennies left">${coins}</div>
        ${move === 'done' ? `<button class="lever" id="leave-tutorial" aria-describedby="banner ticket-answer">${returnTo.firstRun ? 'Play the mystery' : 'Back to mystery'}</button>` :
          `<button class="lever${ui.refused ? ' refused' : ''}" id="drop"${returnTo && !E.ready(state) ? ' disabled' : ''}${last ? ' aria-label="Insert last penny"' : ''}><i class="mouth" aria-hidden="true"></i>${last ? 'Last penny' : 'Insert penny'}</button>`}
        ${returnTo ? '' : '<button class="knob small" id="tip" aria-label="Ask the attendant for a tip">Tip</button>'}
      </div>
    </div>`;
}

// A close look into the window at the exhibit: the same live scene, reframed, so the
// dolls keep swaying in the card (and the dead keep still). A person is framed on their
// head, found from the doll under their tag in the window; a fallen doll whole; anything
// else centred on its tag, or on the scene's own focus point for it.
const CLOSE_W = 150;
const CLOSE_H = 75;
const SCENE_W = 400;
// In scene units, as large as they get (on a phone): the culprit's sign and a tag.
const SIGN_W = 62;
const SIGN_H = 23;
const TAG = 33;
const SIGN_TOP = 30; // just under the pelmet

// Every doll in the window with its box in scene units, front doll last. Measured on the
// screen, so a mirrored scene gives the boxes where the dolls are actually drawn.
function dollBoxes() {
  const scene = $('#window .scene');
  if (!scene) return [];
  const frame = scene.getBoundingClientRect();
  const k = SCENE_W / (frame.width || SCENE_W);
  return [...scene.querySelectorAll('g[filter="url(#lift)"]')].map((el) => {
    const r = el.getBoundingClientRect();
    return { el, x: (r.left - frame.left) * k, y: (r.top - frame.top) * k, width: r.width * k, height: r.height * k };
  });
}

// The doll a tag is pinned to: the one whose box holds the tag, or else the nearest.
function dollAt([x, y]) {
  let best = null;
  for (const b of dollBoxes()) {
    const inside = x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
    // Of two dolls that both hold the tag, a standing one beats the one lying behind it.
    const d = Math.hypot(x - (b.x + b.width / 2), y - (b.y + b.height / 2)) - (inside ? 1000 : 0);
    if (!best || d < best.d) best = { ...b, d };
  }
  return best;
}

function closeFocus(ex) {
  const pin = scenePins(c.scene)[ex.id] || [200, 140];
  const person = c.panels[0].parts.some((p) => Array.isArray(p) && p[2] === ex.id);
  const b = person && dollAt(pin);
  if (!b) return sceneFocus(c.scene)[ex.id] || pin;
  if (b.width > b.height) return [b.x + b.width / 2, b.y + b.height / 2];
  return [b.x + b.width / 2, b.y + CLOSE_H / 2 - 4];
}

// Once the case is over, a sign hangs over the doll the story plate names as the culprit.
// Not every story has one (a prize wrongly claimed has a claimant, not a killer).
function culpritSpot() {
  const blanks = E.blanksOf(c);
  const who = blanks.find((b) => b.panel === 'story' && b.key === 'culprit' && b.kind === 'person');
  const doll = who && blanks.find((b) => b.panel === 'cast' && b.answer === who.answer);
  const pins = scenePins(c.scene);
  const pin = doll && pins[doll.key];
  const box = pin && dollAt(pin);
  if (!box || box.width > box.height) return null;
  // Over the doll's head: its tag is pinned on its centre line, where an outstretched
  // arm would pull the middle of its box to one side.
  const mid = box.x + box.width / 2;
  const x0 = Math.abs(pin[0] - mid) < box.width * 0.4 ? pin[0] : mid;
  const y0 = Math.max(SIGN_TOP, box.y - SIGN_H);
  const covers = (x, y) => Object.values(pins).some(([px, py]) =>
    Math.abs(px - x) < (SIGN_W + TAG) / 2 && py + TAG / 2 > y && py - TAG / 2 < y + SIGN_H);
  // Clear of every tag: straight above, or a little to one side, or failing that higher.
  for (const up of [0, 12, 24, 36]) {
    for (const across of [0, 10, -10, 20, -20]) {
      const x = Math.min(SCENE_W - SIGN_W / 2, Math.max(SIGN_W / 2, x0 + across));
      if (y0 - up >= SIGN_TOP && !covers(x, y0 - up)) return [x, y0 - up];
    }
  }
  return [x0, y0];
}

function hangSign(wanted) {
  const glass = $('.glass');
  const sign = glass.querySelector('.guilty');
  if (!wanted) return sign?.remove();
  if (sign) return undefined;
  const spot = culpritSpot();
  if (!spot) return undefined;
  const hung = document.createElement('div');
  hung.className = 'guilty';
  hung.setAttribute('aria-hidden', 'true');
  hung.style.cssText = `left:${(spot[0] / 4).toFixed(2)}%;height:${((spot[1] / 280) * 100).toFixed(2)}%`;
  hung.innerHTML = '<div class="hang"><b>Guilty</b></div>';
  glass.insertBefore(hung, glass.querySelector('.pins'));
  return undefined;
}

// Scraps of the tiles' paper, let fall inside the window when the machine runs.
function confetti() {
  const glass = $('.glass');
  if (!glass || still()) return;
  const tints = ['var(--person)', 'var(--thing)', 'var(--place)', 'var(--paper)', 'var(--red)', 'var(--teal)'];
  const box = document.createElement('div');
  box.className = 'confetti';
  box.setAttribute('aria-hidden', 'true');
  const drop = glass.clientHeight * 1.15;
  for (let n = 0; n < 36; n++) {
    const bit = document.createElement('i');
    const wide = 6 + Math.random() * 7;
    bit.style.cssText = `--x:${(Math.random() * 100).toFixed(1)}%;--w:${wide.toFixed(1)}px;--h:${(wide * (0.5 + Math.random() * 0.6)).toFixed(1)}px;` +
      `--tint:${tints[n % tints.length]};--fall:${drop.toFixed(0)}px;--drift:${(Math.random() * 60 - 30).toFixed(0)}px;` +
      `--turn:${(Math.random() * 900 - 450).toFixed(0)}deg;--t:${(1.5 + Math.random() * 1.3).toFixed(2)}s;--delay:${(Math.random() * 0.9).toFixed(2)}s`;
    box.append(bit);
  }
  glass.insertBefore(box, glass.querySelector('.pins'));
  setTimeout(() => box.remove(), 4200);
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
  return `<div class="card" role="${ui.admiring ? 'region' : 'dialog'}" tabindex="-1" aria-label="${esc(ex.title)}">
      ${PAPER_BACK}
      <div class="card-details">
        <div class="card-head"><span class="badge">${n}</span><h3>${esc(ex.title)}</h3><button class="close" id="close" aria-label="Put it back">×</button></div>
        <div class="card-body">${lines}</div>
        ${ui.fresh.length ? `<p class="got"><span>Words added</span>${ui.fresh.map((w, n) => `<i class="k-${c.words[w]}" style="--n:${n}">${esc(w)}</i>`).join('')}</p>` : ''}
        ${ui.admiring ? '' : `<div class="card-foot">
          <button class="plain wide" id="back">Back</button>
        </div>`}
      </div>
      ${closeup(ex)}
    </div>`;
}

// The record is read from storage each time: another tab may have finished a case.
function loadRecord() {
  const saved = read('record');
  const record = R.readRecord(saved);
  const today = utcDate();
  // Take in games finished before the record was kept (every edition, the first time) or
  // in a tab still running an older release (the last week, after that).
  const from = saved?.v === 1 ? R.dates(LAUNCH, today).slice(-7) : R.dates(LAUNCH, today);
  let found = saved?.v !== 1;
  for (const date of from) {
    if (record.days[date]) continue;
    const line = R.resultOf(savedGame(caseIdForDate(date), true));
    if (line) {
      record.days[date] = line;
      found = true;
    }
  }
  if (found) write('record', record);
  return record;
}

function keepRecord() {
  const line = edition && !returnTo && R.resultOf(state);
  if (!line) return;
  const record = loadRecord();
  record.days[edition.date] = line;
  write('record', record);
}

const summary = () => R.summarise(loadRecord().days, utcDate(), LAUNCH);

function figures(sum) {
  return `<dl class="figures">
      <div><dt>Streak</dt><dd>${sum.streak}</dd></div>
      <div><dt>Best</dt><dd>${sum.best}</dd></div>
      <div><dt>Solved</dt><dd>${sum.solved}<small> of ${sum.played}</small></dd></div>
    </dl>`;
}

// Editions solved, by the penny that solved them, with this playbill's own row marked.
function tally(sum) {
  const mine = state.status === 'won' ? state.tries.length : 0;
  const most = Math.max(1, ...sum.dist, sum.lost);
  const row = (label, count, now, spoken) =>
    `<li class="${now ? 'now' : ''}" aria-label="${spoken}: ${count}${now ? ', this edition' : ''}"><span aria-hidden="true">${label}</span><i aria-hidden="true" style="--w:${Math.round((count / most) * 100)}%">${count}</i></li>`;
  return `<h4>Pennies to solve</h4>
    <ol class="tally">${sum.dist.map((count, n) => row(n + 1, count, mine === n + 1, `${ORDINAL[n]} penny`)).join('')}${
      sum.lost ? row('×', sum.lost, state.status === 'lost', 'Out of pennies') : ''}</ol>`;
}

// Under a finished edition: when the next one opens, or the way to today's if that is
// still to be finished.
function todayWaits() {
  const today = utcDate();
  if (!edition || edition.date === today) return false;
  const status = savedGame(caseIdForDate(today), true)?.status;
  return status !== 'won' && status !== 'lost';
}

function nextLine() {
  if (!edition) return '';
  if (edition.date === utcDate()) return `<p class="next">Next cabinet in <b id="countdown">${R.countdown(R.untilNext(Date.now()))}</b></p>`;
  return todayWaits() ? '<p class="next"><button class="plain" id="play-today">Play today’s cabinet</button></p>' : '';
}

function playbill() {
  const blanks = E.blanksOf(c);
  const won = state.status === 'won';
  const secs = E.seconds(state, Date.now());
  const paid = E.paidTips(state);
  const sum = edition ? summary() : null;
  // Earlier editions still to play. Today's has its own button under these.
  const waiting = sum ? sum.unplayed - (todayWaits() ? 1 : 0) : 0;
  const grid = state.tries.map((t) => `<div class="grid-row">${t.marks.map((ok, i) =>
    `<i class="${ok ? 'ok' : 'no'}${i > 0 && blanks[i].panel !== blanks[i - 1].panel ? ' gap' : ''}"></i>`).join('')}</div>`).join('');
  const how = c.path.map((s) => `<li><b>${esc(s.how)}.</b> ${esc(s.say)}</li>`).join('');
  const traps = (c.traps || []).map((t) => `<li>${esc(t.say)}</li>`).join('');
  return `<div class="playbill">
      ${PAPER_BACK}
      <div class="canopy" aria-hidden="true"></div>
      ${BILL_HEADING}
      <div class="stub"><span>Tonight's bill</span><span>${editionLabel()}</span></div>
      <h3 tabindex="-1">${won ? 'Solved!' : 'The machine keeps your pennies'}</h3>
      <div class="grid" role="img" aria-label="${state.tries.length === 1 ? '1 penny' : state.tries.length + ' pennies'} used">${grid}</div>
      <p class="meta">${E.clock(secs)} · ${paid ? paid + (paid === 1 ? ' tip' : ' tips') : 'no tips'}</p>
      ${sum ? figures(sum) : ''}
      <div class="actions">
        <button class="lever" id="share">Share playbill</button>
        <button class="plain" id="admire-scene">Admire scene</button>
        <button class="plain" id="others">Archive${waiting > 0 ? ` · ${waiting} to play` : ''}</button>
      </div>
      ${nextLine()}
      <label id="share-fallback" hidden>Copy this result to share it.
        <textarea readonly rows="${state.tries.length + 3}"></textarea>
      </label>
      <h4>How it was done</h4>
      <ol class="how">${how}</ol>
      ${traps ? `<h4>What it was not</h4><ul class="how">${traps}</ul>` : ''}
      ${sum ? tally(sum) : ''}
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

function others(month) {
  const today = utcDate();
  const selected = edition?.date;
  const calendar = archiveCalendar({
    month: month || (selected || today).slice(0, 7), today, selected,
    statusFor: (date) => savedGame(caseIdForDate(date), true)?.status,
  });
  ui.dialog = 'menu';
  const sum = summary();
  dialog(`${BILL_HEADING}
    <p class="edition">${editionLabel()}</p>
    ${sum.played ? `<p class="record-line">Streak ${sum.streak} · Best ${sum.best} · Solved ${sum.solved} of ${sum.played}</p>` : ''}
    ${calendar}
    ${selected !== today ? '<button class="plain row" id="today">Back to today</button>' : ''}
    <div class="actions"><button class="plain" data-close>Close</button><button class="plain" id="how">How to play</button><button class="plain" id="sound" aria-pressed="${Sound.soundOn()}">Sound ${Sound.soundOn() ? 'on' : 'off'}</button><button class="plain" id="install-help"${P.isInstalled() ? ' hidden' : ''}>Install</button></div>
    <p class="about">By <a href="https://ryanlmelvin.com" target="_blank" rel="noopener">Ryan L. Melvin</a> · Release ${esc(RELEASE)} · <a href="./update.html">Update help</a></p>`);
  $('#dialog').setAttribute('aria-labelledby', 'archive-title');
  if (!month) $(`[data-date="${selected || today}"]`)?.focus({ preventScroll: true });
}

function installDialog() {
  ui.dialog = 'install';
  dialog(`<h3 id="install-title">Install The Penny Murders</h3>
    <p class="small">Put the cabinet on your home screen. It opens full screen and plays offline.</p>
    <div class="platforms">
      <details open><summary>iPhone or iPad</summary><ol>
        <li>Open The Penny Murders in Safari.</li>
        <li>Tap Share (the square with an up arrow). You may need to open the … menu first.</li>
        <li>Choose Add to Home Screen. If it is missing, look under Edit Actions.</li>
        <li>Turn on Open as Web App if it is shown, then tap Add.</li></ol></details>
      <details open><summary>Android</summary><ol>
        <li>Open The Penny Murders in Chrome.</li>
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
  P.applyUpdate(() => {
    if (returnTo?.state.t0 != null && !write(saveKey(returnTo.c.id, edition), returnTo.state)) return false;
    return c ? save() : true;
  }, { discard }).catch(() => chrome());
  chrome();
}

function tipDialog(result) {
  ui.dialog = 'tip';
  const next = state.tips;
  const offer = next < 2 ? 'Each tip adds one mark to your playbill.'
    : 'The attendant can set one tile for one mark on your playbill.';
  const told = c.tips.slice(0, next).map((t) => `<li>${esc(t)}</li>`).join('');
  dialog(`<h3>Ask the attendant</h3>
    ${told ? `<ul class="told">${told}</ul>` : ''}
    ${result?.tier === 3 ? `<p class="tip-result">${esc(result.text)}</p>` : ''}
    <p class="small">${offer}</p>
    <div class="actions"><button class="lever" id="take-tip">${next === 0 ? 'First tip' : next === 1 ? 'Second tip' : 'Set a tile'}</button><button class="plain" data-close>Close</button></div>`);
  if (result) {
    const revealed = $('#dialog .tip-result') || $('#dialog .told li:last-child');
    revealed.tabIndex = -1;
    revealed.focus();
  }
}

// ---------- moves ----------

function openExhibit(id) {
  if (state.status === 'play') {
    const before = state.bank.length;
    E.openExhibit(c, state, id, Date.now());
    ui.fresh = state.bank.slice(before);
    save();
  } else {
    // Looking at a tag while the solved machine runs takes the player to the scene; the
    // playbill waits behind "Back to playbill", and the tune plays on.
    if (show?.phase === 'celebrating') cancelShow(false);
    ui.admiring = !returnTo;
    ui.fresh = [];
  }
  ui.open = id;
  ui.message = '';
  Sound.play('paper');
  ui.fresh.forEach((_, n) => Sound.play('word', n, 0.17 + n * 0.09));
  draw();
  if (ui.admiring) $('.card').focus({ preventScroll: true });
  $('.card-details').scrollIntoView({ block: 'nearest' });
}

function closeExhibit() {
  const pin = $('.pin.on');
  ui.open = null;
  ui.fresh = [];
  draw();
  if (ui.admiring) pin?.focus();
}

function tapSlot(i) {
  if (ui.sel === i && state.fills[i]) {
    if (E.clearBlank(c, state, i, Date.now())) Sound.play('lift');
    save();
  } else {
    ui.sel = i;
  }
  ui.message = '';
  draw();
}

// A copy of the tile leaves the tray and lands in its gap, which stays an empty recess
// until it arrives. The plates are redrawn on every move, so the landing looks the gap
// up again by its number.
function fly(word, from, k) {
  const gap = $(`.slot[data-i="${k}"]`);
  const layer = $('.flights');
  if (!gap || !layer) return land(k);
  const to = gap.getBoundingClientRect();
  const ghost = document.createElement('span');
  ghost.className = `tile k-${c.words[word]} ghost`;
  ghost.textContent = word;
  ghost.style.cssText = `left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px`;
  layer.append(ghost);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  ghost.animate?.([
    { transform: 'translate(0, 0) rotate(-3deg) scale(1.08)' },
    { transform: `translate(${dx}px, ${dy}px) rotate(0deg) scale(1)` }
  ], { duration: FLIGHT, easing: 'cubic-bezier(.3, .6, .3, 1)', fill: 'forwards' });
  setTimeout(() => {
    ghost.remove();
    land(k);
  }, FLIGHT);
  return undefined;
}

function land(k) {
  ui.flying.delete(k);
  const gap = $(`.slot[data-i="${k}"]`);
  gap?.classList.remove('incoming');
  gap?.classList.add('landed');
  Sound.play('tile');
}

function refuse(message) {
  ui.message = message;
  Sound.play('deny');
  draw();
}

function tapTile(word, tile) {
  ui.fresh = [];
  if (ui.sel === null) {
    const kind = c.words[word];
    const blanks = E.blanksOf(c);
    const free = blanks.findIndex((b, i) => b.kind === kind && !state.fills[i] && !E.isFixed(c, state, i));
    if (free < 0) return refuse('Tap a gap first.');
    ui.sel = free;
  }
  const res = E.place(c, state, ui.sel, word, Date.now());
  if (!res.ok) return refuse(res.why === 'kind' ? `That gap wants a ${KIND[res.kind]} tile.` : 'That tile will not go there.');
  const placed = ui.sel;
  const from = !still() && tile?.isConnected ? tile.getBoundingClientRect() : null;
  if (from) ui.flying.add(placed);
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
  if (from) fly(word, from, placed);
  else land(placed);
}

function drop() {
  const lockedBefore = E.lockedPanels(c, state);
  const before = state.tries.at(-1)?.wrong;
  const res = E.dropPenny(c, state, Date.now());
  if (!res.ok) {
    // The lever shakes its head, and the gaps still empty show themselves.
    ui.refused = res.why;
    refuse(res.why === 'unfilled' ? 'Fill every gap first.' : res.why === 'same' ? 'Nothing has changed since your last penny.' : '');
    ui.refused = '';
    return;
  }
  ui.sel = null;
  ui.fresh = [];
  const judged = c.panels.filter((panel) => !lockedBefore.has(panel.id))
    .map((panel) => ({ panel: panel.id, ok: res.attempt.wrong[panel.id] === 0 }));
  ui.message = res.status !== 'play' ? '' : pennyLine({
    wrong: res.attempt.wrong, before, left: E.PENNIES - state.tries.length,
    locked: judged.filter((v) => v.ok).map((v) => v.panel)
  });
  // The result is settled and saved before any of it is shown.
  save();
  keepRecord();
  judge(res, judged, lockedBefore);
}

// Stop whatever is being shown, for good. Leaving the cabinet also stops its tune.
function cancelShow(hush = true) {
  const old = show;
  show = null;
  if (hush) Sound.hush();
  if (!old) return;
  old.cancelled = true;
  old.ctl.abort();
}

// The penny drops and each plate it judges is marked in turn. A tap skips ahead, though
// not the second half of a double tap on the lever.
const SKIP_AFTER = 400;
async function judge(res, judged, lockedBefore) {
  const mine = { phase: 'judging', ctl: new AbortController(), cancelled: false, lockedBefore, since: performance.now() };
  show = mine;
  draw();
  const fall = $('.fall');
  const mouth = $('#drop .mouth');
  if (fall && mouth) {
    const a = fall.getBoundingClientRect();
    const b = mouth.getBoundingClientRect();
    fall.style.setProperty('--dx', `${(b.left + b.width / 2 - (a.left + a.width / 2)).toFixed(1)}px`);
  }
  await pennyShow({ works: $('#works'), glass: $('#window') }, judged, { sound: Sound.play, signal: mine.ctl.signal, still: still() });
  if (mine.cancelled) return undefined;
  if (!returnTo && res.status === 'won') return celebrate(mine);
  if (!returnTo && res.status === 'lost') return showLossReveal(mine);
  show = null;
  if (res.status === 'lost') Sound.play('lose');
  draw();
  // The practice cabinet runs too, without the playbill to follow.
  if (res.status === 'won') {
    Sound.play('win');
    confetti();
  }
  if (res.status !== 'play') $('#works').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  return undefined;
}

// Solved: the machine runs with the stage to itself, then the playbill is handed over.
// A player who asked for no motion is given the playbill at once.
async function celebrate(mine) {
  Sound.play('win');
  if (!still()) {
    mine.phase = 'celebrating';
    mine.ctl = new AbortController();
    draw();
    if (!$('#dialog').open) window.scrollTo({ top: 0, behavior: 'smooth' });
    confetti();
    await pause(CELEBRATION, mine.ctl.signal);
    if (mine.cancelled) return;
    Sound.play('bill');
  }
  show = null;
  draw();
  $('#works').scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'nearest' });
  if (!$('#dialog').open) $('.playbill h3').focus({ preventScroll: true });
}

async function showLossReveal(mine) {
  mine.phase = 'reveal';
  mine.ctl = new AbortController();
  draw();
  Sound.play('lose');
  $('#reveal-reading').focus({ preventScroll: true });
  const board = $('.plates');
  board.scrollIntoView({ block: 'nearest' });
  await revealSolution(board, mine.ctl.signal, { onSeat: () => Sound.play('tile') });
  if (mine.cancelled) return;
  show = null;
  draw();
  Sound.play('bill');
  if (!$('#dialog').open) $('.playbill h3').focus();
}

// A doll flicked with a finger rocks on its base. Looking is free, and so is this.
function poke(ev) {
  const hit = dollBoxes().reverse().find(({ el }) => {
    const r = el.getBoundingClientRect();
    return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
  });
  if (!hit) return;
  hit.el.classList.remove('poked', 'poked-flat');
  hit.el.getBoundingClientRect(); // lets a second flick start the rocking over
  hit.el.classList.add(hit.width > hit.height ? 'poked-flat' : 'poked');
  Sound.play('rattle');
}

async function share() {
  const url = new URL('./', location.href);
  if (!edition) url.searchParams.set('case', c.id);
  else if (edition.date !== utcDate()) url.searchParams.set('edition', edition.date);
  const link = url.href;
  const text = E.shareText(c, state, edition?.date, link.startsWith('http://localhost') || link.startsWith('http://127.') ? '' : link);
  const fallback = $('#share-fallback');
  fallback.hidden = true;
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ text });
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }
  const field = fallback.querySelector('textarea');
  field.value = text;
  fallback.hidden = false;
  field.focus();
  field.select();
}

app.addEventListener('click', (ev) => {
  Sound.wake();
  // A tap anywhere on the cabinet while a penny is being weighed shows the result now.
  if (show?.phase === 'judging' && !ev.target.closest('dialog, .top, .updatebar')) {
    if (performance.now() - show.since > SKIP_AFTER) show.ctl.abort();
    return undefined;
  }
  const el = ev.target.closest('button');
  // A tap on the plates while the solved machine runs asks for the playbill now.
  if (!el && show?.phase === 'celebrating' && ev.target.closest('#works')) return show.ctl.abort();
  if (!el) return ev.target.closest('.glass') ? poke(ev) : undefined;
  if (el.matches('.skip-tutorial, #leave-tutorial')) return leaveTutorial();
  if (el.dataset.close !== undefined) return document.getElementById('dialog').close();
  if (el.dataset.update) {
    const u = el.dataset.update;
    if (u === 'now') return startUpdate();
    if (u === 'anyway') return startUpdate(true);
    if (u === 'reload') return P.reloadNow();
    if (u === 'later') { ui.hideUpdate = true; return chrome(); }
  }
  if (el.dataset.month) {
    const arrow = el.getAttribute('aria-label');
    others(el.dataset.month);
    const target = $(`[data-month][aria-label="${arrow}"]:enabled`) || $('[data-month]:enabled');
    return target?.focus();
  }
  if (el.dataset.date) return navigate(el.dataset.date === utcDate() ? '' : '?edition=' + el.dataset.date);
  if (el.dataset.ex) return ui.open === el.dataset.ex ? closeExhibit() : openExhibit(el.dataset.ex);
  if (el.dataset.i !== undefined) return tapSlot(Number(el.dataset.i));
  if (el.dataset.w) return tapTile(el.dataset.w, el);
  switch (el.id) {
    case 'close': case 'back': return closeExhibit();
    case 'drop': return drop();
    case 'tip': return tipDialog();
    case 'skip-reveal': return show?.ctl.abort();
    case 'sound': {
      Sound.setSound(!Sound.soundOn());
      write('sound', Sound.soundOn() ? 1 : 0);
      Sound.play('bell');
      el.setAttribute('aria-pressed', Sound.soundOn());
      el.textContent = Sound.soundOn() ? 'Sound on' : 'Sound off';
      return undefined;
    }
    case 'take-tip': {
      const tip = E.takeTip(c, state, Date.now());
      if (!tip) return;
      Sound.play('bell');
      save();
      if (tip.blank !== undefined) {
        ui.sel = null;
        ui.message = '';
        draw();
        ui.returnFocus = $('#tip');
      }
      return tipDialog(tip);
    }
    case 'share': return share();
    case 'admire-scene':
      ui.admiring = true;
      draw();
      $('.pin').focus({ preventScroll: true });
      return window.scrollTo(0, 0);
    case 'back-to-playbill':
      ui.admiring = false;
      ui.open = null;
      draw();
      return $('#admire-scene').focus();
    case 'today': case 'play-today': return navigate('');
    case 'others': case 'menu': return others();
    case 'install': return install();
    case 'install-help': return installDialog();
    case 'how': return startTutorial();
    default: return undefined;
  }
});

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && ui.open && !$('#dialog').open) closeExhibit();
});

P.initUpdates(chrome);
P.initInstall(chrome, () => {
  const d = document.getElementById('dialog');
  if (d.open && ui.dialog === 'install') d.close();
  chrome();
});

// The countdown on a finished playbill. When midnight passes, the playbill is redrawn to
// offer the new edition instead.
setInterval(() => {
  const el = document.getElementById('countdown');
  if (!el) return;
  if (edition?.date !== utcDate()) {
    if (!show) draw();
    return;
  }
  el.textContent = R.countdown(R.untilNext(Date.now()));
}, 1000);

// Sound starts off (see sound.js). It is on only for a player who switched it on.
if (read('sound') === 1) Sound.setSound(true);
window.addEventListener('popstate', () => loadLocation());
// The slip's width changes with the screen, and the title's with its font once loaded.
window.addEventListener('resize', fitTitle);
document.fonts?.ready.then(fitTitle);
loadLocation(read('seen') !== 1);
