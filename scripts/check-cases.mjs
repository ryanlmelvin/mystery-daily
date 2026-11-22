// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// Check every case against the rules in src/lint.js and print its size.
import { CASES } from '../src/cases/index.js';
import { lintCase } from '../src/lint.js';
import { scenePins } from '../src/art/scenes.js';

let failed = false;
for (const c of CASES) {
  const { errors, warnings, stats } = lintCase(c, scenePins(c.scene));
  const size = `${stats.exhibits} exhibits, ${stats.blanks} blanks, ${stats.words} words, ${stats.reading} words of reading, ${stats.guesses.toLocaleString('en')} possible fills`;
  console.log(`${errors.length ? 'FAIL' : 'ok  '} ${c.id.padEnd(11)} ${size}`);
  for (const e of errors) console.log(`     error: ${e}`);
  for (const w of warnings) console.log(`     note:  ${w}`);
  if (errors.length) failed = true;
}
process.exit(failed ? 1 : 0);
