# The token pipeline

Turns one file of brand decisions into the design tokens, the stylesheet and the AI handoff.

**The values in here are placeholders.** The *structure* is the product — keep it, swap the
values for your brand.

```bash
npm install
npm run build     # tokens.json + tokens.css
npm run verify    # prove every token name resolves
npm run check -- some-component.css   # grade a file against the token layer
```

This package requires Node.js 22 or newer. When working from the repository root, the same
flow is available as `npm run setup`, `npm run build` and `npm run verify`.

## What's in here

| | |
|---|---|
| `src/values.mjs` | **The only file you edit.** Every brand decision lives here. |
| `scripts/build-tokens.mjs` | `values.mjs` → DTCG `dist/tokens.json`. Machinery; nothing to edit. |
| `scripts/build-css.mjs` | DTCG → `dist/tokens.css`, including the short-alias layer |
| `scripts/build-skill.mjs` | Regenerates the inline token block inside `../handoff/SKILL.md` |
| `scripts/verify.mjs` | Follows every `var()` chain to a literal, and grades files against it |
| `manifest.json` | Expected counts and release contract for automated checks |
| `dist/tokens.json` | Generated. Do not edit. |
| `dist/tokens.css` | Generated. Do not edit. The file you actually import. |

## What this connects to

| | |
|---|---|
| [`../contracts/naming.md`](../contracts/naming.md) | **Start here.** Fill this in before creating a single variable |
| [`../contracts/components.md`](../contracts/components.md) | Component families, variant axes and property APIs |
| [`../handoff/SKILL.md`](../handoff/SKILL.md) | Generated. Carries every value inline, so it works anywhere |
| [`../handoff/CLAUDE.md`](../handoff/CLAUDE.md) | Project rules for any AI working in a repo that consumes these tokens |
| [`../prompts/`](../prompts/) | Building the Figma system these tokens come from |

## The pipeline

```
                        src/values.mjs
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
      build-tokens.mjs                 the setup skill
              │                               │
         tokens.json                          ▼
              │                        your Figma file
      Style Dictionary                 (~22 primitives rebound;
              │                         311 semantics follow)
         tokens.css
```

**`src/values.mjs` is the source of truth**, and it is the only file you edit. The Figma
file and the stylesheet are two renderings of the same decisions — neither is upstream of
the other. That is what stops a rebrand having to be done twice and drifting.

The moment someone hand-edits `tokens.css` you have two sources of truth and no way to
tell which is right. Same for `tokens.json`. Both are generated; regenerate them.

If Figma and `values.mjs` ever disagree, `../prompts/07-code-layer.md` exports Figma and
diffs it against the generated `tokens.json`. That diff is the drift check, and
`values.mjs` is what gets corrected.

## Choose one of two Figma paths

1. **Use the finished file:** import `../figma/starter-template.fig` (see
   [`../figma/README.md`](../figma/README.md)), then customise its primitive values.
2. **Create your own file:** start with a blank file and use `../contracts/naming.md`, the guided
   prompts or `../prompts/one-shot.md` to rebuild the same audited contract.

The repository test is only a preliminary check. It confirms that the token pipeline works;
it is not a third Figma path.

## Use it

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="dist/tokens.css">
```

```html
<h1 class="text-jumbo" style="color: var(--text-neutral-bold-default)">Hello</h1>
<button style="background: var(--bg-brand-bold-default); border-radius: var(--radius-full)">
  Book a call
</button>
```

Heading classes are responsive across three breakpoints. Body classes are constant.

## What you will build

The finished system contains 311 native variables, 41 text styles, 5 effect styles and
9 component families / 134 variants. The parent repository includes the audited Figma file
for the fast route. The prompts can also build the same result in a new, empty file so you
understand and own every decision.

## Install the skill

```bash
mkdir -p ~/.claude/skills/<your-system>
cp ../handoff/SKILL.md ~/.claude/skills/<your-system>/SKILL.md
```

The skill carries every token value inline, so any project inherits the system with no file
access or setup — including tools that can't read your filesystem at all, like Lovable.

## Changing a value

1. Edit it in `src/values.mjs`.
2. `npm run build && npm run verify`.
3. Apply the same change in Figma — the setup skill does this, or `prompts/07-code-layer.md`
   gives you the manual change list.

If a value was changed in Figma first, run `../prompts/07-code-layer.md` to export and diff
against `dist/tokens.json`, then correct `src/values.mjs` and rebuild. Reconcile in
`values.mjs`, never in the generated files.

## Not built, on purpose

- **Tailwind preset** — only worth adding inside a real Tailwind project. `tokens.css`
  works everywhere, including Framer custom code and whatever Lovable generates.
- **Dark mode** — the structure supports it, no values exist. It's a design project, not a
  token-filling exercise.
