# AGENTS.md

Guidance for coding agents working in this repository.

Penny Tableau (working title) is a daily five-minute mystery. Each case is a
coin-operated arcade cabinet of painted wooden dolls, jammed at the moment of a death.
The player reads numbered tags in the cabinet window, collects the words they find,
sets them as tiles into two brass plates (who the dolls are, and what happened), and
drops a penny to test the plates. Four pennies; each says only how many tiles are wrong
on each plate. This is a playable prototype with five hand-written cases.

Static site, no server. Vanilla JS (ES modules), built with Vite. No framework, no
TypeScript, no linter.

## Commands

```sh
npm install
npm run dev            # Vite on 127.0.0.1:4331
npm test               # node --test tests/*.test.js
npm run check:cases    # check and prove every case; add -- --why for the reasoning
npm run build          # vite build into dist/ (never committed)
```

Dev pages and switches:

- `/?case=study` (or `?case=5`) opens a cabinet other than today's, as practice.
- `/art.html` shows every scene with its tags; `?scene=train`, `?big=1`, `?nopins=1`.

## Architecture

- `src/engine.js`: the rules, pure and deterministic: collecting words, placing tiles,
  dropping a penny, locking a plate, tips, the share ticket. No DOM, no clock of its own.
- `src/cases/*.js`: one case per file, as data. `src/cases/index.js` lists them in order
  of difficulty.
- `src/logic.js`: the proof. From the facts a case states, it finds every way to name
  the cast and every story that fits, and reasons step by step as a person would.
- `src/lint.js`: the case checker: structure, size, tags, then the proof.
  `scripts/check-cases.mjs` runs it.
- `src/daily.js`: which case is today's. One edition per UTC day; the five cases repeat.
- `src/art/kit.js`: palette and SVG primitives. `src/art/doll.js`: the dolls.
  `src/art/props.js`: sets and props. `src/art/scenes.js`: one composed scene per case,
  plus where each exhibit's tag sits. `src/art/cogs.js`: the cog strip under the window.
- `src/main.js`: the cabinet front (window, tags, plates, tray, lever, ticket, dialogs)
  and local saves. `src/style.css`: all styling.

## Writing a case

A case has two halves that must agree: what the player reads, and what the proof reads.

**What the player reads.** `words` (each a person, thing or place); `exhibits`, each with
short `lines` of text in which `{word}` or `{word|shown text}` marks a collectable word;
two `panels` (`cast`, then `story`), each a sentence with gaps; the `path` and `traps`
shown at the end; and two `tips`. The scene and tag positions live in `src/art/scenes.js`.

**What the proof reads.** Each exhibit also lists `facts`: plain observations in the fixed
vocabulary at the top of `src/logic.js` (a name on a belonging, a description on a list,
what the body shows, what would leave that mark, what is untouched, who holds what, who
boarded where). Each gap is `[kind, answer, key]`, where `key` is a doll's id on the cast
plate or a part of the story (`culprit`, `victim`, `means`, `loot`, `motive`, `intended`,
`framed`, `before`). Never write a conclusion as a fact. State what the exhibit shows and
let the rules in `src/logic.js` decide what follows; that is what lets the proof disagree
with you.

`npm run check:cases` (and `npm test`) fails a case unless:

- the cast can be named in exactly one way, with no doll left to a guess;
- exactly one story fits the facts, and it can be settled one step at a time;
- every tempting wrong answer is refuted by something in the cabinet;
- every exhibit states facts, and none is idle;
- the `path` shown to the player rests on exhibits the proof actually uses;
- every answer can be collected, and every gap has at least two rival words of its kind;
- it fits the size budget: at most 9 exhibits, 9 gaps, 16 words, 175 words of reading;
- every exhibit has a tag inside the window, and no two tags overlap.

`npm run check:cases -- --why` prints how the proof reaches each answer, each trap and
what answers it, and what each exhibit is for. It also notes answers settled by a single
exhibit and cases with no real trap; those are judgement calls, not failures.

What the proof cannot do: it reasons about the facts, not the sentences. It cannot tell
whether a line of text really says what its fact claims, or whether a person finds the
chain fair. When you change an exhibit's text, change its facts to match, and playtest.
A clue must be stated in words: the first run of the proof caught a doll whose identity
only the picture gave away.

Rules to keep by hand:

- Include only what the solution needs or what deliberately misleads.
- The pictures support the text; a clue is never readable only from the picture.
- Fewer real traps than spare pennies.

To add a kind of clue, add a fact type and its rule to `src/logic.js`, with a test in
`tests/logic.test.js` showing both that it settles an answer and that leaving it out is
caught.

## Art direction

The look is a fairground cabinet of turned, painted wooden automaton dolls: big egg
heads, painted faces, riveted paddle arms, round bases in floor slots, a sprung coil on
any doll that has stopped for good. Flat enamel colours with one warm dark outline, a
little gloss, a swagged pelmet over every scene, brass plates, enamel tiles, a striped
awning. Parts sway on their pivots while the machine is jammed and run when it is solved.

It must stay clearly different from:

- The Case of the Golden Idol: no pixel art, no grotesque human caricature, no scroll.
- Dungeon Chess Daily: no newspaper, no blackletter, no pixel fonts, no dark screen.
- Debrief: no dossier or typewriter look, no monospace, no parchment on dark green.

So: no paper-document chrome, no monospace type, no dark background, no stamps.
Fonts are Abril Fatface (signs), Fraunces (text), Cinzel (engraving) and Caveat
(handwriting), bundled from `@fontsource`. All drawings are original SVG built in code.

## Design constraints

- A whole case fits five minutes: see the size budget above.
- Looking is free. Only pennies and paid tips cost anything.
- The machine never says which tile is wrong, only how many on each plate.
- A plate with nothing wrong locks.
- The solution and its reasoning are always shown at the end, win or lose.
- Phone first. The play screen has no standing header: the case marquee sits on the
  window frame, and the game name, edition and awning live on the end ticket and in
  the menu. The coins, lever and status sit in a dock pinned to the bottom of the
  screen, so the lever is always in reach. With every word collected, a three-doll
  case of up to 13 words fits one 375 by 812 screen without scrolling. Check 375 by
  812 and 375 by 667 when changing the layout.

## Licence

The project is GPL-3.0-only (`LICENSE`, and `license` in `package.json`). New source
files (`src`, `tests`, `scripts`) start with the copyright line and
`SPDX-License-Identifier: GPL-3.0-only`, as the existing ones do. Original drawings and
text only; anything bundled from elsewhere needs a compatible licence and its notice in
`public/licenses/`.

## Publishing

Publish finished work without asking. When a change is done and `npm test` and
`npm run check:cases` pass, commit it to `main` and push, then confirm the deploy
succeeded. Do not stop to ask whether to commit or publish.

Publishing is a push to `main`: `.github/workflows/deploy.yml` runs `npm test` and
`npm run build`, then deploys `dist/` to GitHub Pages. `dist/` is never committed. The
live site is https://ryanlmelvin.github.io/mystery-daily/.

The repository belongs to the GitHub account `ryanlmelvin`. On the development machine
`gh` may have a different account active. Do not switch accounts; run `gh` and
`git push` for this repository with `GH_TOKEN=$(gh auth token --user ryanlmelvin)` set
for that command. Commits use the identity in this repository's own git config.

## Local saves

Saves on the development machine are disposable (`localStorage`, keys `penny:v1:*`).
Wipe or seed them freely while testing.
