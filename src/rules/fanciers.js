// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
export const factArity = { ringScore: 2, birdEntry: 3, firstRibbon: 1, ribbonReceipt: 2, exhibitorSeal: 2 };
export const factBindings = {
  ringScore: ([key, value]) => ({ key, value }),
  birdEntry: ([key, thing, name]) => ({ key, thing, name }),
  firstRibbon: ([key]) => ({ key }),
  ribbonReceipt: ([key, value]) => ({ key, value }),
  exhibitorSeal: ([, value]) => ({ value })
};

export function deduce({ of, person, about, sup, exc }) {
  const entries = of('birdEntry');
  const scores = of('ringScore');
  const top = Math.max(...scores.map((s) => s.a[1]));

  // The blue silk gives a plausible winner until the judge's marks are read.
  for (const ribbon of of('firstRibbon')) {
    for (const entry of entries.filter((e) => e.a[0] === ribbon.a[0])) {
      sup('winningBird', entry.a[1], { rule: 'the displayed first prize', from: [ribbon.ex, entry.ex] });
    }
  }
  for (const score of scores) {
    for (const entry of entries.filter((e) => e.a[0] === score.a[0])) {
      const [, bird, owner] = entry.a;
      if (score.a[1] === top) {
        sup('winningBird', bird, { rule: 'the highest mark for song', from: [...scores.map((s) => s.ex), entry.ex] });
      } else {
        exc('winningBird', bird, { rule: 'another bird scored higher', from: [score.ex, ...scores.filter((s) => s.a[1] > score.a[1]).map((s) => s.ex)] });
      }
      sup('winner', person(owner), { when: { winningBird: bird }, rule: 'the exhibitor of the winning entry', from: [entry.ex] });
    }
  }
  for (const receipt of of('ribbonReceipt')) {
    const [ring, impression] = receipt.a;
    for (const seal of of('exhibitorSeal').filter((s) => s.a[1] === impression)) {
      const holder = seal.a[0];
      sup('claimant', person(holder), { rule: 'the seal on the first-prize receipt', from: [receipt.ex, seal.ex, ...about(holder)] });
    }
    for (const entry of entries.filter((e) => e.a[0] === ring)) {
      sup('claimedBird', entry.a[1], { rule: 'the ring named on the receipt', from: [receipt.ex, entry.ex] });
    }
  }
}
