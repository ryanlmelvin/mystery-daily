// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// Installing and updating. The worker downloads a new release in the background; this
// module notices it (including one that was already waiting at startup), tells the page,
// and on request saves, activates the waiting worker and reloads once.
//
// Other windows: activating replaces the worker for every tab, but only the tab that
// asked reloads by itself. Any other tab is told a new version is ready and offered a
// reload; saves are written on every move, so an older tab has nothing unsaved to lose.

const CHECK_GAP = 30_000; // never check more often than this
const POLL = 60_000; // check once a minute while visible
const STALL = 12_000; // give up waiting for the new worker after this long

let reg = null;
let waiting = null;
let checking = null;
let lastCheck = 0;
let asked = false; // this tab requested the update, so it reloads on controllerchange
let reloaded = false;
let notify = () => {};
let deferredPrompt = null;

export const update = { state: 'none', error: '' }; // none | ready | working | failed | reload

function set(state, error = '') {
  Object.assign(update, { state, error });
  notify();
}

function watch(worker) {
  const ready = () => {
    // With no controller this is the first install: nothing to update from.
    if (worker.state === 'installed' && navigator.serviceWorker.controller) {
      waiting = worker;
      if (update.state !== 'working') set('ready');
    }
  };
  ready();
  worker.addEventListener('statechange', ready);
}

export function checkForUpdate(force = false) {
  if (!reg || checking) return checking;
  if (!force && Date.now() - lastCheck < CHECK_GAP) return null;
  lastCheck = Date.now();
  checking = reg.update().catch(() => {}).finally(() => { checking = null; });
  return checking;
}

/**
 * Accept the waiting update. `preserve` saves the game and returns true on success.
 * Resolves only by reloading; rejects with a message if the update cannot finish.
 */
export function applyUpdate(preserve, { discard = false } = {}) {
  const worker = waiting || reg?.waiting;
  if (!worker) { set('none'); return Promise.reject(new Error('No update is waiting.')); }
  if (!preserve() && !discard) {
    set('failed', 'savefail');
    return Promise.reject(new Error('savefail'));
  }
  set('working');
  asked = true;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      asked = false;
      set('failed', 'stalled');
      reject(new Error('stalled'));
    }, STALL);
    navigator.serviceWorker.addEventListener('controllerchange', () => clearTimeout(timer), { once: true });
    worker.postMessage({ type: 'activate' });
  });
}

export function reloadNow() {
  if (reloaded) return;
  reloaded = true;
  location.reload();
}

export function initUpdates(onChange) {
  notify = onChange;
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (asked) reloadNow();
    else if (update.state !== 'working') set('reload');
  });
  navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' }).then((r) => {
    reg = r;
    if (r.waiting) watch(r.waiting); // downloaded on an earlier visit
    if (r.installing) watch(r.installing);
    r.addEventListener('updatefound', () => r.installing && watch(r.installing));
    lastCheck = Date.now();
  }).catch(() => {});
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkForUpdate(); });
  addEventListener('online', () => checkForUpdate(true));
  setInterval(() => { if (document.visibilityState === 'visible') checkForUpdate(); }, POLL);
}

// ---------- installing ----------

export function isInstalled() {
  return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

export function canPrompt() {
  return !!deferredPrompt;
}

export async function promptInstall() {
  const p = deferredPrompt;
  if (!p) return false;
  deferredPrompt = null;
  p.prompt();
  try { await p.userChoice; } catch { /* dismissed */ }
  notify();
  return true;
}

export function initInstall(onChange, onInstalled) {
  addEventListener('beforeinstallprompt', (ev) => {
    ev.preventDefault();
    deferredPrompt = ev;
    onChange();
  });
  addEventListener('appinstalled', () => {
    deferredPrompt = null;
    onInstalled();
  });
  matchMedia('(display-mode: standalone)').addEventListener?.('change', onChange);
}
