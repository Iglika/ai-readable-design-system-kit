# Step 8 — The AI handoff

**Time:** 20 minutes · **Creates:** `SKILL.md`, `CLAUDE.md`

The payoff. Everything so far produced a design system. This step makes it *readable by
something that isn't you*.

---

## The concept

A design system that lives only in Figma can be used by people who open Figma. A design
system with a code layer can be used by developers. **A design system with a skill file can
be used by any LLM, in any project, with no setup.**

Three artifacts, three audiences:

| Artifact | Read by | Contains |
|---|---|---|
| Figma library | designers | the components, visually |
| `tokens.css` | build tools, browsers | the values |
| `SKILL.md` | LLMs | the values **and the rules for choosing between them** |

That third one is the interesting one, and it's the one almost nobody builds.

### Why a skill file isn't just the CSS again

`tokens.css` tells a model *what exists*. It does not tell it that `bold` backgrounds
require `inverse` text, that a button is a pill and not a rounded rectangle, or that error
colours the border and never the field's own text.

Those rules are the difference between output that uses your tokens and output that looks
like your brand. **A model given only values will produce valid, off-brand work** — every
colour a real token, every element invented.

### Carry the values inline

The skill should contain the actual token block, not a path to it. A skill that references
`tokens/dist/tokens.css` only works in projects that have that file. A skill that carries the
values works in a scratch HTML file, a Lovable project, someone else's repo — anywhere.

---

## The prompt

```
Read handoff/SKILL.md and handoff/CLAUDE.md.

Write my design system's skill file and project rules file, using those
templates as the structure.

Sources of truth, in this order:
1. tokens/dist/tokens.css — for every value
2. contracts/naming.md — for the rules and the reasoning
3. my component specs — for how the components actually behave

SKILL.md must contain:
- the complete token block INLINE as CSS custom properties, so the skill
  works in a project with no access to my files
- the tier rule: component -> semantic -> primitive, never skip
- how to CHOOSE a token: property -> intent -> emphasis -> state, read
  left to right
- the contrast pairing rule (bold backgrounds take inverse text)
- typography: use the .text-* classes, not the raw variables; heading
  classes are responsive, body classes are not; colour is applied
  separately and is never part of a text class
- a worked example for each component I've built, as real markup
- state rules — focus, error, disabled, required
- motion tokens and when each duration applies
- a "search before you build" section listing every component that already
  exists, so nothing gets reinvented
- the known gaps and constraints: no dark mode, gradients aren't tokens,
  which colours fail contrast at normal size

CLAUDE.md must contain:
- the one rule: never emit a raw value, always a token reference
- the pipeline diagram and which files are generated
- the tier rule
- how to pick a semantic
- known gaps

Both files: state what to do, not what I did. No changelog, no history.
An LLM reading this needs the rules in force, not how they got there.

When done, run:
  node scripts/verify.mjs handoff/SKILL.md handoff/CLAUDE.md
Every token name in both files must resolve. Report the number that fail.
It must be 0.
```

---

## Using it

### Claude Code

```bash
mkdir -p ~/.claude/skills && cp -R skill/〈your-system〉 ~/.claude/skills/
```

Then any session, in any project, either invokes it by name or triggers it automatically
when you ask for branded UI.

### Lovable, v0, Bolt and friends

Paste the token block plus the rules section into the project's system prompt or knowledge
file. The inline values are what make this work — these tools can't read your filesystem.

### A developer

`tokens.css` and `CLAUDE.md`. The CSS is what their build needs; the rules file is what
stops the next AI-assisted edit from undoing the system.

---

## Checkpoint

- [ ] `SKILL.md` carries every token value inline
- [ ] **0** token names in it fail `verify.mjs`
- [ ] it contains rules, not just values
- [ ] it lists the components that already exist
- [ ] the real test: open a **fresh session with no context**, ask for a landing page
      section, and see whether what comes back looks like your brand

That last one is the only test that matters. Everything else is a proxy for it.

---

## Common failures

**A skill that's just the CSS with prose around it.** If it contains no rule that would stop
a model making a bad choice, it isn't teaching anything. The rules are the product.

**Referencing files instead of carrying values.** Works in your repo, fails everywhere else
— which is exactly where you wanted to use it.

**Documenting history instead of rules.** "We changed the border to gray/300 on 3 September"
is useless to a model. "Field borders are gray/300 — soft on purpose, don't darken them" is
the same fact as an instruction.

**Never testing it cold.** Your own session already has all the context. Open a new one.
