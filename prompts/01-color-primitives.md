# Step 1 — Colour primitives

**Time:** 10 minutes · **Creates:** ~75 variables in a `Primitives` collection

The raw palette. Every colour value your system will ever use, named for what it **is**.

---

## The concept

Primitives are paint tubes. `indigo/500` is "this exact blue-purple." It is not "the brand
colour" — that is a job, and jobs are named in Step 2.

Keeping these separate is what makes a rebrand a one-line change instead of a rename, and
renames are the expensive operation in Figma (`traps.md` #4).

**Eleven steps per hue, 50 → 950.** You will not use them all. That is correct and expected:
full ramps are the method, and the semantic layer picks a subset. Orphaned primitives are
not waste — they are the range you chose from.

---

## Before you start

- [ ] `contracts/naming.md` is filled in
- [ ] Figma desktop app open, on the file you want to build in
- [ ] `use_figma` available (ask Claude to confirm it can see the tool)

---

## The prompt

```
Read contracts/naming.md and traps.md before doing anything.

Create the Primitives collection in my Figma file and populate the colour
primitives exactly as the contract specifies.

File key: 〈your file key〉

Requirements:
- One collection named "Primitives", one mode named "Value"
- Set Primitives.hiddenFromPublishing = true (traps.md #12)
- Groups: color/base, color/〈each hue〉, color/shadow
- Eleven steps per hue: 50,100,200,300,400,500,600,700,800,900,950
- Shadow colours carry their alpha baked into the value (traps.md #7)
- Set scopes explicitly on every variable, per the contract's scopes table.
  Never ALL_SCOPES.
- color/shadow/* scoped to EFFECT_COLOR only

Generate each ramp from my base step. I want perceptually even steps, not
a naive lightness interpolation — 500 should read as the same colour family
as 50 and 950, and no step should be a visible jump from its neighbours.

Work in batches and screenshot after each batch. Do not tell me it worked —
show me the swatches.

When done, report: total variables created, count per group, any variable
that ended up with ALL_SCOPES, and confirmation that hiddenFromPublishing
is set.
```

---

## What to expect

Roughly 75 variables: 6 hues × 11 steps, plus base white and black, plus the shadow alphas.

The model should work in batches — one hue at a time is typical — and show you swatches
between batches. **If it reports success without showing you anything, ask for the
screenshot.** Half the failures in `traps.md` are invisible in metadata and obvious in a
picture.

---

## Checkpoint

Open Figma's Variables panel (bottom of the right sidebar).

- [ ] a `Primitives` collection exists with your hue groups
- [ ] each ramp reads as one colour family, light to dark, no jumps
- [ ] the collection shows as hidden from publishing
- [ ] clicking a text layer does **not** offer you `color/shadow/*`

That last check is the scopes test. If shadow colours appear in a text fill picker, scopes
weren't set and you should fix it now, before 200 more variables inherit the problem.

---

## Common failures

**Every swatch renders black.** The paints are bound correctly and the cached colour is
still the `{0,0,0}` placeholder — `traps.md` #2. Ask for the variable's resolved RGB to be
used as the paint's base colour *before* binding.

**Ramps that go grey in the middle.** Naive interpolation through RGB desaturates. Ask for
the ramp to be regenerated in a perceptual space (OKLCH), keeping your base step fixed.

**A hue named `brand`.** Stop and rename now, while nothing is bound. In ten minutes this
becomes expensive; right now it is free.
