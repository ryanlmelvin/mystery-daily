// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// The rules of one cabinet, with no DOM and no clock of its own: every function takes
// the case, the saved state and (where time matters) the current time in milliseconds.

export const PENNIES = 4;

// Every blank in the order it is read: the cast plate first, then the story plate.
export function blanksOf(c) {
  const out = [];
  for (const panel of c.panels) {
    for (const part of panel.parts) {
      if (typeof part !== 'string') out.push({ panel: panel.id, kind: part[0], answer: part[1] });
    }
  }
  return out;
}

// "{token}" or "{token|shown text}" marks a word the player collects from an exhibit.
const WORD = /\{([^}|]+)(?:\|([^}]+))?\}/g;

export function wordsIn(exhibit) {
  const found = [];
  for (const [, text] of exhibit.lines) {
    for (const m of text.matchAll(WORD)) if (!found.includes(m[1])) found.push(m[1]);
  }
  return found;
}

// Split a line into plain text and collectable words, for drawing.
export function segments(text) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(WORD)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    out.push({ text: m[2] || m[1], word: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

export function newGame(c) {
  return {
    v: 1,
    id: c.id,
    opened: [],
    bank: [],
    fills: blanksOf(c).map(() => null),
    given: [],
    tries: [],
    tips: 0,
    status: 'play',
    t0: null,
    t1: null,
    log: []
  };
}

const note = (s, now, what) => {
  if (s.t0 === null) s.t0 = now;
  s.log.push([Math.round((now - s.t0) / 100) / 10, what]);
};

export function openExhibit(c, s, id, now) {
  const ex = c.exhibits.find((e) => e.id === id);
  if (!ex) return false;
  note(s, now, `open ${id}`);
  if (!s.opened.includes(id)) {
    s.opened.push(id);
    for (const w of wordsIn(ex)) if (!s.bank.includes(w)) s.bank.push(w);
  }
  return true;
}

// A plate locks once a penny has shown nothing wrong on it.
export function lockedPanels(c, s) {
  const locked = new Set();
  for (const t of s.tries) for (const [panel, wrong] of Object.entries(t.wrong)) if (wrong === 0) locked.add(panel);
  return locked;
}

export function isFixed(c, s, i) {
  return s.given.includes(i) || lockedPanels(c, s).has(blanksOf(c)[i].panel);
}

export function place(c, s, i, word, now) {
  const blank = blanksOf(c)[i];
  if (s.status !== 'play') return { ok: false, why: 'over' };
  if (!blank) return { ok: false, why: 'unknown' };
  if (isFixed(c, s, i)) return { ok: false, why: 'fixed' };
  if (!s.bank.includes(word)) return { ok: false, why: 'unknown' };
  if (c.words[word] !== blank.kind) return { ok: false, why: 'kind', kind: blank.kind };
  s.fills[i] = word;
  note(s, now, `set ${i} ${word}`);
  return { ok: true };
}

export function clearBlank(c, s, i, now) {
  if (s.status !== 'play' || isFixed(c, s, i) || !s.fills[i]) return false;
  s.fills[i] = null;
  note(s, now, `clear ${i}`);
  return true;
}

export const ready = (s) => s.fills.every(Boolean);

// Drop a penny: the machine checks the plates and says only how many tiles are wrong on each.
export function dropPenny(c, s, now) {
  if (s.status !== 'play') return { ok: false, why: 'over' };
  if (!ready(s)) return { ok: false, why: 'unfilled' };
  const last = s.tries[s.tries.length - 1];
  if (last && last.fills.every((w, i) => w === s.fills[i])) return { ok: false, why: 'same' };
  const blanks = blanksOf(c);
  const marks = s.fills.map((w, i) => w === blanks[i].answer);
  const wrong = {};
  for (const panel of c.panels) wrong[panel.id] = 0;
  blanks.forEach((b, i) => { if (!marks[i]) wrong[b.panel] += 1; });
  const attempt = { fills: [...s.fills], marks, wrong };
  s.tries.push(attempt);
  note(s, now, `penny ${s.tries.length} ${Object.values(wrong).join('/')}`);
  if (marks.every(Boolean)) {
    s.status = 'won';
    s.t1 = now;
  } else if (s.tries.length >= PENNIES) {
    s.status = 'lost';
    s.t1 = now;
  }
  return { ok: true, attempt, status: s.status };
}

// Three tips, each blunter than the last. The first is free; the others show on the ticket.
export function takeTip(c, s, now) {
  if (s.status !== 'play') return null;
  const tier = s.tips;
  if (tier < 2) {
    s.tips += 1;
    note(s, now, `tip ${tier + 1}`);
    return { tier: tier + 1, text: c.tips[tier] };
  }
  const blanks = blanksOf(c);
  const order = blanks.map((_, i) => i).sort((a, b) => (blanks[b].panel === 'story') - (blanks[a].panel === 'story'));
  const i = order.find((k) => !isFixed(c, s, k) && s.fills[k] !== blanks[k].answer);
  if (i === undefined) return { tier: 3, text: 'Every tile on the plates is already right.' };
  s.tips += 1;
  s.fills[i] = blanks[i].answer;
  if (!s.bank.includes(blanks[i].answer)) s.bank.push(blanks[i].answer);
  s.given.push(i);
  note(s, now, `tip set ${i}`);
  return { tier: 3, text: 'The attendant has set one tile for you.', blank: i };
}

export const paidTips = (s) => Math.max(0, s.tips - 1);

export function seconds(s, now) {
  if (s.t0 === null) return 0;
  return Math.max(0, Math.round(((s.t1 ?? now) - s.t0) / 1000));
}

export const clock = (secs) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

// The spoiler-free ticket: one row per penny, one square per tile, cast then story.
export function shareText(c, s, edition, link = '') {
  const blanks = blanksOf(c);
  const rows = s.tries.map((t) => {
    let row = '';
    t.marks.forEach((ok, i) => {
      if (i > 0 && blanks[i].panel !== blanks[i - 1].panel) row += ' ';
      row += ok ? '🟩' : '⬛';
    });
    return row;
  });
  const score = s.status === 'won' ? `${s.tries.length}/${PENNIES}` : `X/${PENNIES}`;
  const tips = '💡'.repeat(paidTips(s));
  const head = `Penny Tableau · No. ${edition} · ${score} 🪙${tips ? ' ' + tips : ''}`;
  return [head, ...rows, link].filter(Boolean).join('\n');
}
