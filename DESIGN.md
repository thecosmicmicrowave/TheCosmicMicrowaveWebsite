---
name: The Cosmic Microwave — FTC 35817
description: Instrument-panel cosmic-dark site for a veteran FTC robotics team courting sponsors.
colors:
  bg-primary: "#0a0a14"
  bg-secondary: "#111128"
  bg-card: "rgba(20, 20, 50, 0.7)"
  text-primary: "#f0f0ff"
  text-secondary: "#b8b8e0"
  accent-1: "#7b4cff"
  accent-2: "#ff3b30"
  accent-3: "#ff6b6b"
  accent-deep: "#b30000"
  border-soft: "rgba(123, 76, 255, 0.18)"
  border-warm: "rgba(255, 59, 48, 0.14)"
  glow-1: "rgba(123, 76, 255, 0.30)"
  glow-2: "rgba(255, 59, 48, 0.20)"
typography:
  display:
    fontFamily: "Orbitron, system-ui, sans-serif"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0.5px"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "10px"
  md: "16px"
  pill: "999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "24px"
  6: "32px"
  7: "48px"
  8: "64px"
  9: "96px"
components:
  button-primary:
    backgroundColor: "{colors.accent-1}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "12px 32px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "12px 32px"
  card:
    backgroundColor: "{colors.bg-card}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "32px"
---

# Design System: The Cosmic Microwave — FTC 35817

## Overview

**Creative North Star: "The Night-Shift Galley"**

Mission control after hours, run by a small crew who treat robotics the way the team's own motto treats thinking: *cogitare est coquere* — a recipe, followed with precision. The instrument-panel structure is real (hairline dividers instead of card grids, Orbitron reserved for readouts and headline moments, one accent color used like a status light, not a decoration), but it's warmed by the kitchen half of the metaphor: the deep red accent reads as a heating element, not a corporate CTA color, and the copy voice stays plainly written by the people who built the thing, not a marketing department.

This system was consolidated in 2026-08 from four independently-drifting, hand-copied stylesheets into one token-driven `assets/css/main.css`, replacing a Font Awesome + emoji icon system with an inline SVG sprite, and replacing repeated gradient-clip-text headlines and rounded-pill/glass card grids with flat hairline-divided rows. Those are confirmed rejections, not defaults to relitigate.

**Key Characteristics:**
- Dark-only, cosmic palette with exactly one warm accent (`--accent-2`) and one cool accent (`--accent-1`), never more.
- Orbitron is a rare instrument-readout voice — headline, stat numbers, tier names, logo wordmark — never body text, never every heading.
- Flat surfaces at rest; depth only appears as an accent glow on hover/focus, never as a static shadow or gradient decoration.
- Content that's a roster or log (team, news, sponsor tiers) reads as hairline-divided rows, not a same-size card grid.
- No emoji, ever — an inline SVG sprite is the only icon system.

## Colors

One warm accent, one cool accent, everything else neutral. The warm accent (`--accent-2`) is the "heating element" — used sparingly, for calls to action and readouts, never as page-wide decoration.

### Primary
- **Ember Red** (`#ff3b30`, `--accent-2`): the one color that means "act here." Primary buttons, active nav underline, form focus glow, hero highlight text. Its 20%-alpha derivative `--glow-2` (`rgba(255,59,48,0.20)`) is the only permitted glow, and only on hover/focus states.
- **Ember Deep** (`#b30000`, `--accent-deep`): the second stop in the primary button's gradient only. Never used standalone.

### Secondary
- **Console Violet** (`#7b4cff`, `--accent-1`): the cool instrument-light accent — hero badge background, nav-menu hover fill. Its 18%-alpha derivative `--border-soft` is the default hairline border color for header/nav chrome. Icons consistently use `--accent-2` (Ember Red), not this color — see the Icons rule under Components.
- **Ember Light** (`#ff6b6b`, `--accent-3`): reserved for solid-color emphasis text where the old system used to reach for gradient-clip (hero "Microwave," section-title fallback color). Never gradient-clipped — see the No-Gradient-Text Rule below.

### Neutral
- **Deep Space** (`#0a0a14`, `--bg-primary`): page background.
- **Console Bay** (`#111128`, `--bg-secondary`): alternating section background (`.section--alt`).
- **Panel Glass** (`rgba(20,20,50,0.7)`, `--bg-card`): card/form surface, always with a `--border-warm` hairline, never a heavier shadow.
- **Readout White** (`#f0f0ff`, `--text-primary`): primary text, headings.
- **Static Grey-Violet** (`#b8b8e0`, `--text-secondary`): body copy, captions, labels. Measured at 10.3:1 contrast against `--bg-primary`.
- **Ember Border** (`rgba(255,59,48,0.14)`, `--border-warm`): the hairline that divides every row list and outlines every card.

### Named Rules
**The One Warm Accent Rule.** `--accent-2`/`--accent-deep` is the only warm color on the page at any zoom level. If a second warm hue shows up, it's a mistake, not a variant.

**The No-Gradient-Text Rule.** No `background-clip: text` gradient anywhere, on any heading, ever. This was the system's most repeated tell of unfinished/templated execution before the 2026-08 consolidation. Emphasis comes from `--accent-2`/`--accent-3` solid color, weight, or size — never a clipped gradient.

## Typography

**Display Font:** Orbitron (weights 600/700/900), with `system-ui, sans-serif` fallback
**Body Font:** Inter (weights 400/500/600/700), with `system-ui, sans-serif` fallback

**Character:** Orbitron is a rare instrument-readout voice, not a default heading font — it appears on the hero H1, stat numbers, page-head titles, sponsor tier names, and the wordmark, and nowhere else. Inter carries every h3–h6, all body copy, all UI chrome (nav, buttons, form labels).

### Hierarchy
- **Display** (900, `clamp(2.4rem, 5vw, 3.8rem)`, 1.15): hero H1 only.
- **Headline** (700, `--text-2xl` / `--text-3xl` = 2rem–3rem): section titles, page-head titles — solid `--accent-3` color, never gradient-clipped.
- **Title** (700, `--text-xl` = 1.5rem, Inter): card/row headings (team names, news titles, tier-spotlight name uses Orbitron instead as the one exception, since it's a readout label).
- **Body** (400, `--text-base`–`--text-lg`, line-height 1.6): all paragraph copy. Reading columns (`.post-body`) cap at 68ch.
- **Label** (500–600, `--text-xs`–`--text-sm`, sometimes uppercase + tracked): stat labels, nav links, badge text, form labels.

### Named Rules
**The Rare Readout Rule.** Orbitron's footprint is capped to hero H1, stat numbers, page-head titles, sponsor tier names, and the wordmark. If a new component wants Orbitron on body-weight text, it's over budget — use weight/color in Inter instead.

## Layout

12px/8px-derived spacing scale (`--space-1` 4px through `--space-9` 96px), single `.container` at `max-width: 1200px` with `--space-5` (24px) inline padding. Sections use `.section` (96px block padding, 64px at ≤768px, 48px at ≤480px) with `.section--alt` alternating to `--bg-secondary` for rhythm instead of dividing borders. Two-column layouts (`hero-grid`, `about-grid`, `contact-grid`) collapse to one column at 900px. A fixed `--header-h` (80px) header sits above a fixed-position, zero-DOM-node CSS starfield (`.starfield`, three layered `radial-gradient` pseudo-elements) that shows through every non-`.section--alt` section.

## Elevation & Depth

Flat by default, glow on state — no static shadows as decoration. `.card` is flat with a `--border-warm` hairline at rest; on `.card--interactive:hover` it lifts 4px and gains `--elev-2` plus a border-color shift, and only then. Buttons follow the same rule: flat `--elev-1` at rest, a colored `--glow-2` box-shadow only on hover. The one exception is the hero image's `radial-gradient` halo, which is a fixed ambient glow behind a photographic/logo element, not a text or card effect.

### Shadow Vocabulary
- **Ambient rest** (`--elev-1`, `0 2px 8px rgba(0,0,0,0.20)`): default button/card shadow at rest.
- **Hover lift** (`--elev-2`, `0 8px 30px rgba(0,0,0,0.30)`): card hover state only.
- **Menu float** (`--elev-3`, `0 20px 60px rgba(0,0,0,0.45)`): the nav dropdown menu only — the one component allowed to feel like it's floating above the page.

### Named Rules
**The Flat-By-Default Rule.** Every surface starts flat. Shadow and glow are earned by a state change (hover, focus, open), never present at rest.

## Shapes

Two corner languages, used consistently by role: `--radius-pill` (999px) on every button and badge — "this is a control, press it" — and `--radius` (16px, `--radius-sm` 10px for inputs) on every card/panel surface — "this is a container." No sharp rectangles and no third radius value anywhere.

## Components

### Buttons
- **Shape:** full pill (`999px`), `min-height: 44px` (touch target floor).
- **Primary:** `linear-gradient(135deg, --accent-1, --accent-deep)` fill, white text, `--elev-1` at rest.
- **Hover/Focus:** `translateY(-2px)` plus `--glow-2` box-shadow on hover; every button gets the global 2px `--accent-1` `:focus-visible` ring, offset 2px, no exceptions.
- **Secondary:** transparent fill, `1px solid rgba(255,255,255,0.18)` border, hover shifts border to `--accent-2` with a faint `--border-warm` fill tint.
- **Ghost:** transparent, `--accent-2` text, no border, used sparingly (tier-jump-style inline links use the pill-bordered `.tier-jump a` variant instead).

### Cards / Containers
- **Corner style:** 16px radius, always.
- **Background:** `--bg-card` (semi-transparent panel violet) with `4px` backdrop blur.
- **Shadow strategy:** flat at rest; see Elevation & Depth.
- **Border:** 1px `--border-warm` always present, even at rest — the hairline is what reads as "container," not the shadow.
- **Internal padding:** `--space-6` (32px) standard, `--space-7` (48px) for hero-weight cards like `.tier-spotlight` and `.donate-cta`.

### Row Lists (signature pattern)
Any roster, log, or repeated-offer content (team roster, news index, sponsor tiers, in-kind partners) renders as `.rows` — a flex column where every child after the first gets a `1px solid --border-warm` top divider and `--space-5` vertical padding. This replaced a same-size icon+heading+text card grid across every one of these sections in the 2026-08 consolidation. New repeated content defaults to a row list; reach for a card grid only when the items are genuinely distinct destinations (e.g. the sponsor page's one spotlighted tier), not a roster.

**Deliberate exception — sponsor tier weighting.** The sponsor page's Star Tier keeps the only full `.tier-spotlight` card ("Most popular"); Universe and Galaxy get `.tier-row--lg` (bigger icon, Orbitron name, full tagline, primary button) while Planet and Meteor stay minimal `.tier-row`. This is an intentional pricing nudge toward the $500–999 tier, not an oversight — Universe being the largest dollar ask does not mean it gets the most prominent container. Confirmed 2026-08-27; don't "fix" this without a product conversation.

### Inputs / Fields
- **Style:** `rgba(10,10,20,0.6)` fill, `1px solid rgba(255,255,255,0.08)` border, `--radius-sm` (10px) corners.
- **Focus:** border shifts to `--accent-2`, plus a 3px `--glow-2` ring — the same warm-accent language as button hover, so a field and a button read as the same control family.
- **Error/success:** `.form-status` text color switches to `--accent-2` (error) or `--accent-3` (success); no red/green-only signaling — status text is always present, not color-alone.

### Icons
All icons (inline SVG sprite via `partial "icon.html"`, brand marks via `brand-icon.html`) render in `--accent-2` (Ember Red) wherever color is applied — achievement rows, contact rows, tier benefit lists, donate-uses items. `--accent-1` is reserved for chrome (badges, nav-menu hover, borders), not icon fills.

### Navigation
Fixed header, `--bg-primary` at 80%/96% opacity (scrolled state) with 16px blur. Nav links get a bottom-border wipe on hover (`--accent-1`→`--accent-2` gradient, width 0→100%) — this is the one place a gradient is allowed, because it's a hairline underline animation, not text fill. The "Support Us" control is a real `<button>` with `aria-expanded`, opening a `--elev-3` dropdown panel — never an `href="#"` link pretending to be one. Mobile collapses to a full-width dropdown panel anchored below the fixed header (not a full-height side drawer), `aria-controls`-wired hamburger, Escape-to-close.

## Do's and Don'ts

### Do:
- **Do** reserve Orbitron for hero H1, stat numbers, page-head titles, tier names, and the wordmark — see The Rare Readout Rule.
- **Do** use `.rows` (hairline dividers) for any roster/log content instead of a card grid.
- **Do** keep every surface flat at rest and let `--glow-2`/`--elev-2` do the work only on hover/focus — see The Flat-By-Default Rule.
- **Do** use the inline SVG sprite (`partial "icon.html"`) or `brand-icon.html` for every icon; no exceptions.
- **Do** give every interactive element a visible `:focus-visible` ring — no `outline: none` without a replacement.

### Don't:
- **Don't** use `background-clip: text` gradient on any heading — see The No-Gradient-Text Rule. The nav-link hover underline is the sole permitted gradient use on the whole site.
- **Don't** introduce a second warm hue alongside `--accent-2`/`--accent-deep` — see The One Warm Accent Rule.
- **Don't** use emoji as icons, or Unicode glyphs standing in for a drawn icon.
- **Don't** reach for a same-size icon+heading+text card grid as the default page structure — check whether the content is actually a roster (→ `.rows`) before reaching for cards.
- **Don't** ship a static/decorative shadow or glow on an element at rest — depth is a state response only.
- **Don't** add a colored `border-left`/`border-right` accent bar above 1px to a card, list item, or callout as a decorative device.
