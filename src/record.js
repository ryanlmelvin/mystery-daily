// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// The player's record: one line per finished daily edition, kept by date. It is stored
// apart from the saved games so it outlives them: a composed case's save is filed under
// the composer's version, and a new version must not wipe out a streak.

import { paidTips, seconds, PENNIES } from './engine.js';

const DAY = 86400000;
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const next = (date, by = 1) => new Date(Date.parse(date + 'T00:00:00Z') + by * DAY).toISOString().slice(0, 10);

export const emptyRecord = () => ({ v: 1, days: {} });

// Every date from one to another, both included.
export function dates(from, to) {
  const out = [];
  for (let date = from; date <= to; date = next(date)) out.push(date);
  return out;
}

// Anything else in storage under this name is thrown away rather than trusted.
export function readRecord(saved) {
  if (saved?.v !== 1 || !saved.days || typeof saved.days !== 'object') return emptyRecord();
  const days = {};
  for (const [date, day] of Object.entries(saved.days)) {
    const pennies = Number.isInteger(day?.p) && day.p >= 1 && day.p <= PENNIES;
    if (ISO.test(date) && (day?.r === 'won' || day?.r === 'lost') && pennies) days[date] = day;
  }
  return { v: 1, days };
}

// The line for a finished game: result, pennies used, paid tips and seconds taken.
export function resultOf(state) {
  if (state?.status !== 'won' && state?.status !== 'lost') return null;
  return { r: state.status, p: state.tries.length, t: paidTips(state), s: seconds(state, state.t1) };
}

// The figures on the playbill. A streak is editions solved in a row, by date, up to
// today's. Today's edition does not break it until it is lost: it may not be played yet.
export function summarise(days, today, launch) {
  const dist = Array(PENNIES).fill(0);
  let played = 0;
  let solved = 0;
  let best = 0;
  let run = 0;
  let unplayed = 0;
  for (const date of dates(launch, today)) {
    const day = days[date];
    if (!day) unplayed += 1;
    else played += 1;
    if (day?.r === 'won') {
      solved += 1;
      dist[day.p - 1] += 1;
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  let streak = 0;
  for (let date = days[today] ? today : next(today, -1); date >= launch && days[date]?.r === 'won'; date = next(date, -1)) streak += 1;
  return { played, solved, lost: played - solved, streak, best, dist, unplayed };
}

// Milliseconds until the next edition opens, at midnight UTC.
export const untilNext = (now) => DAY - (now % DAY);

export function countdown(ms) {
  const secs = Math.max(0, Math.ceil(ms / 1000));
  const two = (n) => String(n).padStart(2, '0');
  return `${Math.floor(secs / 3600)}:${two(Math.floor(secs / 60) % 60)}:${two(secs % 60)}`;
}
