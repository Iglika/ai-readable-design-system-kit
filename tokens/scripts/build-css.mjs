/**
 * Style Dictionary build: dist/tokens.json -> dist/tokens.css
 *
 * Four outputs in one stylesheet:
 *   1. every scalar token as a CSS custom property
 *   2. --semantic-shadow-* properties, composed from the multi-layer shadow tokens
 *   3. .text-* classes for the composite typography tokens, with the responsive
 *      heading ramp expressed as real media queries
 *   4. a generated block of SHORT ALIASES (--bg-brand-bold-default) pointing at
 *      the fully-qualified names — see the note above that block
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import StyleDictionary from 'style-dictionary';

const BREAKPOINTS = { tablet: 810, desktop: 1200 };

const isTypography = (t) => t.$type === 'typography';
const isShadow = (t) => t.$type === 'shadow';
const isScalar = (t) => !isTypography(t) && !isShadow(t);

/** join a token path into a css custom property name */
const cssVar = (path) => `--${path.join('-')}`;

/** resolve a {a.b.c} reference against the flat token list */
function makeResolver(all) {
  const byPath = new Map(all.map((t) => [t.path.join('.'), t]));
  return function resolve(v) {
    if (typeof v !== 'string') return v;
    const m = v.match(/^\{([^}]+)\}$/);
    if (!m) return v;
    const target = byPath.get(m[1]);
    return target ? `var(${cssVar(target.path)})` : v;
  };
}

StyleDictionary.registerFormat({
  name: 'starter/css',
  format({ dictionary }) {
    const all = dictionary.allTokens;
    const resolve = makeResolver(all);

    const lines = [];
    lines.push('/* Design tokens — GENERATED, DO NOT EDIT.');
    lines.push('   Source of truth: your Figma file.');
    lines.push('   Regenerate with `npm run build`. */\n');
    lines.push(':root {');

    // 1. scalars, grouped by top-level namespace
    let group = null;
    for (const token of all.filter(isScalar)) {
      const g = token.path[0] === 'semantic' ? `semantic ${token.path[1]}` : token.path[0];
      if (g !== group) { lines.push(`\n  /* ${g} */`); group = g; }
      lines.push(`  ${cssVar(token.path)}: ${resolve(token.original.$value)};`);
    }

    // 2. shadows
    lines.push('\n  /* elevation */');
    for (const token of all.filter(isShadow)) {
      const layers = token.original.$value
        .map((l) => `${l.offsetX} ${l.offsetY} ${l.blur} ${l.spread} ${resolve(l.color)}`)
        .join(', ');
      lines.push(`  ${cssVar(token.path)}: ${layers};`);
    }
    lines.push('}\n');

    // 3. typography classes
    const typo = all.filter(isTypography);
    const decl = (v) => [
      `  font-family: ${resolve(v.fontFamily)}, system-ui, sans-serif;`,
      `  font-weight: ${resolve(v.fontWeight)};`,
      `  font-size: ${resolve(v.fontSize)};`,
      `  line-height: ${resolve(v.lineHeight)};`,
      `  letter-spacing: ${resolve(v.letterSpacing)};`
    ].join('\n');

    // body: no breakpoint variation
    lines.push('/* body */');
    for (const token of typo.filter((t) => t.path[2] === 'body')) {
      const cls = `.text-body-${token.path.slice(3).join('-')}`;
      lines.push(`${cls} {\n${decl(token.original.$value)}\n}`);
    }

    // headings: mobile is the base, tablet and desktop override
    lines.push('\n/* headings — mobile first */');
    const headings = typo.filter((t) => t.path[2] === 'heading');
    const names = [...new Set(headings.map((t) => t.path[4]))];

    for (const name of names) {
      const mobile = headings.find((t) => t.path[3] === 'mobile' && t.path[4] === name);
      lines.push(`.text-${name} {\n${decl(mobile.original.$value)}\n}`);
    }
    for (const bp of ['tablet', 'desktop']) {
      lines.push(`\n@media (min-width: ${BREAKPOINTS[bp]}px) {`);
      for (const name of names) {
        const tk = headings.find((t) => t.path[3] === bp && t.path[4] === name);
        lines.push(`  .text-${name} {`);
        lines.push(decl(tk.original.$value).split('\n').map((l) => '  ' + l).join('\n'));
        lines.push('  }');
      }
      lines.push('}');
    }

    return lines.join('\n') + '\n';
  }
});

mkdirSync('build', { recursive: true });

const sd = new StyleDictionary({
  source: ['dist/tokens.json'],
  usesDtcg: true,
  log: { warnings: 'disabled' },
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [{ destination: 'tokens.css', format: 'starter/css' }]
    }
  }
});

await sd.buildAllPlatforms();

/* ── SHORT ALIASES ──────────────────────────────────────────────────────────
 *
 * READ THIS BEFORE YOU DELETE THIS BLOCK.
 *
 * Style Dictionary emits fully-qualified names, because that is what the token
 * path says:
 *     --semantic-color-background-brand-bold-default
 *
 * But nobody writes that by hand, and no LLM reliably reproduces it. Every
 * human-facing document — your SKILL.md, your component specs, your CLAUDE.md —
 * will use the short ergonomic form:
 *     --bg-brand-bold-default
 *
 * If you ship only the long names, every short name silently resolves to
 * NOTHING. Not an error. Not a warning. `var(--bg-brand-bold-default)` with no
 * such property just produces no declaration, and you get an unstyled page with
 * a clean console.
 *
 * This block closes that gap mechanically. It is GENERATED — never hand-edit it.
 * To change the naming, change the RULES below and re-run the build.
 * ────────────────────────────────────────────────────────────────────────── */
{
  const file = 'dist/tokens.css';
  const css = readFileSync(file, 'utf8');

  const RULES = [
    [/^--semantic-color-background-/, '--bg-'],
    [/^--semantic-color-text-/,       '--text-'],
    [/^--semantic-color-border-/,     '--border-'],
    [/^--semantic-color-icon-/,       '--icon-'],
    [/^--semantic-border-width-/,     '--border-width-'],
    [/^--semantic-radius-/,           '--radius-'],
    [/^--semantic-spacing-/,          '--spacing-'],
    [/^--semantic-size-/,             '--size-'],
    [/^--semantic-shadow-/,           '--shadow-'],
    [/^--semantic-motion-duration-/,  '--duration-'],
    [/^--semantic-motion-easing-/,    '--easing-']
  ];

  const declared = new Set([...css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1]));
  const aliases = [];
  for (const long of declared) {
    for (const [re, short] of RULES) {
      if (re.test(long)) {
        const name = long.replace(re, short);
        if (!declared.has(name)) aliases.push(`  ${name}: var(${long});`);
        break;
      }
    }
  }

  // The colour families also answer to the state-less form for their default
  // state: --text-neutral-bold as well as --text-neutral-bold-default.
  // Dimension families are excluded — "--border-width" would be a nonsense name.
  const STATELESS_OK = ['--bg-', '--text-', '--border-', '--icon-'];
  const aliasNames = new Set(aliases.map((a) => a.trim().split(':')[0]));
  for (const line of [...aliases]) {
    const name = line.trim().split(':')[0];
    if (!name.endsWith('-default')) continue;
    if (name.startsWith('--border-width-')) continue;
    if (!STATELESS_OK.some((pfx) => name.startsWith(pfx))) continue;
    const bare = name.slice(0, -'-default'.length);
    if (declared.has(bare) || aliasNames.has(bare)) continue;
    aliasNames.add(bare);
    aliases.push(`  ${bare}: var(${name});`);
  }

  // Named exceptions: shorthands the docs use that no mechanical rule produces.
  const EXTRA = {
    '--font-heading':            '--font-family-heading',
    '--font-body':               '--font-family-body',
    '--font-mono':               '--font-family-mono',
    '--border-neutral-hovered':  '--semantic-color-border-neutral-default-hovered',
    '--border-neutral-focused':  '--semantic-color-border-neutral-default-focused',
    '--border-neutral-disabled': '--semantic-color-border-neutral-default-disabled',
    '--text-neutral-disabled':   '--semantic-color-text-neutral-bold-disabled'
  };
  for (const [name, target] of Object.entries(EXTRA)) {
    if (aliasNames.has(name) || declared.has(name)) continue;
    if (!declared.has(target)) { console.warn(`  ! alias target missing: ${target}`); continue; }
    aliasNames.add(name);
    aliases.push(`  ${name}: var(${target});`);
  }

  aliases.sort();
  const block = [
    '',
    '/* SHORT ALIASES — the names your SKILL.md and components actually use.',
    '   Generated, never hand-edited: every one points at its qualified token.',
    '   Without this block, every short name silently resolves to nothing. */',
    ':root {',
    ...aliases,
    '}',
    ''
  ].join('\n');

  writeFileSync(file, css + block);
  console.log(`dist/tokens.css written — ${aliases.length} short aliases appended`);
}
