# Step 7 — Reconcile Figma with the code layer

**Time:** 20 minutes · **Confirms:** the Figma file and the generated tokens agree

`tokens.json` and `tokens.css` already exist — Step 0 generated them from `src/values.mjs`
before any Figma work started. Steps 1 to 6 built the Figma file to match.

This step proves they actually match. Six steps of hand-built Figma work is enough surface
for a value to have been mistyped, a binding to have been missed, or an alias to point one
step off, and every one of those failures reports success (`traps.md`). The export-and-diff
below is what catches them.

It is also the step you return to whenever Figma has been edited directly — by you, or by
someone who does not use the pipeline.

---

## The concept

```
src/values.mjs  →  build-tokens.mjs  →  tokens.json  →  Style Dictionary  →  tokens.css
       │
       └──────────→  the setup skill  →  your Figma file
```

**`src/values.mjs` is the source of truth**, and both the Figma file and the stylesheet
are generated from it. Nothing downstream is edited by hand. The moment someone hand-edits
`tokens.css`, you have two sources of truth and no way to tell which is right.

**This prompt is the drift check.** When Figma has been edited directly — by you, or by a
teammate who does not use the pipeline — export it, diff it against the generated
`tokens.json`, and correct `src/values.mjs` so the two agree again.

`tokens.json` is DTCG format — the portable artifact. It's what you'd hand to a different
build, a different framework, or a different tool entirely.

`tokens.css` is plain custom properties. Deliberately not a Tailwind preset: custom
properties work everywhere, including Framer custom code, a plain HTML file, and whatever
Lovable generates. Build the universal artifact first.

---

## The trap that lives in this step

This is the one that fails in *someone else's project*, weeks later.

Style Dictionary emits fully-qualified names from the token path:

```css
--semantic-color-background-brand-bold-default: #4F46E5;
```

Nobody writes that by hand. Every human-facing document you produce — your `SKILL.md`, your
component specs — will use the short form:

```css
background: var(--bg-brand-bold-default);
```

If your stylesheet defines only the long names, **every short name resolves to nothing.**
No error, no warning — `var()` on an undefined property just produces no declaration. An
unstyled page with a clean console.

A real audit found **176 of 176** token names in a `SKILL.md` failing to resolve. The build
defined zero `--bg-*` properties, and a note in the repo actively claimed the two name sets
were interchangeable.

> **Fix:** generate an alias block. `scripts/build-css.mjs` does this — never hand-write it,
> derive it from the declared names so it cannot drift.

---

## The prompt

```
Export my Figma variables and styles, then build the code layer.

File key: 〈your file key〉

1. EXPORT
   Write a read-only use_figma script that reads every local variable and
   style, RESOLVING ALIASES to their final values, and outputs JSON.
   Include: collection, name, type, scopes, resolved value, and what each
   semantic points at.

2. RECONCILE
   Diff that export against tokens/dist/tokens.json. Report:
   - primitives whose value differs
   - semantics pointing somewhere different
   - anything in Figma that's missing from the package, and vice versa
   Tell me the counts. Don't fix anything yet — show me first.

3. UPDATE
   Write the reconciled values into tokens/src/values.mjs — the single
   input. Do not hand-write tokens.json or tokens.css; both are generated.

4. BUILD
   npm run build
   Then npm run verify

5. PROVE IT
   Do not tell me the build succeeded. Verify that the var() chains
   actually resolve:
   - resolve every custom property to a literal
   - report any dangling reference or cycle
   - spot-check five names from handoff/SKILL.md end to end

   Grepping the CSS is NOT proof — a name appearing in the file means a
   property was declared, not that its chain terminates in a value.

Report: token count, alias count, and the number of names in my SKILL.md
that fail to resolve. That last number must be 0.
```

---

## Two mismatches that are not drift

When you reconcile, these two will look like bugs and aren't:

- **Line height `160` in Figma vs `1.6` in the package.** Figma stores a percentage; CSS
  wants a unitless ratio. The build converts. Correct.
- **Letter spacing `-2` vs `-0.02em`.** Same thing.

Note them in your decision log so a future audit doesn't "fix" them back.

---

## Checkpoint

- [ ] the Figma export and `tokens.json` differ in **0** primitives and **0** semantics —
      or every difference is explained and reconciled in `src/values.mjs`
- [ ] `npm run build` completes
- [ ] `npm run verify` reports **0 broken chains**
- [ ] `--bg-brand-bold-default` resolves to your actual brand hex
- [ ] **0** names in your docs fail to resolve
- [ ] `tokens.json` and `tokens.css` are both listed as generated, and you have not
      hand-edited either

---

## Common failures

**The build succeeds and the page is unstyled.** The alias block is missing. This is the
one that gets past everything, because every individual piece reports success.

**Semantics that emit a hex instead of a `var()`.** A semantic is holding a raw value
somewhere. Go back to Step 2 — that count should be 0.

**Nobody can tell which file is authoritative.** Put it in writing at the top of every
generated file: *generated, do not edit, regenerate with `npm run build`*. Then put it in
`CLAUDE.md` too, because the next thing to edit these files will not be a human.
