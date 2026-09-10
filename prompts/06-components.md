# Step 6 — Components

**Time:** the long step — budget an afternoon · **Creates:** 9 component sets

Where the token layer stops being theoretical. Nothing tests a design system like binding a
real component to it.

---

## The concept

```
component  →  semantic  →  primitive
```

**Components read semantics. Never reach past a semantic to a primitive.**

A primitive says what a colour *is*. A semantic says what it's *for*. Using
`color/indigo/600` for a button background works today and breaks the first time your brand
changes, because nothing recorded that it was *the brand colour* rather than just some
indigo.

The only legitimate use of a primitive in a component is when no semantic exists for that
role — and that usually means a semantic is missing, not that the rule should bend.

---

## Binding will change your tokens. That is the point.

Expect this, and don't treat it as rework.

A real build bound eight components to a token layer that had been carefully designed
first. **Nine semantic aliases changed as a result** — not because the tokens were sloppy,
but because a token layer that has never been bound to anything has never been tested.

What surfaced:

| Found | Fix |
|---|---|
| disabled background too pale to read as disabled | one step darker |
| focus border identical to the brand fill — focus ring invisible on brand buttons | move focus darker |
| disabled text at 2.4:1 | one step darker, to 3.9:1 |
| a text colour that passed on white and failed on its own field's tinted background | one step darker |

Every one of those is invisible until a component exists. **None of them added a raw value**
— they re-pointed existing aliases, which is exactly what the semantic layer is for.

> If binding your first component changes nothing, you probably haven't looked hard enough.

---

## Nine families, in dependency order

`Icon → Button → Input → Textarea → Select → Checkbox → Radio → Toggle → Form Field`

Icon first because four families nest it. Form Field last because it composes the rest.
Build in this order and nothing waits on something that doesn't exist yet.

Every family's public API — variant axes and component properties — is specified in
`contracts/components.md`. **Those names are contracts.** Renaming an axis there
is an API change, and it breaks the code side without any error.

**Button** and **Input** are written out in full below, because between them they teach
every move: variants, states, the `bold`/`inverse` contrast pairing, borders, focus, error,
and the difference between required and wrong. The remaining seven use the follow-on prompt
after them.

---

## The prompt — Button

```
Read contracts/naming.md, traps.md and handoff/SKILL.md first.

Build a Button component set in my Figma file.

File key: 〈your file key〉

Variants:
- variant: primary, secondary, ghost, danger
- size: sm, md, lg
- state: default, hovered, pressed, disabled

Every visual property binds to a SEMANTIC token. Zero primitives, zero raw
values — no hex, no px. If you need something the semantic layer doesn't
have, STOP and tell me which token is missing rather than reaching for a
primitive.

Rules:
- primary = background/brand/bold/* with text/inverse/bold/* on it
- secondary = background/neutral/subtle/* with text/neutral/bold/*
- ghost = transparent, text/brand/bold/*
- danger = background/danger/bold/* with text/inverse/bold/*
- padding from semantic/spacing/*, radius from semantic/radius/*
- every interactive target at least 44x44
- transitions use semantic/motion/duration/state and easing/default

CRITICAL (traps.md #2): when binding a paint, resolve the variable down its
alias chain to a raw RGB and use THAT as the paint's base colour BEFORE
calling setBoundVariableForPaint. Building the paint as {0,0,0} and then
binding leaves the cached colour black — the node renders solid black while
reporting a perfectly correct binding.

Present the set the way a design system documents a component: a white
section frame, padding 48, itemSpacing 32, a title in Heading/Desktop/H3
and a one-line description in Body/Default/Regular.

Then audit and report separately:
- unboundPaints  (paints with no binding)
- driftedPaints  (bound, but cached colour != resolved token value)
- any raw layout value
- any target under 44x44
- any token you needed that doesn't exist

Screenshot every variant.
```

---

## The prompt — Input

```
Same file, same rules. Build an Input component set.

Variants:
- state: default, hovered, focused, filled, error, disabled
- with/without label, with/without helper text

Design decisions to follow:
- the field is FILLED (background/neutral/subtlest/*) with a thin border —
  not white with a grey outline
- focus and error use border-width/default (2px); default, hover and
  disabled stay at border-width/thin (1px). The weight change is part of
  the signal, not just the colour.

Two rules that are easy to get wrong:
- ERROR COLOURS THE BORDER AND THE MESSAGE, NEVER THE FIELD'S OWN TEXT.
  A red placeholder reads as invalid content on a field nobody has touched.
- REQUIRED IS NOT AN ERROR. The required marker uses text/brand/bold/default,
  because red should stay reserved for something actually being wrong.

Same audit and the same screenshots.
```

---

## The prompt — the remaining seven

```
Same file, same rules, same audit. Build the rest of the set in this order:
Textarea, Select, Checkbox, Radio, Toggle, Form Field. (Icon first if you
have not already built it — Button, Input, Select and Checkbox all nest it.)

Take every variant axis and component property from
contracts/components.md exactly as written. Do not improve the
names. They are a public API shared with the code side.

State vocabulary, from the contract:
- text controls: Default, Hovered, Focused, Filled, Error, Disabled
  — Select also has Open
- choice controls: Default, Hovered, Focused, Error or Pressed where it
  means something, Disabled
- Button: Default, Hovered, Pressed, Focused, Disabled

What each one is actually testing — tell me if any of these turns out to be
false for my system:
- Textarea: that the Input decisions were about FIELDS, not about one height
- Select: Open is the first state that isn't about the pointer
- Checkbox: a second variant axis, and an indicator that isn't text
- Radio: identical to Checkbox except it cannot be unchosen
- Toggle: commits immediately — the state IS the save, so there is no
  pending appearance to design
- Form Field: label, control, helper, error and required composed together.
  Nest the real components; do not redraw them.

Build them ONE AT A TIME. After each, run the same audit — unboundPaints,
driftedPaints, raw layout values, targets under 44x44, missing tokens — and
screenshot it before starting the next. Stop and tell me if a count is not
zero rather than carrying it into the next component.
```

**One at a time is the whole instruction.** Nine components built in one pass and audited at
the end gives you nine components with the same mistake in them.

---

## Checkpoint

- [ ] nine component sets exist, each presented in a titled section frame
- [ ] every variant axis and property matches `contracts/components.md` exactly
- [ ] **unbound paints: 0**
- [ ] **drifted paints: 0** — this is the separate check that catches trap #2
- [ ] no raw hex or px anywhere in any of them
- [ ] every target ≥ 44×44
- [ ] you have a list of tokens the components needed and the system lacked

---

## Common failures

**Everything renders black.** Trap #2, and it will pass a binding audit. The two checks are
different questions: *is this bound?* and *does it render what it's bound to?*

**A "just this once" primitive.** The moment a component reaches past the semantic layer,
the tier rule is decoration. If a semantic is genuinely missing, add it — that's a decision
worth making explicitly, and it belongs in the contract's decision log.

**Audits that only report success.** Ask for the numbers, not the verdict. "Zero unbound
paints" is a fact. "The component is correct" is an opinion, and it's the model's.
