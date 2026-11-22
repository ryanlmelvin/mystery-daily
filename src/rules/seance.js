// Penny Tableau — Copyright (C) 2026 Ryan L. Melvin
// SPDX-License-Identifier: GPL-3.0-only
// The private greeting reveals the sitter who supplied the message. Its signature and
// description of the accused tell us whom it impersonates and whom it blames.
export const factArity = {
  privateDraw: 0, testLine: 2, drawStub: 2, slateLine: 1, slateSeal: 1, letterSeal: 2, slateCharge: 1, wearsPin: 2
};
export const factBindings = {
  privateDraw: () => ({}),
  testLine: ([key, value]) => ({ key, value }),
  drawStub: ([name, value]) => ({ name, value }),
  slateLine: ([value]) => ({ value }),
  slateSeal: ([key]) => ({ key }),
  letterSeal: ([name, key]) => ({ name, key }),
  slateCharge: ([key]) => ({ key }),
  wearsPin: ([, key]) => ({ key })
};

export function deduce({ of, sup, person, about }) {
  for (const log of of('privateDraw')) {
    for (const slate of of('slateLine')) {
      const copies = of('testLine').filter((card) => card.a[1] === slate.a[0]);
      for (const copy of copies) {
        for (const stub of of('drawStub').filter((ticket) => ticket.a[1] === copy.a[0])) {
          sup('culprit', stub.a[0], {
            weight: 'act', rule: 'alone with that invented pet name', from: [log.ex, slate.ex, copy.ex, stub.ex]
          });
        }
      }
    }
  }
  for (const seal of of('slateSeal')) {
    for (const letter of of('letterSeal')) {
      if (letter.a[1] === seal.a[0]) sup('spirit', letter.a[0], { rule: 'the signature on the old letters', from: [seal.ex, letter.ex] });
    }
  }
  for (const charge of of('slateCharge')) {
    for (const pin of of('wearsPin')) {
      if (pin.a[1] === charge.a[0]) sup('blamed', person(pin.a[0]), {
        rule: 'the pin named on the slate', from: [charge.ex, pin.ex, ...about(pin.a[0])]
      });
    }
  }
}
