/**
 * verify.mjs — prove that every token name actually resolves to a value.
 *
 * WHY THIS EXISTS
 *
 * The most expensive bug in a token pipeline does not throw. If your docs say
 * `--bg-brand-bold-default` and your stylesheet only defines
 * `--semantic-color-background-brand-bold-default`, then every rule written
 * from those docs resolves to nothing. No error. No warning. A clean console
 * and a completely unstyled page.
 *
 * Grepping the CSS is not proof. `--bg-brand-bold-default` appearing in the file
 * tells you a property was DECLARED; it does not tell you the var() chain behind
 * it terminates in a real value. This script follows every chain to the end.
 *
 * WHAT IT CHECKS
 *   1. every custom property resolves to a literal (no dangling var(), no cycles)
 *   2. every token name mentioned in the files you point it at is declared
 *
 * USAGE
 *   node scripts/verify.mjs
 *   node scripts/verify.mjs ../handoff/SKILL.md ../handoff/CLAUDE.md
 *
 * Exits non-zero on failure, so it works as a CI gate or a pre-commit hook.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve as resolvePath, relative as relativePath } from 'node:path';

const CSS_FILE = 'dist/tokens.css';
const args = process.argv.slice(2);
const strict = args.includes('--strict');
// npm runs this with cwd = tokens/, but `npm run check` is typed from the
// repository root. Try the path as given, then relative to where npm was invoked.
const INVOKED_FROM = process.env.INIT_CWD || process.cwd();
const locate = (f) => {
  if (existsSync(f)) return f;
  const alt = resolvePath(INVOKED_FROM, f);
  return existsSync(alt) ? alt : f;
};
const docFiles = args.filter((a) => a !== '--strict').map(locate);

if (!existsSync(CSS_FILE)) {
  console.error(`✗ ${CSS_FILE} not found. Run \`npm run build\` first.`);
  process.exit(1);
}

const css = readFileSync(CSS_FILE, 'utf8');

/* ── 1. collect declarations ─────────────────────────────────────────────── */
// Last declaration wins, matching the cascade for identical specificity.
const decls = new Map();
for (const m of css.matchAll(/^\s*(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/gm)) {
  decls.set(m[1], m[2].trim());
}

/* ── 2. resolve every chain to a literal ─────────────────────────────────── */
const VAR_RE = /var\(\s*(--[a-zA-Z0-9-]+)\s*(?:,([^)]*))?\)/g;

const resolved = new Map();
const problems = [];

function resolve(name, seen = new Set()) {
  if (resolved.has(name)) return resolved.get(name);
  if (seen.has(name)) {
    problems.push({ kind: 'cycle', name, detail: [...seen, name].join(' → ') });
    return null;
  }
  if (!decls.has(name)) {
    problems.push({ kind: 'undeclared', name, detail: 'referenced but never declared' });
    return null;
  }

  seen.add(name);
  let value = decls.get(name);
  let out = '';
  let last = 0;
  VAR_RE.lastIndex = 0;

  for (const m of value.matchAll(VAR_RE)) {
    out += value.slice(last, m.index);
    const inner = resolve(m[1], new Set(seen));
    if (inner === null) {
      const fallback = m[2]?.trim();
      if (fallback) {
        out += fallback;
      } else {
        seen.delete(name);
        resolved.set(name, null);
        return null;
      }
    } else {
      out += inner;
    }
    last = m.index + m[0].length;
  }
  out += value.slice(last);

  seen.delete(name);
  const final = out.trim();
  resolved.set(name, final);
  return final;
}

for (const name of decls.keys()) resolve(name);

const literals = [...resolved.entries()].filter(([, v]) => v !== null);
const broken = [...resolved.entries()].filter(([, v]) => v === null);

/* ── 3. check names used in the docs are declared ────────────────────────── */
const docProblems = [];
for (const file of docFiles) {
  if (!existsSync(file)) {
    docProblems.push({ file, name: '—', detail: 'file not found' });
    continue;
  }
  const text = readFileSync(file, 'utf8');
  // A consumer file may define its own custom properties — a hoisted layout
  // constant, say. Those are local by design, not missing tokens.
  const local = new Set([...text.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)].map((m) => m[1]));
  const used = new Set([...text.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)/g)].map((m) => m[1]));
  for (const name of used) {
    if (!decls.has(name) && !local.has(name)) {
      docProblems.push({ file, name, detail: 'not declared in tokens.css, and not defined locally' });
    }
  }
}

/* ── 3b. strict mode: catch tokens that were BYPASSED ────────────────────── */
/*
 * Section 3 catches a name that was INVENTED — `var(--bg-primary)` when no such
 * token exists. That is the failure a model makes rarely, because SKILL.md lists
 * every real name inline.
 *
 * The common failure is the opposite one: skipping the token entirely and writing
 * the literal. `color: #4F46E5` is the right colour and completely off-system —
 * it survives a rebrand unchanged while everything around it moves. There is no
 * var() in that line, so section 3 sees nothing and passes clean.
 *
 * WHAT COUNTS
 *   hex literal, anywhere          -> violation. Every colour in this system has
 *                                    a token; there is no legitimate raw hex.
 *   px / rem in a declaration      -> violation. The dimension scale covers these.
 *   px / rem in a --custom-prop    -> reported, not failed. Hoisting a layout
 *                                    constant into one named property at :root is
 *                                    the sanctioned workaround for the missing
 *                                    layout tokens (see the known gaps in SKILL.md).
 *
 * WHAT IS ALLOWED
 *   0, %, vw, vh, vmin, vmax, fr, ch, auto, unitless numbers, and `em` — which is
 *   the unit letter-spacing tokens are expressed in. Media queries are skipped
 *   entirely: they cannot read a custom property, so a raw px there is forced.
 */
const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const LENGTH = /(?<![\w.#-])(\d*\.?\d+)(px|rem)\b/g;

// Blank a run of text but keep its newlines, so every offset below still maps
// to the real line in the real file.
const blank = (s) => s.replace(/[^\n]/g, ' ');

// Keep only the CSS, blanked in place rather than extracted.
function cssFrom(file, text) {
  const carve = (re, group) => {
    let out = '';
    let last = 0;
    for (const m of text.matchAll(re)) {
      out += blank(text.slice(last, m.index));
      const at = m.index + m[0].indexOf(m[group]);
      out += blank(text.slice(m.index, at)) + m[group];
      last = at + m[group].length;
    }
    return out + blank(text.slice(last));
  };
  if (file.endsWith('.md')) return carve(/```[a-zA-Z]*\n([\s\S]*?)```/g, 1);
  if (/\.html?$/.test(file)) {
    // Both masks are the same length as the source, so merge them position-wise.
    const blocks = carve(/<style[^>]*>([\s\S]*?)<\/style>/gi, 1);
    const attrs = carve(/\sstyle\s*=\s*"([^"]*)"/gi, 1);
    return [...blocks].map((c, i) => (c === ' ' ? attrs[i] : c)).join('');
  }
  return text;
}

const bypass = [];
const constants = [];

if (strict) {
  for (const file of docFiles) {
    if (!existsSync(file) || file.endsWith('tokens.css')) continue;

    // The generated block inside SKILL.md carries every token value inline —
    // that block IS the definitions, exactly like tokens.css, so exclude it.
    const source = readFileSync(file, 'utf8')
      .replace(/<!--\s*TOKENS:START\s*-->[\s\S]*?<!--\s*TOKENS:END\s*-->/g, blank);

    // Escape hatches, read before comments are stripped:
    //   `check-ignore` on a line          — that line only
    //   check-ignore-start / -end         — everything between them
    // For documented gaps and for the deliberate "wrong" examples in the docs.
    const lines = source.split('\n');
    const skip = new Set();
    let off = false;
    lines.forEach((l, i) => {
      if (/check-ignore-start/.test(l)) off = true;
      if (off || /check-ignore\b/.test(l)) skip.add(i + 1);
      if (/check-ignore-end/.test(l)) off = false;
    });

    const text = cssFrom(file, source)
      .replace(/\/\*[\s\S]*?\*\//g, blank)        // comments
      .replace(/@[a-zA-Z-]+[^{;]*[{;]/g, blank);  // @media / @supports prologues

    for (const m of text.matchAll(/([-a-zA-Z]+)\s*:\s*([^;{}]+)/g)) {
      const [, prop, raw] = m;
      const value = raw.trim();
      const line = text.slice(0, m.index).split('\n').length;
      if (skip.has(line)) continue;
      const isCustomProp = prop.startsWith('--');

      for (const h of value.matchAll(HEX)) {
        bypass.push({ file, line, prop, found: h[0], why: 'raw hex — every colour has a token' });
      }
      for (const l of value.matchAll(LENGTH)) {
        if (Number(l[1]) === 0) continue;
        (isCustomProp ? constants : bypass).push({
          file, line, prop, found: l[0],
          why: isCustomProp ? 'local constant' : 'raw length — the dimension scale covers this'
        });
      }
    }
  }
}

/* ── 4. report ───────────────────────────────────────────────────────────── */const pad = (s, n) => String(s).padEnd(n);
const short = (f) => {
  const r = relativePath(INVOKED_FROM, f);
  return r && !r.startsWith('..') ? r : f;
};
console.log('');
console.log('  token verification');
console.log('  ──────────────────────────────────────────────');
console.log(`  ${pad('declared properties', 28)} ${decls.size}`);
console.log(`  ${pad('resolve to a literal', 28)} ${literals.length}`);
console.log(`  ${pad('broken chains', 28)} ${broken.length}`);
if (docFiles.length) {
  const checked = docFiles.length === 1 ? '1 file' : `${docFiles.length} files`;
  console.log(`  ${pad(`names used in ${checked}`, 28)} ${docProblems.length} unresolved`);
}
if (strict) {
  console.log(`  ${pad('tokens bypassed', 28)} ${bypass.length}`);
  console.log(`  ${pad('local constants', 28)} ${constants.length}`);
}
console.log('');

// Spot-check output: show a few resolved values so a human can eyeball them.
const samples = ['--bg-brand-bold-default', '--text-neutral-bold-default', '--radius-full', '--spacing-xl', '--shadow-md'];
const shown = samples.filter((s) => resolved.get(s));
if (shown.length) {
  console.log('  spot check');
  for (const s of shown) {
    const v = resolved.get(s);
    console.log(`    ${pad(s, 32)} ${v.length > 60 ? v.slice(0, 57) + '…' : v}`);
  }
  console.log('');
}

const seen = new Set();
const unique = problems.filter((p) => {
  const k = `${p.kind}:${p.name}`;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

if (unique.length) {
  console.log('  ✗ problems in tokens.css');
  for (const p of unique.slice(0, 40)) console.log(`    [${p.kind}] ${p.name} — ${p.detail}`);
  if (unique.length > 40) console.log(`    … and ${unique.length - 40} more`);
  console.log('');
}

if (docProblems.length) {
  console.log('  ✗ names used in the docs that do not resolve');
  for (const p of docProblems.slice(0, 40)) console.log(`    ${short(p.file)}: ${p.name} — ${p.detail}`);
  if (docProblems.length > 40) console.log(`    … and ${docProblems.length - 40} more`);
  console.log('');
  console.log('  This is the silent one. Every rule written from those names');
  console.log('  produces no declaration at all — an unstyled page, clean console.');
  console.log('');
}

if (constants.length) {
  console.log('  local constants — allowed, but each one is a token you do not have');
  for (const c of constants.slice(0, 20)) {
    console.log(`    ${short(c.file)}:${c.line}  ${c.prop}: ${c.found}`);
  }
  if (constants.length > 20) console.log(`    … and ${constants.length - 20} more`);
  console.log('');
}

if (bypass.length) {
  console.log('  ✗ tokens bypassed — a literal was written where a token exists');
  for (const b of bypass.slice(0, 40)) {
    console.log(`    ${short(b.file)}:${b.line}  ${b.prop}: ${b.found}  — ${b.why}`);
  }
  if (bypass.length > 40) console.log(`    … and ${bypass.length - 40} more`);
  console.log('');
  console.log('  These resolve correctly and render correctly today. They are still');
  console.log('  off-system: a rebrand moves everything around them and leaves these');
  console.log('  exactly where they are. Replace each with the token that holds it.');
  console.log('');
}

if (unique.length || docProblems.length || bypass.length) process.exit(1);
console.log(strict
  ? '  ✓ every chain resolves, and nothing bypassed a token'
  : '  ✓ every chain terminates in a real value');
console.log('');
