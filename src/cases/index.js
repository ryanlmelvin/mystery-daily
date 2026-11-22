// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import vicarage from './vicarage.js';
import glasshouse from './glasshouse.js';
import train from './train.js';
import theatre from './theatre.js';
import study from './study.js';
import foxes from './foxes.js';
import seance from './seance.js';
import encore from './encore.js';
import fanciers from './fanciers.js';
import { told } from '../tell.js';
import { composeDay, SETTING_IDS } from '../compose.js';

// A case file holds facts, each with its telling. `told` renders every exhibit's text
// from them, so the text the player reads is never written separately.
// The first five daily editions run in this order of difficulty.
export const CASES = [vicarage, glasshouse, train, theatre, study].map(told);

// The arcade offers these fixed samples for review.
export const SAMPLES = [foxes, seance, encore, fanciers].map(told);
export const BROOCH_SAMPLE_DATE = '2027-01-01';
export const reviewCases = () => [composeDay(BROOCH_SAMPLE_DATE), ...SAMPLES];

// A composed case is asked for by its date: "day-2026-11-26". Its own id also carries
// the composer's version ("day-2026-11-26-c2"), and either form finds it.
export function caseById(id) {
  if (id === 'brooch') return composeDay(BROOCH_SAMPLE_DATE);
  const made = CASES.find((c) => c.id === id) || SAMPLES.find((c) => c.id === id);
  const day = /^day-(\d{4}-\d{2}-\d{2})(-c\d+)?$/.exec(String(id));
  if (made || !day) return made;
  try {
    return composeDay(day[1]);
  } catch {
    return undefined;
  }
}

// The On trial menu previews the first composed case in each setting after `date`.
export function trialCases(date, limit = 60) {
  const found = [];
  const start = Date.parse(date + 'T00:00:00Z');
  for (let i = 1; i <= limit && found.length < SETTING_IDS.length; i++) {
    const c = caseById('day-' + new Date(start + i * 86400000).toISOString().slice(0, 10));
    if (c && !found.some((f) => f.composed.setting === c.composed.setting)) found.push(c);
  }
  return found;
}
