// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// The telling. An exhibit has no text of its own: every sentence the player reads is the
// telling of one of its facts, and the words that carry the clue (names, initials,
// things, places, times) are written into the sentence from the fact itself. So the
// text and the facts cannot say different things about who, what, where or when.
//
// A telling is the string after a fact's arguments. In it:
//
//   $name $who        the name the fact gives (a full name is collectable; initials,
//                     a surname or 'L. Sparrow' are shown as written)
//   $thing $place     the thing or place, collectable; $Thing capitalises it,
//                     $thing[hatpins] shows other words for it, and
//                     $thing~[a white orchid] shows it without naming it
//   $key $mark $value $time    shown as written ($Key capitalises)
//   $stops            the timetable
//   {word}            any other collectable word, as a decoy
//   a | b             separate lines; a line may begin cut:, hand: or print:
//
// A fact must be told. Its telling may be null only where the scene itself says it
// (which doll has stopped for good). What a fact asserts must be shown somewhere in its
// exhibit by one of these holes, and no word from the tray may be mentioned unless the
// player can collect it there.
//
// What this cannot check: the connecting words. "Thick with dust" is this game's way of
// saying untouched only because the author wrote it on an untouched fact.

import { rulesFor } from './rules/index.js';
import { ARITY } from './logic.js';

// Which argument each hole reads, by kind of fact.
const HOLES = {
  tag: { name: 1 }, owner: { name: 1 }, accused: { name: 0 }, meantFor: { name: 0 },
  listed: { name: 0, key: 1 },
  sign: { mark: 0 }, makes: { thing: 0, mark: 1 },
  untouched: { thing: 0 }, taken: { thing: 0 },
  has: { who: 0, thing: 1 }, wants: { who: 0, thing: 1 }, excused: { who: 0, thing: 1 },
  lead: { who: 0 }, explained: { who: 0 }, wrote: { who: 0 },
  habit: { value: 1 }, found: { value: 1 },
  died: { time: 0 }, stops: { stops: 0 }, boarded: { who: 0, place: 1 },
  fits: {}, link: {}, dead: {}
};

// What each kind of fact asserts, and so what its exhibit must show.
const MUST = {
  tag: ['name'], owner: ['name'], accused: ['name'], meantFor: ['name'], listed: ['name', 'key'],
  sign: ['mark'], makes: ['thing'], untouched: ['thing'], taken: ['thing'], has: ['thing'], wants: ['thing'],
  habit: ['value'], found: ['value'], died: ['time'], stops: ['stops'], boarded: ['place'],
  excused: [], lead: [], explained: [], wrote: [], fits: [], link: [], dead: []
};

const SILENT = ['dead'];
const STYLES = ['see', 'hand', 'print', 'cut'];
const HOLE = /\$([A-Za-z]+)(~)?(?:\[([^\]]*)\])?/g;
const SPECIAL = /[.*+?^$()|[\]{}\\]/g;

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const collect = (word, shown) => (shown && shown !== word ? `{${word}|${shown}}` : `{${word}}`);
const patternText = (p) => (typeof p === 'string' ? p : p.full || p.initials || p.surname || p.abbr || '');
const mentions = (text, word) => new RegExp('(?<![\\w-])' + word.replace(SPECIAL, '\\$&') + '(?![\\w-])', 'i').test(text);

function token(hole, v) {
  if (hole === 'stops') return 'the timetable';
  return v && typeof v === 'object' ? patternText(v) : String(v);
}

export function factParts(f, rules) {
  const n = ARITY[f[0]] ?? rules?.factArity[f[0]];
  return { type: f[0], args: f.slice(1, 1 + n), say: f[1 + n] };
}

// Render one exhibit's facts as lines of text, and list what is wrong with the telling.
export function tellExhibit(c, ex) {
  const errors = [];
  const lines = [];
  const shown = new Set();
  const owed = [];
  const bank = Object.keys(c.words);
  const fail = (msg) => errors.push(`${ex.id}: ${msg}`);

  const rules = rulesFor(c);
  for (const f of ex.facts || []) {
    if (!(f[0] in ARITY) && rules?.factArity[f[0]] === undefined) {
      fail(`"${f[0]}" is not a kind of fact.`);
      continue;
    }
    const { type, args, say } = factParts(f, rules);
    const bindings = rules?.factBindings[type]?.(args) ??
      Object.fromEntries(Object.entries(HOLES[type]).map(([hole, i]) => [hole, args[i]]));
    for (const hole of MUST[type] ?? Object.keys(bindings)) {
      owed.push({ type, hole: hole === 'who' ? 'name' : hole, tok: token(hole, bindings[hole]) });
    }
    if (say === undefined) {
      fail(`the ${type} fact has no telling.`);
      continue;
    }
    if (say === null) {
      if (!SILENT.includes(type)) fail(`the ${type} fact cannot go untold.`);
      continue;
    }

    const bare = say.replace(/\{[^}]*\}/g, ' ').replace(HOLE, ' ');
    for (const w of bank) {
      if (mentions(bare, w)) fail(`"${w}" is mentioned but cannot be collected there; write {${w}}.`);
    }

    for (const piece of say.split('|')) {
      let text = piece.trim();
      let style = 'see';
      const m = /^([a-z]+):\s*/.exec(text);
      if (m && STYLES.includes(m[1])) {
        style = m[1];
        text = text.slice(m[0].length);
      }
      text = text.replace(HOLE, (whole, name, veil, alt) => {
        const hole = name.toLowerCase();
        const upper = name[0] !== name[0].toLowerCase();
        if (!(hole in bindings)) {
          fail(`the ${type} fact has no $${name} to show.`);
          return whole;
        }
        const v = bindings[hole];
        if (hole === 'stops') {
          shown.add('stops:the timetable');
          return v.map(([place, at], i) => `${collect(place)}${i === 0 ? ' depart' : i === v.length - 1 ? ' arrive' : ''} ${at}.`).join(' ');
        }
        if (hole === 'name' || hole === 'who') {
          if (typeof v === 'string') {
            if (c.words[v] !== 'person') {
              fail(`$${name} is a doll, which has no name to write.`);
              return whole;
            }
            shown.add('name:' + v);
            return collect(v);
          }
          if (v.listed) {
            fail(`$${name} is "whoever is listed as ${v.listed}", which has no name to write.`);
            return whole;
          }
          shown.add('name:' + patternText(v));
          return v.full ? collect(v.full) : patternText(v);
        }
        if (hole === 'thing' || hole === 'other' || hole === 'place') {
          shown.add(hole + ':' + v);
          if (veil) return alt || '';
          return collect(v, alt || (upper ? cap(v) : v));
        }
        shown.add(hole + ':' + v);
        return upper ? cap(String(v)) : String(v);
      });
      if (!text) continue;
      const last = lines[lines.length - 1];
      if (last && last[0] === style) last[1] += ' ' + text;
      else lines.push([style, text]);
    }
  }

  for (const o of owed) {
    if (!shown.has(o.hole + ':' + o.tok)) fail(`the ${o.type} fact asserts "${o.tok}", but the exhibit never shows it.`);
  }
  if (!lines.length) fail('has no text.');
  return { lines, errors };
}

export function tellErrors(c) {
  return c.exhibits.flatMap((ex) => tellExhibit(c, ex).errors);
}

// A case with every exhibit's text rendered from its facts. This is the only place the
// text is made: a case file that writes its own `lines` has them replaced.
export function told(c) {
  return { ...c, exhibits: c.exhibits.map((ex) => ({ ...ex, lines: tellExhibit(c, ex).lines })) };
}
