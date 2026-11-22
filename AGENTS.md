# AGENTS.md

Guidance for coding agents working in this repository.

The Penny Murders is a daily clockwork mystery. Each five-minute case is a
coin-operated arcade cabinet of cut-paper dolls, jammed at the moment of a death.
The player reads numbered tags in the cabinet window, collects the words they find,
sets them as tiles into two brass plates (who the dolls are, and what happened), and
drops a penny to test the plates. Four pennies; each says only how many tiles are wrong
on each plate. The daily rotation uses five hand-written cases. The arcade also offers composed cases and four hand-written approval samples.

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
- `/?case=brooch` opens the fixed composer sample. `?case=foxes`, `seance`, `encore` and
  `fanciers` open the other samples under **On trial → Samples for review**.
- `/art.html` shows every scene with its tags; `?scene=train`, `?big=1`, `?nopins=1`.

## Architecture

- `src/engine.js`: the rules, pure and deterministic: collecting words, placing tiles,
  dropping a penny, locking a plate, tips, the shared playbill. No DOM, no clock of its own.
- `src/cases/*.js`: one case per file, as data. `src/cases/index.js` lists them in order
  of difficulty and renders their text.
- `src/tell.js`: the telling. Renders each exhibit's text from its facts, and checks
  that every fact is told.
- `src/compose.js`: the composer. Builds a whole case from a date and puts it through
  the same gate as a hand-written one. `src/art/stage.js` stages its scene.
- `src/logic.js`: the proof. From the facts a case states, it finds every way to name
  the cast and every story that fits, and reasons step by step as a person would.
- `src/explain.js` turns the proof's steps and refuted alternatives into the composed
  case's end playbill and tips.
- `src/lint.js`: the case checker: structure, size, tags, then the proof.
  `scripts/check-cases.mjs` runs it.
- `src/daily.js`: which case is today's. One edition per UTC day; the five cases repeat.
- `src/art/kit.js`: palette and SVG primitives, each shape drawn as a cut-paper piece. `src/art/doll.js`: the dolls.
  `src/art/props.js`: sets and props. `src/art/scenes.js`: one composed scene per case,
  plus where each exhibit's tag sits. `src/art/cogs.js`: the cog strip under the window.
- `src/main.js`: the cabinet front (window, tags, plates, tray, lever, playbill, dialogs)
  and local saves. `src/style.css`: all styling.
- `src/pwa.js`: install prompt and the update controller. `scripts/sw-template.js` is
  the service worker; `scripts/sw-build.mjs` (run by the Vite build) writes `dist/sw.js`
  with a version hashed from every shipped file. `public/update.html` is the standalone
  update recovery page. `scripts/make-icons.mjs` draws `public/icons/*.png`.

## Writing a case

A case file has `words` (each a person, thing or place); `exhibits`; two `panels` (`cast`,
then `story`), each a sentence with gaps; the `path` and `traps` shown at the end; and two
`tips`. The scene and tag positions live in `src/art/scenes.js`.

**An exhibit is a list of facts, and nothing else.** It has an `id`, a `title` and
`facts`; it has no text of its own. Each fact is a plain observation in the fixed
vocabulary at the top of `src/logic.js` (a name on a belonging, a description on a list,
what the body shows, what would leave that mark, what is untouched, who holds what, who
boarded where), followed by its telling: the sentence the player reads.

```js
['tag', 'body', { initials: 'S.C.' }, 'In his waistcoat, a {watch} engraved: | cut: $name Thirty years among the roses'],
['untouched', 'shears', 'straight blades, thick with dust.'],
['dead', 'body', null]
```

`src/tell.js` renders an exhibit's text from its facts, in order, when the cases load.
In a telling, `$name`, `$thing`, `$place`, `$key`, `$mark`, `$value`, `$time` and `$stops`
are written in from the fact, so the text cannot name a different person, thing, place or
time than the proof reasons about. `$Thing` capitalises, `$thing[hatpins]` shows other
words, and `$thing~[a white orchid]` shows a thing without naming it. `{word}` makes any
other tray word collectable. `|` starts a new line, which may begin `cut:`, `hand:` or
`print:`; facts told in the same hand run on as one line. The top of `src/tell.js` has
the full list.

Never write a conclusion as a fact. State what the exhibit shows and let the rules in
`src/logic.js` decide what follows; that is what lets the proof disagree with you. Each
gap is `[kind, answer, key]`, where `key` is a doll's id on the cast plate or a part of
the story (`culprit`, `victim`, `means`, `loot`, `motive`, `intended`, `framed`,
`before`).

`npm run check:cases` (and `npm test`) fails a case unless:

- the cast can be named in exactly one way, with no doll left to a guess;
- exactly one story fits the facts, and it can be settled one step at a time;
- every tempting wrong answer is refuted by something in the cabinet;
- every exhibit states facts, and none is idle;
- every fact is told (only `dead` may be `null`), what a fact asserts is shown in its
  exhibit, and no tray word is mentioned where it cannot be collected;
- the `path` shown to the player rests on exhibits the proof actually uses;
- every answer can be collected, and every gap has at least two rival words of its kind;
- it fits the size budget: at most 9 exhibits, 9 gaps, 16 words, 175 words of reading;
- every exhibit has a tag inside the window, and no two tags overlap.

`npm run check:cases -- --why` prints how the proof reaches each answer, each trap and
what answers it, and what each exhibit is for. It also notes answers settled by a single
exhibit and cases with no real trap; those are judgement calls, not failures.

What this cannot do. The names, things, places and times in the text come from the
facts, but the connecting words are the author's: "thick with dust" means untouched only
because it was written on an `untouched` fact. Nothing checks that a telling's wording
fits its kind of fact, or that a person finds the chain fair. Read the rendered text
(`npm run check:cases -- --text`, or play the case) and playtest. A clue must be stated
in words: the first run of the proof caught a doll whose identity only the picture
gave away.

Rules to keep by hand:

- Include only what the solution needs or what deliberately misleads.
- The pictures support the text; a clue is never readable only from the picture.
- Fewer real traps than spare pennies.

Use `['explained', who, why, telling]` for evidence that answers a `lead` with the
same person and reason. For example, an invitation to arrive on tonight's train accounts for
a visitor's travelling clothes. The proof cites the exhibit with the invitation.
Use `excused` when the answer concerns a specific thing, such as a receipt showing
that the servant has paid a debt.

To add a kind of clue, add a fact type and its rule to `src/logic.js`, with a test in
`tests/logic.test.js` showing both that it settles an answer and that leaving it out is
caught. For family-specific observations, register a module in `src/rules/index.js`.
The case selects its vocabulary with `ruleSet`. Its module declares fact arities,
bindings for the telling and deductions over the observed facts. The case stays plain data.

## Composed cases

`composeDay(date)` in `src/compose.js` builds the cast, facts, tellings, plates
and scene. `explain` calls `proveCase` to produce the solution path, the answers to
the red herrings, and the two tips. The complete case goes through `lintCase`, which
checks the telling, proof, size and tags. If a case fails, the composer tries a new
salt, up to 40 attempts. Each date and composer version gives the same case and has
its own save ID.

Version 5 rotates three crimes by date (`crimeOf`).

- **The interrupted theft** (`buildTheft`) has three dolls in a glasshouse, library
  or plate room. Either the visitor or the servant holds the missing item. Either
  wall tool or the guilty doll's own carried object can match the wound. The same
  eight tags appear whoever did it. An invitation accounts for an innocent visitor's
  journey, and a receipt clears an innocent servant's debt.
- **The wrong glass** (`buildSwitch`) has four dolls in a dressing room, kitchen or
  ship's cabin. The poisoner may be the doll at the door or the one across from it.
  A receipt, an empty container, or a trace matching an opened poison on the shelf
  ties them to the means. An innocent suspect can have a receipt for a sealed
  poison or a dismissal that was taken back.
- **The Mourning Brooch** (`src/brooch.js`) has three mourners at a memorial
  supper and a guest on the floor. A numbered button identifies the assailant.
  The constable’s inventory and the admission tickets establish a later theft.
  Each mourner can kill and either other mourner can take the jewel.

Each setting returns every ninth day. The room, title and principal objects rotate.
The date seeds the remaining choices. The year-long test checks that all six ordered
killer–thief pairings occur in every Brooch setting.

The crime builders live in `src/compose.js` and `src/brooch.js`. `src/art/stage.js` draws the
scene from the case's `scene` object. Each crime has one arrangement that can be
mirrored. A doll's trade determines its costume. Expressions and free-hand poses
are drawn independently of guilt. A doll carrying the tray or cloak keeps its carry pose.

- Composed cases are on trial. They are listed under **On trial** in the arcade and open
  with `/?date=2026-11-26`; they are not part of the daily run (`src/daily.js` still
  cycles the five hand-written cases). Putting them into the daily run is the owner's
  decision.
- `/art.html?composed=1` shows a composed scene for each setting, plain and mirrored.
- `tests/compose.test.js` checks the gate and the mix of culprits and clues across
  dates. Two dates pin the expected output. When a deliberate change alters a date's
  puzzle, bump `COMPOSER` and update the pins so older saves keep their own version.
- A new tool needs a drawing in `TOOLS` in `src/art/stage.js`; a new thing a doll carries
  needs one in `CARRIED` or `HELD`; a new way of keeping a poison needs one in `KEPT`. A
  new setting needs an entry in `SETTINGS` or `SWITCHES` and a set in `SETS` or
  `SWITCH_SETS`. A new kind of crime needs its own builder in `CRIMES`, and its own
  blocking and tag positions in `src/art/stage.js`.
- Keep the composer downstream of the facts: it chooses facts and tellings, and the gate
  decides. Never patch a refused case; let it reroll.
- A reroll is a sign a list is wrong. `composed.refused` records what the gate said to
  each refused attempt, and the test fails if more than a tenth of the days needed one.
  The first run of the second crime rerolled 28 times in a year because one play title
  mentioned a tray word; the fix was to the list.

## Art direction

The look is a Victorian penny-in-the-slot working model, cut from printed card: a scene
of jointed paper dolls in the manner of engraved cut-out collage, in bright hand-tinted
colours. Human proportions: egg heads about a fifth of the figure, with engraved faces (almond eyes, a lid line, a nose stroke,
hatching down the shadowed cheek), arms fixed at shoulder and elbow with brass split
pins, round bases in floor slots, a sprung coil on any doll that has stopped for good.
Every outlined shape is a cut piece: a white scissor margin, a short crisp shadow on
whatever lies beneath, flat bright colour, fine engraver's hatching and a thin ink line
(`piece` in `src/art/kit.js` does this for every `rect`, `ell`, `circ` and `path`; dots,
lines and blobs are printed on the piece). A swagged pelmet hangs over every scene.
Parts sway on their pivots while the machine is jammed and run when it is solved.

The cabinet front is the same paper: a torn red card frames the window, the case title is
a yellow slip pasted across its top edge (title only; the time and place stay for screen
readers), the plates are torn cards, the words are crooked scraps of tinted paper
(yellow for people, blue for things, pink for places), the tags are numbered scraps on
split pins, and the dock is a red card torn along its top. Torn cards use the `.paper`
class in `src/style.css`; its shadow is a still layer so the moving scene is never
re-blurred.

It must stay clearly different from:

- The Case of the Golden Idol: no pixel art, no grotesque human caricature, no scroll.
- Dungeon Chess Daily: no newspaper, no blackletter, no pixel fonts, no dark screen.
- Debrief: no dossier or typewriter look, no monospace, no parchment on dark green.
- Monty Python's animations: the technique (engraved cut-outs, split pins) is common
  property; never copy a recognisable image or character from them.

So: paper as cut card and pasted scraps, never as a document (no forms, files, stamps,
typed sheets or aged parchment). No monospace type, no dark background, sepia kept to the
ink. Fonts are Abril Fatface (signs), Fraunces (text), Cinzel (engraving) and Caveat
(handwriting), bundled from `@fontsource`. All drawings are original SVG built in code.

## Design constraints

- A whole case fits five minutes: see the size budget above.
- Looking is free. Only pennies and paid tips cost anything.
- The machine never says which tile is wrong, only how many on each plate.
- A plate with nothing wrong locks.
- The solution and its reasoning are always shown at the end, win or lose.
- Phone first. The play screen has no standing header: the case marquee sits on the
  window frame, and the game name, subtitle, edition and awning live on the end playbill and in
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

Other sessions push to `main` too. Fetch and rebase onto `origin/main` before pushing,
and never force-push.

Another session may be working in this same folder at the same moment. Run
`git status` before committing and stage only the files you changed, by name (never
`git add -A`). Do not stash, restore or discard a change you did not make; if someone
else's uncommitted change blocks a rebase, leave it and try again once it is committed.

Publishing is a push to `main`: `.github/workflows/deploy.yml` runs `npm test` and
`npm run build`, then deploys `dist/` to GitHub Pages. `dist/` is never committed. The
live site is https://ryanlmelvin.github.io/mystery-daily/.

The repository belongs to the GitHub account `ryanlmelvin`. On the development machine
`gh` may have a different account active. Do not switch accounts; run `gh` and
`git push` for this repository with `GH_TOKEN=$(gh auth token --user ryanlmelvin)` set
for that command. Commits use the identity in this repository's own git config.

## Installing and updating

It is an installable PWA following `../GITHUB_PAGES_PWA_TIPS.md` (in the parent
`side_projects` folder). The essentials:

- The worker URL stays `./sw.js`. Its version changes by itself whenever any shipped file
  changes, so there is nothing to bump. A new release installs in the background and
  waits; the page shows **Update now** in a bar above the marquee and inside every
  dialog. Accepting saves the game, activates the worker and reloads once; a stall
  offers a retry and the recovery page.
- The menu shows the release (the commit's short SHA) and the creator credit.
- The Install knob (top left) stays visible in the browser and hides when installed.
- `update.html` is never served from the worker's cache and never touches saves.
- The worker is registered only in production builds. To test updates locally, build,
  serve `dist` with `npx vite preview`, change something, build again, and wait for the
  bar (or open `update.html`).

## Local saves

Saves on the development machine are disposable (`localStorage`, keys `penny:v1:*`).
Wipe or seed them freely while testing.
