# Sigil cards — how to add a p5.js tile

The "opus strip" on `index.html` is a row of `.sigil` link-tiles, each running a
tiny p5.js sketch (a "sigil"). All sketches share one visual language — one green
(`#33FF33`), a dark phosphor backdrop, and a single trail/fade rhythm — so the
five read as a set. Their order is shuffled on every load (Fisher–Yates in
`boot()`), so don't rely on position.

Everything lives in `index.html`, in the `<script>` block that defines the
sketch functions, the `SK` registry, and `boot()`. A short copy-paste skeleton
also lives in a comment directly above `var SK = {...}`.

## The contract

A card is an **instance-mode p5 closure**: `function name(p, holder, st)`. It
keeps its state in local vars and assigns `p.setup` / `p.draw` /
`p.windowResized` onto `p`. It never touches globals except the shared palette
and helpers.

- `p` — the p5 instance.
- `holder` — the `.sigil-canvas` element to render into.
- `st` — the hover bridge: `st.hover` (bool, set by boot's pointer listeners)
  and `st.k`, a 0→1 hover intensity **you ease yourself** in `draw`:
  `st.k += ((st.hover ? 1 : 0) - st.k) * 0.08`. Drive anything that should speed
  up / brighten on hover off `st.k`.

Three rules keep a new card in the family:

1. **Size** — in `setup`, `var b = box(holder); W = b.w; H = b.h;
   p.createCanvas(W, H);`. `box()` returns a square sized to the cell. Mirror it
   in `windowResized` with `p.resizeCanvas`.
2. **Breathe** — make `trail(p, W, H, TRAIL_A - st.k * 18)` the **first** line of
   `draw`. That's the shared phosphor fade; it's what makes all the cards pulse
   alike instead of clearing to black.
3. **Palette + reduced motion** — paint only via `gstroke` / `gfill` / `accent`
   (green, plus the lighter accent for the one *live* element). Honor `reduce`:
   if true, render one static frame in `setup` then `p.noLoop()`.

### The opacity vocabulary (don't invent new alphas)

Depth is expressed with three tiers, nothing else:

| constant   | value | meaning                         |
|------------|-------|---------------------------------|
| `A_FAINT`  | 45    | scaffolding / ghosts            |
| `A_STRUCT` | 110   | structure: edges, frames, idle  |
| `A_ACTIVE` | 190   | the live layer                  |

`accent(p)` paints the lighter green at 255 — reserve it for the *single* live
element each frame (the packet, the flip seam, the verdict).

## Wiring a new card — two edits, zero plumbing

After writing the sketch function:

1. Register it in the `SK` map: `var SK = { ..., name: name };`
2. Add one tile to the `.sigils` strip in the HTML:

```html
<a class="sigil" data-sketch="name" href="https://zntznt.com/<repo>/">
  <span class="sigil-canvas" aria-hidden="true"></span>
  <span class="sigil-label">name</span>
  <span class="sigil-desc">one short line</span>
</a>
```

`boot()` finds every `.sigil`, reads `data-sketch`, instantiates p5, and the
shuffle + `ResizeObserver` sizing already cover it. No other wiring.

## Worked example A — the `steelman` card (belief math)

[Steelman](https://github.com/zntznt/steelman) reads an argument **at its
strongest before judging it** — the opposite of a strawman. Its thesis: **start from goodwill, hold a
strong prior that the argument is SOUND, and notice a gap only when one fallacy
clearly beats that prior.** The tone is gap-noticing, not accusation ("one thing
to check," never "gotcha").

The sketch plays a miniature of the narrowing engine — it doesn't just *look*
like the app, it runs the math:

- Each cycle loads a **fresh random argument**: 4 candidate fallacies drawn from a
  pool, plus a **SOUND** null hypothesis that starts with a strong prior
  (`PRIOR_VALID = 0.6`). The belief vector is rendered as horizontal **bars** —
  bar width *is* the posterior probability.
- A sequence of **questions** then arrives on a timer. Each answer is a real
  **Bayesian update**: every candidate's belief is multiplied by a likelihood and
  the whole vector renormalizes to a distribution. The bars rebalance and the
  field visibly **narrows**. (~half the questions are "charitable" — they prop up
  SOUND rather than implicate a candidate.)
- After the questions run out it **decides**, then holds the verdict before
  reloading. It surfaces a gap on a candidate *only* if that candidate beats SOUND
  **and** clears a threshold (`THRESH`); otherwise the `λ sound` bar wins and
  glows in `accent` — "looks solid; nothing to flag."

Because of the strong prior plus charitable likelihoods, SOUND wins ~88% of
rounds. A flagged gap (accent on a fallacy row) is the rare exception, never the
default. If you rework the engine, keep the prior strong and the likelihoods
charity-first — the card should keep landing on SOUND most of the time.

> Note: the animation still depicts the older sequential-interview engine. The
> live app moved to a positive-first virtue **checklist**, but the bars-narrowing
> picture still reads true for the *thesis* (strong prior on soundness, rare
> flags), so it was retoned rather than rebuilt.

## Worked example B — the `timecards` card (a state machine)

A different shape from `steelman`: where that one animates a belief *distribution*,
this one animates a **process**. [Timecards](https://github.com/zntznt/timecards)
is study timers "in card form" — slot a card into a device, hit the big button to
start/pause/resume, each card keeps its own time; swap a card and its data swaps
in.

The sketch plays the device's big-button loop as a four-phase state machine:

1. **slot-in** — a fresh random card (label, timer mode, start value,
   deadline/streak chip) slides down into the reader slot.
2. **press** — the big button presses; an `accent` ring ripples out.
3. **run** — the timer readout counts **up** (`▸` stopwatch) or **down** (`▾`
   countdown). The running digits are the live `accent`.
4. **chime** — a countdown that hits zero pulses concentric `accent` rings with a
   `♪`/`!` (unless the card's alarm is `silent`). Then the card swaps and a new
   one slots in.

The per-cycle randomization is the **card itself** (the Timecards analog of
`sim`'s fresh graph): each swap rolls a new label, up-vs-down mode, starting time,
and a deadline (`"42d left"`) or streak (`"day 17"`) chip. The single live accent
moves with the active phase — press ripple → running digits → chime burst.

Between them, these two examples cover both kinds of richness in the family:
**belief/structure** (`steelman`, like `sim`/`outline`) and **a timed process**
(`timecards`, like `sim`'s packets or `deck`'s flips).
