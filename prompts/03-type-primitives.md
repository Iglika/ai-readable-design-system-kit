# Step 3 — Typography primitives

**Time:** 10 minutes · **Creates:** ~36 variables

Font families, sizes, weights, line heights and tracking. The raw material the text styles
in Step 4 are assembled from.

---

## The concept

**Two fonts.** One with personality for headings, one built for reading.

One font doing both jobs compromises at both ends: display faces get tiring at 16px, text
faces get characterless at 64px. The split is the single cheapest way to make a system look
considered.

**Style strings and weight numbers are different things.** Figma matches fonts by an exact
style *string* (`SemiBold`); CSS wants a *number* (`600`). You need both, stored separately:

```
font/style/semibold   = "SemiBold"    ← Figma binds this
font/weight/semibold  = 600           ← CSS uses this
```

Keeping only one of them means either Figma or your stylesheet is guessing.

---

## The trap that lives in this step

**Line height and letter spacing must NOT be bound to variables.**

Figma's float variables carry no unit. Bind `font/lineheight/160` to a text style and Figma
resolves it as **160 pixels**, silently overriding any percentage you set first. On a 12px
caption that is a line thirteen times too tall.

This is `traps.md` #1, and it is the most expensive trap in the whole build because nothing
errors. It was caught only when a specimen page came out 7,606px tall instead of 2,365px —
after every one of 36 text styles had already been built wrong.

> **Create the `font/lineheight/*` and `font/letterspacing/*` primitives anyway.** They are
> the source of truth for your CSS, where percentages work correctly. They just cannot drive
> Figma. Step 4 sets those two properties directly on each style.

---

## The prompt

```
Read contracts/naming.md and traps.md #1 before starting.

Add the typography primitives to the Primitives collection in my Figma file.

File key: 〈your file key〉

Create:
- font/family/heading and font/family/body  (STRING)
- font/style/{regular,medium,semibold,bold}  (STRING — the exact Figma
  style names)
- font/size/{each size in my ramp}  (FLOAT, scoped to FONT_SIZE)
- font/lineheight/{110,120,130,140,150,160}  (FLOAT)
- font/letterspacing/{normal,tight,tighter}  (FLOAT)
- font/paragraphspacing/{0,20,40}  (FLOAT)

Critical:
1. Before creating any style variable, call listAvailableFontsAsync() and
   confirm the EXACT style strings my two fonts actually expose. Do not
   guess casing — "SemiBold" and "Semi Bold" are different fonts to Figma.
   Show me the list.
2. Create font/lineheight/* and font/letterspacing/* as primitives, but
   note in your summary that they must NEVER be bound to a text style —
   Figma float variables carry no unit and will apply them as pixels.
3. Set scopes explicitly. font/size/* -> FONT_SIZE only.

My fonts: heading 〈name〉, body 〈name〉
My sizes: 〈list, or "use the starter kit ramp"〉

Report the available style strings you found, then what you created.
```

---

## Checkpoint

- [ ] `Type` groups appear inside `Primitives` — family, style, size, lineheight,
      letterspacing, paragraphspacing
- [ ] the style strings match what `listAvailableFontsAsync()` actually returned
- [ ] `font/size/*` is scoped to `FONT_SIZE` and appears nowhere else
- [ ] you have been told, in writing, not to bind line height or letter spacing

---

## Common failures

**"Font not found" on a style you can see in the Figma UI.** The style string casing is
wrong. `SemiBold`, `Semibold` and `Semi Bold` are three different strings and only one of
them exists for your family. This is one of the few traps that throws — take the gift.

**Both fonts are the same family.** Not a bug, but check it was a decision. If you genuinely
want one font, say so in the contract's decision log so nobody "fixes" it later.

**Line heights stored as pixels.** If your source data has `22.4px`, that is `140%` already
multiplied out. Convert it back to a percentage. Fractional values never become tokens.
