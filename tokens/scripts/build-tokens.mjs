/**
 * build-tokens.mjs — machinery. Turns src/values.mjs into DTCG dist/tokens.json.
 *
 * THERE IS NOTHING TO EDIT IN THIS FILE. Your brand values live in
 * `src/values.mjs`; this only reshapes them.
 *
 *   ┌──────────────────┐    ┌──────────────────┐    ┌─────────────┐    ┌────────────┐
 *   │  src/values.mjs  │ -> │ build-tokens.mjs │ -> │ tokens.json │ -> │ tokens.css │
 *   └──────────────────┘    └──────────────────┘    └─────────────┘    └────────────┘
 *            │
 *            └──> the setup skill rebinds the same values in Figma
 *
 * The same input drives both the Figma file and the code layer, so a rebrand is
 * made once. If Figma and this file ever disagree, `prompts/07-code-layer.md`
 * exports Figma and diffs it against the generated tokens.json — that diff is
 * the drift check, and src/values.mjs is what gets corrected.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  COLOR,
  DIMENSION,
  FONT,
  MOTION,
  SEM_MOTION,
  SEM_COLOR,
  SEM_DIMENSION,
  HEADINGS,
  BODY,
  BODY_WEIGHTS,
  SHADOWS
} from '../src/values.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

/* ═══════════════════════════════════════════════════════════ GENERATE ══
 * Machinery below. You should not need to touch any of it.
 * ═════════════════════════════════════════════════════════════════════════ */

const t = (type, value, desc) => desc ? { $type:type, $value:value, $description:desc } : { $type:type, $value:value };
const px = n => `${n}px`;

const tokens = {
  $description: 'Design tokens. Generated from Figma — do not edit by hand. Edit in Figma, re-export, regenerate.',
  color: {}, dimension: {}, font: {}, motion: {}, semantic: {}
};

// primitives — colour
for (const [group, steps] of Object.entries(COLOR)) {
  tokens.color[group] = {};
  for (const [step, hex] of Object.entries(steps)) tokens.color[group][step] = t('color', hex);
}

// primitives — dimension
for (const [step, val] of Object.entries(DIMENSION)) tokens.dimension[step] = t('dimension', px(val));

// primitives — font
tokens.font.family = {};
for (const [k, v] of Object.entries(FONT.family)) tokens.font.family[k] = t('fontFamily', v);
tokens.font.style = {};
for (const [family, styles] of Object.entries(FONT.style)) {
  tokens.font.style[family] = {};
  for (const [k, v] of Object.entries(styles)) {
    tokens.font.style[family][k] = t('string', v, `Figma ${family} font style string`);
  }
}
tokens.font.weight = {};
for (const [k, v] of Object.entries(FONT.weight)) tokens.font.weight[k] = t('fontWeight', v);
tokens.font.size = {};
for (const s of FONT.size) tokens.font.size[s] = t('dimension', px(s));
tokens.font.lineheight = {};
for (const [k, v] of Object.entries(FONT.lineheight)) tokens.font.lineheight[k] = t('number', v, `${k}% as a unitless ratio`);
tokens.font.letterspacing = {};
for (const [k, v] of Object.entries(FONT.letterspacing)) tokens.font.letterspacing[k] = t('dimension', `${v}em`);
tokens.font.paragraphspacing = {};
for (const s of FONT.paragraphspacing) tokens.font.paragraphspacing[s] = t('dimension', px(s));

// primitives — motion
tokens.motion = { duration: {}, easing: {} };
for (const [k, v] of Object.entries(MOTION.duration)) tokens.motion.duration[k] = t('duration', `${v}ms`);
for (const [k, v] of Object.entries(MOTION.easing))   tokens.motion.easing[k]   = t('cubicBezier', v);

// semantics — colour
tokens.semantic.color = {};
for (const [path, target] of Object.entries(SEM_COLOR)) {
  const parts = path.split('/');
  let node = tokens.semantic.color;
  for (let i = 0; i < parts.length - 1; i++) node = (node[parts[i]] ??= {});
  node[parts.at(-1)] = t('color', `{color.${target}}`);
}

// semantics — motion
tokens.semantic.motion = { duration: {}, easing: {} };
for (const [name, [step, desc]] of Object.entries(SEM_MOTION.duration))
  tokens.semantic.motion.duration[name] = t('duration', `{motion.duration.${step}}`, desc);
for (const [name, [step, desc]] of Object.entries(SEM_MOTION.easing))
  tokens.semantic.motion.easing[name] = t('cubicBezier', `{motion.easing.${step}}`, desc);

// semantics — dimension families
for (const [family, map] of Object.entries(SEM_DIMENSION)) {
  tokens.semantic[family] = {};
  for (const [name, step] of Object.entries(map)) {
    tokens.semantic[family][name] = t('dimension', `{dimension.${step}}`);
  }
}

// semantics — typography (composite)
tokens.semantic.typography = { heading: {}, body: {} };
for (const bp of ['desktop','tablet','mobile']) {
  tokens.semantic.typography.heading[bp] = {};
  for (const [name, cfg] of Object.entries(HEADINGS)) {
    const [size, lh] = cfg[bp];
    tokens.semantic.typography.heading[bp][name] = {
      $type: 'typography',
      $value: {
        fontFamily: '{font.family.heading}',
        fontWeight: `{font.weight.${cfg.style}}`,
        fontSize: `{font.size.${size}}`,
        lineHeight: `{font.lineheight.${lh}}`,
        letterSpacing: `{font.letterspacing.${cfg.ls}}`
      }
    };
  }
}
for (const [size, [px_, lh]] of Object.entries(BODY)) {
  tokens.semantic.typography.body[size] = {};
  for (const w of BODY_WEIGHTS) {
    tokens.semantic.typography.body[size][w] = {
      $type: 'typography',
      $value: {
        fontFamily: '{font.family.body}',
        fontWeight: `{font.weight.${w}}`,
        fontSize: `{font.size.${px_}}`,
        lineHeight: `{font.lineheight.${lh}}`,
        letterSpacing: '{font.letterspacing.normal}'
      }
    };
  }
}

// semantics — shadow (composite, multi-layer)
tokens.semantic.shadow = {};
for (const [name, layers] of Object.entries(SHADOWS)) {
  tokens.semantic.shadow[name] = {
    $type: 'shadow',
    $value: layers.map(([y, blur, spread, alpha]) => ({
      offsetX: '0px', offsetY: px(y), blur: px(blur), spread: px(spread),
      color: `{color.shadow.${alpha}}`
    }))
  };
}

mkdirSync(resolve(root, 'dist'), { recursive: true });
writeFileSync(resolve(root, 'dist/tokens.json'), JSON.stringify(tokens, null, 2) + '\n');

const count = (o) => Object.values(o).reduce((n, v) =>
  v && typeof v === 'object' ? (v.$value !== undefined ? n + 1 : n + count(v)) : n, 0);

const countIn = (o) => o ? count(o) : 0;
console.log(`dist/tokens.json written — ${count(tokens)} tokens`);
console.log(`  primitives : ${countIn(tokens.color) + countIn(tokens.dimension) + countIn(tokens.font) + countIn(tokens.motion)}`);
console.log(`  semantics  : ${countIn(tokens.semantic)}`);
