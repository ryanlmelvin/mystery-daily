// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
export const factArity = { maskAtDoor: 2, exchanged: 3, maskFeature: 2, strikingMask: 1, stoppedAt: 1 };
export const factBindings = {
  maskAtDoor: ([who, thing]) => ({ who, thing }),
  exchanged: ([thing, other, value]) => ({ thing, other, value }),
  maskFeature: ([thing, mark]) => ({ thing, mark }),
  strikingMask: ([mark]) => ({ mark }),
  stoppedAt: ([value]) => ({ value })
};

// The door card records the opening order. The signed forfeit records the
// only change, and the fiddler's pencil fixes the blow on one side of it.
export function deduce({ of, person, sup }) {
  for (const blow of of('strikingMask')) {
    for (const face of of('maskFeature')) {
      if (blow.a[0] !== face.a[1]) continue;
      const mask = face.a[0];
      const sighting = [blow.ex, face.ex];
      sup('guise', mask, { rule: 'the mask the fiddler saw', from: sighting });
      for (const door of of('maskAtDoor')) {
        if (door.a[1] === mask) sup('firstWearer', person(door.a[0]), { rule: 'the mask on entry', from: [...sighting, door.ex] });
      }
      for (const change of of('exchanged')) {
        const [left, right, afterDance] = change.a;
        for (const stop of of('stoppedAt')) {
          const traded = stop.a[0] > afterDance && (left === mask || right === mask);
          const from = [...sighting, change.ex, stop.ex];
          for (const door of of('maskAtDoor')) {
            const who = person(door.a[0]);
            if (door.a[1] === mask) {
              if (!traded) {
                sup('culprit', who, { rule: 'still wearing the opening mask', from: [...from, door.ex], weight: 'act' });
                continue;
              }
              sup('culprit', who, {
                rule: 'arrived in the mask the fiddler saw', from: [...sighting, door.ex],
                weight: 'lead', defeated: { rule: 'the masks had already changed hands', from: [change.ex, stop.ex] }
              });
            }
            if (traded && door.a[1] === (left === mask ? right : left)) {
              sup('culprit', who, { rule: 'wore the mask at the blow', from: [...from, door.ex], weight: 'act' });
            }
          }
        }
      }
    }
  }
}
