// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// The explanation shown at the end, written from the proof. A composed case can take
// many shapes (who did it, where the weapon was, which clue is the trap), so its
// explanation cannot be a fixed set of sentences: it is read off the steps the proof
// took and the temptations it had to answer. Plainer than a hand-written one, but it
// cannot disagree with the proof, because it is the proof.

import { proveCase } from './logic.js';
import { blanksOf, segments } from './engine.js';
import { tellExhibit } from './tell.js';

// How each rule of the proof is said, as the reason a name belongs to a doll.
const CAST = {
  'a name on a belonging': 'a belonging carries the name',
  'a belonging that names its owner': 'something tied to them names its owner',
  'a description on a list': 'their belongings or dress match the written description'
};

// ...as what marks someone out as the one who did it (each completes "X ...").
const DID = {
  'holds the means': 'is tied to what did it',
  'holds what was taken': 'has what was taken',
  'a motive': 'had a reason',
  'staged the scene': 'staged the scene',
  'named at the scene': 'is named at the scene'
};

// ...and as what clears a tempting wrong answer (each completes "..., but ...").
const CLEARS = {
  'the dead did not do it': 'the dead did not do it',
  'plainly untouched': 'it could not have been used',
  'an innocent reason': 'that is accounted for',
  'nobody poisons his own': 'nobody poisons his own',
  'not yet aboard': 'they were not yet aboard',
  'came aboard too late': 'it only came aboard after the death',
  'the scene was staged': 'the scene was staged',
  'it only fits another story': 'that only fits a story the rest rules out'
};

const HEAD = { thief: 'Who took it afterward', culprit: 'Who did it', victim: 'Who died', means: 'With what', loot: 'What was taken', motive: 'Why', intended: 'Who it was meant for', framed: 'Who was blamed', before: 'Where' };

const list = (items) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const uniq = (items) => [...new Set(items)];

export function explain(c) {
  const proof = proveCase(c);
  if (!proof.ok) return { path: [], traps: [], tips: ['', ''], proof };
  const blanks = blanksOf(c);
  const title = (id) => c.exhibits.find((e) => e.id === id).title;
  const cite = (ids) => (ids.length ? ` (${list(uniq(ids).map(title))})` : '');
  const the = (w) => (c.words[w] === 'person' ? w : `the ${w}`);
  const answer = proof.story.answer;
  // The invitation, receipt or other paper that actually answers a lead.
  const quote = (fact) => {
    if (!fact) return '';
    const { lines } = tellExhibit(c, { facts: [fact] });
    const written = lines.filter(([style]) => ['hand', 'print', 'cut'].includes(style));
    const words = written.map(([, line]) => segments(line).map((p) => p.text).join('')).join(' ');
    return words ? `The paper reads “${words}”` : '';
  };

  // What the cabinet shows of a thing that was not used: the sentence on its tag. A player
  // should no more have to take "untouched" on trust than what a paper says.
  const seen = (word) => {
    const ex = c.exhibits.find((e) => e.facts.some(([type, thing]) => type === 'untouched' && thing === word));
    if (!ex) return '';
    const text = tellExhibit(c, ex).lines.map(([, line]) => segments(line).map((p) => p.text).join('')).join(' ');
    return text.split(/(?<=[.!?])\s+/).find((sentence) => sentence.includes(word)) || '';
  };

  // What someone did, said with the thing itself where the rule rests on one.
  const did = (rule, when) => {
    const w = when || answer;
    if (rule === 'holds the means' && w.means) return `is tied to ${the(w.means)}`;
    if (rule === 'holds what was taken' && w.loot) return `has ${the(w.loot)}`;
    return DID[rule] || rule;
  };

  // Where each doll stands, from the cast plate: "On the floor", "At the door".
  const places = {};
  const cast = c.panels.find((p) => p.id === 'cast');
  cast.parts.forEach((part, n) => {
    if (typeof part !== 'string') places[part[2]] = String(cast.parts[n - 1] || '').replace(/^[\s.,]+|[\s.,]+$/g, '');
  });

  const path = [];
  for (const s of proof.cast.steps) {
    const i = blanks.findIndex((b) => b.panel === 'cast' && b.key === s.doll);
    const others = s.eliminated.map((doll) => `${proof.cast.ids[doll]} is ${places[doll].toLowerCase()}`);
    const reason = others.length
      ? `${list(others)}. That leaves ${s.name} ${places[s.doll].toLowerCase()}`
      : `${s.name}: ${list(s.how.map((h) => CAST[h] || h))}`;
    path.push({ how: places[s.doll] || 'A name', from: s.from, gives: [i], say: `${reason}${cite(s.from)}.` });
  }
  for (const s of proof.story.steps) {
    const i = blanks.findIndex((b) => b.panel === 'story' && b.key === s.role);
    let say;
    if (s.role === 'culprit') say = `${s.value} ${list(uniq(s.how.map((h) => did(h))))}`;
    else if (s.role === 'victim') say = `${s.value} is the one who has stopped for good`;
    else if (s.role === 'means') say = `${cap(the(s.value))} would leave the mark on the body`;
    else if (s.role === 'thief') say = `${s.value} first entered after the constable recorded the ${answer.loot} on the body. It turned up inside their glove`;
    else if (s.role === 'loot' && c.ruleSet === 'brooch') say = `The constable recorded the ${s.value} still pinned to the body. Only torn crape and pinholes remain`;
    else if (s.role === 'loot') say = `${cap(the(s.value))} is missing from its place`;
    else if (s.role === 'motive') say = `${cap(the(s.value))}: that was ${answer.culprit ? `${answer.culprit}'s` : 'the'} reason`;
    else if (s.role === 'intended') say = `The label says it was for ${s.value}`;
    else if (s.role === 'framed') say = `${s.value} is named by a scene that was staged`;
    else if (s.role === 'before') say = `The timetable puts the death before ${s.value}`;
    else say = `${cap(the(s.value))}: ${list(s.how)}`;
    let from = s.from;
    say += `${cite(from)}.`;
    if (s.role === 'means') {
      // Alternatives that could make the mark get their own trap below. Other unused
      // implements are accounted for here, beside the exhibits showing their condition.
      const traps = proof.story.traps.filter((t) => t.role === 'means').map((t) => t.value);
      const unused = c.exhibits.flatMap((ex) => ex.facts
        .filter(([type, word]) => type === 'untouched' && !traps.includes(word))
        .map(([, word]) => ({ word, id: ex.id })));
      if (unused.length) {
        const items = uniq(unused.map((item) => the(item.word)));
        const ids = unused.map((item) => item.id);
        say += ` ${cap(list(items))} ${items.length === 1 ? 'was' : 'were'} untouched${cite(ids)}.`;
        from = uniq([...from, ...ids]);
      }
    }
    path.push({ how: HEAD[s.role] || cap(s.role), from, gives: [i], say });
  }

  // Every tempting wrong answer, and what clears it.
  const trapFor = (role, value) => proof.story.traps.find((t) => t.role === role && t.value === value);
  const traps = [];
  for (const t of proof.story.traps) {
    const against = [...t.answeredBy];
    let say;
    if (t.role === 'culprit' && t.ruled.length) {
      // One plain rule puts them out of it, whatever points their way.
      say = `${t.value} ${list(uniq(t.parts.map((p) => did(p.rule, p.when))))}, but ${list(t.ruled.map((r) => CLEARS[r] || r))}`;
    } else if (t.role === 'culprit') {
      // Otherwise each thing that points their way has its own answer.
      const clauses = [];
      for (const p of t.parts) {
        if (p.beaten) {
          const lead = p.rule === 'a motive' && p.reason
            ? `${cap(the(p.reason[2]))} looked like a motive for ${t.value}`
            : `${t.value} ${did(p.rule, p.when)}`;
          clauses.push(`${lead}. ${quote(p.reason) || cap(CLEARS[p.beaten] || p.beaten)}`);
        }
        else if (!p.holds && p.when) {
          const [role, value] = Object.entries(p.when)[0];
          const other = trapFor(role, value);
          if (other) against.push(...other.answeredBy);
          const why = other && other.ruled.length ? CLEARS[other.ruled[0]] || other.ruled[0] : `that is not ${role === 'loot' ? 'what was taken' : 'what did it'}`;
          clauses.push(`${t.value} ${did(p.rule, p.when)}. ${cap(why)}`);
        }
      }
      say = uniq(clauses).join('. ');
    } else if (t.role === 'means') {
      say = `${cap(the(t.value))} would leave that mark too, but ${list(t.how.map((h) => CLEARS[h] || h))}`;
      const shown = t.ruled.includes('plainly untouched') ? seen(t.value) : '';
      if (shown) say += `: “${shown}”`;
    } else if (t.role === 'motive') {
      // One receipt can clear both a person and their apparent motive. The culprit
      // entry above names both, using the very same fact and sources from the proof.
      if (t.parts.every((p) => {
        const suspect = trapFor('culprit', p.when?.culprit);
        return p.reason && suspect && !suspect.ruled.length &&
          suspect.parts.some((s) => s.rule === 'a motive' && s.reason === p.reason);
      })) continue;
      const whose = uniq(t.parts.filter((p) => p.when && p.when.culprit).map((p) => p.when.culprit));
      if (t.parts.every((p) => p.beaten)) {
        const reasons = uniq(t.parts.map((p) => quote(p.reason) || cap(CLEARS[p.beaten] || p.beaten)));
        say = `${cap(the(t.value))} looked like a motive for ${list(whose)}. ${reasons.join('. ')}`;
      } else {
        say = `${list(whose)} had a grievance over the ${t.value}`;
        against.push(...t.from);
        for (const name of whose) {
          const other = trapFor('culprit', name);
          if (other) against.push(...other.answeredBy);
        }
        if (whose.includes(answer.victim)) say += `. ${answer.victim} was the victim`;
      }
    } else {
      say = `${cap(the(t.value))}: ${list(t.how.map((h) => CLEARS[h] || h))}`;
    }
    traps.push({ word: t.value, from: t.from, against: uniq(against), say: `${say}${cite(against)}.` });
  }

  const who = proof.story.steps.find((s) => s.role === 'culprit');
  const real = proof.story.traps.find((t) => t.role === 'culprit' && !t.self);
  const pair = uniq(who ? who.from : []).slice(0, 2).map((id) => `"${title(id)}"`);
  const tips = [
    real ? 'Someone here looks guilty and is not. Ask what clears them.' : 'Look for something that fits the mark on the body and shows signs of use.',
    pair.length === 2 ? `Set ${pair[0]} beside ${pair[1]}.` : 'Ask who is tied to the thing that did it, not who had a reason.'
  ];
  if (c.ruleSet === 'brooch') {
    tips[0] = 'When did the jewel disappear? Read the inventory before you accuse its new owner.';
    tips[1] = 'Compare the first admission on each ticket with the constable’s time. Then match the button in the mourner’s fist to a cuff.';
  }
  return { path, traps, tips, proof };
}
