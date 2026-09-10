# Step 4 — Text styles

**Time:** 20 minutes · **Creates:** 41 text styles

The composite layer for typography. After this step you apply `Heading/Desktop/H1` to a
layer with one click and get family, weight, size, line height and tracking together.

---

## The concept

**Text styles ARE the semantic layer for type.** There is no `semantic/typography/*`
variable group, because Figma variables cannot express a composite. A text style is the
only container that holds five properties as one decision.

This also means text styles appear in the **Styles** panel, not the Variables panel. If
your type semantics show "0 variables", that is correct — look in Styles.

**Text styles cannot consume modes** (`traps.md` #9). So a responsive ramp has to be
explicit styles per breakpoint — `Heading/Desktop/H1`, `Heading/Tablet/H1`,
`Heading/Mobile/H1` — not one style reading from a breakpoint mode. That is more styles,
and it is the only thing that works.

### Three breakpoints

Desktop ≥1200 · Tablet 810–1199 · Mobile <810.

Three is almost always enough. **If two breakpoints hold identical values, you have a
breakpoint, not a decision.** A real audit found an H2 with a unique 1440px breakpoint that
made it render identically to H3 between 1200 and 1439 — the width most laptops sit at. The
hierarchy collapsed on the most common desktop size and nobody had noticed for two years,
because it was never visible in one place.

**Body is constant across breakpoints.** Reading size doesn't need to respond; 16px is 16px
everywhere.

---

## The prompt

```
Read contracts/naming.md and traps.md #1 and #9 first.

Create the text styles in my Figma file from the ramp in my naming contract.

File key: 〈your file key〉

Structure:
- Heading/{Desktop,Tablet,Mobile}/{Jumbo,H1,H2,H3,H4,H5,H6}   = 21 styles
- Body/{Large,Medium,Default,Small,Tiny}/{Regular,Medium,SemiBold,Bold}
                                                              = 20 styles

For each style:
- BIND fontFamily, fontStyle, fontSize and paragraphSpacing to the
  primitives from Step 3
- DO NOT BIND lineHeight or letterSpacing. Set them DIRECTLY on the style
  as {value: N, unit: 'PERCENT'}. Figma float variables carry no unit and
  binding them applies pixels — a 160% line height becomes a 160px line.
  This is traps.md #1 and it fails silently.
- loadFontAsync() every family/style pair before setting text

After creating them, build me a specimen page:
- one frame, every style stacked in order, labelled with its name and its
  actual resolved size/line-height
- headings grouped by breakpoint so I can see the ramp

Then TELL ME THE FRAME'S TOTAL HEIGHT and what it should be if every line
height resolved as a percentage. If those two numbers disagree by more than
a few pixels, line heights bound as pixels somewhere — find it and fix it
before reporting done.

Screenshot the specimen page.
```

---

## Why the height check is in the prompt

Because it is the only cheap way to catch trap #1.

A ramp with pixel line heights looks *structurally* perfect — every style exists, every
binding reports correctly, the Styles panel is beautifully organised. It is wrong by an
order of magnitude and the only symptom is a page that is three times too tall.

Asking the model to compute the expected height and compare turns an invisible failure into
a number that disagrees with another number.

---

## Checkpoint

Open the **Styles** panel (paintbrush icon, right sidebar).

- [ ] `heading/` and `body/` groups, 41 styles total
- [ ] the specimen page renders at roughly the height it should
- [ ] a 12px caption is about 19px tall, **not 160px**
- [ ] `Type Semantic` shows 0 variables — correct, these are Styles
- [ ] applying `Heading/Desktop/H1` to a layer sets all five properties at once

---

## Common failures

**The specimen page is enormous.** Trap #1. Line heights bound as pixels. Fix by setting
them directly rather than binding, then rebuild the styles.

**Letter spacing is subtly wrong everywhere.** Same trap, quieter symptom — `-4` became
−4px instead of −4%. On a 64px heading that is barely visible; on a 12px label it closes
the letters up noticeably.

**Styles exist but apply nothing.** The font wasn't loaded before the style was written.
`loadFontAsync()` on every family/style pair, then rebuild.

**Two breakpoints with identical values.** Delete one. You have a breakpoint, not a
decision.
