# Project design system — rules for working in this repo

> **White-label starter.** Replace “Project” with your product name after you customize
> the palette and fonts. This file states the rules **in force**, never their history.

`src/values.mjs` is the source of truth. This repo is a build artifact. **Nothing here is edited by
hand.**

```
Figma  →  scripts/build-tokens.mjs  →  tokens/dist/tokens.json  →  Style Dictionary  →  tokens/dist/tokens.css
```

Regenerate with `npm run build`. Verify with `npm run verify`.

---

## Search before you build

**Before building any page, form or screen, find the components that already exist.**
Icon, Button, Input, Textarea, Select, Checkbox, Radio, Toggle, and Form Field are built
and specified in `handoff/SKILL.md`, `contracts/components.md`, and Figma. Search all
three before concluding something is missing.

This is a separate failure from the token rule below, and a quieter one: a page can
reference nothing but valid tokens and still be off-system, because the elements themselves
were invented. Demos and samples are held to this too.

---

## The one rule that matters

**Never emit a raw value. Always emit a token reference.**

<!-- check-ignore-start -->
```css
/* wrong */
color: #4F46E5;
padding: 16px;
border-radius: 8px;

/* right */
color: var(--text-brand-bold-default);
padding: var(--spacing-xl);
border-radius: var(--radius-md);
```
<!-- check-ignore-end -->

If you find yourself typing a hex, a px value, or a font size, stop — there is a token for
it. If there genuinely isn't, **say so rather than inventing one.** Adding a token is a
decision, not a side effect.

This is enforced, not just requested. `npm run check -- <file>` fails on a raw hex and on a
raw `px` or `rem` in a declaration, and exits non-zero, so it runs in CI. A value hoisted
into one named custom property at `:root` is reported as a local constant rather than a
failure — that is the sanctioned way to handle a genuinely missing token.

---

## The tier rule

```
component  →  semantic  →  primitive
```

- **Primitives** (`--color-indigo-500`, `--dimension-4`) hold raw values.
- **Semantics** (`--bg-brand-bold-default`) reference primitives and carry meaning.
- **Components** read semantics. **Never reach past a semantic to a primitive.**

A primitive says what a colour *is*. A semantic says what it's *for*. Using
`--color-indigo-500` for a button background works today and breaks the first time the
brand colour changes, because nothing recorded that it was the brand colour rather than
just some indigo.

The only legitimate use of a primitive in application code is when no semantic exists for
that role — which usually means a semantic is missing.

---

## Picking the right semantic

Read the name left to right: `property` → `intent` → `emphasis` → `state`.

| | |
|---|---|
| **Property** | `bg`, `text`, `border`, `icon` |
| **Intent** | `neutral`, `brand`, `accent`, `inverse`, `danger`, `success`, `warning` |
| **Emphasis** | `bold`, `subtle`, `subtlest` |
| **State** | `default`, `hovered`, `pressed`, `focused`, `disabled` |

**Emphasis decides your text colour, and it's a contrast requirement, not a preference:**

- `bold` backgrounds are saturated → text must be `inverse` (white)
- `subtle` and `subtlest` backgrounds are tinted → text stays `neutral` or the matching intent

`inverse` means a dark surface inside a light page — a nav, a footer, a CTA band. **It is
not dark mode. There is no dark mode.**

Not every cell exists. Cells were created where a real component needed them, so a missing
token usually means that combination isn't used, not that it was forgotten.

---

## Typography

Use the classes, not the variables:

```html
<h1 class="text-jumbo">…</h1>
<p class="text-body-default-regular">…</p>
```

Heading classes are **responsive** — they carry the ramp across three breakpoints via media
queries (mobile base, ≥810 tablet, ≥1200 desktop). Do not add your own font-size media
queries on top.

Body classes are constant across breakpoints.

Colour is **not** part of a text class. Apply it separately:

```html
<h2 class="text-h2" style="color: var(--text-neutral-bold-default)">
```

---

## Motion

Transition **specific properties, never `all`**. Always honour `prefers-reduced-motion`.

`--duration-state` for control states, `--duration-fade` for opacity, `--duration-layout`
for size and position. `--easing-default` unless you have a reason.

---

## Elevation

`--shadow-xs | sm | md | lg | xl` is the scale. Reach for it in order.

There are no elevation exceptions in the starter. Document any future exception with its
purpose; an unmarked exception looks like a mistake and will be “fixed.”

---

## Constraints worth knowing

- **Gradients are not tokens.** Figma cannot express them as variables. Any gradient is
  hand-maintained and will drift.
- **There is no dark mode.** The token structure supports adding one; no values exist. Do
  not invent them.
- **`line-height` is unitless, `letter-spacing` is in `em`.** Both scale with font size on
  purpose.
- **The dimension scale is Tailwind's.** `--dimension-4` is 16px because Tailwind's `4` is
  16px, so `p-4` and `--dimension-4` agree.

---

## Known gaps

- Indigo and teal are starter values, not a finished brand decision. Replace their full
  ramps before shipping a branded product.
- Dark mode is not defined. Do not infer it by reversing the light palette.
- **No brand color works on an inverse surface.** indigo-600 is the brightest brand text
  token and it fails contrast on both inverse backgrounds, so a form with a brand-colored
  required marker cannot go on a dark surface. Use a raised light surface, and raise the
  gap rather than substituting a lighter indigo.
- **No layout tokens.** No container width, column width or breakpoint exists, and a media
  query cannot read a custom property. Keep the page's layout constants in one block.
- **No touch-target token.** 44×44 is required on every control but exists only as the
  primitive `--dimension-11`. Alias it once; do not write `44px` per control.
- **No mono text styles.** `--font-mono` is a token, but no mono class is emitted. Compose
  one from the font variables.
- Re-run contrast checks after changing any primitive color or font.

---

## Files

| | |
|---|---|
| `tokens/dist/tokens.json` | DTCG tokens, **generated** |
| `tokens/dist/tokens.css` | the stylesheet to import, **generated** |
| `src/values.mjs` | **The only file edited by hand.** Every brand value lives here |
| `scripts/build-tokens.mjs` | `values.mjs` → DTCG. Machinery; nothing to edit |
| `scripts/build-css.mjs` | DTCG → CSS via Style Dictionary |
| `scripts/build-skill.mjs` | regenerates the token block inside `SKILL.md` |
| `scripts/verify.mjs` | proves every token name resolves to a real value |
| `contracts/naming.md` | full reference and decision record |
