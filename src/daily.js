// Which cabinet is today's. One edition per UTC day, the same for everyone.
import { CASES } from './cases/index.js';

export const LAUNCH = '2026-11-21';
const DAY = 86400000;

export function utcDate(now = Date.now()) {
  return new Date(now).toISOString().slice(0, 10);
}

export function editionFor(date) {
  return Math.floor((Date.parse(date + 'T00:00:00Z') - Date.parse(LAUNCH + 'T00:00:00Z')) / DAY) + 1;
}

// The prototype has five cases, so the week repeats: edition 6 is edition 1 again.
export function caseForEdition(edition) {
  const n = CASES.length;
  return CASES[(((edition - 1) % n) + n) % n];
}

export function today(now = Date.now()) {
  const date = utcDate(now);
  const edition = editionFor(date);
  return { date, edition, case: caseForEdition(edition) };
}
