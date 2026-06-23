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

The sketch renders that as a belief contest:

- A ring of candidate **fallacy** nodes surrounds a central **VALID** anchor.
- Each frame, "evidence" nudges the candidates' belief weights up and down. A
  node's weight decides which opacity tier it sits in — most stay at `A_FAINT` /
  `A_STRUCT` (suspicion that never amounts to much).
- VALID carries a **strong prior**, so the verdict edge usually resolves *to the
  center* and VALID glows in `accent` — "no clear fallacy; you might just be
  skeptical, and that's okay."
- Only when a candidate's weight crosses a high threshold does *that* node briefly
  flash `accent` as a tentative accusation — then belief decays and the center
  reclaims it. Accusations are rare and never sticky, by design.

That's "strong prior on validity, accuse rarely" rendered as motion. If you ever
rework the engine, the card should keep favoring the center.
