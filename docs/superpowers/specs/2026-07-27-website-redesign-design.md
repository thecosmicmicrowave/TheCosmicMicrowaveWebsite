# Website Redesign — FTC 35817 The Cosmic Microwave

Date: 2026-07-27
Status: Approved

## Goal

Rebuild the execution of the site while keeping its visual identity. The cosmic-dark
look, the purple/red palette, the Orbitron display face and the existing logo art all
stay. What changes is structure: layout rhythm, hierarchy, accessibility, motion
discipline, and the elimination of duplicated CSS across five layout files.

Scope covers all six templates and a shared-CSS refactor.

## Current State

Hugo site, no theme, deployed to Cloudflare via `wrangler.jsonc`. Six templates:

| File | Lines | Notes |
|---|---|---|
| `layouts/index.html` | 1170 | Homepage; full CSS inlined |
| `layouts/sponsor/single.html` | 798 | Sponsor tiers; emoji used as icons |
| `layouts/posts/single.html` | 521 | Blog post |
| `layouts/donate/single.html` | 232 | Single card |
| `layouts/posts/list.html` | 202 | Post index |
| `layouts/404.html` | 17 | Unstyled stub |
| `layouts/_default/baseof.html` | 1 | `{{ block "main" . }}{{ end }}` — does nothing |

The base template is inert. Each layout carries its own `<head>`, its own copy of the
design tokens, and verbatim duplicates of the header, footer, starfield markup and
navigation JavaScript. Changing a token today means editing four files.

## Architecture

Hugo Pipes plus partials. No new tooling; this is stock Hugo.

```
layouts/_default/baseof.html   head, starfield, header, {{ block "main" }}, footer, scripts
layouts/partials/head.html     meta, fonts, stylesheet link, favicon
layouts/partials/header.html   logo, nav, dropdown, hamburger
layouts/partials/footer.html   footer logo, links, copyright
layouts/partials/icon.html     SVG sprite lookup: {{ partial "icon" "rocket" }}
layouts/partials/svg-sprite.html   inline <symbol> definitions
assets/css/main.css            single stylesheet — the only place tokens live
assets/js/site.js              nav toggle, scroll header, stat counter, smooth scroll
```

`head.html` pipes the stylesheet:

```go-html-template
{{ $css := resources.Get "css/main.css" | minify | fingerprint }}
<link rel="stylesheet" href="{{ $css.RelPermalink }}" integrity="{{ $css.Data.Integrity }}">
```

Fingerprinting gives cache-busted filenames, which matters because Cloudflare will
otherwise serve stale CSS after a deploy.

Every layout is reduced to `{{ define "main" }}…{{ end }}` containing only its own
content. `layouts/index.html` drops from 1170 lines to roughly 250.

Each unit has one job: `main.css` owns all visual decisions, `site.js` owns all
behavior, each partial owns one region of the page, each layout owns one page's
content. A token change touches exactly one file.

## Design Tokens

Identity preserved. Existing colors keep their values; what changes is that ad-hoc
numbers become named scales.

```css
:root {
  /* color — unchanged values */
  --bg-primary: #0a0a14;
  --bg-secondary: #111128;
  --bg-card: rgba(20, 20, 50, 0.7);
  --text-primary: #f0f0ff;
  --text-secondary: #b8b8e0;
  --accent-1: #7b4cff;
  --accent-2: #ff3b30;
  --accent-3: #ff6b6b;

  /* spacing — 4/8px rhythm */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 24px;  --space-6: 32px;
  --space-7: 48px;  --space-8: 64px;  --space-9: 96px;

  /* type scale */
  --text-xs: 0.75rem;  --text-sm: 0.875rem; --text-base: 1rem;
  --text-lg: 1.125rem; --text-xl: 1.5rem;   --text-2xl: 2rem;
  --text-3xl: 3rem;    --text-4xl: 4rem;

  /* elevation — three steps, no ad-hoc shadows */
  --elev-1: 0 2px 8px rgba(0,0,0,0.2);
  --elev-2: 0 8px 30px rgba(0,0,0,0.3);
  --elev-3: 0 20px 60px rgba(0,0,0,0.45);

  /* motion — one pair, used everywhere */
  --dur: 200ms;
  --ease: cubic-bezier(0.4, 0, 0.2, 1);

  --radius: 16px;
}
```

Contrast was measured against `--bg-primary` and the existing text tokens pass:
`--text-secondary` at 10.3:1, `--accent-2` at 5.5:1. They are not being changed.

Typography: Orbitron for display only (h1, h2, stat numbers, logo wordmark), Inter for
everything else. Orbitron is heavy and currently leaks into places it shouldn't.

## Fixes Included in the Rebuild

These are defects in the current site. A redesign either fixes them or silently
reproduces them.

**Focus states.** The site has no `:focus-visible` rules anywhere. Keyboard users get
whatever the browser default is, and several elements suppress it. A 2px `--accent-1`
ring with 2px offset goes on every interactive element. This is the largest
accessibility gap on the site.

**Starfield.** Currently 200 `<div>` elements injected by JavaScript, each running an
infinite `twinkle` animation, plus three shooting stars. Replaced with three layered
CSS `radial-gradient` backgrounds on a fixed pseudo-element: zero DOM nodes, GPU
composited, and trivially disabled for reduced motion.

**`prefers-reduced-motion`.** Currently ignored entirely. All non-essential animation
moves inside `@media (prefers-reduced-motion: no-preference)`. The stat counter
renders final values immediately when motion is reduced.

**Font Awesome.** A render-blocking CDN stylesheet pulling an entire icon font for
roughly 15 icons. Replaced with an inline SVG sprite containing only the icons used,
emitted once in `baseof.html` and referenced via `<use>`. This also removes the emoji
icons on the sponsor page (🌌 🌠 ⭐ 🪐 ☄️ 🚀 🔧 🧰 🛰️ 🌎) and on the 404 page.

**Gradient text.** `.section-title` and `.stat-number` set
`-webkit-text-fill-color: transparent` with no fallback. A solid `color` is declared
first so the text remains visible if `background-clip: text` is unsupported.

**Mobile navigation.** The hamburger has no `aria-expanded`, the open drawer has no
Escape-to-close and no focus containment. All three are added.

**Viewport units.** `min-height: 100vh` on `body` and `.hero` clips under mobile
browser toolbars. Changed to `100dvh`.

**Contact form.** Submits to Formspree with no loading, success, or error state — the
user gets no feedback. Adding a disabled+spinner state on submit and an inline result
message with `role="status"`.

**Placeholder content.** The `+1 (555) 000-0000` contact row is deleted. The literal
square brackets around `[Lake Tapps, Washington]` are stripped. The three social links
pointing at `href="#"` (Instagram, YouTube, Twitter) are left in place, per decision.

## Per-Page Work

**Homepage (`index.html`).** Same sections in the same order: hero, stats, about, team,
news, contact. Rebuilt spacing rhythm and hierarchy against the new scales. The four
`.img-placeholder` tiles in the About section are icon-and-stat cards, not image
placeholders — relabeled as such so they stop reading as missing content.

**Sponsor (`sponsor/single.html`).** The five financial tiers and five in-kind partner
types unify into one `.tier-card` component with a rank SVG icon replacing each emoji.
Inline `style="…"` attributes on section headings move into classes.

**Donate (`donate/single.html`).** Currently one card on an otherwise empty page.
Expanded to a proper page: what donations fund, the Give Lively CTA, and a link across
to the sponsorship tiers.

**Posts list and single.** Reading typography — measure capped at 65–75 characters,
1.6 line height, styled headings, code blocks, blockquotes and lists.

**404.** A designed page using the shared base instead of the current 17-line stub.

## Testing

No test framework exists in this repo and none is being introduced. Verification is
manual and explicit:

1. `hugo` builds with zero errors and zero template warnings.
2. Every page renders at 375px, 768px, 1024px and 1440px with no horizontal scroll.
3. Keyboard-only pass: Tab reaches every interactive element, focus is always visible,
   the nav dropdown opens on focus, Escape closes the mobile drawer.
4. With `prefers-reduced-motion: reduce` set, no animation runs and the stat counters
   show their final values.
5. Contact form submit shows loading, then success or error.
6. No `href="#"` link fires a navigation.
7. Rendered HTML contains no `<style>` blocks and no Font Awesome request.

## Out of Scope

No new pages. No content rewriting beyond the two placeholder fixes above. No Tailwind
or build tooling beyond stock Hugo Pipes. No light mode. No changes to `public/`
(build output) or to the logo assets.
