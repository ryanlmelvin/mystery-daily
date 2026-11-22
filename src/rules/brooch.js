// The Penny Murders — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
export const factArity = { witnessedButton: 0, grippedButton: 1, cuffNumber: 2, inventory: 3, bare: 1, admitted: 2 };
export const factBindings = {
  witnessedButton: () => ({}),
  grippedButton: ([mark]) => ({ mark }),
  cuffNumber: ([, mark]) => ({ mark }),
  inventory: ([site, item, time]) => ({ key: site, thing: item, time }),
  bare: ([site]) => ({ key: site }),
  admitted: ([, time]) => ({ time })
};

export function deduce({ of, person, about, sup, exc, minutes }) {
  for (const witness of of('witnessedButton')) {
    for (const button of of('grippedButton')) {
      for (const cuff of of('cuffNumber')) {
        const [doll, stamp] = cuff.a;
        if (stamp === button.a[0]) sup('culprit', person(doll), {
          weight: 'act', rule: 'lost the matching button in the struggle',
          from: [witness.ex, button.ex, cuff.ex, ...about(doll)]
        });
      }
    }
  }
  for (const record of of('inventory')) {
    const [site, item, time] = record.a;
    for (const bare of of('bare')) {
      if (site === bare.a[0]) sup('loot', item, {
        rule: 'recorded on the body and now missing', from: [record.ex, bare.ex]
      });
    }
    for (const entry of of('admitted')) {
      const [doll, arrival] = entry.a;
      if (minutes(arrival) <= minutes(time)) continue;
      const name = person(doll);
      const from = [record.ex, entry.ex, ...about(doll)];
      exc('culprit', name, { rule: 'first arrived after the body was examined', from });
      for (const pocket of of('has')) {
        if (pocket.a[1] === item && person(pocket.a[0]) === name) sup('thief', name, {
          when: { loot: item }, rule: 'arrived after the inventory and has the missing jewel', from: [...from, pocket.ex]
        });
      }
    }
  }
}
