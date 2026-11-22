// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// Each family adds observations and their deductions to the common vocabulary.
// The proof receives the exhibits, never the answers the author put on the plates.
import * as brooch from './brooch.js';
import * as foxes from './foxes.js';
import * as seance from './seance.js';
import * as encore from './encore.js';
import * as fanciers from './fanciers.js';

const families = { brooch, foxes, seance, encore, fanciers };
export const rulesFor = (c) => families[c.ruleSet];
