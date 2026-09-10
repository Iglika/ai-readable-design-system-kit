# Step 2 — Semantic colour

**Time:** 20 minutes · **Creates:** ~110 variables in a `Semantics` collection

This is the step where the system stops being a palette and becomes readable. It is also
the step where most systems go wrong, in a very specific way.

---

## The concept

A semantic token holds **no value**. It holds a reference to a primitive, and a name that
says what the colour is *for*.

```
background/brand/bold/default   →   {color.indigo.600}
```

Read it left to right:

| Segment | Answers |
|---|---|
| `background` | what property does it paint? |
| `brand` | what does it mean? |
| `bold` | how much presence does it have? |
| `default` | which interaction state? |

**Emphasis is a contrast rule, not a preference.** `bold` fills are saturated, so text on
them must be `inverse` (white). `subtle` fills are tinted, so text stays neutral. Getting
this wrong doesn't look like a naming problem — it looks like unreadable buttons.

**`inverse` is not dark mode.** It's a dark surface inside a light page: a nav, a footer, a
CTA band. Dark mode is a *mode on this collection*, and it's a design project, not a
token-filling exercise.

---

## The mistake this step exists to prevent

The grammar above has 4 × 7 × 3 × 5 = **420 possible cells.** You need about 110.

There is a well-known class exercise that generates the full matrix — properties, roles,
emphases, states, all combinations — and it is an excellent teaching device and a terrible
production system. A real audit of one such file found **684 semantic tokens for a
five-page marketing site whose homepage used about fifteen colours**, and 168 of those
semantics held raw hex values with no primitive to point at, because the exercise's palette
didn't match the brand's.

The tell is always the same: tokens that exist because the grid has a cell there, not
because a component needed them.

> **Create a cell when a component needs it.** Not before.

---

## The prompt

```
Read contracts/naming.md and traps.md first.

Create the Semantics collection in my Figma file and populate the semantic
colour tokens.

File key: 〈your file key〉

Requirements:
- Collection "Semantics", ONE mode named "Light" (not "Semantics" — I may
  add a Dark mode later and I don't want to rename anything)
- Every token is an ALIAS to a primitive. Zero raw values. If you can't find
  a primitive for something, stop and tell me — do not invent a hex.
- Naming: semantic/color/{property}/{intent}/{emphasis}/{state}
- Scopes set explicitly per the contract's table:
    text/* -> TEXT_FILL
    background/* -> FRAME_FILL, SHAPE_FILL
    border/* -> STROKE_COLOR
    icon/* -> SHAPE_FILL

Build ONLY the cells I actually need. Start from this list and challenge
anything on it you think I won't use:
〈paste the semantic list from your contract, or say "use the starter kit's list"〉

Do not fill the matrix. If a cell has no use case, leave it out and tell me
what you left out.

Contrast rules to enforce as you go:
- text on a `bold` background must be `inverse`
- `focused` borders must be visibly different from the brand fill, or a
  focus ring on a brand button is invisible
- disabled text must still be legible — aim above 3:1

When done, report: total created, count per property, the number of
semantics holding a raw value (must be 0), and any cell you chose not to
build with your reason.
```

---

## Checkpoint

- [ ] the Variables panel shows **two** collections: `Primitives` and `Semantics`
- [ ] the semantics mode is called `Light`
- [ ] clicking any semantic shows an alias chip pointing at a primitive, not a hex
- [ ] **semantics holding a raw value: 0** — ask for this number explicitly
- [ ] a text layer's fill picker offers `text/*` and not `background/*`

**The raw-value count is the one that matters.** It is the single number that tells you
whether you have two layers or one layer wearing two names. It should be 0 on the day you
build it and 0 forever after.

---

## Common failures

**Semantics holding hexes.** Almost always means a needed primitive doesn't exist — the
usual culprit is a status colour, when `success` wants green and the palette has no green
because green was never a brand hue. Fix it by adding the primitive, never by putting a
hex in a semantic.

**A focus ring you can't see.** If `border/*/focused` points at the same step as your brand
fill, the ring vanishes on brand-coloured buttons. Move focus a few steps darker.

**Too many `subtlest` tokens.** `subtlest` earns its place only if you genuinely layer a
tint on a tint. If you don't, drop the emphasis level entirely — two are enough.
