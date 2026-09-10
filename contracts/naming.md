# Naming Contract

*Fill this in before you create a single variable. It is Step 0 for a reason.*

> **How to use this file.** Everywhere you see `〈…〉`, replace it with your own decision.
> Everything else is the contract — keep it. When you are done, this file is the brief you
> hand to the LLM, and the reference you argue with six months from now.

---

## Why this exists

With a plugin, naming is whatever your JSON happens to say. With an LLM writing your
variables, **the names are the interface.** The model needs a rule it can apply to a token
it has never seen, or it will invent something plausible and slightly wrong — `bg-primary`
here, `background-brand` there, `brandBg` in the third file. Each one works. Together they
are not a system.

A naming contract is one page that makes every future name derivable rather than
remembered. It is also the thing that makes the system *auditable*: you cannot check
whether a file follows a convention that only exists in someone's head.

**Write it first. Not after the tokens — after is a rationalisation, not a contract.**

---

## 1 · Architecture

Two collections. The tier rule is enforced by tooling, not by memory.

| Collection | Mode | Contents | Published |
|---|---|---|---|
| `Primitives` | `Value` | raw values — the only place a hex or a px lives | **Hidden** |
| `Semantics` | `Light` | aliases that point at primitives and carry meaning | Visible |

Three rules, and they are the whole system:

1. **Primitives hold raw values. Nothing else does.**
2. **Semantics only reference primitives.** Never a raw value. Not once.
3. **Components read semantics.** Never reach past a semantic to a primitive.

Set `Primitives` to `hiddenFromPublishing = true`. This is not tidiness — it is the tier
rule made physical. A consumer of your library literally cannot reach a primitive, so the
rule holds even when nobody is watching it.

**Name the semantics mode `Light`, not `Semantics`.** You are not adding dark mode today,
but naming the mode after its *content* rather than its *layer* means adding one later is
a new mode rather than a rename. Renaming a mode is cheap; renaming 200 variables is not.

---

## 2 · Naming grammar

```
Primitives   color/〈hue〉/〈step〉                color/indigo/500
             color/base/〈white|black〉
             color/shadow/〈colour〉-〈alpha〉     color/shadow/black-10
             font/family/〈heading|body|mono〉
             font/style/〈heading|body|mono〉/〈regular|medium|semibold|bold〉
             font/size/〈px〉                     font/size/16
             font/lineheight/〈percent〉          font/lineheight/150
             font/letterspacing/〈name〉          font/letterspacing/tight
             dimension/〈tailwind-step〉          dimension/4  = 16px
             motion/duration/〈ms〉               motion/duration/220
             motion/easing/〈name〉               motion/easing/standard

Semantics    semantic/color/〈property〉/〈intent〉/〈emphasis〉/〈state〉
             semantic/〈radius|spacing|border-width|size〉/〈t-shirt〉
             semantic/motion/〈duration|easing〉/〈role〉
```

### The group carries the noun, the leaf carries the value

`color/gray/50`, never `color/gray/gray-50`. `dimension/2`, never `dimension/dimension-2`.

Figma's `/` is the group separator, and most build tools join the path with hyphens — so
`dimension/2` emits `--dimension-2` on its own. Repeating the noun gives you
`--dimension-dimension-2` and a system that reads like a stutter.

### Primitives are named for what they ARE

`indigo`, not `brand`. `gray`, not `neutral`.

This is the single most common mistake, and it collapses two layers into one. The moment
you name a primitive `brand`, rebranding means renaming — and **renaming a variable in
Figma silently unbinds every layer using it.** Keep the hue name at the primitive layer and
the purpose at the semantic layer, and a rebrand is one alias change.

### T-shirt sizing belongs to the semantic layer only

`semantic/radius/md` is right. `dimension/md` is wrong — at 29 steps, t-shirt names run out
long before the scale does, and `dimension/3xl` tells you nothing about whether it is
bigger than `dimension/xxl`.

---

## 3 · Colour

**6 hues × 11 steps (50–950), plus base white and black.**

```
gray   indigo   teal   red   emerald   amber
       └ brand     └ accent  └ danger, success, warning
```

Fill in what each hue is *for* — but only here, in the contract. The token names stay hue
names.

| Hue | Role | Notes |
|---|---|---|
| `gray` | neutral UI | surfaces, text, borders |
| `indigo` | brand | **swap this ramp first** |
| `teal` | accent | secondary actions, highlights |
| `red` | danger | errors, destructive actions |
| `emerald` | success | confirmations, valid states |
| `amber` | warning | caution, pending |

**Step meanings:** `50` lightest (page tints) · `500` the base step · `950` darkest.

### Semantic colour: property → intent → emphasis → state

Read every name left to right.

| Segment | Values |
|---|---|
| **property** | `background` · `text` · `border` · `icon` |
| **intent** | `neutral` · `brand` · `accent` · `inverse` · `danger` · `success` · `warning` |
| **emphasis** | `bold` · `subtle` · `subtlest` |
| **state** | `default` · `hovered` · `pressed` · `focused` · `disabled` |

**Emphasis is a contrast requirement, not a preference:**

- `bold` fills are saturated → text on them must be `inverse` (white)
- `subtle` fills are tinted → text stays `neutral` or the matching intent
- `subtlest` is for layering a tint on a tint — a brand band with brand tags on it

**`inverse` is not dark mode.** It is a dark surface inside a light page: a nav, a footer, a
CTA band. Dark mode is a *mode on this collection*, and it is a design project — deciding
how your brand hue behaves on near-black — not a token-filling exercise.

### Do not fill the matrix

4 properties × 7 intents × 3 emphases × 5 states is 420 cells. **You need about 110.**

A `subtlest` background has no pressed state. An error message has no disabled state. A
`warning` intent probably needs two cells, not fifteen.

> **The rule: create a cell when a component needs it.** A token that has never been bound
> to anything has absorbed no decisions and taught you nothing. It is not an asset — it is
> a guess you now have to maintain.

This is the entire difference between a system with 110 semantics and one with 700. The
700-token version is not more thorough. It is unfinished work that looks like finished work.

---

## 4 · Typography

**Two interface fonts, plus a mono.** `Outfit` for headings, `Inter` for body, and
`IBM Plex Mono` for code and documentation.

The two-font rule governs *interface* type. Documentation needs a third face, because a
prompt block set in a proportional font is the one thing readers copy and paste.

One font trying to do both jobs compromises on both: display faces are tiring at 16px,
and text faces are characterless at 64px.

### Text styles ARE the semantic layer for type

Figma variables cannot express a composite text style, and text styles cannot consume
modes. So a responsive ramp has to be **explicit styles per breakpoint**, not one token
with a mode per screen size.

Bind these to primitives: `fontFamily` · `fontStyle` · `fontSize` · `paragraphSpacing`.

Keep font-style strings family-specific. For example, Outfit exposes `SemiBold` while
Inter exposes `Semi Bold`; one shared token cannot bind both correctly.

**Do NOT bind `lineHeight` or `letterSpacing`.** Set them directly on the style as
percentages. Figma's float variables carry no unit, so binding one to a unit-bearing
property forces **pixels** — see `traps.md`, trap #1. This will not error. It will silently
give you a 160-pixel line height on a 12px caption.

### Three breakpoints

Desktop ≥1200 · Tablet 810–1199 · Mobile <810.

Three is almost always enough. **If two breakpoints hold identical values, you have a
breakpoint, not a decision** — delete it.

| | Desktop | Tablet | Mobile | Weight | Tracking |
|---|---|---|---|---|---|
| Jumbo | 64 / 110% | 52 / 110% | 40 / 120% | SemiBold | −4% |
| Heading 1 | 48 / 120% | 40 / 120% | 32 / 120% | SemiBold | −4% |
| Heading 2 | 40 / 120% | 32 / 130% | 28 / 130% | SemiBold | −4% |
| Heading 3 | 32 / 130% | 28 / 130% | 24 / 130% | SemiBold | −2% |
| Heading 4 | 24 / 140% | 24 / 140% | 20 / 140% | SemiBold | −2% |
| Heading 5 | 20 / 140% | 20 / 140% | 18 / 140% | SemiBold | −2% |
| Heading 6 | 18 / 140% | 18 / 140% | 16 / 140% | SemiBold | 0 |

**Body is constant across breakpoints.** Reading size does not need to respond — a 16px
paragraph is 16px everywhere. Weights: Regular · Medium · SemiBold · Bold.

| | Size / line |
|---|---|
| Body/Large | 20 / 150% |
| Body/Medium | 18 / 150% |
| Body/Default | 16 / 160% |
| Body/Small | 14 / 160% |
| Body/Tiny | 12 / 160% |

**Line height is a percentage, never px.** A ratio survives a size change; a px line height
breaks the moment the font size moves. Any fractional line height in your source data
(`22.4px`) is a percentage that has already been multiplied out — convert it back.

**Leading grades inversely to size.** Larger text takes less leading, smaller text more.

---

## 5 · Dimension

**Tailwind's spacing scale, verbatim.** 0–96px plus `999` for full rounding.

`dimension/4` is 16px because Tailwind's `4` is 16px. That correspondence means `p-4` in
code and `dimension/4` in Figma agree without a translation table in anyone's head.

Renaming these to pixel values (`dimension/16`) looks tidier on the canvas and breaks
exactly that. Don't.

Dots become hyphens — `dimension/0-5` is Tailwind's `0.5` = 2px — because a dot collides
with the token path separator.

Four semantic families alias the scale. They are **not** parallel scales; they are semantic
*uses* of one scale.

```
semantic/radius/         none sm md lg xl 2xl full           7
semantic/spacing/        none xxs xs sm md lg xl … 10xl     16
semantic/border-width/   none thin default thick             4
semantic/size/           xs sm md lg xl 2xl 3xl 4xl 5xl      9
```

---

## 6 · Elevation

**Shadow-colour primitives + effect styles.** Effect styles are the composite semantic
layer, exactly as text styles are for type. There is no separate `semantic/elevation/*`
variable group.

**Alpha is baked into each primitive** — `color/shadow/black-10` is rgba, not a solid with
opacity applied on top. You cannot alias a colour variable and then set opacity on it, so
anything translucent needs its own primitive. Scope these to `EFFECT_COLOR` only, or they
pollute every colour picker in the file.

| Style | Layers | Reach | Use for |
|---|---|---|---|
| `Shadow/xs` | 1 | 2 | badges, subtle chips |
| `Shadow/sm` | 3 | 8 | cards, inputs |
| `Shadow/md` | 4 | 12 | raised cards, popovers |
| `Shadow/lg` | 4 | 20 | dropdowns, sheets |
| `Shadow/xl` | 1 | 50 | modals, dialogs |

**Real shadows are layered.** One big soft blur reads as a sticker. Three or four stacked
layers with tightening spreads read as a lit object.

**Bind colour to variables; leave geometry in the style.** Offsets and blurs aren't shared
between styles, so a variable would have exactly one consumer. Colour is also the part that
changes in a dark theme.

**If you keep an exception to the scale, mark it as one** — in the style's Figma
description, in this contract, and in your `SKILL.md`. An unmarked exception is
indistinguishable from a mistake, and the next person will "fix" it.

---

## 7 · Motion

Most starter kits skip motion, which is why most vibe-coded UI animates at whatever the
framework's default happens to be.

```
motion/duration/〈ms〉        0 · 160 · 220 · 320 · 400
motion/easing/〈name〉        standard · gentle · linear
```

| Semantic | Points at | For |
|---|---|---|
| `duration/instant` | `0` | the reduced-motion fallback |
| `duration/state` | `160` | hover, focus, press on a control |
| `duration/fade` | `220` | opacity only — shorter than layout on purpose |
| `duration/layout` | `320` | size, position, reveal |
| `duration/deliberate` | `400` | slow colour washes; use sparingly |
| `easing/default` | `standard` | the system curve — reach for this first |
| `easing/gentle` | `gentle` | symmetrical; pairs with `deliberate` |

---

## 8 · Scopes

**Always set `scopes` explicitly. Never `ALL_SCOPES`.**

| Variable group | Scope |
|---|---|
| `semantic/color/text/*` | `TEXT_FILL` |
| `semantic/color/background/*` | `FRAME_FILL`, `SHAPE_FILL` |
| `semantic/color/border/*` | `STROKE_COLOR` |
| `semantic/color/icon/*` | `SHAPE_FILL` |
| `color/shadow/*` | `EFFECT_COLOR` |
| `semantic/radius/*` | `CORNER_RADIUS` |
| `semantic/spacing/*` | `GAP` |
| `semantic/border-width/*` | `STROKE_FLOAT` |
| `font/size/*` | `FONT_SIZE` |

Scoping is what makes the picker teach the system. A text layer offered only `text/*`
tokens cannot be given a background colour by accident, and a designer who has never read
this document still ends up doing the right thing.

`ALL_SCOPES` offers all 200 semantics on every property and guarantees the opposite.

---

## 9 · Guardrails

1. **Never rename a variable you intend to keep.** Renaming silently unbinds every layer
   using it. Not an error — the layer just quietly holds a raw value again.
2. **Deprecate, don't delete** — once anything is bound. Before anything is bound, cleanup
   is free. That window closes fast.
3. **No semantic holds a raw value.** Check this number. It should be 0, always.
4. **Fractional values never become tokens.** Line heights as percentages, sizes rounded to
   the grid.
5. **Always set `scopes` explicitly.**
6. **A token that has never been bound has absorbed nothing.** Build for what exists.

---

## 10 · Decision log

> Keep this section. Write down every choice whose *reasoning* is not recoverable from the
> file itself. Six months from now this is the only thing standing between you and
> re-litigating a decision you already made well.

| Date | Decision | Why |
|---|---|---|
| 2026-09-07 | **Three font families, not two.** Outfit / Inter / IBM Plex Mono. | The two-font rule governs interface type. Code and prompt blocks are the thing readers copy, and a proportional face breaks them. |
| 2026-09-07 | **Mono is IBM Plex Mono, not JetBrains Mono.** | JetBrains Mono ships no SemiBold in any spelling, so `font/style/mono/semibold` pointed at a font Figma cannot resolve — a dead token that would have thrown on first bind. IBM Plex Mono has all four weights with the `SemiBold` spelling. Rejected: keeping JetBrains and dropping the semibold step, which would have made the mono ramp inconsistent with heading and body. |
| 2026-09-07 | **Spacing extends to `10xl` (96px).** `8xl` 64 · `9xl` 80 · `10xl` 96, aliasing existing `dimension/16·20·24`. | Document sections need 96px padding; the old ceiling was `7xl` = 56. No new primitives — the scale already went that far. |
| 2026-09-07 | **Focus is an offset ring, not a border.** 2px ring, 2px surface-coloured gap, drawn as an absolutely-positioned child frame. | The focus token and the brand fill are the same colour (indigo/600), so a focus *border* on a brand-filled control measures 1.00:1 — invisible. Darkening cannot fix it: even indigo/950 reaches only 2.54:1 against that fill. Offsetting puts the ring against the page instead, so ring-to-gap, gap-to-fill and ring-to-page all measure 6.29:1. |
| 2026-09-07 | **Disabled contrast left as built.** ghost 1.99:1, primary 3.19:1, danger 3.29:1, secondary 3.86:1. | WCAG 1.4.3 exempts inactive controls from contrast minimums, and a disabled control that reads as clearly unavailable is doing its job. Recorded here so a future audit does not "fix" it. Same reasoning as the gray/300 field border. |
| 2026-09-07 | **Form Field exposes no `Control` swap property.** The `State` axis drives the nested control instead. | Figma applies an INSTANCE_SWAP default across every variant of a set, which silently flattened all four Form Field controls to the default Input and removed the red error border. A variant axis and a swap property cannot both drive one slot. Chose the visible error state. |

### Deliberately NOT built

| Not built | Why |
|---|---|
| **Dark mode** | The `Semantics` mode is named `Light` so adding `Dark` later is a new mode, not a rename. Nothing today needs it, and an untested second mode is 154 more guesses. |
| **A `semantic/size/target` (44px) token** | The 44×44 rule is currently satisfied by padding maths (controls land at 46–62px) rather than by a named token. Worth adding the moment a control needs to declare the target explicitly. |
| **Stroke-scoped icon colours** | `semantic/color/icon/*` is scoped `SHAPE_FILL` only, so the icon set uses filled paths. Stroked (Lucide-style) icons would need `STROKE_COLOR` added to that scope. Not needed yet. |
| **`accent` hover/pressed on every property** | `teal` carries only the roles something actually uses. Filling the matrix would add ~40 cells nothing has ever bound. |

### Results that look like failures and are not

| Looks wrong | Is correct |
|---|---|
| Line height `160` in Figma, `1.6` in the package | Figma stores percentages, CSS wants a ratio. The build converts. |
| Letter spacing `-2` in Figma, `-0.02em` in the package | Same conversion. |
| `Type Semantic` shows **0 variables** | Composite typography is Text Styles, not variables. Figma variables cannot express a composite. |
| Figma effect order is the reverse of CSS `box-shadow` | Figma paints *later* effects on top; `box-shadow` paints *earlier* ones on top. |

Two prompts worth answering here, because they are the ones you will forget:

- **What did you deliberately NOT build, and why?** (Dark mode? A Tailwind preset? A hue you
  chose not to add?) An absence with a reason is a decision. An absence without one looks
  like an oversight and gets "fixed".
- **Where did you knowingly trade conformance for aesthetics?** Write the number down once —
  the contrast ratio, the size — then stop re-raising it. A recorded trade-off is a
  decision. An unrecorded one is a bug with a long life ahead of it.
