# The traps

*Fourteen ways this goes wrong. **Every one of them fails silently.** No error is thrown —
the output is just wrong, and it stays wrong until someone looks at the right thing.*

This is the page to read before you start, not after. Most of these cost hours to diagnose
and seconds to avoid, and none of them are findable by searching for an error message —
because there isn't one.

---

## The shape of the problem

When an LLM writes your design system through the Figma plugin API, it is doing hundreds
of small operations you never see. The API is permissive: it accepts a great deal of input
that is *structurally valid* and *semantically wrong*, and it reports success either way.

So the ordinary verification instinct — "did it error? no? good" — is worthless here.
You have to check the thing itself.

> **The rule that generalises across all fourteen: audit the rendered result, never the
> operation.** "Is this paint bound to a variable?" is the wrong question. "Does this paint
> render the colour that variable holds?" is the right one. They come apart more often than
> you would believe.

---

## 1 · Float variables carry no unit

**The worst one.** Figma's float variables are bare numbers. Bind one to a property that
expects a unit and Figma resolves it as **pixels**, overriding a percentage you set moments
earlier.

```
font/lineheight/160  →  bound to a 12px text style
Expected:  160%  =  19.2px line
Actual:    160px line
```

A caption renders thirteen times too tall. Letter spacing fails identically: `-4` becomes
−4px, not −4%.

**How it surfaces:** it doesn't, until you look at something. This was caught on a specimen
page that came out 7,606px tall when it should have been 2,365px. Every one of 36 text
styles was wrong. Nothing errored.

> **Fix:** bind only unitless or inherently-pixel properties. `fontFamily`, `fontStyle`,
> `fontSize` and `paragraphSpacing` bind correctly. **Set `lineHeight` and `letterSpacing`
> directly on the style** as `{value, unit:'PERCENT'}`. Keep the primitives — they're the
> source of truth for CSS, where percentages work fine. They just cannot drive Figma.

**Detect it:** build one specimen page with every text style stacked. Check its height
against what it should be. A ramp with this bug is off by an order of magnitude, not a
few pixels — it's obvious the moment anything renders.

---

## 2 · A correctly-bound paint can still render the wrong colour

Build a paint as a placeholder and then bind a variable to it:

```js
const paint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
figma.variables.setBoundVariableForPaint(paint, 'color', variable);
```

The binding attaches correctly. The paint's **cached base colour** can stay at the `{0,0,0}`
placeholder. The node renders solid black and reports a perfectly correct variable binding.

This hit 13 paints across 9 variants of a button component set. Every one passed a binding
audit, because "is it bound?" returns true.

> **Fix:** resolve the variable down its alias chain to a raw RGB first, use *that* as the
> paint's base colour, **then** bind.

**Detect it:** your audit must check two different things.

| Check | Question |
|---|---|
| `unboundPaints` | is there a binding at all? |
| `driftedPaints` | does the cached colour equal the resolved token value? |

And **screenshot after every batch.** This bug is invisible in structural metadata and
unmissable on sight.

---

## 3 · Short names resolve to nothing

The silent one that costs the most, because it fails *downstream*, in someone else's project.

Style Dictionary emits fully-qualified names from the token path:

```css
--semantic-color-background-brand-bold-default: #4F46E5;
```

Nobody writes that by hand, and no LLM reliably reproduces it. So every human-facing
document — your `SKILL.md`, your component specs — uses the short form:

```css
background: var(--bg-brand-bold-default);
```

If your stylesheet defines only the long names, **every short name resolves to nothing.**
Not an error. Not a warning. `var(--nonexistent)` with no fallback produces no declaration
at all. You get an unstyled page and a clean console.

Found by audit: **176 of 176** token names in a `SKILL.md` failed to resolve. The build
defined zero `--bg-*` properties. A note in the repo actively claimed the two name sets
were interchangeable.

> **Fix:** generate an alias block — see `scripts/build-css.mjs`. Never hand-write it;
> derive it from the declared names so it cannot drift.

**Detect it:** `npm run verify`. Grepping the CSS is **not** proof — a name appearing in
the file tells you a property was declared, not that its `var()` chain terminates in a
value. `scripts/verify.mjs` follows every chain to the end.

---

## 4 · Renaming silently unbinds everything

Rename a variable and Figma does not rebind the layers using it. It **unbinds** them. Each
layer keeps the last value it had, now as a raw hardcoded value, and looks completely fine.

You will discover this when you change the variable and nothing updates.

> **Fix:** never rename a variable you intend to keep. Get names right in the naming
> contract, before anything is bound.

**Detect it:** count bound layers before and after. And do all your renaming in the window
*before* components exist — that window is free, and it closes fast.

---

## 5 · Auto-layout frames default to a white fill — and clip their children

`figma.createFrame()` with auto-layout gives you two defaults nobody wants:

- **a white fill** — invisible on a white canvas, glaring on any other surface
- **`clipsContent = true`** — which crops the drop shadow off everything inside it

The second one is nastier: your elevation styles are applied, correct, bound, and
invisible. You will check the shadow style three times before you think to check the
parent frame.

> **Fix:** on every layout-only container, set `fills = []`. Around anything with a shadow,
> set `clipsContent = false`.

**There is a third cause of the same symptom, and it is the worst of them: an effect on the
root of a `COMPONENT` or `INSTANCE` is never painted at all.** Not on canvas, not in any
export. The same effect array on a plain frame or an auto-layout frame renders perfectly.

What makes it vicious is that the node's *bounds* grow to include the effect even though the
paint does not — a focused button measured 100×58 against 92×50 for the unfocused one,
exactly the 4px ring on each side. `effects` reads back correct, `effectStyleId` matches, the
geometry agrees. Only the pixels disagree, and the bounds argue against you.

> **Fix:** put the effect on a child frame, not on the component root. For a focus ring, an
> absolutely-positioned child inset `-4` with a 2px inside stroke gives you ring + gap and
> renders everywhere.

---

## 6 · `setBoundVariableForEffect` returns a NEW effect

It does not mutate in place. If you don't capture and reassign the return value, the
binding evaporates and you keep the original unbound effect.

```js
// wrong — binding is discarded
figma.variables.setBoundVariableForEffect(effect, 'color', variable);

// right
const bound = figma.variables.setBoundVariableForEffect(effect, 'color', variable);
node.effects = [bound];
```

Bindable effect fields: `color`, `radius`, `spread`, `offsetX`, `offsetY`.

**And the array order is the reverse of CSS.** `box-shadow: A, B` paints **A** on top;
Figma's `effects: [A, B]` paints **B** on top. A ring translated layer-for-layer out of CSS
therefore comes out inside-out — and when the two layers are a fill colour and a surface
colour, the result is not a visibly wrong ring, it is **no ring at all**.

---

## 7 · Alpha cannot be applied on top of an alias

You cannot alias a colour variable and then set opacity on it. The alias resolves to a
solid colour; the opacity lives on the paint, not the token, so it is invisible to your
system and drifts immediately.

> **Fix:** anything translucent needs its **own primitive with the alpha baked in** —
> `color/shadow/black-10` holds `rgba(2,6,23,0.10)`, not a solid at 10%.

This is why shadow colours are primitives rather than aliases of `gray/950`, and why there
are seven of them instead of one.

---

## 8 · Gradients cannot be tokens

`VariableResolvedDataType` is `BOOLEAN | COLOR | FLOAT | STRING`. `setBoundVariableForPaint`
accepts `SolidPaint` only. `ColorStop.color` is a raw readonly RGBA with no binding field.

There is no way to express a gradient as a variable. It is not a gap in your knowledge.

> **Fix:** gradients live as **paint styles**, with their stops documented by convention and
> updated by hand. Write down in your contract that they will drift, so the drift is a known
> cost rather than a surprise.

---

## 9 · Text styles cannot consume modes

You cannot put your responsive ramp in a Desktop/Tablet/Mobile mode collection and have
text styles read from it. Text styles don't take modes.

A responsive ramp must be **explicit styles per breakpoint** — `Heading/Desktop/H1`,
`Heading/Mobile/H1`. That is more styles, and it is the only thing that works.

Attempting it the other way produces tokens that look right in the Variables panel and
cannot be applied to a text layer.

---

## 10 · Font style strings must be verified, not guessed

Font styles are matched by exact string. `SemiBold` is not `Semibold`, `Semi Bold`, or
`600`. Guessing throws — this is one of the few in this list that *does* error, which makes
it the friendliest problem here.

> **Fix:** call `listAvailableFontsAsync()` and read the real style strings for your family
> before binding anything. Do it once, at the start, and keep the list.

Also: `loadFontAsync()` every font/style pair before setting text. Missing this throws too.

---

## 11 · The Figma connection reports something other than what you asked it

Two versions of the same trap. Both produce confident, completely wrong conclusions, and
neither throws.

**a · The read tools ignore your `fileKey`.** `get_metadata` and `get_screenshot` operate on
**whatever file is open in the Figma desktop app**. `use_figma` genuinely honours `fileKey`.

In one case `get_metadata` reported a design system file as a single empty "Page 1", so it
looked like the entire token system had been lost. A blank Untitled document happened to be
open in Figma desktop. The real file was intact — 162 primitives, 123 semantics, 36 text
styles.

**b · "Connected" is not "capable."** `claude mcp list` reporting
`figma-desktop … ✔ Connected` tests the transport and nothing else. The server on
`127.0.0.1:3845` may be the **`Figma Dev Mode MCP Server`**, which exposes six tools — all
reads, no `use_figma`, no `create_new_file`. Every build step in this guide then fails, and
the health line still says the connection is fine.

Registering the server is necessary and not sufficient. So is restarting the session: an
afternoon went into "MCP servers load at session start," which is true, and was not the
problem.

> **Fix:** ask for the tool names, not the connection status, and have the model report the
> server's own name. **When two sources disagree, trust the one that enumerates.**
> Keep the file you're working on open and focused in the desktop app.

---

## 12 · Publishing your primitives breaks the tier rule

If the `Primitives` collection is published, every consumer of your library can reach a
primitive directly. They will. `color/indigo/500` is right there in the picker, it works
today, and nothing stops it.

Then you rebrand, change the semantic alias, and half the product doesn't move — because
nothing recorded that those layers meant *brand*, only that they meant *indigo*.

> **Fix:** `Primitives.hiddenFromPublishing = true`. The tier rule enforced physically
> rather than documented hopefully.

---

## 13 · A variant axis and an instance-swap property cannot both drive one slot

Add an `INSTANCE_SWAP` component property and its default is applied to that nested instance
in **every variant of the set**.

A Form Field built with four state-matched controls — default, focused, error, disabled —
lost all four the moment a `Control` swap property was added. Every one silently repointed to
the default control. The red error border and the focus ring vanished, while the component
went on reporting four distinct states and passing every structural check.

The property wins. Always.

> **Fix:** pick one. If the nested control must change per state, drive it from the variant
> axis and do not expose a swap property. If consumers must be able to swap the control, add
> a `Control type` axis instead. Whichever you drop is an API change — document the
> migration.

---

## 14 · Focus cannot be a border on a brand-filled control

Your focus colour and your primary fill are almost certainly the same value. In this system
both resolve to `indigo/600`, so a focus border on a primary button measures **1.00 : 1** —
the ring *is* the fill.

The instinct is to darken the focus token. It does not work. No step on the ramp escapes:

| Focus ring | vs primary fill | vs page |
|---|---|---|
| indigo/700 | 1.26 | 7.90 |
| indigo/800 | 1.58 | 9.93 |
| indigo/950 | 2.54 | 15.99 |

A same-hue ring on a same-hue fill cannot reach 3:1 by darkening, because the two values
move together.

> **Fix:** offset the ring. A 2px gap in the *surface* colour between control and ring means
> the ring contrasts with the page instead of the fill — ring-to-gap, gap-to-fill and
> ring-to-page all land at 6.29:1, clearing WCAG 2.4.11. In CSS that is `outline` plus
> `outline-offset`; in Figma it is a ring child frame (see trap 5).

This one is invisible to every structural audit. The binding is correct, the token is
correct, nothing has drifted — and the control has no visible focus state.

---

## The audit that catches all fourteen

Run this before you call the system done. It is the difference between a system you believe
in and one you hope about.

| # | Check | Expected |
|---|---|---|
| 1 | semantics holding a raw value | **0** |
| 2 | paints bound to a variable | 100% |
| 3 | paints whose rendered colour ≠ resolved token | **0** |
| 4 | layout values not from the scale | **0** |
| 5 | variables with `ALL_SCOPES` | **0** |
| 6 | `Primitives.hiddenFromPublishing` | `true` |
| 7 | text styles whose line height is in px | **0** |
| 8 | doc token names that resolve in `tokens.css` | 100% |
| 9 | specimen page height vs. expected | within a few px |
| 10 | interactive targets under 44×44 | **0** |
| 11 | component axes match the written contract | exact |
| 12 | focus indicator contrast, ring vs fill *and* ring vs page | **≥ 3:1** |

Items 3, 7 and 8 are the ones that catch the silent failures. Item 11 is the one no
self-consistency check can catch: a system can pass all ten numbers and still disagree with
its own documentation — a build here shipped four Button states where the contract specified
five, and ten green checks said nothing. Items 1, 5 and 6 are the ones
that keep the system honest six months from now.

**And screenshot.** Every batch. Half of this list is invisible in metadata and obvious in
a picture.
