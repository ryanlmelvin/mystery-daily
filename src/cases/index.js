// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import vicarage from './vicarage.js';
import glasshouse from './glasshouse.js';
import train from './train.js';
import theatre from './theatre.js';
import study from './study.js';
import { told } from '../tell.js';

// A case file holds facts, each with its telling. `told` renders every exhibit's text
// from them, so the text the player reads is never written separately.
// In order of difficulty: the prototype runs them as a five-day week.
export const CASES = [vicarage, glasshouse, train, theatre, study].map(told);

export const caseById = (id) => CASES.find((c) => c.id === id);
