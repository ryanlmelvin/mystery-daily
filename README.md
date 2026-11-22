# The Penny Murders

A daily clockwork mystery.

[Play The Penny Murders](https://ryanlmelvin.github.io/mystery-daily/) · [Source](https://github.com/ryanlmelvin/mystery-daily)

Each five-minute case is a Victorian penny-arcade machine of cut-paper dolls that has jammed at the
moment of a death. Nothing is explained. You work out who everyone is and what happened.

## Play

1. **Inspect.** Tap the numbered tags in the cabinet window. Each shows an exhibit: what
   is in a pocket, a letter, a label. Words you find drop into your tray.
2. **Fill the gaps.** Tap a gap, then a tile. Name the cast and piece together what happened.
3. **Insert penny.** The cast and story each show how many tiles are wrong. When every
   tile in a section is correct, that section locks. You have four pennies.

Looking costs nothing. Each tip you take adds one mark to your playbill. You can reread
your tips for free. Win or lose, the cabinet then shows how it was done.

After a case, **Share playbill** opens your device’s share sheet. If sharing is
unavailable, you can copy the result by hand. Each row shows one penny, with the
cast tiles on the left and the story tiles on the right. A 💡 marks each tip
taken since the previous penny. The answers stay secret.

```
The Penny Murders · Saturday 11/21/2026
🟩🟩🟩 ⬛⬛🟩⬛ 💡
🟩🟩🟩 🟩🟩🟩🟩
https://ryanlmelvin.github.io/mystery-daily/
```

## Daily editions and the archive

A cabinet opens each day at 00:00 UTC. The first five editions are hand-written and
run from November 21 through 25, 2026.

| No. | Case | Turns on |
| --- | --- | --- |
| 1 | Tea at the Vicarage | Two men in the same collar; a herbal that names the poison |
| 2 | Death in the Glasshouse | A thief dressed to leave; the tool that fits the wound |
| 3 | The 8.40 Down | A stopped watch, a timetable and two tickets |
| 4 | Curtain at the Alhambra | A bottle meant for somebody else |
| 5 | The Bell-Pull | A left-handed man with a pen in his right hand |

Starting November 26, each edition is composed for its date. Open the calendar with
the **?** button or **Archive** on a finished playbill. Choose a released date to
resume its case. The calendar shows your progress on this device.

## Composed cabinets and practice

The arcade’s **On trial** menu offers a composed cabinet in each of nine settings. The composer builds the cast,
clues and scene from a date, then uses the same proof as the hand-written cases to
check that the clues lead to one solution. Three crimes rotate.

- **The interrupted theft** takes place in a glasshouse, library or plate room.
  The same eight tags let you investigate both the visitor and the servant.
  Even the familiar spade can tell a different story when its blade is caked in dry earth.
- **The wrong glass** takes place in a dressing room, kitchen or ship's cabin.
  A man drinks from a bottle intended for someone else. A chemist's receipt tells
  you who bought a poison. The seal on the shelf may tell you whether anyone used it.
- **The Mourning Brooch** takes place at a memorial supper. Three mourners can each be the
  killer, the thief who arrived afterward, or the bystander.

**Samples for review** opens five fixed playtests. Play [The Mourning Brooch](https://ryanlmelvin.github.io/mystery-daily/?case=brooch),
[Death at the Foxes’ Ball](https://ryanlmelvin.github.io/mystery-daily/?case=foxes),
[The Shilling Séance](https://ryanlmelvin.github.io/mystery-daily/?case=seance),
[An Encore for Nobody](https://ryanlmelvin.github.io/mystery-daily/?case=encore), or
[First Prize at the Fanciers’ Hall](https://ryanlmelvin.github.io/mystery-daily/?case=fanciers).

Each date gives everyone the same cabinet. Try [The wrong glass](https://ryanlmelvin.github.io/mystery-daily/?date=2026-11-28)
or [The interrupted theft](https://ryanlmelvin.github.io/mystery-daily/?date=2026-11-27).
The end playbill follows that cabinet's proof and names the exhibits that clear its
red herrings. One player timed two earlier composed cabinets at 3:35 and 3:10.

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

- Each case is proved to have exactly one answer, but only inside a model: every exhibit
  is a list of facts in a fixed vocabulary, and the proof reasons from those. The text
  is rendered from the same facts, so its names, things, places and times cannot differ
  from them. The connecting words are still the author's, and nothing checks those.
- No streaks, statistics or sound.

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
