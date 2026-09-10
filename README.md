# AI-Readable Design System Starter Kit

> Public beta: a complete, free design-system starter for Figma, code and AI-assisted product building.

Build interfaces that stay visually consistent when humans and AI tools work on the same
product. The kit combines a finished Figma system with the method, prompts, token pipeline
and verification tools used to create it.

The project is intentionally small enough to understand. It is also real enough to run:
311 native Figma variables, 41 text styles, 5 effect styles, 9 component families,
134 component variants and a verified CSS token build.

## Start here

Download **[`figma/starter-template.fig`](figma/starter-template.fig)**, then in Figma:
**File → Import**, or drag the file onto your Figma dashboard.

That gives you the complete system — 311 variables, 41 text styles, 9 component families,
134 variants — as a normal file in your own workspace from the first second. Nothing to
duplicate, no access to request.

Everything else in this repository is for what comes next: rebranding it, carrying it into
code, or rebuilding it from scratch so you own every decision.

### Easiest test: use the built-in skill

1. Install Node.js 22 or newer.
2. Download or clone this repository and open the **repository folder** in Claude Code or Codex.
3. Ask it to set up the AI-Readable Design System.
   Or invoke the skill directly — `/setup-ai-readable-design-system` in Claude Code,
   `$setup-ai-readable-design-system` in Codex.
4. Choose **Test the supplied starter** when asked.

The skill installs the local dependency, builds the supplied tokens and checks the result.
It then points you to the finished Figma system. The skill only ever writes to a Figma file
you own — your imported copy, or a new file it creates for you.

### Manual alternative

Open a terminal in the repository folder and run:

```bash
npm run setup
npm run build
npm run verify
```

The successful verification ends with:

```text
every chain terminates in a real value
```

Then import [`figma/starter-template.fig`](figma/starter-template.fig) into Figma with
**File → Import**.

## Choose one of two Figma paths

The initial test only confirms that the repository works. When you are ready to use the
system in Figma, choose exactly one of these two paths:

| Route | What the skill does | Best for |
|---|---|---|
| **Use the finished file** | Rewrites ~22 primitive values. All 311 semantics and 134 variants follow automatically, because they are aliases. | The fast route, and an exact structural starting point |
| **Create your own file** | Builds all 311 from scratch through the nine prompts, using your values during construction. | Owning every decision, and understanding why each one is there |

Import the `.fig` for the first route; give the skill a blank file for the second. Either
way it asks for your brand values and writes them to `tokens/src/values.mjs` first, so
Figma and the code layer come from the same source.

Both routes use the same naming contract, component contract and verification process.

## What is included

- A finished, editable and brand-neutral Figma implementation, downloadable as a `.fig`
- A 13-artboard visual guide inside the Figma file
- The complete written guide and fourteen documented failure modes
- Nine guided Figma build prompts, one one-shot prompt and a final audit prompt
- White-label naming and component contracts
- A 357-token DTCG package and 537-property CSS output
- AI handoff templates for project instructions and a portable skill
- Reproducible build and verification scripts

## Repository map

| Path | Purpose |
|---|---|
| **`figma/`** | **The finished system.** `starter-template.fig` plus how to import it and what to check |
| **`tokens/`** | The pipeline. `src/values.mjs` is the only file you edit; `dist/` is generated |
| **`handoff/`** | Generated. `SKILL.md` and `CLAUDE.md` — what you give an AI tool |
| **`prompts/`** | Route 2: build the system yourself. Start at `prompts/README.md` |
| **`contracts/`** | `naming.md` and `components.md` — the decisions the prompts apply |
| `traps.md` | The fourteen documented failure modes, all of which report success |
| `.agents/skills/…`<br>`.claude/skills/…` | Interactive setup and test guide. Same skill in both locations — Codex reads `.agents/`, Claude Code reads `.claude/` |

Each directory is one job:

```text
figma/      get the system          tokens/    change its values
handoff/    give it to an AI        prompts/   rebuild it yourself
contracts/  the rules both follow
```

For a first test, ignore the map. Use only this `README.md`, the setup skill and
`figma/`. The rest becomes relevant when you customise or rebuild the system.

## How the system works

```text
                         tokens/src/values.mjs
                                    │
                ┌───────────────────┴───────────────────┐
                ▼                                       ▼
          tokens.json  ->  tokens.css  ->  SKILL.md   Figma file
                                    │
                                    ▼
                              verification
```

**`src/values.mjs` is the source of truth.** The Figma file and the code layer are two
renderings of the same decisions, so a rebrand is made once instead of twice. The verifier
follows every CSS variable chain to a literal value, so a token that merely exists by name
cannot silently pass.

## Check the AI's work

`handoff/SKILL.md` carries every token value inline, so you can hand it to any
AI tool — including one with no access to this repository — and ask for components. This
closes the loop on that:

```bash
npm run check -- path/to/the-component.css
```

It grades generated code against the real token layer and exits non-zero on a failure, so it
works as a CI gate or a pre-commit hook. Two different failures:

| The model wrote | Caught by |
|---|---|
| `var(--bg-primary)` — a name that does not exist | Unresolved names. Rare, because SKILL.md lists every real name |
| `#4F46E5` — the right colour, no token | **Tokens bypassed.** The common one |

The second is the one that matters. It renders correctly today and is completely
off-system: a rebrand moves everything around it and leaves it exactly where it is. There is
no `var()` on that line, so nothing else would ever notice.

Raw values hoisted into a named custom property at `:root` are reported as **local
constants** rather than failures — that is the sanctioned workaround for the missing layout
tokens. Percentages, viewport units, `fr`, `em` and zero are allowed; media queries are
skipped, since they cannot read a custom property.

For a deliberate exception, put `check-ignore` in a comment on the line, or wrap a block in
`<!-- check-ignore-start -->` and `<!-- check-ignore-end -->`.

## Path 2: create your own Figma file

1. Read `traps.md` for the fourteen failure modes, all of which report success.
2. Run `prompts/00-naming-contract.md`. It settles the naming grammar in
   `contracts/naming.md`, writes your values into `tokens/src/values.mjs`,
   and ends with `npm run build && npm run verify`. Nothing touches Figma yet.
3. Run `prompts/01` through `prompts/06` in order to build the Figma file against those
   verified values — primitives, semantics, type, text styles, layout tokens, components.
4. Run `prompts/07-code-layer.md` to export Figma and prove it matches the generated tokens.
5. Run `prompts/08-handoff.md` for the AI handoff files.
6. Run `prompts/99-audit.md` before calling the Figma system finished.

`prompts/README.md` has the sequence, the timings and what each step produces.

The one-shot alternative is in `prompts/one-shot.md`.
This route targets structural and visual parity with the supplied starter, using the new
brand values during construction. It is not a literal duplicate, so call it equivalent
only after `prompts/99-audit.md` confirms the expected names, counts, bindings and visuals.

## Scope of the beta

The current release focuses on foundations and form controls: Icon, Button, Input,
Textarea, Select, Checkbox, Radio, Toggle and Form Field. It does not yet include dark
mode, navigation, data display, overlays, responsive application templates or a production
component framework.

Those additions will be driven by what people repeatedly need after using the beta.

## Project status

This is the active public product, and it is free. There is no paid edition: the finished
Figma file, the method, the prompts and the token pipeline are all in this repository.
Feedback is part of the product-discovery process:
please use the repository's **Beta feedback** issue template to record what you tried to
build, where you became stuck and what you needed next.
