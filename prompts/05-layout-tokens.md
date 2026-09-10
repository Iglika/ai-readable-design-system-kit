# Step 5 — Spacing, radius, elevation & motion

**Time:** 15 minutes · **Creates:** ~29 primitives, 33 semantics, 5 effect styles, 7 motion tokens

The tokens that make a layout feel deliberate rather than assembled.

---

## The concept

### Dimension is one scale, used four ways

`semantic/radius/*`, `semantic/spacing/*`, `semantic/border-width/*` and `semantic/size/*`
are **not** four parallel scales. They are four semantic *uses* of one primitive scale.

That is why t-shirt sizing is correct at the semantic layer and wrong at the primitive
layer: `semantic/radius/md` is meaningful, `dimension/md` is not — at 29 steps you run out
of t-shirt names long before you run out of scale.

### Use Tailwind's numbers

`dimension/4` is 16px because Tailwind's `4` is 16px. That correspondence means `p-4` in
code and `dimension/4` in Figma agree with no translation table. Renaming to pixel values
looks tidier on the canvas and throws that away.

### Real shadows are layered

One big soft blur reads as a sticker. Three or four stacked layers with tightening spreads
read as a lit object. The starter kit's `md` has four layers for this reason.

**Bind colour to variables; leave geometry in the style.** Offsets and blurs aren't shared
between styles, so a variable would have exactly one consumer. Colour is also the part that
changes if you ever add a dark theme.

**Alpha is baked into each shadow primitive** — you cannot alias a colour and apply opacity
on top (`traps.md` #7).

### Motion is a token, not a default

Most starter kits skip motion entirely, which is why most vibe-coded UI animates at
whatever the framework's default happens to be. Five durations and two curves is enough to
make an entire product feel consistent.

---

## The prompt

```
Read contracts/naming.md and traps.md #5, #6 and #7 first.

Add the layout, elevation and motion tokens to my Figma file.

File key: 〈your file key〉

1. PRIMITIVES — dimension
   dimension/{Tailwind spacing steps} per the contract, 0 through 96px
   plus dimension/999 for full rounding.
   Dots escaped as hyphens: dimension/0-5 = 2px.

2. SEMANTICS — four families aliasing dimension:
   semantic/radius/       none sm md lg xl 2xl full
   semantic/spacing/      none xxs xs sm md lg xl 2xl…7xl
   semantic/border-width/ none thin default thick
   semantic/size/         xs sm md lg xl 2xl 3xl 4xl 5xl

   Scopes: radius -> CORNER_RADIUS, spacing -> GAP,
           border-width -> STROKE_FLOAT, size -> WIDTH_HEIGHT

3. PRIMITIVES — motion
   motion/duration/{0,160,220,320,400}
   motion/easing/{standard,gentle,linear}
   Plus semantic/motion/duration/{instant,state,fade,layout,deliberate}
   and semantic/motion/easing/{default,gentle}

4. EFFECT STYLES — Shadow/{xs,sm,md,lg,xl}
   Multi-layer per the contract. Bind each layer's COLOUR to the
   color/shadow/* primitives; leave offsets, blur and spread as literals
   in the style.

   IMPORTANT: setBoundVariableForEffect returns a NEW effect object — it
   does not mutate in place. Capture the return value and reassign it, or
   the binding is silently discarded (traps.md #6).

5. Build me a specimen frame showing the spacing scale, the radius scale
   and all five shadows on cards.

   On that frame: set fills = [] on layout-only containers and
   clipsContent = false on anything wrapping a shadow — auto-layout frames
   default to a white fill and clip their children, which crops drop
   shadows off entirely (traps.md #5).

Screenshot it. Report counts per group and confirm every shadow layer's
colour is bound.
```

---

## Checkpoint

- [ ] Variables panel shows a `Layout` group: spacing, radius, border-width, size
- [ ] Styles panel shows 5 new **Effect styles**
- [ ] the shadow specimen shows five visibly different elevations
- [ ] **the shadows are actually visible** — if they're cropped, that's trap #5
- [ ] a corner-radius field offers `radius/*` and not `spacing/*`

---

## Common failures

**The shadows are invisible.** The parent frame is clipping them. `clipsContent = false`.
This one wastes a lot of time because the shadow styles themselves are perfectly correct —
you will check them three times before thinking to check the frame.

**The shadow bindings didn't stick.** `setBoundVariableForEffect` returns a new effect and
the return value was thrown away. Trap #6.

**Every elevation looks the same.** Your alpha steps are too close together. Shadows need
roughly a doubling of reach between levels to read as distinct.

**Spacing tokens offered on corner radius.** Scopes weren't set. Fix now — this is the last
step before components start binding, and after that it gets expensive.
