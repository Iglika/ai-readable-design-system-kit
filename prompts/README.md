# The prompts

Route 2: build the whole system in a blank Figma file, using your own brand values.

Run them in order. Each one assumes the previous one passed its checkpoint.

| | Step | Time | Produces |
|---|---|---|---:|
| 00 | [Naming contract and values](00-naming-contract.md) | 30 min | `contracts/naming.md`, `tokens/src/values.mjs`, `tokens/dist/` |
| 01 | [Colour primitives](01-color-primitives.md) | 10 min | ~75 variables |
| 02 | [Semantic colour](02-semantic-color.md) | 20 min | ~110 variables, all aliases |
| 03 | [Type primitives](03-type-primitives.md) | 10 min | ~36 variables |
| 04 | [Text styles](04-text-styles.md) | 20 min | 41 text styles |
| 05 | [Layout, radius, elevation, motion](05-layout-tokens.md) | 15 min | ~29 primitives, 33 semantics, 5 effect styles |
| 06 | [Components](06-components.md) | an afternoon | 9 component families, 134 variants |
| 07 | [Reconcile Figma with the code layer](07-code-layer.md) | 20 min | Proof that Figma and the tokens agree |
| 08 | [Handoff](08-handoff.md) | 20 min | `handoff/SKILL.md`, `handoff/CLAUDE.md` |
| 99 | [Audit](99-audit.md) | — | The gate. Run before calling it done |

Roughly two hours, plus an afternoon for components.

## Values come before Figma

Step 00 writes your brand values into `../tokens/src/values.mjs` and verifies them
*before* anything is created in Figma. Steps 01 to 06 then build the Figma file to match
values that are already known-good, rather than building first and checking afterwards.

`tokens/src/values.mjs` is the single input for the whole system — the Figma file and the code
layer are both generated from it. That is what stops a rebrand having to be done twice.

## Read alongside

| | |
|---|---|
| [`../traps.md`](../traps.md) | The fourteen failure modes. Every one of them reports success — this is the reason the audit exists |
| [`../contracts/naming.md`](../contracts/naming.md) | The grammar every prompt applies. Step 00 fills it in |
| [`../contracts/components.md`](../contracts/components.md) | Component families, variant axes and property APIs. Those names are contracts |

## The one-shot alternative

[`one-shot.md`](one-shot.md) attempts steps 01–06 in a single pass. It is faster when it works and harder to debug when it does not,
because a failure in step 4 surfaces as a wrong pixel in step 6. Prefer the numbered steps
on a first build.

## Do not skip 99

Every failure mode in `traps.md` is silent: a correctly-named variable bound to the wrong
paint, an alias that resolves to nothing, a text style that ignores its mode. The file will
look finished either way. `99-audit.md` is what tells you whether the previous nine actually
worked, and it is the only basis for claiming parity with the supplied starter.
