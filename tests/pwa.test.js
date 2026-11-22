// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildServiceWorker } from '../scripts/sw-build.mjs';

function fakeDist(files) {
  const dir = mkdtempSync(join(tmpdir(), 'penny-sw-'));
  for (const [name, body] of Object.entries(files)) {
    mkdirSync(join(dir, name, '..'), { recursive: true });
    writeFileSync(join(dir, name), body);
  }
  return dir;
}

const RELEASE = {
  'index.html': '<html></html>',
  'assets/main-abc.js': 'console.log(1)',
  'assets/font.woff2': 'font',
  'icons/icon-192.png': 'png',
  'manifest.webmanifest': '{}',
  'update.html': 'recovery',
};

test('the worker precaches every shipped file except itself and the recovery page', () => {
  const dir = fakeDist(RELEASE);
  try {
    const { files } = buildServiceWorker(dir);
    assert.deepEqual(files.sort(), ['assets/font.woff2', 'assets/main-abc.js', 'icons/icon-192.png', 'index.html', 'manifest.webmanifest']);
    const sw = readFileSync(join(dir, 'sw.js'), 'utf8');
    assert.ok(!sw.includes('__ASSETS__') && !sw.includes('__VERSION__'));
    assert.ok(sw.includes('"./assets/font.woff2"'));
    assert.ok(!sw.includes('"./update.html"'));
  } finally { rmSync(dir, { recursive: true }); }
});

test('the worker version changes whenever a shipped file changes, and only then', () => {
  const a = fakeDist(RELEASE);
  const b = fakeDist(RELEASE);
  const c = fakeDist({ ...RELEASE, 'assets/main-abc.js': 'console.log(2)' });
  try {
    const va = buildServiceWorker(a).version;
    assert.equal(buildServiceWorker(b).version, va);
    assert.notEqual(buildServiceWorker(c).version, va);
    // Rebuilding over an existing sw.js gives the same version (sw.js is not hashed).
    assert.equal(buildServiceWorker(a).version, va);
  } finally { for (const d of [a, b, c]) rmSync(d, { recursive: true }); }
});
