// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
export const factArity = { heardAs: 1, heardEncore: 1, recordedMatinee: 3, running: 1, boxPhotograph: 1, wornSash: 2 };
export const factBindings = {
  heardAs: ([thing]) => ({ thing }),
  heardEncore: ([mark]) => ({ mark }),
  recordedMatinee: ([thing, mark, value]) => ({ thing, mark, value }),
  running: ([value]) => ({ value }),
  boxPhotograph: ([mark]) => ({ mark }),
  wornSash: ([, mark]) => ({ mark })
};

export function deduce({ of, person, about, sup }) {
  // A record with the right blemish accounts for the encore only if that
  // particular record was turning on the machine during the song.
  const playbacks = [];
  for (const heard of of('heardEncore')) {
    for (const take of of('recordedMatinee')) {
      if (take.a[1] !== heard.a[0]) continue;
      for (const playing of of('running')) {
        if (playing.a[0] === take.a[2]) playbacks.push({ source: take.a[0], from: [heard.ex, take.ex, playing.ex] });
      }
    }
  }
  for (const playback of playbacks) {
    sup('source', playback.source, { rule: 'the same blemish on the turning recording', from: playback.from });
  }
  for (const report of of('heardAs')) {
    sup('source', report.a[0], {
      rule: 'a familiar voice behind the curtain', from: [report.ex],
      defeated: playbacks.length ? { rule: 'the playing copy carried the same sneeze', from: playbacks[0].from } : null
    });
  }
  for (const exposure of of('boxPhotograph')) {
    for (const sash of of('wornSash')) {
      if (sash.a[1] === exposure.a[0]) {
        sup('culprit', person(sash.a[0]), { rule: 'the sash in the box photograph', weight: 'act', from: [exposure.ex, sash.ex, ...about(sash.a[0])] });
      }
    }
  }
}
