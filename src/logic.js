// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// The proof. A case states what each exhibit plainly shows, as facts in a small fixed
// vocabulary; the rules below decide what follows from them. The author never writes a
// conclusion, only observations, so the proof can disagree with the author.
//
// A case passes when:
//   - the cast can be named in exactly one way, and without guessing;
//   - exactly one story fits the facts, and it can be reached step by step;
//   - every tempting wrong answer is refuted by something in the cabinet;
//   - every exhibit matters.
//
// This is a proof inside the model. It cannot tell whether the written sentences say
// what the facts claim, or whether a person finds the chain fair. Playtest does that.
//
// Facts (each is an array on an exhibit, followed by its telling, the sentence the player
// reads; `who` is a doll id, a name, {listed: key} or a name pattern; a pattern is {full},
// {initials}, {surname} or {abbr: 'L. Sparrow'}; a `fits` key may be a list of keys):
//
//   ['tag', doll, pattern]       a belonging on the doll bears a name
//   ['link', doll, item]         the doll is tied to an item (holds its key, wears its hat)
//   ['owner', item, pattern]     the item bears its owner's name
//   ['fits', doll, key]          the doll visibly matches a description (a trade, an age)
//   ['listed', name, key]        a document gives that description to a name
//   ['dead', doll]               this doll is the victim
//   ['sign', mark]               what the body shows
//   ['makes', thing, mark]       the thing would leave that mark
//   ['untouched', thing]         the thing was plainly not used and not taken
//   ['taken', thing]             the thing is missing from where it belongs
//   ['has', who, thing]          who holds (or owns) the thing
//   ['wants', who, thing]        who has a reason to want the thing
//   ['excused', who, thing]      an innocent reason for that holding or wanting
//   ['lead', who, why]           something else that makes who look guilty
//   ['accused', pattern]         a message at the scene blames this name
//   ['habit', key, value]        how the victim always did something
//   ['found', key, value]        how the scene shows it done (a mismatch means staging)
//   ['wrote', who]               who carries the trace of writing the message
//   ['meantFor', pattern]        the fatal thing was meant for this name
//   ['died', time]               when the victim died, as 'h.mm'
//   ['stops', [[place, time]]]   the timetable
//   ['boarded', who, place]      where who got on

import { blanksOf, PENNIES } from './engine.js';

const peopleOf = (c) => Object.keys(c.words).filter((w) => c.words[w] === 'person');
const uniq = (list) => [...new Set(list)];
const minutes = (t) => {
  const [h, m] = String(t).split('.').map(Number);
  return h * 60 + m;
};

export function matches(name, pat) {
  if (typeof pat === 'string') return name === pat;
  const parts = name.split(' ');
  const last = parts[parts.length - 1];
  if (pat.full) return name === pat.full;
  if (pat.initials) return parts.map((p) => p[0] + '.').join('') === pat.initials;
  if (pat.surname) return last === pat.surname;
  if (pat.abbr) {
    const [initial, surname] = pat.abbr.split('. ');
    return parts[0][0] === initial && last === surname;
  }
  return false;
}

// How many arguments each kind of fact takes. Whatever follows them is the fact's
// telling: the sentence the player reads (see tell.js). The proof never reads it.
export const ARITY = {
  tag: 2, link: 2, owner: 2, fits: 2, listed: 2, dead: 1, sign: 1, makes: 2, untouched: 1, taken: 1,
  has: 2, wants: 2, excused: 2, lead: 2, accused: 1, habit: 2, found: 2, wrote: 1, meantFor: 1,
  died: 1, stops: 1, boarded: 2
};

function gather(c, without = []) {
  const atoms = [];
  for (const ex of c.exhibits) {
    if (without.includes(ex.id)) continue;
    for (const f of ex.facts || []) {
      if (f[0] in ARITY) atoms.push({ type: f[0], a: f.slice(1, 1 + ARITY[f[0]]), ex: ex.id });
    }
  }
  return atoms;
}

// ---------- the cast plate ----------

function solveCast(c, atoms) {
  const people = peopleOf(c);
  const dolls = blanksOf(c).filter((b) => b.panel === 'cast').map((b) => b.key);
  const of = (type) => atoms.filter((x) => x.type === type);
  const cons = Object.fromEntries(dolls.map((d) => [d, []]));
  const add = (doll, names, rule, from) => {
    if (cons[doll]) cons[doll].push({ names, rule, from: uniq(from) });
  };

  for (const t of of('tag')) add(t.a[0], people.filter((n) => matches(n, t.a[1])), 'a name on a belonging', [t.ex]);
  for (const l of of('link')) {
    for (const o of of('owner')) {
      if (o.a[0] === l.a[1]) add(l.a[0], people.filter((n) => matches(n, o.a[1])), 'a belonging that names its owner', [l.ex, o.ex]);
    }
  }
  for (const f of of('fits')) {
    // A doll may fit more than one description: a clerical collar suits vicar or curate.
    const keys = [].concat(f.a[1]);
    const listed = of('listed').filter((l) => keys.includes(l.a[1]));
    if (listed.length) add(f.a[0], listed.map((l) => l.a[0]), 'a description on a list', [f.ex, ...listed.map((l) => l.ex)]);
  }

  const cand = {};
  for (const d of dolls) cand[d] = people.filter((n) => cons[d].every((k) => k.names.includes(n)));

  // Every way to give the dolls distinct names that the facts allow.
  const solutions = [];
  const seat = (i, used, cur) => {
    if (solutions.length > 20) return;
    if (i === dolls.length) return void solutions.push({ ...cur });
    for (const n of cand[dolls[i]]) {
      if (used.has(n)) continue;
      used.add(n);
      cur[dolls[i]] = n;
      seat(i + 1, used, cur);
      used.delete(n);
    }
    delete cur[dolls[i]];
  };
  seat(0, new Set(), {});

  // The way a person does it: name whoever has one name left, cross that name off the rest.
  const ids = {};
  const steps = [];
  for (let moved = true; moved;) {
    moved = false;
    for (const d of dolls) {
      if (ids[d]) continue;
      const open = cand[d].filter((n) => !Object.values(ids).includes(n));
      if (open.length !== 1) continue;
      ids[d] = open[0];
      steps.push({
        doll: d,
        name: open[0],
        how: uniq(cons[d].map((k) => k.rule)).concat(cand[d].length > 1 ? ['the only name left'] : []),
        from: uniq(cons[d].flatMap((k) => k.from))
      });
      moved = true;
    }
  }
  return { dolls, solutions, ids, steps, stalled: dolls.filter((d) => !ids[d]) };
}

// ---------- the story plate ----------

function solveStory(c, atoms, cast) {
  const people = peopleOf(c);
  const gaps = blanksOf(c).filter((b) => b.panel === 'story');
  const roles = gaps.map((g) => g.key);
  const has = (role) => roles.includes(role);
  const of = (type) => atoms.filter((x) => x.type === type);
  const ids = cast.ids;
  const idFrom = Object.fromEntries(cast.steps.map((s) => [s.doll, s.from]));
  const listedAs = (key) => of('listed').filter((l) => l.a[1] === key);

  const person = (ref) => {
    if (typeof ref === 'string') return ref in ids ? ids[ref] : c.words[ref] === 'person' ? ref : null;
    if (ref.listed) {
      const l = listedAs(ref.listed);
      return l.length === 1 ? l[0].a[0] : null;
    }
    const m = people.filter((n) => matches(n, ref));
    return m.length === 1 ? m[0] : null;
  };
  // The exhibits it takes to know who `ref` is.
  const about = (ref) => (typeof ref === 'string' ? idFrom[ref] || [] : ref.listed ? listedAs(ref.listed).map((l) => l.ex) : []);

  const supports = [];
  const excludes = [];
  const sup = (role, value, o) => {
    if (has(role) && value) supports.push({ role, value, when: o.when || null, weight: o.weight || 'fact', rule: o.rule, from: uniq(o.from), at: o.at || o.from[0], defeated: o.defeated || null });
  };
  const exc = (role, value, o) => {
    if (has(role) && value) excludes.push({ role, value, when: o.when || null, rule: o.rule, from: uniq(o.from) });
  };

  // A scene is staged when it shows the victim doing something the way he never did.
  let staged = null;
  for (const h of of('habit')) {
    for (const f of of('found')) {
      if (h.a[0] === f.a[0] && h.a[1] !== f.a[1]) staged = { from: uniq([...(staged ? staged.from : []), h.ex, f.ex]) };
    }
  }
  const excuse = (ref, thing) => {
    const p = person(ref);
    const e = of('excused').find((x) => person(x.a[0]) === p && x.a[1] === thing);
    return e ? { rule: 'an innocent reason', from: [e.ex] } : null;
  };

  const dead = of('dead')[0];
  if (dead) {
    const from = [dead.ex, ...about(dead.a[0])];
    sup('victim', ids[dead.a[0]], { rule: 'the body', from });
    exc('culprit', ids[dead.a[0]], { rule: 'the dead did not do it', from });
  }
  for (const s of of('sign')) {
    for (const m of of('makes')) if (m.a[1] === s.a[0]) sup('means', m.a[0], { rule: 'it fits the mark', from: [s.ex, m.ex], at: m.ex });
  }
  for (const u of of('untouched')) {
    exc('means', u.a[0], { rule: 'plainly untouched', from: [u.ex] });
    exc('loot', u.a[0], { rule: 'plainly untouched', from: [u.ex] });
  }
  for (const t of of('taken')) sup('loot', t.a[0], { rule: 'missing from its place', from: [t.ex] });
  for (const h of of('has')) {
    const p = person(h.a[0]);
    const from = [h.ex, ...about(h.a[0])];
    const defeated = excuse(h.a[0], h.a[1]);
    if (has('means')) sup('culprit', p, { when: { means: h.a[1] }, weight: 'act', rule: 'holds the means', from, defeated });
    if (has('loot')) sup('culprit', p, { when: { loot: h.a[1] }, weight: 'act', rule: 'holds what was taken', from, defeated });
  }
  for (const w of of('wants')) {
    const p = person(w.a[0]);
    const from = [w.ex, ...about(w.a[0])];
    const defeated = excuse(w.a[0], w.a[1]);
    sup('culprit', p, { weight: 'lead', rule: 'a motive', from, defeated });
    sup('motive', w.a[1], { when: { culprit: p }, rule: 'a motive', from, defeated });
  }
  for (const l of of('lead')) sup('culprit', person(l.a[0]), { weight: 'lead', rule: l.a[1], from: [l.ex, ...about(l.a[0])] });
  for (const a of of('accused')) {
    const p = person(a.a[0]);
    if (staged) {
      sup('culprit', p, { weight: 'act', rule: 'named at the scene', from: [a.ex], defeated: { rule: 'the scene was staged', from: staged.from } });
      sup('framed', p, { rule: 'named by a staged scene', from: [a.ex, ...staged.from] });
    } else {
      sup('culprit', p, { weight: 'act', rule: 'named at the scene', from: [a.ex] });
    }
  }
  if (staged) {
    for (const w of of('wrote')) sup('culprit', person(w.a[0]), { weight: 'act', rule: 'staged the scene', from: [w.ex, ...about(w.a[0]), ...staged.from] });
  }
  for (const m of of('meantFor')) sup('intended', person(m.a[0]), { rule: 'it was meant for him', from: [m.ex] });
  if (has('intended')) {
    for (const p of people) exc('culprit', p, { when: { intended: p }, rule: 'nobody poisons his own', from: of('meantFor').map((m) => m.ex) });
  }
  if (has('framed')) for (const p of people) exc('framed', p, { when: { culprit: p }, rule: 'nobody frames himself', from: [] });
  const died = of('died')[0];
  const stops = of('stops')[0];
  if (died && stops) {
    const t = minutes(died.a[0]);
    const next = stops.a[0].find(([, at]) => minutes(at) > t);
    if (next) sup('before', next[0], { rule: 'the timetable', from: [died.ex, stops.ex] });
    for (const b of of('boarded')) {
      const stop = stops.a[0].find(([place]) => place === b.a[1]);
      if (stop && minutes(stop[1]) > t) exc('culprit', person(b.a[0]), { rule: 'not yet aboard', from: [b.ex, died.ex, stops.ex, ...about(b.a[0])] });
    }
  }

  const domain = (g) => Object.keys(c.words).filter((w) => c.words[w] === g.kind);
  const holds = (when, fill) => !when || Object.entries(when).every(([r, v]) => fill[r] === v);
  const stands = (role, value, fill) => {
    const s = supports.filter((x) => x.role === role && x.value === value && !x.defeated && holds(x.when, fill));
    if (!s.length) return false;
    if (role === 'culprit' && !s.some((x) => x.weight === 'act')) return false;
    return !excludes.some((x) => x.role === role && x.value === value && holds(x.when, fill));
  };

  // Every story the facts allow.
  const solutions = [];
  const walk = (i, fill) => {
    if (solutions.length > 20) return;
    if (i === gaps.length) {
      if (roles.every((r) => stands(r, fill[r], fill))) solutions.push({ ...fill });
      return;
    }
    for (const v of domain(gaps[i])) {
      fill[roles[i]] = v;
      walk(i + 1, fill);
    }
    delete fill[roles[i]];
  };
  walk(0, {});

  // The way a person does it: settle what can be settled now, then what depends on it.
  const fixed = {};
  const steps = [];
  for (let round = 1; ; round++) {
    const found = [];
    const state = (when) => {
      if (!when) return 'on';
      const pairs = Object.entries(when);
      if (pairs.every(([k, v]) => fixed[k] === v)) return 'on';
      return pairs.some(([k, v]) => k in fixed && fixed[k] !== v) ? 'off' : 'wait';
    };
    for (const g of gaps) {
      const r = g.key;
      if (r in fixed) continue;
      const live = [];
      let waiting = false;
      for (const v of domain(g)) {
        if (excludes.some((x) => x.role === r && x.value === v && state(x.when) === 'on')) continue;
        const mine = supports.filter((x) => x.role === r && x.value === v && !x.defeated && (r !== 'culprit' || x.weight === 'act'));
        const on = mine.filter((x) => state(x.when) === 'on');
        if (on.length) {
          const all = supports.filter((x) => x.role === r && x.value === v && !x.defeated && state(x.when) === 'on');
          live.push({ v, on: all });
        } else if (mine.some((x) => state(x.when) === 'wait')) waiting = true;
      }
      if (live.length === 1 && !waiting) {
        // Settled by one exhibit: a support that counts, needs nothing else, and has one source.
        const counted = live[0].on.filter((x) => r !== 'culprit' || x.weight === 'act');
        found.push({ role: r, value: live[0].v, round, how: uniq(live[0].on.map((x) => x.rule)), from: uniq(live[0].on.flatMap((x) => x.from)), alone: counted.some((x) => !x.when && x.from.length === 1) });
      }
    }
    if (!found.length) break;
    for (const f of found) {
      fixed[f.role] = f.value;
      steps.push(f);
    }
  }

  // Temptations: wrong answers that something in the cabinet points to.
  const answer = Object.fromEntries(gaps.map((g) => [g.key, g.answer]));
  const traps = [];
  for (const g of gaps) {
    for (const v of domain(g)) {
      if (v === g.answer) continue;
      const mine = supports.filter((x) => x.role === g.key && x.value === v);
      if (!mine.length) continue;
      const fill = { ...answer, [g.key]: v };
      const ruled = excludes.filter((x) => x.role === g.key && x.value === v && holds(x.when, fill));
      const beaten = mine.filter((x) => x.defeated);
      const elsewhere = mine.filter((x) => !x.defeated && !holds(x.when, fill));
      const open = mine.filter((x) => !x.defeated && holds(x.when, fill));
      const from = uniq(mine.flatMap((x) => x.from));
      const answeredBy = uniq([...ruled.flatMap((x) => x.from), ...beaten.flatMap((x) => x.defeated.from)]);
      traps.push({
        role: g.key,
        value: v,
        why: uniq(mine.map((x) => x.rule)),
        from,
        answered: ruled.length > 0 || open.length === 0,
        how: uniq([...ruled.map((x) => x.rule), ...beaten.map((x) => x.defeated.rule), ...(elsewhere.length ? ['it only fits another story'] : [])]),
        answeredBy,
        // A trap answered by the very exhibit that sets it costs the player nothing.
        self: answeredBy.length > 0 && answeredBy.every((e) => mine.some((x) => x.at === e))
      });
    }
  }

  const decoyEx = uniq(excludes.flatMap((x) => x.from));
  return { gaps, solutions, fill: fixed, steps, stalled: roles.filter((r) => !(r in fixed)), traps, decoyEx, answer };
}

// ---------- the verdict ----------

function attempt(c, without = []) {
  const atoms = gather(c, without);
  const cast = solveCast(c, atoms);
  const castOk = cast.solutions.length === 1 && !cast.stalled.length;
  const story = castOk ? solveStory(c, atoms, cast) : null;
  return { cast, story };
}

function sound(c, run) {
  const { cast, story } = run;
  if (!story) return false;
  const blanks = blanksOf(c);
  if (blanks.some((b) => b.panel === 'cast' && cast.ids[b.key] !== b.answer)) return false;
  if (story.solutions.length !== 1 || story.stalled.length) return false;
  if (story.gaps.some((g) => story.fill[g.key] !== g.answer)) return false;
  return story.traps.every((t) => t.answered);
}

const differs = (a, b) => Object.keys(a).filter((k) => a[k] !== b[k]).map((k) => `${k}: ${a[k]}`).join(', ');

export function proveCase(c) {
  const errors = [];
  const warnings = [];
  const notes = [];
  const blanks = blanksOf(c);

  for (const b of blanks) if (!b.key) errors.push(`The gap for "${b.answer}" does not say which ${b.panel === 'cast' ? 'doll' : 'part of the story'} it is.`);
  for (const ex of c.exhibits) if (!(ex.facts || []).length) errors.push(`Exhibit ${ex.id} states no facts.`);
  if (errors.length) return { ok: false, errors, warnings, notes, cast: null, story: null, exhibits: {} };

  const run = attempt(c);
  const { cast, story } = run;
  const castAnswer = Object.fromEntries(blanks.filter((b) => b.panel === 'cast').map((b) => [b.key, b.answer]));

  if (cast.solutions.length === 0) errors.push('The facts allow no way to name the cast.');
  if (cast.solutions.length > 1) {
    const other = cast.solutions.find((s) => differs(s, castAnswer)) || cast.solutions[0];
    errors.push(`The cast can be named ${cast.solutions.length > 20 ? 'more than 20' : cast.solutions.length} ways. One of them: ${differs(other, castAnswer)}.`);
  }
  if (cast.solutions.length === 1) {
    if (cast.stalled.length) errors.push(`Naming ${cast.stalled.join(', ')} takes a guess: no doll is down to one name.`);
    const wrong = differs(cast.solutions[0], castAnswer);
    if (wrong) errors.push(`The facts name the cast differently from the case: ${wrong}.`);
  }

  if (story) {
    if (story.solutions.length === 0) {
      errors.push('No story fits the facts.');
      for (const g of story.gaps) if (!story.steps.some((s) => s.role === g.key)) errors.push(`Nothing settles the ${g.key}.`);
    }
    if (story.solutions.length > 1) {
      const other = story.solutions.find((s) => differs(s, story.answer)) || story.solutions[0];
      errors.push(`${story.solutions.length > 20 ? 'More than 20' : story.solutions.length} stories fit the facts. A second answer: ${differs(other, story.answer)}.`);
    }
    if (story.solutions.length === 1) {
      const wrong = differs(story.solutions[0], story.answer);
      if (wrong) errors.push(`The facts tell a different story from the case: ${wrong}.`);
      else if (story.stalled.length) errors.push(`The ${story.stalled.join(' and ')} cannot be settled one step at a time: more than one answer stays open until another gap is tried.`);
    }
    for (const t of story.traps) {
      if (!t.answered) errors.push(`Nothing answers a temptation: ${t.role} = ${t.value} (${t.why.join(', ')}; from ${t.from.join(', ')}).`);
    }
    const real = story.traps.filter((t) => t.answered && !t.self);
    const lures = uniq(real.map((t) => t.from.join('+')));
    if (lures.length >= PENNIES - 1) warnings.push(`${lures.length} real traps, and only ${PENNIES - 1} spare pennies.`);
    if (!real.length) notes.push('No real trap: every temptation is answered by the exhibit that sets it.');
    for (const s of story.steps) if (s.alone) warnings.push(`The ${s.role} (${s.value}) is settled by one exhibit: ${s.from.join(', ')}.`);
  }

  // What each exhibit is for: take it away and see whether the proof still stands.
  const exhibits = {};
  if (story && !errors.length) {
    const used = new Set([...cast.steps.flatMap((s) => s.from), ...story.steps.flatMap((s) => s.from)]);
    const trapEx = new Set(story.traps.flatMap((t) => [...t.from, ...t.answeredBy]));
    for (const ex of c.exhibits) {
      if (!sound(c, attempt(c, [ex.id]))) exhibits[ex.id] = 'needed';
      else if (used.has(ex.id)) exhibits[ex.id] = 'backs up';
      else if (trapEx.has(ex.id)) exhibits[ex.id] = 'trap';
      else if (story.decoyEx.includes(ex.id)) exhibits[ex.id] = 'rules out a decoy';
      else {
        exhibits[ex.id] = 'idle';
        errors.push(`Exhibit ${ex.id} is idle: none of its facts changes anything.`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    notes,
    cast,
    story,
    exhibits,
    rounds: story ? Math.max(0, ...story.steps.map((s) => s.round)) : 0
  };
}
