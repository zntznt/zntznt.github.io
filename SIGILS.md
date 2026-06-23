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

## Worked example — the `fallacynator` card

Added alongside the original five. It exists to show the contract end to end, and
its *behavior encodes the app's thesis* (see below).

[Fallacynator](https://github.com/zntznt/fallacynator) is an "Akinator for
logical fallacies." Its non-negotiable thesis: **start from goodwill, disarm
cynics, hold a strong prior that the argument is VALID** — accuse a fallacy only
when one candidate clearly beats the VALID null hypothesis.

The sketch plays the actual Akinator loop — it doesn't just *look* like the app,
it runs a miniature of the engine:

- Each cycle loads a **fresh random argument**: 4 candidate fallacies drawn from a
  pool, plus a **VALID** null hypothesis that starts with a strong prior
  (`PRIOR_VALID = 0.6`). The belief vector is rendered as horizontal **bars** —
  bar width *is* the posterior probability.
- A sequence of yes/no **questions** then arrives on a timer. Each answer is a
  real **Bayesian update**: every candidate's belief is multiplied by a
  likelihood and the whole vector renormalizes to a distribution. The bars
  rebalance and the field visibly **narrows**. (~60% of questions are
  "charitable" — they prop up VALID rather than implicate a candidate.)
- After the questions run out it **decides**, then holds the verdict before
  reloading. It accuses a candidate *only* if that candidate beats VALID **and**
  clears a confidence threshold (`THRESH`); otherwise VALID wins and glows in
  `accent` — "no clear fallacy; you might just be skeptical, and that's okay."

Because of the strong prior plus charitable likelihoods, VALID wins most rounds.
A tentative accusation (accent on a fallacy row) is the rare exception, never the
default. That's the thesis as a running process, not decoration. If you rework
the engine, keep the prior strong and the likelihoods charity-first — the card
should keep landing on VALID most of the time.

This card is the richest worked example of the contract: per-cycle randomized
structure (like `sim`'s graph or `outline`'s tree), a real multi-step process
(like `sim`'s flowing packets), and a single live accent (the question cursor,
then the verdict).
