/**
 * build-skill.mjs — regenerate the token block inside ../handoff/SKILL.md
 *
 * The skill file carries every token value INLINE, so it works in a project
 * with no access to your repo — a scratch HTML file, a Lovable project,
 * someone else's codebase.
 *
 * That inline block is generated, never hand-written, so it cannot drift from
 * the real tokens. It lives between the TOKENS:START and TOKENS:END markers;
 * everything outside those markers is prose you write yourself.
 *
 *   node scripts/build-skill.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const SKILL = '../handoff/SKILL.md';
const CSS = 'dist/tokens.css';
const START = '<!-- TOKENS:START -->';
const END = '<!-- TOKENS:END -->';

for (const f of [SKILL, CSS]) {
  if (!existsSync(f)) { console.error(`✗ ${f} not found.`); process.exit(1); }
}

const css = readFileSync(CSS, 'utf8');

/* collect declarations, resolve chains to literals */
const decls = new Map();
for (const m of css.matchAll(/^\s*(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/gm)) decls.set(m[1], m[2].trim());

const cache = new Map();
function resolve(name, seen = new Set()) {
  if (cache.has(name)) return cache.get(name);
  if (seen.has(name) || !decls.has(name)) return null;
  seen.add(name);
  const out = decls.get(name).replace(/var\(\s*(--[a-zA-Z0-9-]+)\s*\)/g, (_, ref) => resolve(ref, new Set(seen)) ?? '');
  cache.set(name, out.trim());
  return out.trim();
}

/* group the short alias names — these are the names humans and models write */
const PREFIXES = [
  ['--bg-',           'background'],
  ['--text-',         'text'],
  ['--border-width-', 'border width'],
  ['--border-',       'border'],
  ['--icon-',         'icon'],
  ['--radius-',       'radius'],
  ['--spacing-',      'spacing'],
  ['--size-',         'size'],
  ['--shadow-',       'elevation'],
  ['--duration-',     'motion duration'],
  ['--easing-',       'motion easing']
];

const groups = new Map(PREFIXES.map(([, label]) => [label, []]));
const fonts = [];

// The build emits two kinds of short name: the canonical one, which points at a
// fully-qualified token (`var(--semantic-…)`), and a state-less convenience form,
// which points at another short name (`--bg-brand-bold` -> `--bg-brand-bold-default`).
// Only the canonical ones belong in the skill: the convenience forms would double
// the block's length while teaching nothing new.
const pointsAtShortAlias = (v) => /^var\(--(bg|text|border|icon)-/.test(v);

for (const name of [...decls.keys()].sort()) {
  // every interface + documentation family, not just the two interface ones
  if (['--font-heading', '--font-body', '--font-mono'].includes(name)) { fonts.push(name); continue; }
  for (const [prefix, label] of PREFIXES) {
    if (name.startsWith(prefix)) {
      if (!pointsAtShortAlias(decls.get(name))) groups.get(label).push(name);
      break;
    }
  }
}

const lines = [];
lines.push('```css');
lines.push('/* Design tokens — the complete set. Generated from tokens.css, do not hand-edit. */');
lines.push(':root {');

if (fonts.length) {
  lines.push('\n  /* fonts */');
  for (const f of fonts) lines.push(`  ${f}: ${resolve(f)};`);
}

for (const [label, names] of groups) {
  if (!names.length) continue;
  lines.push(`\n  /* ${label} */`);
  for (const n of names) {
    const v = resolve(n);
    if (v) lines.push(`  ${n}: ${v};`);
  }
}
lines.push('}');
lines.push('```');

const block = `${START}\n\n${lines.join('\n')}\n\n${END}`;

const skill = readFileSync(SKILL, 'utf8');
const re = new RegExp(`${START}[\\s\\S]*?${END}`);
if (!re.test(skill)) {
  console.error(`✗ ${SKILL} has no ${START} / ${END} markers.`);
  process.exit(1);
}

writeFileSync(SKILL, skill.replace(re, block));
const count = [...groups.values()].reduce((n, g) => n + g.length, 0) + fonts.length;
console.log(`${SKILL} updated — ${count} token values inlined`);
