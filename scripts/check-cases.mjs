// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// Check every case (src/lint.js) and prove it (src/logic.js), then print its size.
// Add --why to print how the proof reaches each answer and what it makes of each exhibit,
// and --text to print every exhibit's text as it is rendered from its facts.
import { CASES, reviewCases } from '../src/cases/index.js';
import { lintCase } from '../src/lint.js';
import { scenePins } from '../src/art/scenes.js';

const why = process.argv.includes('--why');
const text = process.argv.includes('--text');
let failed = false;
for (const c of [...CASES, ...reviewCases()]) {
  const { errors, warnings, stats, proof } = lintCase(c, scenePins(c.scene));
  const size = `${stats.exhibits} exhibits, ${stats.blanks} blanks, ${stats.words} words, ${stats.reading} words of reading`;
  console.log(`${errors.length ? 'FAIL' : 'ok  '} ${c.id.padEnd(11)} ${size}`);
  if (proof.ok) {
    const traps = proof.story.traps;
    // One misleading exhibit can tempt in two gaps at once; count it once.
    const real = new Set(traps.filter((t) => !t.self).map((t) => t.from.join('+'))).size;
    const spot = new Set(traps.filter((t) => t.self).map((t) => t.from.join('+'))).size;
    const count = (label) => Object.values(proof.exhibits).filter((v) => v === label).length;
    console.log(`     proved: one way to name the cast, one story, reached in ${proof.rounds} rounds; ` +
      `${real} real trap${real === 1 ? '' : 's'}, ${spot} answered on the spot; ` +
      `exhibits: ${count('needed')} needed, ${c.exhibits.length - count('needed')} supporting`);
  }
  for (const e of errors) console.log(`     error: ${e}`);
  for (const w of warnings) console.log(`     note:  ${w}`);
  for (const n of proof.notes) console.log(`     note:  ${n}`);
  if (why && proof.cast) {
    for (const s of proof.cast.steps) console.log(`       cast   ${s.doll} is ${s.name}: ${s.how.join('; ')} (${s.from.join(', ')})`);
    for (const s of proof.story ? proof.story.steps : []) console.log(`       round ${s.round}  ${s.role} is ${s.value}: ${s.how.join('; ')} (${s.from.join(', ')})`);
    for (const t of proof.story ? proof.story.traps : []) console.log(`       trap   ${t.role} = ${t.value}: ${t.why.join('; ')} (${t.from.join(', ')}); answered: ${t.how.join('; ')}${t.answeredBy.length ? ' (' + t.answeredBy.join(', ') + ')' : ''}`);
    console.log(`       exhibits  ${Object.entries(proof.exhibits).map(([k, v]) => `${k}: ${v}`).join(' | ')}`);
  }
  if (text) {
    for (const ex of c.exhibits) {
      console.log(`       ${ex.id}: ${ex.title}`);
      for (const [style, line] of ex.lines) console.log(`         ${style.padEnd(5)} ${line}`);
    }
  }
  if (errors.length) failed = true;
}
process.exit(failed ? 1 : 0);
