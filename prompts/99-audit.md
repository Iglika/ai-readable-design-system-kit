# The audit

**Run this before you call the system done.** Not as a formality — as the step that tells
you whether the previous eight actually worked.

---

## Why a separate audit step

Because every failure mode in `traps.md` reports success.

The Figma plugin API accepts a great deal of input that is structurally valid and
semantically wrong. Style Dictionary happily builds a stylesheet whose names nothing uses.
An LLM will tell you a component is correct because it built what you asked for — which is
a different claim from *the output is right*.

> **Audit the rendered result, never the operation.**
>
> "Is this paint bound to a variable?" and "does this paint render the colour that variable
> holds?" are different questions with different answers more often than you'd believe.

---

## The prompt

```
Audit my design system against the checklist below. This is a verification
pass, not a build pass — do not fix anything until you've reported
everything.

File key: 〈your file key〉

Verify MECHANICALLY, not by eye. Write a read-only use_figma script that
reads the real state of the file and reports numbers. Where a check is
about rendered appearance, screenshot it.

FIGMA
 1. semantics holding a raw value                    expect 0
 2. semantics whose alias chain doesn't resolve      expect 0
 3. variables with ALL_SCOPES                        expect 0
 4. Primitives.hiddenFromPublishing                  expect true
 5. text styles with a PIXEL line height             expect 0
 6. specimen page height vs. computed expected       within a few px
 7. component paints with no binding                 expect 0
 8. component paints where cached colour != resolved
    token value  (this is a DIFFERENT check from 7)  expect 0
 9. raw layout values in components                  expect 0
10. interactive targets under 44x44                  expect 0

CODE
11. every custom property resolves to a literal      expect 100%
12. token names in SKILL.md that fail to resolve     expect 0
13. tokens.json vs Figma: primitive value mismatches expect 0
14. tokens.json vs Figma: semantic alias mismatches  expect 0

For each check report the actual number, not a verdict. If a number is
non-zero, list the specific offenders.

Then, separately: tell me anything you found that ISN'T on this list and
looks wrong.
```

---

## The two checks people skip

**#8 — drifted paints.** Check 7 asks whether a binding exists. Check 8 asks whether the
rendered colour agrees with it. A build once had 13 paints across 9 variants render solid
black while passing check 7 perfectly. They are not the same check and you need both.

**#12 — doc names resolving.** The failure lands in someone else's project, weeks later, as
an unstyled page with a clean console. One audit found 176 of 176 names failing.

---

## Two results that look like failures and aren't

- **Line height `160` in Figma, `1.6` in the package.** Figma stores percentages; CSS wants
  a ratio. The build converts.
- **Letter spacing `-2` vs `-0.02em`.** Same.

Record both in your decision log so the next audit doesn't "fix" them.

---

## What a passing audit looks like

Every number zero, and a specimen page that renders at the height it should.

That is a real result and worth pausing on: it means a model can now read your system and
build with it, and you can check that it did. Most design systems can't make either claim.

---

## After it passes

- **Screenshot the Variables and Styles panels.** These become the "what done looks like"
  reference for anyone you hand this to.
- **Write down the counts.** Collections, variables, styles, tokens. They're the baseline a
  future audit diffs against.
- **Test cold.** New session, no context, ask for a page section. That's the real exam.
