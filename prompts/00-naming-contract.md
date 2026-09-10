# Step 0 — Lock the naming contract and the values

**Time:** 30 minutes · **Writes to Figma:** nothing · **Creates:** `tokens.json`, `tokens.css`

> The only step with no Figma output, and the one that decides whether the other eight work.
> Skip it and you will get a system that is 90% consistent, which is the same as inconsistent
> — you just can't predict where.

---

## Why this comes first

An LLM writing your variables needs a rule it can apply to a token it has never seen. Give
it examples instead of a rule and it will interpolate, plausibly and slightly differently
each time: `bg-primary` in one batch, `background-brand` in the next.

Each name works. Together they are not a system, and no amount of later tidying makes them
one, because **renaming a Figma variable silently unbinds every layer using it** (`traps.md`
#4). Names are the one thing that is genuinely expensive to change later.

So: decide first, in writing, in a file the model can read.

---

## Before you start

Have ready:

- your brand colours — at minimum one hex you consider "the brand colour"
- two font names, both installed in Figma and available on Google Fonts
- 20 minutes where you are not also doing something else

You do **not** need a full palette. Step 1 generates ramps from a base step.

---

## The prompt

```
Read contracts/naming.md in full.

I'm building a design system in Figma that an LLM will read and build from.
Help me fill in this contract for my brand. Work through it with me section
by section — don't fill it all in at once and don't guess my brand decisions.

My starting point:
- Brand colour: 〈#HEX, or describe it〉
- Accent colour: 〈#HEX, or "pick one that works"〉
- Heading font: 〈name〉
- Body font: 〈name〉
- What I'm building: 〈marketing site / product UI / both〉

For each section, tell me what the default is, what it would cost me to
change it, and ask only about the decisions that are genuinely mine. Where
the contract states a rule with a reason, keep the rule — I want to
understand it, not relitigate it.

Two things I want you to push back on:
- if I ask for a token I don't have a use for yet
- if I name a primitive after its purpose instead of what it is

When we're done, write the completed file back to
contracts/naming.md and give me a one-screen summary of every
decision, including anything I chose NOT to build and why.
```

---

## What to expect

A conversation, not a file dump. The model should be asking you maybe eight to ten
questions, most of them about colour roles and how many hues you actually need.

Sections you will genuinely decide:

- which hues exist, and which is brand vs accent
- whether you need `warning` (many marketing sites don't)
- your two fonts
- your type ramp sizes — or accept the default, which is fine

Sections you should **not** change on a first build:

- the two-collection architecture
- the `property/intent/emphasis/state` grammar
- Tailwind's dimension scale
- the scopes table

---

## Checkpoint

Before moving to Step 1, your `contracts/naming.md` should have:

- [ ] no remaining `〈…〉` placeholders
- [ ] every hue named for **what it is**, not what it's for (`indigo`, not `brand`)
- [ ] a decision log with at least one entry
- [ ] at least one thing you deliberately did **not** build, with the reason written down

That last one matters more than it looks. An absence with a reason is a decision. An
absence without one looks like an oversight, and the next person — possibly you — will
"fix" it.

---

## Then write the values

The contract settles the *names*. This settles the *numbers* — and it happens before Figma,
not after, so that every later step builds against values that are already verified.

`tokens/src/values.mjs` is the single input for the whole system. Both the Figma file
and the code layer are generated from it, which is what stops a rebrand having to be done
twice and drifting.

```text
Open tokens/src/values.mjs and replace the placeholder values with the
decisions from contracts/naming.md:

  COLOR      the hues you kept, eleven steps each (50-950)
  FONT       family names, Figma style strings, and the CSS weight numbers
  SEM_COLOR  only the cells you decided you need — do not fill the matrix

Leave the structure exactly as it is. Change nothing below the export.

Then run, from the repository root:

  npm run build
  npm run verify

Report the token count and the verification result. If verification does not
end with "every chain terminates in a real value", stop and show me what
failed — do not continue to Step 1.
```

You now have `tokens.json`, `tokens.css` and a proven set of values. Steps 1 to 6 build the
Figma file to match them, so Figma is constructed against known-good numbers instead of
being exported and checked afterwards.

Font style strings are the one thing you cannot verify here — they are family-specific and
Figma throws on a wrong one. Step 3 checks them with `listAvailableFontsAsync()`. See
`traps.md` #10.

---

## Checkpoint — before Step 1

- [ ] `npm run verify` ends with `every chain terminates in a real value`
- [ ] the token count matches what you expected from the contract
- [ ] `tokens.css` contains your brand ramp, not indigo

---

## Common failure

**Filling the matrix.** 4 properties × 7 intents × 3 emphases × 5 states is 420 cells and
you need about 110. If the model offers you a complete grid, say no.

The 420-token version is not more thorough than the 110-token version. It is unfinished
work wearing the costume of finished work — every cell is a guess nobody has tested against
a real component, and you now maintain all of them.

> A token that has never been bound to anything has absorbed no decisions.
> Build for what exists.
