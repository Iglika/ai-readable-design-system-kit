/**
 * values.mjs — THE SINGLE INPUT.
 *
 * Every brand decision in this system lives in this file and nowhere else.
 * Everything downstream is generated from it, and none of it should ever be
 * hand-edited:
 *
 *                       ┌──────────────────┐
 *                       │  src/values.mjs  │  ← the one file you edit
 *                       └────────┬─────────┘
 *             ┌──────────────────┴──────────────────┐
 *             ▼                                     ▼
 *      build-tokens.mjs                      the setup skill
 *             │                                     │
 *      dist/tokens.json                           ▼
 *             │                               your Figma file
 *      build-css.mjs                          (~22 primitives rebound;
 *             │                                all 311 semantics and
 *      dist/tokens.css                        134 variants follow)
 *             │
 *      build-skill.mjs
 *             │
 *      ../handoff/SKILL.md
 *
 * The Figma file and the CSS are two renderings of the same decisions. Neither
 * is upstream of the other — this file is upstream of both. That is what keeps
 * a rebrand from having to be done twice and drifting.
 *
 * WHY THIS IS A .mjs AND NOT A .json
 * The comments are half the product. They carry the reasoning behind each
 * decision, and JSON cannot hold them. Keep them: they are what makes the next
 * person's change a decision rather than a guess.
 *
 * EVERYTHING BELOW IS A PLACEHOLDER. Replace the values, keep the structure —
 * every prompt, checkpoint and screenshot in the guide refers to these shapes.
 *
 * After editing:  npm run build && npm run verify
 */

/**
 * Six hues, eleven steps each, plus base white/black and the shadow alphas.
 *
 * Hues are named for WHAT THEY ARE, never what they are for. `indigo`, not
 * `brand` — the semantic layer is where purpose gets named. If you rename this
 * to `brand` you have collapsed two layers into one and lost the ability to
 * rebrand without renaming every token.
 *
 * 50 = lightest (page tints), 500 = the base step, 950 = darkest (text on light).
 */
const COLOR = {
  base: { white: '#FFFFFF', black: '#000000' },

  // neutral UI — surfaces, text, borders, dividers
  gray:    { 50:'#F8FAFC',100:'#F1F5F9',200:'#E2E8F0',300:'#CBD5E1',400:'#94A3B8',500:'#64748B',600:'#475569',700:'#334155',800:'#1E293B',900:'#0F172A',950:'#020617' },

  // PLACEHOLDER BRAND — swap this ramp for yours first
  indigo:  { 50:'#EEF2FF',100:'#E0E7FF',200:'#C7D2FE',300:'#A5B4FC',400:'#818CF8',500:'#6366F1',600:'#4F46E5',700:'#4338CA',800:'#3730A3',900:'#312E81',950:'#1E1B4B' },

  // PLACEHOLDER ACCENT — a second brand hue for highlights and secondary actions
  teal:    { 50:'#F0FDFA',100:'#CCFBF1',200:'#99F6E4',300:'#5EEAD4',400:'#2DD4BF',500:'#14B8A6',600:'#0D9488',700:'#0F766E',800:'#115E59',900:'#134E4A',950:'#042F2E' },

  // status hues — keep these unless your brand has a reason to move them
  red:     { 50:'#FEF2F2',100:'#FEE2E2',200:'#FECACA',300:'#FCA5A5',400:'#F87171',500:'#EF4444',600:'#DC2626',700:'#B91C1C',800:'#991B1B',900:'#7F1D1D',950:'#450A0A' },
  emerald: { 50:'#ECFDF5',100:'#D1FAE5',200:'#A7F3D0',300:'#6EE7B7',400:'#34D399',500:'#10B981',600:'#059669',700:'#047857',800:'#065F46',900:'#064E3B',950:'#022C22' },
  amber:   { 50:'#FFFBEB',100:'#FEF3C7',200:'#FDE68A',300:'#FCD34D',400:'#FBBF24',500:'#F59E0B',600:'#D97706',700:'#B45309',800:'#92400E',900:'#78350F',950:'#451A03' },

  /**
   * Shadow colours carry their alpha BAKED IN. This is not a style choice.
   * Figma cannot alias a colour variable and then apply opacity on top of it,
   * so anything translucent needs its own primitive. See traps.md.
   */
  shadow:  {
    'black-4':'rgba(2,6,23,0.04)',  'black-6':'rgba(2,6,23,0.06)',
    'black-8':'rgba(2,6,23,0.08)',  'black-10':'rgba(2,6,23,0.10)',
    'black-14':'rgba(2,6,23,0.14)', 'black-18':'rgba(2,6,23,0.18)',
    'black-25':'rgba(2,6,23,0.25)'
  }
};

/**
 * Tailwind's spacing scale, verbatim. `dimension/4` is 16px because Tailwind's
 * `4` is 16px — so `p-4` in code and `dimension/4` in Figma agree without a
 * translation table in anyone's head.
 *
 * Renaming these to pixel values (dimension/16) looks tidier and breaks that
 * correspondence. Don't.
 *
 * Dots become hyphens: `0-5` is Tailwind's `0.5` = 2px. A dot would collide
 * with the DTCG path separator.
 */
const DIMENSION = {
  '0':0,'0-25':1,'0-5':2,'1':4,'1-5':6,'2':8,'2-5':10,'3':12,'3-5':14,'4':16,'4-5':18,
  '5':20,'5-5':22,'6':24,'7':28,'8':32,'9':36,'10':40,'11':44,'12':48,'13':52,'14':56,
  '15':60,'16':64,'18':72,'20':80,'22':88,'24':96,'999':999
};

/**
 * Two fonts: one with personality for headings, one built for reading.
 *
 * `style` holds the Figma font-style STRING; `weight` holds the CSS NUMBER.
 * They are separate on purpose — Figma binds style names, CSS needs numbers.
 * Verify your style strings with listAvailableFontsAsync() before binding;
 * guessing the casing throws.
 */
const FONT = {
  // The two-font strategy governs INTERFACE type. Documentation and code need a third
  // face — a prompt block set in a proportional font is the one thing readers copy.
  family: { heading: 'Outfit', body: 'Inter', mono: 'IBM Plex Mono' },  // PLACEHOLDER — swap for your brand
  // Figma style strings are family-specific. Outfit uses `SemiBold`; Inter uses
  // `Semi Bold`. Keeping one shared string makes one family fail silently.
  style:  {
    heading: { regular:'Regular', medium:'Medium', semibold:'SemiBold',  bold:'Bold' },
    body:    { regular:'Regular', medium:'Medium', semibold:'Semi Bold', bold:'Bold' },
    mono:    { regular:'Regular', medium:'Medium', semibold:'SemiBold',  bold:'Bold' }
  },
  weight: { regular:400, medium:500, semibold:600, bold:700 },
  size:   [12,14,16,18,20,24,28,32,36,40,48,52,56,64],
  /**
   * Line height as a UNITLESS RATIO, never px. Ratios survive a size change;
   * a px line height silently breaks the moment the font size moves.
   * The key is the percentage, the value is the ratio CSS wants.
   */
  lineheight: { 110:1.1, 120:1.2, 130:1.3, 140:1.4, 150:1.5, 160:1.6 },
  letterspacing: { normal:0, tight:-0.02, tighter:-0.04 },
  paragraphspacing: [0,20,40]
};

/**
 * Motion primitives. Durations in ms, easings as CSS timing functions.
 * Most starter kits skip motion entirely, which is why most vibe-coded UI
 * animates at whatever the framework's default happens to be.
 */
const MOTION = {
  duration: { '0':0, '160':160, '220':220, '320':320, '400':400 },
  easing: {
    standard: 'cubic-bezier(0.23, 1, 0.32, 1)',   // decelerating — the system curve
    gentle:   'cubic-bezier(0.44, 0, 0.56, 1)',   // symmetrical ease-in-out
    linear:   'linear'
  }
};

// semantic motion: role -> primitive step
const SEM_MOTION = {
  duration: {
    instant:    ['0',   'No transition. The reduced-motion fallback.'],
    state:      ['160', 'Hover, focus, press on a control.'],
    fade:       ['220', 'Opacity only. Shorter than layout on purpose.'],
    layout:     ['320', 'Size, position, reveal.'],
    deliberate: ['400', 'Slow colour washes. Use sparingly.']
  },
  easing: {
    default: ['standard', 'The system curve. Reach for this first.'],
    gentle:  ['gentle',   'Symmetrical; pairs with deliberate.']
  }
};

/**
 * SEMANTIC COLOUR — the layer that makes the system readable by anything.
 *
 *   property / intent / emphasis / state   ->   primitive
 *
 *   property   background · text · border · icon
 *   intent     neutral · brand · accent · inverse · danger · success · warning
 *   emphasis   bold · subtle · subtlest
 *   state      default · hovered · pressed · focused · disabled
 *
 * EMPHASIS IS A CONTRAST RULE, NOT A PREFERENCE:
 *   bold      saturated fill  -> text on it must be `inverse` (white)
 *   subtle    tinted fill     -> text stays neutral or the matching intent
 *   subtlest  barely tinted   -> for layering a tint on a tint
 *
 * `inverse` means a dark surface inside a light page — a nav, a footer, a CTA
 * band. IT IS NOT DARK MODE. Dark mode is a mode on this collection, and it is
 * a design project, not a token-filling exercise.
 *
 * CELLS EXIST ONLY WHERE THEY MEAN SOMETHING. A subtlest background has no
 * pressed state. An error message has no disabled state. That selectivity is
 * the whole difference between a system with 100 semantics and one with 700.
 * Do not fill the matrix. Add a cell when a component needs it.
 */
const SEM_COLOR = {
  // ── background ──────────────────────────────────────────────────────────
  'background/brand/bold/default':'indigo.600','background/brand/bold/hovered':'indigo.700','background/brand/bold/pressed':'indigo.800','background/brand/bold/disabled':'indigo.200',
  'background/brand/subtle/default':'indigo.100','background/brand/subtle/hovered':'indigo.200','background/brand/subtle/pressed':'indigo.300','background/brand/subtle/disabled':'indigo.50',
  'background/brand/subtlest/default':'indigo.50','background/brand/subtlest/hovered':'indigo.100',

  'background/accent/bold/default':'teal.600','background/accent/bold/hovered':'teal.700','background/accent/bold/pressed':'teal.800',
  'background/accent/subtle/default':'teal.100','background/accent/subtlest/default':'teal.50',

  'background/neutral/bold/default':'gray.300','background/neutral/bold/hovered':'gray.400',
  'background/neutral/subtle/default':'gray.100','background/neutral/subtle/hovered':'gray.200','background/neutral/subtle/pressed':'gray.300','background/neutral/subtle/disabled':'gray.200',
  'background/neutral/subtlest/default':'gray.50','background/neutral/subtlest/hovered':'gray.100','background/neutral/subtlest/pressed':'gray.200','background/neutral/subtlest/disabled':'gray.50','background/neutral/subtlest/focused':'base.white',

  'background/inverse/bold/default':'gray.900','background/inverse/bold/hovered':'gray.800','background/inverse/bold/pressed':'gray.950','background/inverse/subtle/default':'gray.800',

  'background/danger/bold/default':'red.600','background/danger/bold/hovered':'red.700','background/danger/bold/pressed':'red.800','background/danger/bold/disabled':'red.200',
  'background/danger/subtle/default':'red.100','background/danger/subtle/hovered':'red.200','background/danger/subtlest/default':'red.50',

  'background/success/bold/default':'emerald.600','background/success/bold/hovered':'emerald.700','background/success/bold/pressed':'emerald.800','background/success/bold/disabled':'emerald.200',
  'background/success/subtle/default':'emerald.100','background/success/subtle/hovered':'emerald.200','background/success/subtlest/default':'emerald.50',

  'background/warning/bold/default':'amber.500','background/warning/bold/hovered':'amber.600',
  'background/warning/subtle/default':'amber.100','background/warning/subtlest/default':'amber.50',

  // surface — the page and the things raised off it
  'background/surface/default/default':'base.white','background/surface/raised/default':'base.white','background/surface/sunken/default':'gray.50',

  // ── text ────────────────────────────────────────────────────────────────
  'text/neutral/bold/default':'gray.900','text/neutral/bold/hovered':'gray.950','text/neutral/bold/disabled':'gray.500',
  'text/neutral/subtle/default':'gray.700','text/neutral/subtle/hovered':'gray.800','text/neutral/subtle/disabled':'gray.400',
  'text/neutral/subtlest/default':'gray.600','text/neutral/subtlest/disabled':'gray.300',

  'text/brand/bold/default':'indigo.700','text/brand/bold/hovered':'indigo.800','text/brand/bold/pressed':'indigo.900','text/brand/bold/disabled':'indigo.300',
  'text/brand/subtle/default':'indigo.600','text/brand/subtle/hovered':'indigo.700',
  'text/accent/bold/default':'teal.700','text/accent/bold/hovered':'teal.800',

  'text/inverse/bold/default':'base.white','text/inverse/bold/hovered':'gray.100','text/inverse/bold/disabled':'gray.500','text/inverse/subtle/default':'gray.300',

  'text/danger/bold/default':'red.700','text/danger/bold/hovered':'red.800','text/danger/subtle/default':'red.600',
  'text/success/bold/default':'emerald.700','text/success/bold/hovered':'emerald.800','text/success/subtle/default':'emerald.600',
  'text/warning/bold/default':'amber.700','text/warning/subtle/default':'amber.600',

  // ── border ──────────────────────────────────────────────────────────────
  'border/neutral/default/default':'gray.300','border/neutral/default/hovered':'gray.400','border/neutral/default/focused':'indigo.600','border/neutral/default/disabled':'gray.200',
  'border/neutral/bold/default':'gray.400','border/neutral/bold/hovered':'gray.500',
  'border/neutral/subtle/default':'gray.200',

  'border/brand/default/default':'indigo.500','border/brand/default/hovered':'indigo.600','border/brand/default/pressed':'indigo.700','border/brand/default/disabled':'indigo.200',
  'border/brand/subtle/default':'indigo.200',
  'border/accent/default/default':'teal.500',
  'border/inverse/default/default':'gray.700',

  'border/danger/default/default':'red.500','border/danger/default/hovered':'red.600','border/danger/default/focused':'red.600',
  'border/success/default/default':'emerald.500',
  'border/warning/default/default':'amber.500',

  // ── icon ────────────────────────────────────────────────────────────────
  'icon/neutral/bold/default':'gray.900','icon/neutral/bold/hovered':'gray.950','icon/neutral/bold/disabled':'gray.300',
  'icon/neutral/subtle/default':'gray.500','icon/neutral/subtle/hovered':'gray.700','icon/neutral/subtle/disabled':'gray.300',
  'icon/brand/bold/default':'indigo.600','icon/brand/bold/hovered':'indigo.700',
  'icon/accent/bold/default':'teal.600',
  'icon/inverse/bold/default':'base.white',
  'icon/danger/bold/default':'red.500','icon/success/bold/default':'emerald.500','icon/warning/bold/default':'amber.500'
};

/**
 * Semantic dimension. These are NOT parallel scales to `dimension` — they are
 * semantic USES of it. T-shirt sizing is correct here and wrong for primitives.
 */
const SEM_DIMENSION = {
  radius:  { none:'0', sm:'1', md:'2', lg:'3', xl:'4', '2xl':'6', full:'999' },
  // 8xl–10xl (64/80/96) exist for DOCUMENT layout, not product UI. A 1440-wide page
  // section needs 96px of padding; capping the semantic scale at 56 forced raw values
  // into the one file that teaches the tier rule. The primitives were already there.
  spacing: { none:'0', xxs:'0-5', xs:'1', sm:'1-5', md:'2', lg:'3', xl:'4', '2xl':'5', '3xl':'6', '4xl':'8', '5xl':'10', '6xl':'12', '7xl':'14', '8xl':'16', '9xl':'20', '10xl':'24' },
  'border-width': { none:'0', thin:'0-25', default:'0-5', thick:'1' },
  size:    { xs:'3', sm:'4', md:'5', lg:'6', xl:'8', '2xl':'10', '3xl':'12', '4xl':'14', '5xl':'16' }
};

/**
 * TYPE RAMP — [size, lineheight%] per breakpoint.
 *
 * Three breakpoints: mobile <810 · tablet 810–1199 · desktop ≥1200.
 * Three is almost always enough. If two breakpoints hold identical values,
 * you have a breakpoint, not a decision.
 *
 * Text styles ARE the semantic layer for type. Figma variables cannot express
 * a composite text style, and text styles cannot consume modes — so a
 * responsive ramp has to be explicit styles per breakpoint, not one token
 * with a mode per screen size. See traps.md.
 */
const HEADINGS = {
  jumbo: { style:'semibold', ls:'tighter', desktop:[64,110], tablet:[52,110], mobile:[40,120], ps:0 },
  h1:    { style:'semibold', ls:'tighter', desktop:[48,120], tablet:[40,120], mobile:[32,120], ps:0 },
  h2:    { style:'semibold', ls:'tighter', desktop:[40,120], tablet:[32,130], mobile:[28,130], ps:40 },
  h3:    { style:'semibold', ls:'tight',   desktop:[32,130], tablet:[28,130], mobile:[24,130], ps:40 },
  h4:    { style:'semibold', ls:'tight',   desktop:[24,140], tablet:[24,140], mobile:[20,140], ps:40 },
  h5:    { style:'semibold', ls:'tight',   desktop:[20,140], tablet:[20,140], mobile:[18,140], ps:40 },
  h6:    { style:'semibold', ls:'normal',  desktop:[18,140], tablet:[18,140], mobile:[16,140], ps:40 }
};

// Body is CONSTANT across breakpoints. Reading size does not need to respond.
// Leading is graded inversely to size — bigger text takes less, smaller takes more.
const BODY = { large:[20,150], medium:[18,150], default:[16,160], small:[14,160], tiny:[12,160] };
const BODY_WEIGHTS = ['regular','medium','semibold','bold'];

/**
 * ELEVATION — [offsetY, blur, spread, alpha-primitive] per layer.
 *
 * Real shadows are layered. One big soft blur reads as a sticker; three or four
 * stacked layers with tightening spreads read as a lit object.
 *
 * Colour is bound to variables. Geometry is not — offsets and blurs aren't
 * shared between styles, so a variable would have exactly one consumer.
 */
const SHADOWS = {
  xs: [[1,2,0,'black-6']],
  sm: [[1,1,-1,'black-10'],[2,2,-3,'black-8'],[8,8,-4,'black-6']],
  md: [[1,1,-1,'black-8'],[2,2,-2,'black-8'],[5,5,-3,'black-6'],[12,12,-4,'black-4']],
  lg: [[1,1,-1,'black-14'],[2,2,-2,'black-10'],[6,6,-3,'black-8'],[20,20,-4,'black-6']],
  xl: [[25,50,-12,'black-25']]
};

export {
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
};
