# Copy-ready Figma MCP build prompt

One prompt that builds the whole system in a single run. Use it after filling in
`contracts/naming.md` and replacing the placeholder values in `src/values.mjs`.

Prefer `prompts/00`–`08` if you want to go step by step and understand each decision as you
make it. This file is the same build, briefed in one go.

## Prompt

You are building a native, AI-readable design system in Figma.

This is **Path 2: create your own file**. You are starting from an empty Figma file and
building the audited contract below. The supplied `figma/starter-template.fig` belongs to Path 1; it is
not the write target for this workflow. Everything you need has already been decided in
writing:
- `contracts/naming.md` — the naming rule, filled in, with its decision log
- `tokens/dist/tokens.json` — every value, in DTCG format
- `contracts/components.md` — the component APIs you must expose

Destination:
- Perform every write in the Figma file you created for this system, and nowhere else.
- Keep a local ledger of every collection, variable, style, page, component, and validation result.

Build order:
1. Read the three contracts and report the locked scope and expected counts back before writing anything.
2. Create a hidden `Primitives` collection with one `Value` mode.
3. Create a published `Semantics` collection with one `Light` mode.
4. Create primitive variables with targeted scopes and web code syntax.
5. Create semantic variables as aliases only. Do not copy raw values.
6. Create composite typography as Text Styles and elevation as Effect Styles.
7. Validate counts, alias targets, scopes, code syntax, fonts, and style bindings.
8. Build Icon, Button, Input, Textarea, Select, Checkbox, Radio, Toggle, and Form Field in dependency order.
9. Bind component decisions to semantic variables and text/effect styles. Expose the APIs in `contracts/components.md`.
10. Create guide and specimen pages that use the system they document.
11. Render screenshots, fix visual defects, and run structural validation before reporting completion.

Rules:
- Use native Figma variables, styles, components, and Figma MCP. Do not use Tokens Studio.
- Components consume semantics; semantics alias primitives; primitives alone contain raw values.
- Never use `ALL_SCOPES` for new variables.
- Verify exact font family/style strings before creating text styles.
- Return IDs from every write and validate each phase before continuing.
- Ask only when two materially different paths remain after reading the contracts.

Acceptance criteria:
- Every semantic value is a resolvable alias.
- Every variable has web code syntax and an intentional scope.
- Every text node in a component uses a Text Style.
- Component descriptions state purpose, API, token dependencies, accessibility, and code mapping.
- The final report includes counts, exceptions, validation evidence, and links to the Figma file and handoff package.
