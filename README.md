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
are marked on your playbill. Win or lose, the cabinet then shows how it was done.

The playbill you can copy is spoiler-free: one row per penny, one square per tile.

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

## On trial: composed cabinets

The arcade also lists cabinets **on trial**. These were not written by hand: a composer
built each one from a date (cast, clues, text, plates, explanation and scene) and put it
through the same proof as the hand-written five. It knows two kinds of crime and takes
them turn about, so two days running never share a shape:

- **The interrupted theft**, in a glasshouse, a library or a plate room.
- **The wrong glass**, a poison meant for one man and drunk by another, in a dressing
  room, a kitchen or a ship's cabin.

Any date has its own: add `?date=2026-11-26` to the address. They are not part of the
daily run yet.

## Run it

Requires Node.js 22 or newer.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:4331. `npm test` runs the rules, proof and case tests.
`npm run check:cases` proves each case and prints its size against the five-minute
budget; add `-- --why` to see how each answer is reached.

## What is not built yet

- The daily run is still five hand-written cases. The composer knows two kinds of crime,
  so composed cases come in two shapes; within a shape the exhibits and the sentence are
  the same, with different people, things and rooms. Nobody has judged yet whether they
  are fun.
- Each case is proved to have exactly one answer, but only inside a model: every exhibit
  is a list of facts in a fixed vocabulary, and the proof reasons from those. The text
  is rendered from the same facts, so its names, things, places and times cannot differ
  from them. The connecting words are still the author's, and nothing checks those.
- No streaks, statistics, archive or sound.
- The five-minute target is an estimate. Nobody has been timed on these cases.

## Publish

Push to `main`. `.github/workflows/deploy.yml` runs the tests, builds, and deploys `dist/`
to GitHub Pages. Asset paths are relative, so the site works under the project path.

## License

Copyright © 2026 Ryan L. Melvin. Source, cases and original drawings are licensed under
**GNU GPL version 3 only**; see [LICENSE](LICENSE). The drawings are original SVG built in
code. The fonts are Abril Fatface, Fraunces, Cinzel and Caveat, each under the SIL Open
Font License 1.1; their notices ship in `public/licenses/`.

[AGENTS.md](AGENTS.md) has the architecture, the rules for writing a case, and the art
direction.
