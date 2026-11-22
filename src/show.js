// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// What the cabinet does with a penny. The rules have already decided the result and the
// game is already saved; this only shows it in order: the coin drops, the works take up
// the strain, and each plate is marked in turn. The page is drawn with its final result
// from the start and these steps uncover it, so stopping at any point leaves it right.

export function pause(ms, signal) {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve();
    function finish() {
      clearTimeout(timer);
      signal.removeEventListener('abort', finish);
      resolve();
    }
    const timer = setTimeout(finish, ms);
    signal.addEventListener('abort', finish, { once: true });
  });
}

// How long each beat is held, in milliseconds: the coin in the air, the works straining,
// the gap between one plate's mark and the next, and the last mark before play goes on.
export const BEAT = { coin: 360, strain: 480, verdict: 430, settle: 320 };

// `verdicts` lists the plates this penny judges, in reading order: [{ panel, ok }].
// A plate locked by an earlier penny is not judged again. `still` is for players who
// asked for no motion: the result is simply there, with one knock to mark the penny.
export async function pennyShow({ works, glass }, verdicts, { sound = () => {}, signal, still = false }) {
  if (signal.aborted) return;
  if (still) {
    sound('clunk');
    if (verdicts.length) sound(verdicts.every((verdict) => verdict.ok) ? 'right' : 'wrong', 0, 0.2);
    return;
  }
  const settle = () => glass.classList.remove('lurch');
  works.querySelector('#drop')?.classList.add('pressed');
  works.querySelector('.fall')?.classList.add('going');
  sound('coin');
  await pause(BEAT.coin, signal);
  if (signal.aborted) return settle();

  glass.classList.add('lurch');
  sound('clunk');
  await pause(BEAT.strain, signal);
  if (signal.aborted) return settle();

  for (const [n, verdict] of verdicts.entries()) {
    const plate = works.querySelector(`[data-panel="${verdict.panel}"]`);
    plate?.classList.add('stamped', verdict.ok ? 'locks' : 'jolts');
    sound(verdict.ok ? 'right' : 'wrong', n);
    await pause(n < verdicts.length - 1 ? BEAT.verdict : BEAT.settle, signal);
    if (signal.aborted) return settle();
  }
  settle();
}

// What the machine says after a penny that did not end the game. One short line: a
// second line would push the tray under the dock.
export function pennyLine({ wrong, before, locked, left }) {
  const coins = left === 1 ? 'One penny left.' : `${left} pennies left.`;
  if (locked.length) return `The ${locked[0]} plate locks. ${coins}`;
  const total = Object.values(wrong).reduce((sum, n) => sum + n, 0);
  if (total === 1) return `One tile out. ${coins}`;
  if (before) {
    const was = Object.values(before).reduce((sum, n) => sum + n, 0);
    if (total < was) return `Closer. ${coins}`;
    if (total > was) return `Further off. ${coins}`;
    return `No nearer. ${coins}`;
  }
  return `Clunk. ${coins}`;
}
