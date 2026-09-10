/**
 * verify-skill-copies.mjs — prove the setup skill is identical in both locations.
 *
 * WHY THIS EXISTS
 *
 * Codex and Claude Code discover skills in different directories and neither
 * reads the other's. Codex scans `.agents/skills/`; Claude Code scans
 * `.claude/skills/` and nothing else. So the same SKILL.md has to ship twice.
 *
 * Two copies of one file drift. Nothing in git stops you editing one and
 * forgetting the other, and the failure is invisible from the inside: your
 * tool reads the copy you just edited and behaves perfectly. The customer on
 * the other tool gets the stale one. Whichever half of your audience you are
 * not testing with is the half that gets the bug.
 *
 * This compares the files byte for byte. It does not merge them or pick a
 * winner — it fails, names the two paths, and leaves the decision to you.
 *
 * USAGE
 *   node scripts/verify-skill-copies.mjs
 *
 * Exits non-zero on drift or on a missing copy, so it works as a CI gate.
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

// Resolve from this file, not from cwd: npm runs it with cwd = tokens/, but it
// may also be invoked from the repository root.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const SKILL = 'setup-ai-readable-design-system/SKILL.md';
const COPIES = [
  { tool: 'Codex', path: join(ROOT, '.agents/skills', SKILL) },
  { tool: 'Claude Code', path: join(ROOT, '.claude/skills', SKILL) },
];

const short = (p) => relative(ROOT, p);

console.log('');
console.log('  skill copies');

const missing = COPIES.filter((c) => !existsSync(c.path));
if (missing.length) {
  for (const m of missing) {
    console.log(`  ✗ missing — ${m.tool} will not find the skill`);
    console.log(`    ${short(m.path)}`);
  }
  console.log('');
  console.log('  Every copy must exist. A tool whose directory is empty does not');
  console.log('  fall back to the other one — the skill simply is not there.');
  console.log('');
  process.exit(1);
}

const [a, b] = COPIES.map((c) => ({ ...c, body: readFileSync(c.path) }));

if (!a.body.equals(b.body)) {
  console.log('  ✗ the two copies have drifted apart');
  for (const c of [a, b]) {
    console.log(`    ${short(c.path)}  ${c.body.length} bytes  (${c.tool})`);
  }
  console.log('');
  console.log('  Copy whichever one is correct over the other, then run this again:');
  console.log(`    cp ${short(a.path)} ${short(b.path)}`);
  console.log('');
  process.exit(1);
}

console.log(`  ✓ identical in both locations (${a.body.length} bytes)`);
console.log('');
