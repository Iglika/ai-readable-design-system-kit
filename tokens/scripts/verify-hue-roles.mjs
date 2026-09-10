/**
 * verify-hue-roles.mjs — prove the semantic roles are still tellable apart.
 *
 * WHY THIS EXISTS
 *
 * `verify.mjs` proves every chain terminates in a real value. It has no opinion
 * about what that value looks like. So a system where `background/brand/bold`
 * and `background/danger/bold` are the same red passes 537/537 and reports a
 * clean build — while the finished product has a "Save" button and a "Delete
 * permanently" button that are the same colour.
 *
 * That failure is invisible to every other check in this repository, and it is
 * easy to walk into: pick a red-ish brand colour and your primary action now
 * lives in the same hue family as your destructive one. Resolution was never
 * the question. Distinguishability is.
 *
 * WHAT IT CHECKS
 *
 * Roles are read from the semantic layer, not from comments — whatever
 * `background/<role>/bold/default` aliases to IS that role's hue, by definition.
 * Each role's colour is converted to OKLCH and compared by hue angle, which is
 * what "the same colour family" actually means perceptually.
 *
 *   < 20°  fail — the same hue family; users cannot reliably tell them apart
 *   < 40°  warn — close enough to be worth a second look
 *
 * Near-grey roles are skipped: below a small chroma threshold hue is noise, and
 * a neutral is *meant* to be neutral.
 *
 * USAGE
 *   node scripts/verify-hue-roles.mjs
 *   node scripts/verify-hue-roles.mjs --allow-close   # downgrade failures to warnings
 *
 * The escape hatch is deliberate. A fire-safety brand really is red, and the
 * script should not be the thing that stops you shipping. It should be the
 * thing that made sure you chose it.
 */
import { COLOR, SEM_COLOR } from '../src/values.mjs';

const FAIL_DEG = 20;
const WARN_DEG = 40;
const MIN_CHROMA = 0.04;

const allowClose = process.argv.includes('--allow-close');

// ── sRGB → OKLCH ──────────────────────────────────────────────────────────────
const toLinear = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };

function oklch(hex) {
  const h = hex.replace('#', '');
  const r = toLinear(parseInt(h.slice(0, 2), 16));
  const g = toLinear(parseInt(h.slice(2, 4), 16));
  const b = toLinear(parseInt(h.slice(4, 6), 16));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  let H = Math.atan2(B, A) * 180 / Math.PI;
  if (H < 0) H += 360;
  return { C: Math.hypot(A, B), H };
}

// shortest arc between two hue angles, 0-180
const arc = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

// ── resolve each role to a concrete colour, via the semantic layer ────────────
const ROLES = ['brand', 'accent', 'danger', 'success', 'warning'];

const resolved = [];
for (const role of ROLES) {
  const alias = SEM_COLOR[`background/${role}/bold/default`];
  if (!alias) continue;
  const [hue, step] = alias.split('.');
  const hex = COLOR[hue]?.[step];
  if (!hex) {
    console.error(`✗ background/${role}/bold/default → ${alias}, which does not exist in COLOR`);
    process.exit(1);
  }
  resolved.push({ role, hue, alias, hex, ...oklch(hex) });
}

console.log('');
console.log('  role distinguishability');
console.log('  ──────────────────────────────────────────────');
for (const r of resolved) {
  const grey = r.C < MIN_CHROMA ? '  (near-grey, skipped)' : '';
  console.log(`  ${r.role.padEnd(9)} ${r.alias.padEnd(14)} ${r.hex}  hue ${r.H.toFixed(0).padStart(3)}°${grey}`);
}

const chromatic = resolved.filter((r) => r.C >= MIN_CHROMA);
const problems = [];

for (let i = 0; i < chromatic.length; i++) {
  for (let j = i + 1; j < chromatic.length; j++) {
    const a = chromatic[i], b = chromatic[j];
    const d = arc(a.H, b.H);
    if (d < WARN_DEG) problems.push({ a, b, d, fail: d < FAIL_DEG, same: a.hue === b.hue });
  }
}

if (!problems.length) {
  const min = chromatic.length > 1
    ? Math.min(...chromatic.flatMap((a, i) => chromatic.slice(i + 1).map((b) => arc(a.H, b.H))))
    : 180;
  console.log('');
  console.log(`  ✓ every role sits in its own hue family (closest pair ${min.toFixed(0)}° apart)`);
  console.log('');
  process.exit(0);
}

problems.sort((x, y) => x.d - y.d);
console.log('');

for (const p of problems) {
  const mark = p.fail && !allowClose ? '✗' : '!';
  console.log(`  ${mark} ${p.a.role} and ${p.b.role} are ${p.d.toFixed(0)}° apart in hue`);
  if (p.same) {
    console.log(`    Both alias the same ramp (${p.a.hue}). They will render identically —`);
    console.log(`    the ${p.b.role} layer no longer exists as a distinct thing.`);
  } else {
    console.log(`    ${p.a.hex} (${p.a.alias})  vs  ${p.b.hex} (${p.b.alias})`);
  }
  if ((p.a.role === 'brand' && p.b.role === 'danger') || (p.a.role === 'danger' && p.b.role === 'brand')) {
    console.log(`    This is the expensive one: your primary action and your destructive`);
    console.log(`    action are the same colour. "Save" and "Delete permanently" stop`);
    console.log(`    being distinguishable at a glance.`);
  }
  console.log('');
}

const failures = problems.filter((p) => p.fail);

if (failures.length && !allowClose) {
  console.log('  Every chain here resolves correctly — that is not what this check is about.');
  console.log('  Pick a brand hue further from your status hues, or re-run with');
  console.log('  --allow-close if this really is the palette you intend to ship.');
  console.log('');
  process.exit(1);
}

console.log(allowClose && failures.length
  ? '  ! close pairs allowed via --allow-close'
  : '  ✓ no role pair is in the same hue family');
console.log('');
