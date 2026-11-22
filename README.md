# Penny Tableau

[Play Penny Tableau](https://ryanlmelvin.github.io/mystery-daily/) · [Source](https://github.com/ryanlmelvin/mystery-daily)

A daily five-minute mystery in a penny-arcade cabinet. Working title; playable prototype.

Each case is a coin-operated machine of painted wooden dolls that has jammed at the
moment of a death. Nothing is explained. You work out who everyone is and what happened.

## Play

1. **Inspect.** Tap the numbered tags in the cabinet window. Each shows an exhibit: what
   is in a pocket, a letter, a label. Words you find drop into your tray.
2. **Set the plates.** Tap a gap on a brass plate, then a tile. The first plate names
   the cast. The second says what happened.
3. **Drop a penny.** The machine tells you only how many tiles are wrong on each plate,
   never which. A plate with nothing wrong locks. You have four pennies.

Looking costs nothing. The attendant has three tips: the first is free, and the other two
are marked on your ticket. Win or lose, the cabinet then shows how it was done.

The ticket you can copy is spoiler-free: one row per penny, one square per tile.

```
Penny Tableau · No. 1 · 2/4 🪙
🟩🟩🟩 ⬛⬛🟩⬛
🟩🟩🟩 🟩🟩🟩🟩
```

## The five cabinets

| No. | Case | Turns on |
| --- | --- | --- |
| 1 | Tea at the Vicarage | Two men in the same collar; a herbal that names the poison |
| 2 | Death in the Glasshouse | A thief dressed to leave; the tool that fits the wound |
| 3 | The 8.40 Down | A stopped watch, a timetable and two tickets |
| 4 | Curtain at the Alhambra | A bottle meant for somebody else |
| 5 | The Bell-Pull | A left-handed man with a pen in his right hand |

Today's cabinet is picked by the UTC date, and the five repeat. The **?** button opens the
arcade, where the other four can be played as practice.

## Run it

Requires Node.js 22 or newer.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:4331. `npm test` runs the rules and case tests, and
`npm run check:cases` prints each case's size against the five-minute budget.

## What is not built yet

- Only five cases, all hand-written. There is no case generator.
- The case checker confirms structure and the author's chain of deductions. It does not
  prove that a case has exactly one answer.
- No streaks, statistics, archive, sound, or offline install.
- The five-minute target is an estimate. Nobody has been timed on these cases.

## Publish

Push to `main`. `.github/workflows/deploy.yml` runs the tests, builds, and deploys `dist/`
to GitHub Pages. Asset paths are relative, so the site works under the project path.

## Credits

Drawings are original SVG built in code. Fonts are Abril Fatface, Fraunces, Cinzel and
Caveat, each under the SIL Open Font License 1.1; their notices ship in
`public/licenses/`.

[AGENTS.md](AGENTS.md) has the architecture, the rules for writing a case, and the art
direction.
