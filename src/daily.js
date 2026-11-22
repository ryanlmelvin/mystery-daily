// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// Which cabinet is today's. One edition per UTC day, the same for everyone.
import { CASES } from './cases/index.js';
import { composeDay, composedId } from './compose.js';

export const LAUNCH = '2026-11-21';
const DAY = 86400000;
const LAUNCH_TIME = Date.parse(LAUNCH + 'T00:00:00Z');

export function utcDate(now = Date.now()) {
  return new Date(now).toISOString().slice(0, 10);
}

export function editionFor(date) {
  const time = Date.parse(date + 'T00:00:00Z');
  if (!Number.isFinite(time) || utcDate(time) !== date) return NaN;
  return (time - LAUNCH_TIME) / DAY + 1;
}

export function dateForEdition(edition) {
  if (!Number.isInteger(edition) || edition < 1) return null;
  return utcDate(LAUNCH_TIME + (edition - 1) * DAY);
}

// The archive can look up a month's saves without composing any of its cases.
export function caseIdForDate(date) {
  const edition = editionFor(date);
  if (!(edition >= 1)) return null;
  return CASES[edition - 1]?.id ?? composedId(date);
}

export function caseForEdition(edition) {
  const date = dateForEdition(edition);
  return date && (CASES[edition - 1] ?? composeDay(date));
}

export function dailyForDate(date) {
  const edition = editionFor(date);
  if (!(edition >= 1)) return null;
  return { date, edition, case: caseForEdition(edition) };
}

export function today(now = Date.now()) {
  return dailyForDate(utcDate(now));
}
