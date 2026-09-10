# The Figma file

The complete, audited system — 311 native variables, 41 text styles, 5 effect styles, 9
component families and 134 variants — in a file you own.

## Get it

Download [`starter-template.fig`](starter-template.fig), then in Figma: **File → Import**,
or drag it onto your Figma dashboard.

That is the whole acquisition step. The file is a normal file in your own workspace from the
first second — nothing to duplicate, no access to request, and no dependency on anyone
else's sharing settings.

## Then check four things

An imported `.fig` is a fresh local file with no library relationships, so confirm the system
survived the trip:

| Check | Expected |
|---|---:|
| Native variables | 311 |
| Text styles | 41 |
| Effect styles | 5 |
| Component families / variants | 9 / 134 |

Then open the `Primitives` collection and confirm **Hide from publishing** is still on. The
tier rule depends on it — see [`../traps.md`](../traps.md) #12. If it came back off, turn it
on before publishing the file as a library.

## What is in the file

- `Cover` for the file introduction
- `00 · Guide` for the 13-artboard visual edition of the method
- `01 · Foundations` for variables and styles
- `02 · Components` and its component-specific pages for the component library
- `03 · Icons` for the icon set

## Then choose one of two paths

The choice is what you do *with* the system, not how you obtained it.

### Path 1 — use the finished file

Change its primitive brand values. This is roughly **22 values** — two colour ramps and the
font families. All 311 semantics and all 134 component variants are aliases, so they follow
automatically. Pages, components, variants, names and bindings are preserved.

### Path 2 — create your own file

Build the same contract in a blank Figma file from [`../prompts/`](../prompts/), then run
`../prompts/99-audit.md`. This constructs all 311 from scratch — nine prompts of work, and
where every one of the fourteen traps lives.

It targets structural and visual parity, but it is not a literal duplicate. Treat it as
equivalent only after the audit confirms the canonical counts, names, bindings and visuals.

That asymmetry — 22 values against 311 built one at a time — is the whole argument for
starting from the finished file.

## Customise it safely

1. Put your values in [`../tokens/src/values.mjs`](../tokens/src/values.mjs) — the single
   source for both Figma and the code layer.
2. Run `npm run build` and `npm run verify`. Verification must end with
   `every chain terminates in a real value`.
3. Apply the same primitive values in Figma: the eleven `color/indigo` steps, `color/teal`
   if you need a different accent, and the heading, body and mono font families with their
   exact Figma style strings.
4. Keep the semantic aliases and component bindings intact. Renaming a variable silently
   unbinds every layer using it — `../traps.md` #4.
5. Run `../prompts/99-audit.md` against the customised file.

If you changed Figma first instead, `../prompts/07-code-layer.md` exports it and diffs
against the generated `tokens.json`. Reconcile in `values.mjs`, then rebuild — never by
hand-editing `tokens.json` or `tokens.css`.

## This copy stays brand-neutral

`starter-template.fig` is the seed for the next person, so your rebrand does not get
committed back over it. Your customised file lives in your own workspace.

It also cannot be edited programmatically. A `.fig` is a proprietary binary archive with no
public format, so no script, API or agent can rewrite a value inside it; Figma's write tools
only ever act on a hosted file. Producing a new `.fig` is a manual **File → Save local copy**.

## Audit history

The source file passed its page-specific technical audit on 8 September 2026. Component
paints, radii, visible stroke weights, auto-layout spacing and typography passed the binding
audit. The component specimens also passed visual inspection.

The guide audit found 1,178 of 1,178 paints bound, 1,586 of 1,586 layout-token slots bound,
303 of 303 rounded nodes bound, 667 of 667 text layers styled or intentionally monospace,
and no overflow or placeholder issues.

## Release check

Verified on 9 September 2026: `starter-template.fig` was imported from a separate Figma
account, all audited counts survived the import, and `Primitives` retained **Hide from
publishing**.

Repeat both checks after any re-export of the file.
