---
name: ai-readable-design-system
description: Use the included white-label design tokens and component contracts when building a UI, page, form, component, or prototype. Trigger for HTML, CSS, React, Lovable, or other implementation work where color, typography, spacing, radius, motion, elevation, or core controls must remain aligned with this system.
---

# AI-readable design system

> **This is a template.** The values below are the starter kit's placeholder palette. Run
> Step 8's prompt to regenerate it from your own tokens. Everything outside the generated
> block is prose you should rewrite for your system — keep the *shape*, replace the content.

Everything below is the real token set. **Never emit a raw hex, px value or font size —
always a token.** If no token fits, say so rather than inventing one.

---

## Search before you build

**Before building any page, form, screen or prototype, find the components that already
exist.** They are built, audited and specified.

| Component | Where the spec lives |
|---|---|
| Button | *Worked example* below |
| Input | *Worked example* below |
| Textarea, Select | `contracts/components.md` |
| Checkbox, Radio, Toggle | `contracts/components.md` |
| Form Field | `contracts/components.md` |

Order to search: the worked examples in this file, then your `.spec.md` files, then Figma.
Only after all three come back empty is it a new component — and that is a decision to
raise, not a gap to quietly fill.

This is a separate failure from the token rule, and a quieter one. **A page can reference
nothing but valid tokens and still be off-system, because the elements themselves were
invented.** Demos and samples are held to the same standard as shipped work.

---

## Build the thing, not a description of it

When asked for a component, page or prototype, emit **only the thing itself**. No captions,
demo notes, usage blurbs, or visible prose explaining what was built — those belong in code
comments or a spec file, never in the rendered output.

The only markup allowed beyond the component is scaffolding it cannot render without (a
spacer clearing a fixed nav, a page wrapper), and it must be commented as demo-only.

---

## Tiers

```
component  →  semantic  →  primitive
```

Components read **semantics**. Never reach past a semantic to a primitive.

A primitive says what a colour *is*; a semantic says what it's *for*. Using a primitive for
a button background works today and breaks the first time the brand changes, because
nothing recorded that it was the brand colour rather than just some indigo.

---

## How to choose a token

Read the name left to right: `property` → `intent` → `emphasis` → `state`.

| | |
|---|---|
| **Property** | `bg` · `text` · `border` · `icon` |
| **Intent** | `neutral` · `brand` · `accent` · `inverse` · `danger` · `success` · `warning` |
| **Emphasis** | `bold` · `subtle` · `subtlest` |
| **State** | `default` · `hovered` · `pressed` · `focused` · `disabled` |

**Emphasis decides your text colour, and it is a contrast requirement, not a preference:**

- `bold` backgrounds are saturated → text must be `inverse` (white)
- `subtle` and `subtlest` backgrounds are tinted → text stays `neutral` or the matching intent

**`inverse` means a dark surface inside a light page** — a nav, a footer, a CTA band.
**It is not dark mode. There is no dark mode.**

Not every cell exists. Cells were created where a real component needed them, so a missing
token usually means that combination isn't used, not that it was forgotten.

---

## Fonts

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap">
```

---

## Token block

Emit this once, at the top of any stylesheet, then reference the variables throughout.
Do not paste raw values into rules.

<!-- TOKENS:START -->

```css
/* Design tokens — the complete set. Generated from tokens.css, do not hand-edit. */
:root {

  /* fonts */
  --font-body: Inter;
  --font-heading: Outfit;
  --font-mono: IBM Plex Mono;

  /* background */
  --bg-accent-bold-default: #0D9488;
  --bg-accent-bold-hovered: #0F766E;
  --bg-accent-bold-pressed: #115E59;
  --bg-accent-subtle-default: #CCFBF1;
  --bg-accent-subtlest-default: #F0FDFA;
  --bg-brand-bold-default: #4F46E5;
  --bg-brand-bold-disabled: #C7D2FE;
  --bg-brand-bold-hovered: #4338CA;
  --bg-brand-bold-pressed: #3730A3;
  --bg-brand-subtle-default: #E0E7FF;
  --bg-brand-subtle-disabled: #EEF2FF;
  --bg-brand-subtle-hovered: #C7D2FE;
  --bg-brand-subtle-pressed: #A5B4FC;
  --bg-brand-subtlest-default: #EEF2FF;
  --bg-brand-subtlest-hovered: #E0E7FF;
  --bg-danger-bold-default: #DC2626;
  --bg-danger-bold-disabled: #FECACA;
  --bg-danger-bold-hovered: #B91C1C;
  --bg-danger-bold-pressed: #991B1B;
  --bg-danger-subtle-default: #FEE2E2;
  --bg-danger-subtle-hovered: #FECACA;
  --bg-danger-subtlest-default: #FEF2F2;
  --bg-inverse-bold-default: #0F172A;
  --bg-inverse-bold-hovered: #1E293B;
  --bg-inverse-bold-pressed: #020617;
  --bg-inverse-subtle-default: #1E293B;
  --bg-neutral-bold-default: #CBD5E1;
  --bg-neutral-bold-hovered: #94A3B8;
  --bg-neutral-subtle-default: #F1F5F9;
  --bg-neutral-subtle-disabled: #E2E8F0;
  --bg-neutral-subtle-hovered: #E2E8F0;
  --bg-neutral-subtle-pressed: #CBD5E1;
  --bg-neutral-subtlest-default: #F8FAFC;
  --bg-neutral-subtlest-disabled: #F8FAFC;
  --bg-neutral-subtlest-focused: #FFFFFF;
  --bg-neutral-subtlest-hovered: #F1F5F9;
  --bg-neutral-subtlest-pressed: #E2E8F0;
  --bg-success-bold-default: #059669;
  --bg-success-bold-disabled: #A7F3D0;
  --bg-success-bold-hovered: #047857;
  --bg-success-bold-pressed: #065F46;
  --bg-success-subtle-default: #D1FAE5;
  --bg-success-subtle-hovered: #A7F3D0;
  --bg-success-subtlest-default: #ECFDF5;
  --bg-surface-default-default: #FFFFFF;
  --bg-surface-raised-default: #FFFFFF;
  --bg-surface-sunken-default: #F8FAFC;
  --bg-warning-bold-default: #F59E0B;
  --bg-warning-bold-hovered: #D97706;
  --bg-warning-subtle-default: #FEF3C7;
  --bg-warning-subtlest-default: #FFFBEB;

  /* text */
  --text-accent-bold-default: #0F766E;
  --text-accent-bold-hovered: #115E59;
  --text-brand-bold-default: #4338CA;
  --text-brand-bold-disabled: #A5B4FC;
  --text-brand-bold-hovered: #3730A3;
  --text-brand-bold-pressed: #312E81;
  --text-brand-subtle-default: #4F46E5;
  --text-brand-subtle-hovered: #4338CA;
  --text-danger-bold-default: #B91C1C;
  --text-danger-bold-hovered: #991B1B;
  --text-danger-subtle-default: #DC2626;
  --text-inverse-bold-default: #FFFFFF;
  --text-inverse-bold-disabled: #64748B;
  --text-inverse-bold-hovered: #F1F5F9;
  --text-inverse-subtle-default: #CBD5E1;
  --text-neutral-bold-default: #0F172A;
  --text-neutral-bold-disabled: #64748B;
  --text-neutral-bold-hovered: #020617;
  --text-neutral-disabled: #64748B;
  --text-neutral-subtle-default: #334155;
  --text-neutral-subtle-disabled: #94A3B8;
  --text-neutral-subtle-hovered: #1E293B;
  --text-neutral-subtlest-default: #475569;
  --text-neutral-subtlest-disabled: #CBD5E1;
  --text-success-bold-default: #047857;
  --text-success-bold-hovered: #065F46;
  --text-success-subtle-default: #059669;
  --text-warning-bold-default: #B45309;
  --text-warning-subtle-default: #D97706;

  /* border width */
  --border-width-default: 2px;
  --border-width-none: 0px;
  --border-width-thick: 4px;
  --border-width-thin: 1px;

  /* border */
  --border-accent-default-default: #14B8A6;
  --border-brand-default-default: #6366F1;
  --border-brand-default-disabled: #C7D2FE;
  --border-brand-default-hovered: #4F46E5;
  --border-brand-default-pressed: #4338CA;
  --border-brand-subtle-default: #C7D2FE;
  --border-danger-default-default: #EF4444;
  --border-danger-default-focused: #DC2626;
  --border-danger-default-hovered: #DC2626;
  --border-inverse-default-default: #334155;
  --border-neutral-bold-default: #94A3B8;
  --border-neutral-bold-hovered: #64748B;
  --border-neutral-default-default: #CBD5E1;
  --border-neutral-default-disabled: #E2E8F0;
  --border-neutral-default-focused: #4F46E5;
  --border-neutral-default-hovered: #94A3B8;
  --border-neutral-disabled: #E2E8F0;
  --border-neutral-focused: #4F46E5;
  --border-neutral-hovered: #94A3B8;
  --border-neutral-subtle-default: #E2E8F0;
  --border-success-default-default: #10B981;
  --border-warning-default-default: #F59E0B;

  /* icon */
  --icon-accent-bold-default: #0D9488;
  --icon-brand-bold-default: #4F46E5;
  --icon-brand-bold-hovered: #4338CA;
  --icon-danger-bold-default: #EF4444;
  --icon-inverse-bold-default: #FFFFFF;
  --icon-neutral-bold-default: #0F172A;
  --icon-neutral-bold-disabled: #CBD5E1;
  --icon-neutral-bold-hovered: #020617;
  --icon-neutral-subtle-default: #64748B;
  --icon-neutral-subtle-disabled: #CBD5E1;
  --icon-neutral-subtle-hovered: #334155;
  --icon-success-bold-default: #10B981;
  --icon-warning-bold-default: #F59E0B;

  /* radius */
  --radius-2xl: 24px;
  --radius-full: 999px;
  --radius-lg: 12px;
  --radius-md: 8px;
  --radius-none: 0px;
  --radius-sm: 4px;
  --radius-xl: 16px;

  /* spacing */
  --spacing-10xl: 96px;
  --spacing-2xl: 20px;
  --spacing-3xl: 24px;
  --spacing-4xl: 32px;
  --spacing-5xl: 40px;
  --spacing-6xl: 48px;
  --spacing-7xl: 56px;
  --spacing-8xl: 64px;
  --spacing-9xl: 80px;
  --spacing-lg: 12px;
  --spacing-md: 8px;
  --spacing-none: 0px;
  --spacing-sm: 6px;
  --spacing-xl: 16px;
  --spacing-xs: 4px;
  --spacing-xxs: 2px;

  /* size */
  --size-2xl: 40px;
  --size-3xl: 48px;
  --size-4xl: 56px;
  --size-5xl: 64px;
  --size-lg: 24px;
  --size-md: 20px;
  --size-sm: 16px;
  --size-xl: 32px;
  --size-xs: 12px;

  /* elevation */
  --shadow-lg: 0px 1px 1px -1px rgba(2,6,23,0.14), 0px 2px 2px -2px rgba(2,6,23,0.10), 0px 6px 6px -3px rgba(2,6,23,0.08), 0px 20px 20px -4px rgba(2,6,23,0.06);
  --shadow-md: 0px 1px 1px -1px rgba(2,6,23,0.08), 0px 2px 2px -2px rgba(2,6,23,0.08), 0px 5px 5px -3px rgba(2,6,23,0.06), 0px 12px 12px -4px rgba(2,6,23,0.04);
  --shadow-sm: 0px 1px 1px -1px rgba(2,6,23,0.10), 0px 2px 2px -3px rgba(2,6,23,0.08), 0px 8px 8px -4px rgba(2,6,23,0.06);
  --shadow-xl: 0px 25px 50px -12px rgba(2,6,23,0.25);
  --shadow-xs: 0px 1px 2px 0px rgba(2,6,23,0.06);

  /* motion duration */
  --duration-deliberate: 400ms;
  --duration-fade: 220ms;
  --duration-instant: 0ms;
  --duration-layout: 320ms;
  --duration-state: 160ms;

  /* motion easing */
  --easing-default: cubic-bezier(0.23, 1, 0.32, 1);
  --easing-gentle: cubic-bezier(0.44, 0, 0.56, 1);
}
```

<!-- TOKENS:END -->

---

## Typography

Use the classes, not the variables:

```html
<h1 class="text-jumbo">…</h1>
<h2 class="text-h2">…</h2>
<p class="text-body-default-regular">…</p>
```

**Heading classes are responsive** — they carry the ramp across three breakpoints via media
queries (mobile base, ≥810 tablet, ≥1200 desktop). Do not add your own font-size media
queries on top.

**Body classes are constant** across breakpoints.

**Colour is not part of a text class.** Apply it separately:

```html
<h2 class="text-h2" style="color: var(--text-neutral-bold-default)">
```

---

## Worked example — a button

```css
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: var(--spacing-md);
  min-height: 44px;   /* check-ignore — touch target; no semantic token exists */
  padding: var(--spacing-lg) var(--spacing-3xl);
  border: none;
  border-radius: var(--radius-full);      /* a button is a PILL */
  font-family: var(--font-heading), system-ui, sans-serif;
  font-weight: 600;
  font-size: var(--font-size-16);
  cursor: pointer;
  transition: background var(--duration-state) var(--easing-default),
              color      var(--duration-state) var(--easing-default);
}

.btn-primary {
  background: var(--bg-brand-bold-default);
  color: var(--text-inverse-bold-default);      /* bold bg -> inverse text */
}
.btn-primary:hover  { background: var(--bg-brand-bold-hovered); }
.btn-primary:active { background: var(--bg-brand-bold-pressed); }
.btn-primary:disabled {
  background: var(--bg-brand-bold-disabled);
  color: var(--text-inverse-bold-disabled);
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-neutral-subtle-default);
  color: var(--text-neutral-bold-default);      /* subtle bg -> neutral text */
}
.btn-secondary:hover { background: var(--bg-neutral-subtle-hovered); }
```

---

## Worked example — an input

```css
.input {
  width: 100%;
  min-height: 44px;   /* check-ignore — see known gaps */
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--bg-neutral-subtlest-default);   /* FILLED, not white */
  border: var(--border-width-thin) solid var(--border-neutral-default-default);
  border-radius: var(--radius-md);
  font-family: var(--font-body), system-ui, sans-serif;
  font-size: var(--font-size-16);                   /* 16px min — stops iOS zoom */
  color: var(--text-neutral-bold-default);
  transition: border-color var(--duration-state) var(--easing-default);
}

.input::placeholder { color: var(--text-neutral-subtlest-default); }
.input:hover        { border-color: var(--border-neutral-hovered); }

.input:focus-visible {
  background: var(--bg-neutral-subtlest-focused);
  border-width: var(--border-width-default);        /* 2px — weight is part of the signal */
  border-color: var(--border-neutral-focused);
  /* the ring sits OUTSIDE the field, separated by the surface colour */
  outline: var(--border-width-default) solid var(--border-neutral-focused);
  outline-offset: var(--border-width-default);
}

.input[aria-invalid="true"] {
  border-width: var(--border-width-default);
  border-color: var(--border-danger-default-default);
  /* the FIELD'S OWN TEXT stays neutral — see State rules */
}

.input:disabled {
  background: var(--bg-neutral-subtlest-disabled);
  border-color: var(--border-neutral-disabled);
  color: var(--text-neutral-disabled);
  cursor: not-allowed;
}
```

---

## State rules

**Focus and error share the heavier border width** (`--border-width-default`, 2px). Default,
hover and disabled stay at `--border-width-thin` (1px). The weight change is part of the
signal, not just the colour — it survives being colour-blind and it survives a screenshot.

**Focus is an offset ring, and never `outline: none`.** Every focusable control gets the
same two lines:

```css
.button:focus-visible,
.input:focus-visible,
.checkbox:focus-visible + .box {
  outline: var(--border-width-default) solid var(--border-neutral-focused);
  outline-offset: var(--border-width-default);
}
```

**Why offset and not a border.** `--border-neutral-focused` and `--bg-brand-bold-default`
are the same colour. A focus ring drawn directly against a brand-filled button therefore
measures **1.00:1** — it is the fill. Darkening does not rescue it: the darkest step on the
ramp still only reaches 2.54:1 against that fill.

`outline-offset` puts a gap of page colour between the control and the ring, so the ring
contrasts with the *page* instead of the fill. Ring-to-gap, gap-to-fill and ring-to-page all
measure 6.29:1, clearing the 3:1 that WCAG 2.4.11 asks of a focus indicator — and the same
two lines work on every control, filled or not.

The Figma library draws this as a ring layer offset 2px outside the shape. Same geometry,
same tokens.

**Error colours the border and the message, never the field's own text.** A red placeholder
reads as invalid *content* on a field nobody has touched yet.

**Required is not an error.** The required marker uses `--text-brand-bold-default`, because
red should stay reserved for something actually being wrong.

**Disabled must still be legible.** Aim above 3:1. Disabled means unavailable, not invisible.

**Every interactive target is at least 44 × 44**, including when the visual element is
smaller — pad the hit area, don't grow the control.

---

## Motion

| Token | Use for |
|---|---|
| `--duration-instant` | the reduced-motion fallback |
| `--duration-state` | hover, focus, press on a control |
| `--duration-fade` | opacity only — shorter than layout on purpose |
| `--duration-layout` | size, position, reveal |
| `--duration-deliberate` | slow colour washes; use sparingly |
| `--easing-default` | the system curve — reach for this first |
| `--easing-gentle` | symmetrical; pairs with `deliberate` |

**Always transition specific properties, never `all`.** `transition: all` animates things
you didn't intend, including layout properties that then jank.

**Always honour reduced motion:**

```css
@media (prefers-reduced-motion: reduce) {
  * { transition-duration: var(--duration-instant) !important;
      animation-duration: var(--duration-instant) !important; }
}
```

---

## Elevation

`--shadow-xs | sm | md | lg | xl` is the scale. Reach for it in order — most UI needs `sm`
or `md` and nothing else.

If your system keeps a shadow outside the scale, **say so here explicitly**. An unmarked
exception is indistinguishable from a mistake, and the next person will "fix" it.

---

## Your output gets checked

What you write here is graded against the real token layer:

```bash
npm run check -- the-file-you-wrote.css
```

It fails on a raw hex and on a raw `px` or `rem` in a declaration — not only on a token name
that does not exist. Writing `#4F46E5` instead of `var(--bg-brand-bold-default)` renders
correctly and is still wrong: a rebrand moves everything around it and leaves it behind.

If a value you need genuinely has no token, do not invent one and do not write the literal
quietly. Hoist it into one named custom property at `:root`, say so, and name the token that
is missing. The gaps below are the ones already known.

---

## Constraints and known gaps

Rewrite this section for your system. It is the most useful part of the file, because it is
the part that stops a model confidently doing something wrong.

- **There is no dark mode.** The structure supports adding one; no values exist. Do not
  invent it, and do not infer it by reversing the light palette.
- **No brand colour works on an inverse surface.** The brightest brand text token is
  indigo-600, which fails contrast against both `--bg-inverse-bold-default` (gray-900) and
  `--bg-inverse-subtle-default` (gray-800). A required marker must be brand-coloured, so
  **a form cannot be built on a dark surface as specified.** Put the form on a raised light
  surface instead. The same gap applies to `border/brand` and `icon/brand` on inverse.
  Raise it rather than substituting a lighter indigo yourself.
- **There are no layout tokens.** No container width, column width or breakpoint exists,
  and a media query cannot read a custom property in any case. Declare the page's few
  layout constants in one block at the top of the page file, aligned to the type ramp's
  810 / 1200 breakpoints so layout never fights typography.
- **There is no touch-target token.** `contracts/components.md` requires 44×44 on every
  control, but 44px exists only as the primitive `--dimension-11`. Reach to it once, named,
  rather than writing `44px` at each control.
- **There are no mono text styles.** `--font-mono` is a token, but no mono text style is
  published, so the build emits no mono class. Compose one from the existing font variables.
  The 41 text styles are 20 body plus 7 headings across 3 breakpoints — none are mono.
- **Gradients are not tokens.** Figma cannot express them as variables. Any gradient is
  hand-maintained and will drift.
- **`line-height` is unitless, `letter-spacing` is in `em`.** Both scale with font size on
  purpose.
- **The dimension scale is Tailwind's.** `--spacing-xl` is 16px, matching `p-4`.
- Indigo and teal are starter ramps. Replace and contrast-test them before shipping a brand.
