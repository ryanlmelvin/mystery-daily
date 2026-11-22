// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// The service worker. scripts/sw-build.mjs fills in VERSION (a hash of every shipped
// file and of this template) and ASSETS at build time and writes dist/sw.js.
//
// A new release installs in the background and waits. The page offers "Update now",
// and only then sends {type: 'activate'}, which calls skipWaiting().

const VERSION = '__VERSION__';
const ASSETS = __ASSETS__;

// Several GitHub project sites share one origin, so caches carry the app name and scope.
const PREFIX = 'penny-tableau@' + new URL(self.registration.scope).pathname + ':';
const CACHE = PREFIX + VERSION;
const SHELL = new URL('./index.html', self.registration.scope).href;
const RECOVERY = new URL('./update.html', self.registration.scope).pathname;

self.addEventListener('install', (event) => {
  // Fetch the whole release fresh (past the HTTP cache) and store each file under its
  // canonical URL. Any failure fails the install and the old release keeps running.
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(ASSETS.map(async (path) => {
      const url = new URL(path, self.registration.scope);
      const fresh = new URL(url);
      fresh.searchParams.set('r', VERSION);
      const res = await fetch(fresh, { cache: 'reload' });
      if (!res.ok) throw new Error(`Could not fetch ${path}: ${res.status}`);
      await cache.put(url.href, res);
    }));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'activate') self.skipWaiting();
  if (event.data && event.data.type === 'version') event.source?.postMessage({ type: 'version', version: VERSION });
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // The recovery page always comes from the network, never from this worker's cache.
  if (url.pathname === RECOVERY) return;
  if (req.mode === 'navigate') {
    // Every page in scope is the one app shell; ?case=... selects a cabinet in the page,
    // not a different file.
    event.respondWith(caches.open(CACHE).then((c) => c.match(SHELL)).then((hit) => hit || fetch(req)));
    return;
  }
  event.respondWith(caches.open(CACHE).then((c) => c.match(req)).then((hit) => hit || fetch(req)));
});
