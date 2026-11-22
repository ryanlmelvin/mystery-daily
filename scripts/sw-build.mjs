// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// Writes dist/sw.js from scripts/sw-template.js. The version is a hash of every shipped
// file plus the template, so any change to what ships changes the worker and installed
// apps are offered the update. There is no version number to remember to bump.

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const TEMPLATE = new URL('./sw-template.js', import.meta.url);

// Not precached: the worker itself, and the recovery page, which must come from the
// network so it still works when the cached app is stale.
const SKIP = new Set(['sw.js', 'update.html']);

function walk(dir, root = dir) {
  return readdirSync(dir).sort().flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full, root);
    const rel = relative(root, full).split(sep).join('/');
    return SKIP.has(rel) || name === '.DS_Store' ? [] : [rel];
  });
}

export function buildServiceWorker(distDir, template = readFileSync(TEMPLATE, 'utf8')) {
  const files = walk(distDir);
  const hash = createHash('sha256').update(template);
  for (const f of files) hash.update(f).update('\0').update(readFileSync(join(distDir, f)));
  const version = hash.digest('hex').slice(0, 12);
  const source = template
    .replace("'__VERSION__'", JSON.stringify(version))
    .replace('__ASSETS__', JSON.stringify(files.map((f) => './' + f), null, 2));
  writeFileSync(join(distDir, 'sw.js'), source);
  return { version, files };
}
