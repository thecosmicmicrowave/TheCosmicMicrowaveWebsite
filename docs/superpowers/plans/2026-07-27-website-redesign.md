# Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the FTC 35817 website's execution — layout rhythm, accessibility, motion discipline — while keeping its cosmic-dark visual identity, and collapse the CSS currently duplicated across four layout files into one Hugo Pipes stylesheet.

**Architecture:** `layouts/_default/baseof.html` becomes a real base template carrying head, starfield, header, footer and scripts. Each page layout is reduced to `{{ define "main" }}`. All styling moves to `assets/css/main.css`, served through `resources.Get | minify | fingerprint`. All behavior moves to `assets/js/site.js`. Icons come from an inline SVG sprite instead of the Font Awesome CDN.

**Tech Stack:** Hugo v0.163.3 extended (already installed), plain CSS custom properties, vanilla JavaScript, Cloudflare deploy via `wrangler.jsonc`. No package manager, no build step beyond Hugo itself.

**Spec:** `docs/superpowers/specs/2026-07-27-website-redesign-design.md`

## Global Constraints

These apply to every task. A task's requirements implicitly include this section.

- **Hugo v0.163.3 extended.** Do not add dependencies, npm packages, Tailwind, or any build tooling. Stock Hugo Pipes only.
- **Colors are fixed.** `--bg-primary: #0a0a14`, `--bg-secondary: #111128`, `--bg-card: rgba(20, 20, 50, 0.7)`, `--text-primary: #f0f0ff`, `--text-secondary: #b8b8e0`, `--accent-1: #7b4cff`, `--accent-2: #ff3b30`, `--accent-3: #ff6b6b`. Do not invent new colors or alter these values.
- **Fonts are fixed.** Orbitron for display only (h1, h2, stat numbers, logo wordmark). Inter for everything else.
- **No emoji anywhere in rendered output.** Not as icons, not decoratively. Use the SVG sprite.
- **No `<style>` blocks in any template** after Task 6. All CSS lives in `assets/css/main.css`.
- **No Font Awesome.** The `cdnjs.cloudflare.com` stylesheet link is removed and never reintroduced.
- **Every interactive element gets a visible `:focus-visible` ring.** No exceptions, no `outline: none` without a replacement.
- **All non-essential animation sits inside `@media (prefers-reduced-motion: no-preference)`.**
- **Dark mode only.** No light-mode variants.
- **Do not modify `public/`** — it is build output and gitignored.
- **Do not modify the logo assets** in `static/`.
- **Copy rules:** the team is "FTC Team 35817 — The Cosmic Microwave". The motto is `"Cogitare est coquere" — To think is to cook.` Location is `Lake Tapps, Washington` with no square brackets.

## Verification Model

This repo has no test framework and none is being added. "Test" in each task means a
concrete, runnable check against the built output. The two commands used throughout:

```bash
cd "C:/The Cosmic Microwave/website"
hugo --quiet          # must exit 0 with no output
```

```bash
python -m http.server 1313 --directory public    # serve build for manual checks
```

Grep assertions run against files under `public/` after a build. They are the
regression net: each one fails loudly if a later task reintroduces something a
previous task removed.

**One caveat that matters:** do not try to detect emoji with a byte-range grep such
as `grep -oE '[\xF0-\xF4][\x80-\xBF]{3}'`. GNU grep does not interpret `\xNN`
escapes inside a bracket expression — it matches the literal characters `\`, `x`,
`F`, `0` and so on, so that pattern reports clean against a page full of emoji. The
"no emoji" constraint is checked with `scripts/check-emoji.py`, created in Task 1.

## File Structure

| File | Responsibility |
|---|---|
| `layouts/_default/baseof.html` | Page skeleton: html/head/body, starfield node, header, `main` block, footer, script tag |
| `layouts/partials/head.html` | meta tags, title, favicon, font links, piped stylesheet |
| `layouts/partials/svg-sprite.html` | All `<symbol>` icon definitions, emitted once per page |
| `layouts/partials/icon.html` | Renders one `<svg><use></svg>` by name |
| `layouts/partials/header.html` | Logo, nav, Support Us dropdown, hamburger button |
| `layouts/partials/footer.html` | Footer wordmark, links, copyright |
| `assets/css/main.css` | Every visual decision on the site — tokens, base, components |
| `assets/js/site.js` | Nav toggle, Escape handling, scrolled header, stat counter, form submit |
| `assets/icons/brands/*.svg` | Five brand marks (filled, from Simple Icons) |
| `layouts/index.html` | Homepage content only |
| `layouts/sponsor/single.html` | Sponsor page content only |
| `layouts/donate/single.html` | Donate page content only |
| `layouts/posts/list.html` | Post index content only |
| `layouts/posts/single.html` | Post body content only |
| `layouts/404.html` | 404 content only |
| `scripts/check-emoji.py` | Build-output check: fails if any page contains an emoji |

CSS is written incrementally: each task appends the rules for the components it
builds. No task rewrites another task's CSS.

---

### Task 1: Foundation — tokens, base template, icon sprite, 404

Builds the skeleton everything else hangs off, and converts the smallest page (404)
to prove the pipeline works end to end.

**Files:**
- Create: `assets/css/main.css`
- Create: `scripts/check-emoji.py`
- Create: `layouts/partials/head.html`
- Create: `layouts/partials/svg-sprite.html`
- Create: `layouts/partials/icon.html`
- Modify: `layouts/_default/baseof.html` (currently 1 line)
- Modify: `layouts/404.html` (currently 17 lines, full replace)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - CSS custom properties listed in Global Constraints plus `--space-1` … `--space-9`, `--text-xs` … `--text-4xl`, `--elev-1` … `--elev-3`, `--dur`, `--dur-fast`, `--ease`, `--radius`.
  - Utility classes `.container`, `.section`, `.section-title`, `.section-subtitle`, `.visually-hidden`, `.starfield`.
  - `{{ partial "icon.html" (dict "name" "star") }}` → `<svg class="icon" aria-hidden="true"><use href="#i-star"></use></svg>`. Optional keys: `class` (extra classes appended), `size` (px number, default 24).
  - Sprite symbol IDs, all `24x24` viewBox: `i-rocket i-arrow-right i-send i-quote i-trophy i-cpu i-users i-star i-calendar i-mail i-map-pin i-chevron-down i-chevron-right i-orbit i-planet i-comet i-globe i-wrench i-package i-hammer i-heart i-check i-alert`.
  - `baseof.html` defines block `main` and block `title`.

- [ ] **Step 1: Create the stylesheet with tokens, reset and base**

Create `assets/css/main.css`:

```css
/* ============================================================
   The Cosmic Microwave — FTC 35817
   Single source of truth for all styling.
   ============================================================ */

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  /* ---- color ---- */
  --bg-primary:    #0a0a14;
  --bg-secondary:  #111128;
  --bg-card:       rgba(20, 20, 50, 0.7);
  --text-primary:  #f0f0ff;
  --text-secondary:#b8b8e0;
  --accent-1:      #7b4cff;
  --accent-2:      #ff3b30;
  --accent-3:      #ff6b6b;
  --accent-deep:   #b30000;
  --border-soft:   rgba(123, 76, 255, 0.18);
  --border-warm:   rgba(255, 59, 48, 0.14);
  --glow-1:        rgba(123, 76, 255, 0.30);
  --glow-2:        rgba(255, 59, 48, 0.20);

  /* ---- spacing: 4/8px rhythm ---- */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px;
  --space-7: 48px; --space-8: 64px; --space-9: 96px;

  /* ---- type scale ---- */
  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.5rem;
  --text-2xl:  2rem;
  --text-3xl:  3rem;
  --text-4xl:  4rem;

  /* ---- elevation: three steps only ---- */
  --elev-1: 0 2px 8px rgba(0, 0, 0, 0.20);
  --elev-2: 0 8px 30px rgba(0, 0, 0, 0.30);
  --elev-3: 0 20px 60px rgba(0, 0, 0, 0.45);

  /* ---- motion: one pair, used everywhere ---- */
  --dur-fast: 120ms;
  --dur:      200ms;
  --ease:     cubic-bezier(0.4, 0, 0.2, 1);

  --radius:    16px;
  --radius-sm: 10px;
  --radius-pill: 999px;

  --header-h: 80px;
}

html {
  scroll-behavior: smooth;
  scroll-padding-top: calc(var(--header-h) + var(--space-4));
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--text-base);
  line-height: 1.6;
  overflow-x: hidden;
  min-height: 100dvh;
  -webkit-font-smoothing: antialiased;
}

h1, h2, .display {
  font-family: 'Orbitron', system-ui, sans-serif;
  line-height: 1.15;
  letter-spacing: 0.5px;
}
h3, h4, h5, h6 { font-family: 'Inter', system-ui, sans-serif; line-height: 1.3; }

a { color: var(--accent-2); text-decoration: none; transition: color var(--dur) var(--ease); }
a:hover { color: var(--accent-1); }

img, svg { display: block; max-width: 100%; }
button { font: inherit; cursor: pointer; }

/* ---- focus: every interactive element, no exceptions ---- */
:focus-visible {
  outline: 2px solid var(--accent-1);
  outline-offset: 2px;
  border-radius: 4px;
}

.visually-hidden {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  z-index: 2000;
  padding: var(--space-3) var(--space-5);
  background: var(--accent-1);
  color: #fff;
  border-radius: var(--radius-sm);
  transform: translateY(-200%);
}
.skip-link:focus-visible { transform: translateY(0); color: #fff; }

/* ---- icons ---- */
.icon {
  width: 24px;
  height: 24px;
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.icon-sm { width: 18px; height: 18px; }
.icon-lg { width: 32px; height: 32px; }
.icon-brand { fill: currentColor; stroke: none; }

/* ---- layout utilities ---- */
.container {
  width: 100%;
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: var(--space-5);
  position: relative;
  z-index: 1;
}

.section { padding-block: var(--space-9); }
/* opaque sections sit above the starfield; transparent ones let it show through */
.section--alt { background: var(--bg-secondary); position: relative; z-index: 1; }

.section-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  text-align: center;
  margin-bottom: var(--space-4);
  /* solid colour first so the text survives without background-clip */
  color: var(--accent-3);
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  -webkit-background-clip: text;
  background-clip: text;
}
@supports (-webkit-background-clip: text) or (background-clip: text) {
  .section-title { -webkit-text-fill-color: transparent; }
}

.section-subtitle {
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--text-lg);
  max-width: 62ch;
  margin: 0 auto var(--space-7);
}

/* ---- starfield: 3 gradient layers, 1 DOM node, 0 injected elements ---- */
.starfield {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.85;
}
.starfield::before,
.starfield::after,
.starfield > span {
  content: '';
  position: absolute;
  inset: 0;
  display: block;
}
.starfield::before {
  background-image:
    radial-gradient(1px 1px at 25px 15px,  #fff, transparent),
    radial-gradient(1px 1px at 90px 60px,  #fff, transparent),
    radial-gradient(1px 1px at 150px 25px, #fff, transparent),
    radial-gradient(1px 1px at 45px 130px, #fff, transparent),
    radial-gradient(1px 1px at 175px 155px,#fff, transparent),
    radial-gradient(1px 1px at 115px 100px,#fff, transparent);
  background-size: 200px 200px;
  opacity: 0.35;
}
.starfield::after {
  background-image:
    radial-gradient(1.5px 1.5px at 60px 40px,  #fff, transparent),
    radial-gradient(1.5px 1.5px at 220px 130px,#fff, transparent),
    radial-gradient(1.5px 1.5px at 130px 240px,#fff, transparent),
    radial-gradient(1.5px 1.5px at 280px 70px, #fff, transparent);
  background-size: 320px 320px;
  opacity: 0.5;
}
.starfield > span {
  background-image:
    radial-gradient(2px 2px at 100px 90px,  rgba(184,184,224,1), transparent),
    radial-gradient(2px 2px at 380px 260px, rgba(255,107,107,0.9), transparent),
    radial-gradient(2px 2px at 250px 420px, rgba(123,76,255,0.9), transparent);
  background-size: 500px 500px;
  opacity: 0.6;
}

@media (prefers-reduced-motion: no-preference) {
  .starfield::before { animation: twinkle 7s ease-in-out infinite alternate; }
  .starfield::after  { animation: twinkle 5s ease-in-out infinite alternate reverse; }
  .starfield > span  { animation: twinkle 9s ease-in-out infinite alternate; }
}

@keyframes twinkle {
  from { opacity: 0.2; }
  to   { opacity: 0.7; }
}

/* ---- global motion opt-out ---- */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
  html { scroll-behavior: auto; }
}

/* ---- responsive ---- */
@media (max-width: 768px) {
  .section { padding-block: var(--space-8); }
  .section-title { font-size: var(--text-xl); }
  .section-subtitle { font-size: var(--text-base); }
}
@media (max-width: 480px) {
  .container { padding-inline: var(--space-4); }
  .section { padding-block: var(--space-7); }
}
```

- [ ] **Step 1b: Create the emoji checker**

The "no emoji" constraint spans six pages and cannot be verified by eye. Create
`scripts/check-emoji.py`:

```python
"""Fail if any built HTML page contains an emoji or pictographic symbol.

Byte-range greps do not work for this: GNU grep treats \\xNN inside a bracket
expression as literal characters, so such a pattern silently reports clean.
"""
import glob
import sys
import unicodedata

RANGES = (
    (0x1F000, 0x1FAFF),  # pictographs, emoticons, transport, symbols
    (0x2600,  0x27BF),   # misc symbols and dingbats
    (0x2B00,  0x2BFF),   # arrows and stars
    (0xFE0F,  0xFE0F),   # variation selector-16
)


def is_emoji(ch: str) -> bool:
    cp = ord(ch)
    if any(lo <= cp <= hi for lo, hi in RANGES):
        return True
    return cp > 0x2500 and unicodedata.category(ch) == "So"


def main() -> int:
    hits = []
    for path in sorted(glob.glob("public/**/*.html", recursive=True)):
        with open(path, encoding="utf-8") as fh:
            for lineno, line in enumerate(fh, 1):
                for ch in line:
                    if is_emoji(ch):
                        name = unicodedata.name(ch, "unnamed")
                        hits.append(f"{path}:{lineno}: U+{ord(ch):04X} {name}")
    if hits:
        print("\n".join(hits))
        print(f"\nFAIL: {len(hits)} emoji found")
        return 1
    print("CLEAN: no emoji in built output")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

Verify it actually detects something before trusting it:

```bash
cd "C:/The Cosmic Microwave/website"
mkdir -p public && printf '<p>\xf0\x9f\x9a\x80 test</p>' > public/_emojitest.html
python scripts/check-emoji.py; echo "exit: $?"
rm public/_emojitest.html
```

Expected: prints a `U+1F680 ROCKET` hit and `exit: 1`. A checker that cannot fail is
not a checker.

- [ ] **Step 2: Create the icon sprite partial**

Create `layouts/partials/svg-sprite.html`. Every symbol is a 24×24 stroke icon
inheriting `currentColor` from the `.icon` class:

```html
<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
  <symbol id="i-rocket" viewBox="0 0 24 24">
    <path d="M12 2c3 2.5 5 6.5 5 11l-2.5 2.5h-5L7 13c0-4.5 2-8.5 5-11Z"/>
    <circle cx="12" cy="9" r="1.8"/>
    <path d="M9.5 15.5 7 18l1 3 2.2-1.5"/>
    <path d="M14.5 15.5 17 18l-1 3-2.2-1.5"/>
  </symbol>
  <symbol id="i-arrow-right" viewBox="0 0 24 24">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </symbol>
  <symbol id="i-chevron-down" viewBox="0 0 24 24">
    <polyline points="6 9 12 15 18 9"/>
  </symbol>
  <symbol id="i-chevron-right" viewBox="0 0 24 24">
    <polyline points="9 18 15 12 9 6"/>
  </symbol>
  <symbol id="i-send" viewBox="0 0 24 24">
    <path d="m22 2-7 20-4-9-9-4Z"/>
    <path d="M22 2 11 13"/>
  </symbol>
  <symbol id="i-mail" viewBox="0 0 24 24">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-10 6L2 7"/>
  </symbol>
  <symbol id="i-map-pin" viewBox="0 0 24 24">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </symbol>
  <symbol id="i-users" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </symbol>
  <symbol id="i-calendar" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </symbol>
  <symbol id="i-star" viewBox="0 0 24 24">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/>
  </symbol>
  <symbol id="i-trophy" viewBox="0 0 24 24">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </symbol>
  <symbol id="i-cpu" viewBox="0 0 24 24">
    <rect x="4" y="4" width="16" height="16" rx="2"/>
    <rect x="9" y="9" width="6" height="6"/>
    <path d="M15 2v2"/><path d="M15 20v2"/>
    <path d="M2 15h2"/><path d="M2 9h2"/>
    <path d="M20 15h2"/><path d="M20 9h2"/>
    <path d="M9 2v2"/><path d="M9 20v2"/>
  </symbol>
  <symbol id="i-quote" viewBox="0 0 24 24">
    <path d="M10 11H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7c0 2.2-1.8 4-4 4"/>
    <path d="M20 11h-4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7c0 2.2-1.8 4-4 4"/>
  </symbol>
  <symbol id="i-orbit" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3"/>
    <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(-25 12 12)"/>
  </symbol>
  <symbol id="i-planet" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="7"/>
    <ellipse cx="12" cy="12" rx="11" ry="3" transform="rotate(-20 12 12)"/>
  </symbol>
  <symbol id="i-comet" viewBox="0 0 24 24">
    <path d="m14 3-1.9 5.8L6 10.7l5.8 1.9L13.7 19l1.9-5.8L21 11.3l-5.8-1.9Z"/>
    <path d="M7 15.5 3 19.5"/>
    <path d="M5.5 12 3 14.5"/>
  </symbol>
  <symbol id="i-globe" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12h20"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/>
  </symbol>
  <symbol id="i-wrench" viewBox="0 0 24 24">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/>
  </symbol>
  <symbol id="i-package" viewBox="0 0 24 24">
    <path d="m7.5 4.27 9 5.15"/>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    <path d="m3.3 7 8.7 5 8.7-5"/>
    <path d="M12 22V12"/>
  </symbol>
  <symbol id="i-hammer" viewBox="0 0 24 24">
    <path d="m15 12-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9"/>
    <path d="M17.64 15 22 10.64"/>
    <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91"/>
  </symbol>
  <symbol id="i-heart" viewBox="0 0 24 24">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </symbol>
  <symbol id="i-check" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </symbol>
  <symbol id="i-alert" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </symbol>
</svg>
```

- [ ] **Step 3: Create the icon partial**

Create `layouts/partials/icon.html`:

```go-html-template
{{- $name  := .name -}}
{{- $extra := .class | default "" -}}
{{- $size  := .size  | default 24 -}}
<svg class="icon {{ $extra }}" width="{{ $size }}" height="{{ $size }}" aria-hidden="true" focusable="false"><use href="#i-{{ $name }}"></use></svg>
```

Call it as `{{ partial "icon.html" (dict "name" "star") }}` or with options:
`{{ partial "icon.html" (dict "name" "star" "class" "icon-lg" "size" 32) }}`.

- [ ] **Step 4: Create the head partial**

Create `layouts/partials/head.html`. This is where the stylesheet gets piped:

```go-html-template
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{ block "title" . }}{{ if .IsHome }}{{ .Site.Title }}{{ else }}{{ .Title }} | FTC 35817{{ end }}{{ end }}</title>
<meta name="description" content="{{ with .Description }}{{ . }}{{ else }}FTC Team 35817 — The Cosmic Microwave. A robotics team from Lake Tapps, Washington building competitive robots and inspiring STEM.{{ end }}">

<link rel="icon" type="image/png" href="/favicon-96x96.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

{{ $css := resources.Get "css/main.css" | minify | fingerprint }}
<link rel="stylesheet" href="{{ $css.RelPermalink }}" integrity="{{ $css.Data.Integrity }}">
```

Note the font URL drops Orbitron 400 and Inter 300 — neither is used any more, and
Orbitron is display-only.

- [ ] **Step 5: Replace the base template**

`layouts/_default/baseof.html` is currently the single line
`{{ block "main" . }}{{ end }}`. Replace the whole file:

```go-html-template
<!DOCTYPE html>
<html lang="en">
<head>
{{ partial "head.html" . }}
</head>
<body>
{{ partial "svg-sprite.html" . }}
<a class="skip-link" href="#main">Skip to main content</a>
<div class="starfield" aria-hidden="true"><span></span></div>

{{ partial "header.html" . }}

<main id="main">
{{ block "main" . }}{{ end }}
</main>

{{ partial "footer.html" . }}

{{ $js := resources.Get "js/site.js" | minify | fingerprint }}
<script src="{{ $js.RelPermalink }}" defer></script>
</body>
</html>
```

`header.html`, `footer.html` and `js/site.js` do not exist yet — Task 2 creates them.
Create three empty placeholder files now so the build succeeds:

```bash
cd "C:/The Cosmic Microwave/website"
mkdir -p layouts/partials assets/css assets/js
printf '<!-- populated in Task 2 -->\n' > layouts/partials/header.html
printf '<!-- populated in Task 2 -->\n' > layouts/partials/footer.html
printf '(function(){"use strict";})();\n' > assets/js/site.js
```

The JS placeholder must contain a real statement, not just a comment — `minify`
reduces a comment-only file to zero bytes and the pipeline can fail on it.

Build now, before touching the 404, so any pipeline failure surfaces against the
smallest possible change:

```bash
hugo --quiet && echo "pipeline OK"
```

Expected: `pipeline OK`.

- [ ] **Step 6: Rewrite the 404 page**

Replace all of `layouts/404.html`:

```go-html-template
{{ define "title" }}Page Not Found | FTC 35817{{ end }}
{{ define "main" }}
<section class="section error-page">
  <div class="container error-page__inner">
    {{ partial "icon.html" (dict "name" "rocket" "class" "error-page__icon" "size" 64) }}
    <p class="error-page__code">404</p>
    <h1 class="error-page__title">Lost in space</h1>
    <p class="error-page__text">
      That page drifted out of orbit. Nothing here but background radiation.
    </p>
    <a class="btn btn--primary" href="/">
      {{ partial "icon.html" (dict "name" "arrow-right" "class" "icon-sm" "size" 18) }}
      Back to home
    </a>
  </div>
</section>
{{ end }}
```

- [ ] **Step 7: Add 404 styles**

Append to `assets/css/main.css`:

```css
/* ---- 404 ---- */
.error-page { padding-block: calc(var(--header-h) + var(--space-9)) var(--space-9); }
.error-page__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-4);
}
.error-page__icon { color: var(--accent-1); }
.error-page__code {
  font-family: 'Orbitron', system-ui, sans-serif;
  font-size: var(--text-4xl);
  font-weight: 900;
  color: var(--accent-2);
  letter-spacing: 4px;
}
.error-page__title { font-size: var(--text-2xl); font-weight: 700; }
.error-page__text { color: var(--text-secondary); max-width: 48ch; }
```

The `.btn` classes it references are created in Task 2. The 404 page will look
unstyled at the button until then — that is expected and is fixed in Task 2.

- [ ] **Step 8: Build and verify the pipeline**

```bash
cd "C:/The Cosmic Microwave/website"
rm -rf public && hugo --quiet
```

Expected: exits 0, prints nothing.

```bash
grep -oE 'main[^"]*\.css' public/404.html | head -1
```

Expected: a fingerprinted filename such as `main.min.4f2a9c1e….css` — `minify`
inserts `.min` before the hash, so do not assume the plain `main.<hash>.css` shape.
If this prints
nothing, `resources.Get` failed — confirm the file is at `assets/css/main.css`, not
`static/css/main.css`.

```bash
grep -c 'id="i-rocket"' public/404.html
```

Expected: `1`.

```bash
grep -c 'fontawesome\|font-awesome' public/404.html
```

Expected: `0`.

- [ ] **Step 9: Commit**

```bash
cd "C:/The Cosmic Microwave/website"
git add assets/css/main.css assets/js/site.js scripts/check-emoji.py \
        layouts/_default/baseof.html \
        layouts/partials/head.html layouts/partials/svg-sprite.html \
        layouts/partials/icon.html layouts/partials/header.html \
        layouts/partials/footer.html layouts/404.html
git commit -m "feat: add design tokens, base template and icon sprite

Turns baseof.html into a real base template, moves styling into a piped
assets/css/main.css, and replaces the Font Awesome CDN with an inline SVG
sprite. Converts the 404 stub as the first consumer.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Header, footer, navigation behavior, donate page

Builds the two shared regions and the JavaScript that drives them, then converts the
donate page — the simplest full page — as the consumer that proves them.

**Files:**
- Modify: `layouts/partials/header.html` (empty placeholder from Task 1)
- Modify: `layouts/partials/footer.html` (empty placeholder from Task 1)
- Modify: `assets/js/site.js` (placeholder from Task 1)
- Modify: `assets/css/main.css` (append)
- Create: `assets/icons/brands/github.svg`, `discord.svg`, `instagram.svg`, `youtube.svg`, `x.svg`
- Create: `layouts/partials/brand-icon.html`
- Modify: `layouts/donate/single.html` (full replace, currently 232 lines)

**Interfaces:**
- Consumes: tokens, `.container`, `.section`, `.icon`, `partial "icon.html"` from Task 1.
- Produces:
  - `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--ghost` — used by every later task.
  - `.card` — base surface used by every later task.
  - `#site-header` with class `is-scrolled` toggled past 50px scroll.
  - `#nav-toggle` button with `aria-expanded` and `aria-controls="nav-links"`.
  - `{{ partial "brand-icon.html" "github" }}` → inline `<svg class="icon icon-brand">`.

- [ ] **Step 1: Fetch the five brand marks**

Brand logos must be the official marks, not hand-drawn approximations. Fetch them
from Simple Icons:

```bash
cd "C:/The Cosmic Microwave/website"
mkdir -p assets/icons/brands
for n in github discord instagram youtube x; do
  curl -fsSL "https://cdn.jsdelivr.net/npm/simple-icons@13/icons/$n.svg" \
    -o "assets/icons/brands/$n.svg" || echo "FAILED: $n"
done
ls -1 assets/icons/brands/
```

Expected: five files listed, no `FAILED` lines. Each file is a 24×24 filled path.

If the network is unavailable this step fails loudly — do not substitute hand-drawn
marks. Stop and report instead.

- [ ] **Step 2: Create the brand icon partial**

Brand marks are filled 24×24 paths, unlike the stroke sprite, so they get their own
partial. Create `layouts/partials/brand-icon.html`:

```go-html-template
{{- $name := . -}}
{{- with resources.Get (printf "icons/brands/%s.svg" $name) -}}
  {{- .Content | replaceRE `<svg` `<svg class="icon icon-brand" aria-hidden="true" focusable="false"` | safeHTML -}}
{{- end -}}
```

- [ ] **Step 3: Write the header partial**

Replace `layouts/partials/header.html`:

```go-html-template
<header id="site-header" class="site-header">
  <div class="container site-header__inner">
    <a class="brand" href="/">
      <img class="brand__mark" src="/logo_circle_nobg.png" width="48" height="48"
           alt="The Cosmic Microwave logo">
      <span class="brand__text">The Cosmic Microwave</span>
    </a>

    <nav class="nav" aria-label="Main">
      <ul class="nav__list" id="nav-links">
        <li><a class="nav__link" href="/#about">About</a></li>
        <li><a class="nav__link" href="/#team">Team</a></li>
        <li><a class="nav__link" href="/#news">News</a></li>
        <li><a class="nav__link" href="/#contact">Contact</a></li>
        <li class="nav__item--drop">
          <button class="btn btn--primary nav__cta" id="support-toggle"
                  aria-expanded="false" aria-controls="support-menu">
            Support Us
            {{ partial "icon.html" (dict "name" "chevron-down" "class" "icon-sm" "size" 18) }}
          </button>
          <div class="nav__menu" id="support-menu">
            <a class="nav__menu-link" href="/sponsor/">
              {{ partial "icon.html" (dict "name" "star" "class" "icon-sm" "size" 18) }}
              <span><strong>Sponsor</strong><small>Partner with the team</small></span>
            </a>
            <a class="nav__menu-link" href="/donate/">
              {{ partial "icon.html" (dict "name" "heart" "class" "icon-sm" "size" 18) }}
              <span><strong>Donate</strong><small>Fund parts and travel</small></span>
            </a>
          </div>
        </li>
      </ul>
    </nav>

    <button class="hamburger" id="nav-toggle" aria-expanded="false" aria-controls="nav-links">
      <span class="visually-hidden">Toggle menu</span>
      <span class="hamburger__bar" aria-hidden="true"></span>
      <span class="hamburger__bar" aria-hidden="true"></span>
      <span class="hamburger__bar" aria-hidden="true"></span>
    </button>
  </div>
</header>
```

The Support Us control is a `<button>`, not `<a href="#">`. It opens a menu; it does
not navigate. This also gives it keyboard activation for free.

- [ ] **Step 4: Write the footer partial**

Replace `layouts/partials/footer.html`:

```go-html-template
<footer class="site-footer">
  <div class="container site-footer__inner">
    <div class="site-footer__brand">
      <span class="site-footer__wordmark">The Cosmic Microwave <span>· FTC 35817</span></span>
      <p class="site-footer__legal">&copy; {{ now.Format "2006" }} The Cosmic Microwave. All rights reserved.</p>
    </div>
    <nav class="site-footer__links" aria-label="Footer">
      <a href="/">Home</a>
      <a href="/#about">About</a>
      <a href="/#team">Team</a>
      <a href="/#news">News</a>
      <a href="/sponsor/">Sponsor</a>
      <a href="/donate/">Donate</a>
      <a href="/#contact">Contact</a>
    </nav>
  </div>
</footer>
```

- [ ] **Step 5: Add header, footer, button and card styles**

Append to `assets/css/main.css`:

```css
/* ============================================================
   Buttons — used site-wide
   ============================================================ */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  font-size: var(--text-base);
  font-weight: 600;
  line-height: 1;
  min-height: 44px;
  cursor: pointer;
  transition: transform var(--dur) var(--ease),
              box-shadow var(--dur) var(--ease),
              background-color var(--dur) var(--ease),
              border-color var(--dur) var(--ease);
}
.btn--primary {
  background: linear-gradient(135deg, var(--accent-1), var(--accent-deep));
  color: #fff;
  box-shadow: var(--elev-1);
}
.btn--primary:hover { color: #fff; box-shadow: 0 12px 40px var(--glow-2); }
.btn--secondary {
  background: transparent;
  color: var(--text-primary);
  border-color: rgba(255, 255, 255, 0.18);
}
.btn--secondary:hover {
  color: var(--text-primary);
  border-color: var(--accent-2);
  background: rgba(255, 59, 48, 0.08);
}
.btn--ghost { background: transparent; color: var(--accent-2); padding-inline: var(--space-3); }
.btn[disabled] { opacity: 0.45; cursor: not-allowed; }
.btn[disabled]:hover { transform: none; box-shadow: var(--elev-1); }

@media (prefers-reduced-motion: no-preference) {
  .btn--primary:hover, .btn--secondary:hover { transform: translateY(-2px); }
  .btn:active { transform: translateY(0) scale(0.98); }
}

/* ============================================================
   Card — base surface
   ============================================================ */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-warm);
  border-radius: var(--radius);
  padding: var(--space-6);
  backdrop-filter: blur(4px);
  transition: transform var(--dur) var(--ease),
              border-color var(--dur) var(--ease),
              box-shadow var(--dur) var(--ease);
}
.card--interactive:hover {
  border-color: rgba(255, 59, 48, 0.32);
  box-shadow: var(--elev-2);
}
@media (prefers-reduced-motion: no-preference) {
  .card--interactive:hover { transform: translateY(-4px); }
}

/* ============================================================
   Header
   ============================================================ */
.site-header {
  position: fixed;
  inset-block-start: 0;
  inset-inline: 0;
  z-index: 1000;
  padding-block: var(--space-4);
  background: rgba(10, 10, 20, 0.80);
  backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid var(--border-soft);
  transition: background-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
}
.site-header.is-scrolled {
  background: rgba(10, 10, 20, 0.96);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
}
.site-header__inner { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); }

.brand { display: flex; align-items: center; gap: var(--space-3); color: var(--text-primary); }
.brand:hover { color: var(--text-primary); }
.brand__mark { width: 48px; height: 48px; border-radius: 50%; object-fit: contain; }
.brand__text {
  font-family: 'Orbitron', system-ui, sans-serif;
  font-weight: 700;
  font-size: var(--text-base);
  letter-spacing: 1px;
}

.nav__list { display: flex; align-items: center; gap: var(--space-6); list-style: none; }
.nav__item--drop { position: relative; }

.nav__link {
  position: relative;
  display: inline-block;
  padding-block: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 500;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}
.nav__link::after {
  content: '';
  position: absolute;
  inset-block-end: 0;
  inset-inline-start: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent-1), var(--accent-2));
  transition: width var(--dur) var(--ease);
}
.nav__link:hover { color: var(--text-primary); }
.nav__link:hover::after { width: 100%; }

.nav__cta { padding: var(--space-2) var(--space-5); font-size: var(--text-sm); min-height: 40px; }

.nav__menu {
  position: absolute;
  inset-block-start: calc(100% + var(--space-3));
  inset-inline-end: 0;
  min-width: 250px;
  padding: var(--space-3);
  display: grid;
  gap: var(--space-2);
  background: rgba(10, 10, 20, 0.97);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius);
  box-shadow: var(--elev-3);
  opacity: 0;
  visibility: hidden;
  transition: opacity var(--dur) var(--ease), visibility var(--dur) var(--ease);
  z-index: 20;
}
.nav__item--drop:hover .nav__menu,
#support-toggle[aria-expanded="true"] + .nav__menu {
  opacity: 1;
  visibility: visible;
}
.nav__menu-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  min-height: 44px;
}
.nav__menu-link:hover { background: rgba(123, 76, 255, 0.14); color: var(--text-primary); }
.nav__menu-link span { display: flex; flex-direction: column; }
.nav__menu-link strong { font-size: var(--text-sm); font-weight: 600; }
.nav__menu-link small { font-size: var(--text-xs); color: var(--text-secondary); }

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
}
.hamburger__bar {
  display: block;
  width: 26px;
  height: 2px;
  background: var(--text-primary);
  border-radius: 2px;
  transition: transform var(--dur) var(--ease), opacity var(--dur) var(--ease);
}
.hamburger[aria-expanded="true"] .hamburger__bar:nth-child(2) { transform: translateY(7px) rotate(45deg); }
.hamburger[aria-expanded="true"] .hamburger__bar:nth-child(3) { opacity: 0; }
.hamburger[aria-expanded="true"] .hamburger__bar:nth-child(4) { transform: translateY(-7px) rotate(-45deg); }

/* ============================================================
   Footer
   ============================================================ */
.site-footer {
  background: var(--bg-primary);
  border-top: 1px solid var(--border-warm);
  padding-block: var(--space-7) var(--space-6);
  position: relative;
  z-index: 1;
}
.site-footer__inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-5);
}
.site-footer__wordmark {
  font-family: 'Orbitron', system-ui, sans-serif;
  font-weight: 700;
  font-size: var(--text-base);
}
.site-footer__wordmark span { color: var(--accent-1); }
.site-footer__legal { color: var(--text-secondary); font-size: var(--text-xs); margin-top: var(--space-1); }
.site-footer__links { display: flex; flex-wrap: wrap; gap: var(--space-5); }
.site-footer__links a { color: var(--text-secondary); font-size: var(--text-sm); }
.site-footer__links a:hover { color: var(--accent-2); }

/* ---- header/footer responsive ---- */
@media (max-width: 900px) {
  .nav__list {
    position: fixed;
    inset-block: 0;
    inset-inline-end: -100%;
    width: min(300px, 85vw);
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    gap: var(--space-5);
    padding: var(--space-7) var(--space-6);
    background: var(--bg-secondary);
    border-inline-start: 1px solid var(--border-soft);
    transition: inset-inline-end var(--dur) var(--ease);
    overflow-y: auto;
  }
  .nav__list.is-open { inset-inline-end: 0; }
  .hamburger { display: flex; }
  .nav__item--drop { position: static; }
  .nav__menu {
    position: static;
    opacity: 1;
    visibility: visible;
    margin-top: var(--space-3);
    background: transparent;
    border: none;
    box-shadow: none;
    padding: 0;
  }
  .nav__cta { width: 100%; }
}
@media (max-width: 480px) {
  .brand__text { display: none; }
  .site-footer__inner { flex-direction: column; text-align: center; }
  .site-footer__links { justify-content: center; }
}
```

- [ ] **Step 6: Write the site JavaScript**

Replace `assets/js/site.js`:

```javascript
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- mobile nav ---- */
  var navToggle = document.getElementById('nav-toggle');
  var navList = document.getElementById('nav-links');

  function setNav(open) {
    if (!navToggle || !navList) return;
    navToggle.setAttribute('aria-expanded', String(open));
    navList.classList.toggle('is-open', open);
  }

  if (navToggle && navList) {
    navToggle.addEventListener('click', function () {
      setNav(navToggle.getAttribute('aria-expanded') !== 'true');
    });
    navList.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });
  }

  /* ---- support dropdown ---- */
  var supportToggle = document.getElementById('support-toggle');
  if (supportToggle) {
    supportToggle.addEventListener('click', function () {
      var open = supportToggle.getAttribute('aria-expanded') === 'true';
      supportToggle.setAttribute('aria-expanded', String(!open));
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav__item--drop')) {
        supportToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- Escape closes whatever is open ---- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (supportToggle && supportToggle.getAttribute('aria-expanded') === 'true') {
      supportToggle.setAttribute('aria-expanded', 'false');
      supportToggle.focus();
      return;
    }
    if (navToggle && navToggle.getAttribute('aria-expanded') === 'true') {
      setNav(false);
      navToggle.focus();
    }
  });

  /* ---- header shadow on scroll ---- */
  var header = document.getElementById('site-header');
  if (header) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        header.classList.toggle('is-scrolled', window.scrollY > 50);
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---- animated stat counters ---- */
  var stats = document.querySelectorAll('[data-count]');
  if (stats.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      stats.forEach(function (el) { el.textContent = el.dataset.count; });
    } else {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var target = parseInt(el.dataset.count, 10);
          var start = performance.now();
          (function step(now) {
            var p = Math.min((now - start) / 1600, 1);
            el.textContent = Math.floor((1 - Math.pow(1 - p, 4)) * target);
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target;
          })(start);
          obs.unobserve(el);
        });
      }, { threshold: 0.4 });
      stats.forEach(function (el) { obs.observe(el); });
    }
  }

  /* ---- contact form submit states ---- */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');
    var submit = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submit.disabled = true;
      form.classList.add('is-sending');
      status.textContent = 'Sending…';
      status.className = 'form-status is-pending';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        form.reset();
        status.textContent = 'Message sent. We will get back to you soon.';
        status.className = 'form-status is-success';
      }).catch(function () {
        status.textContent = 'Could not send. Email us directly at thecosmicmicrowave35817@gmail.com.';
        status.className = 'form-status is-error';
      }).finally(function () {
        submit.disabled = false;
        form.classList.remove('is-sending');
      });
    });
  }
})();
```

- [ ] **Step 7: Rewrite the donate page**

Replace all of `layouts/donate/single.html`:

```go-html-template
{{ define "main" }}
<section class="section page-head">
  <div class="container">
    <h1 class="page-head__title">Support Our Team</h1>
    <p class="page-head__lead">
      Every dollar goes straight into robot parts, competition travel, and the STEM
      outreach we run in our community.
    </p>
  </div>
</section>

<section class="section section--alt">
  <div class="container donate-layout">
    <div class="donate-cta card">
      <h2 class="donate-cta__title">Make a donation</h2>
      <p class="donate-cta__text">
        Donations are processed through Washington FIRST Robotics, a registered
        non-profit. Your contribution is tax-deductible.
      </p>
      <a class="btn btn--primary donate-cta__btn"
         href="https://secure.givelively.org/donate/washington-first-robotics/the-cosmic-microwave"
         target="_blank" rel="noopener noreferrer">
        {{ partial "icon.html" (dict "name" "heart" "class" "icon-sm" "size" 18) }}
        Donate now
      </a>
      <p class="donate-cta__note">Opens Give Lively in a new tab.</p>
    </div>

    <div class="donate-uses">
      <h2 class="donate-uses__title">Where it goes</h2>
      <ul class="donate-uses__list">
        <li class="donate-uses__item">
          {{ partial "icon.html" (dict "name" "cpu" "size" 24) }}
          <div><strong>Robot parts</strong><span>Motors, sensors, control hubs and the aluminium everything bolts to.</span></div>
        </li>
        <li class="donate-uses__item">
          {{ partial "icon.html" (dict "name" "trophy" "size" 24) }}
          <div><strong>Competition costs</strong><span>Event registration, travel and lodging for qualifiers and championships.</span></div>
        </li>
        <li class="donate-uses__item">
          {{ partial "icon.html" (dict "name" "package" "size" 24) }}
          <div><strong>Tools and materials</strong><span>Shop supplies, spare parts and the consumables a build season eats.</span></div>
        </li>
        <li class="donate-uses__item">
          {{ partial "icon.html" (dict "name" "globe" "size" 24) }}
          <div><strong>Outreach</strong><span>Workshops and demos that put robotics in front of younger students.</span></div>
        </li>
      </ul>
    </div>
  </div>
</section>

<section class="section">
  <div class="container donate-alt">
    <h2 class="section-title">Prefer to partner?</h2>
    <p class="section-subtitle">
      Businesses can sponsor the team directly and get logo placement on the robot,
      our banner and this site.
    </p>
    <div class="donate-alt__actions">
      <a class="btn btn--secondary" href="/sponsor/">
        {{ partial "icon.html" (dict "name" "star" "class" "icon-sm" "size" 18) }}
        See sponsorship tiers
      </a>
    </div>
  </div>
</section>
{{ end }}
```

- [ ] **Step 8: Add page-head and donate styles**

Append to `assets/css/main.css`:

```css
/* ============================================================
   Page head — shared by donate, sponsor, posts
   ============================================================ */
.page-head {
  padding-block: calc(var(--header-h) + var(--space-8)) var(--space-7);
  text-align: center;
}
.page-head__title {
  font-size: var(--text-3xl);
  font-weight: 900;
  color: var(--accent-3);
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2), var(--accent-3));
  -webkit-background-clip: text;
  background-clip: text;
}
@supports (-webkit-background-clip: text) or (background-clip: text) {
  .page-head__title { -webkit-text-fill-color: transparent; }
}
.page-head__lead {
  color: var(--text-secondary);
  font-size: var(--text-lg);
  max-width: 60ch;
  margin: var(--space-4) auto 0;
}

/* ============================================================
   Donate
   ============================================================ */
.donate-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  gap: var(--space-7);
  align-items: start;
}
.donate-cta { padding: var(--space-7); }
.donate-cta__title { font-size: var(--text-xl); font-weight: 600; margin-bottom: var(--space-3); }
.donate-cta__text { color: var(--text-secondary); margin-bottom: var(--space-5); }
.donate-cta__btn { width: 100%; }
.donate-cta__note { color: var(--text-secondary); font-size: var(--text-xs); margin-top: var(--space-3); text-align: center; }

.donate-uses__title { font-size: var(--text-xl); font-weight: 600; margin-bottom: var(--space-5); }
.donate-uses__list { list-style: none; display: grid; gap: var(--space-5); }
.donate-uses__item { display: flex; gap: var(--space-4); align-items: flex-start; }
.donate-uses__item .icon { color: var(--accent-2); margin-top: 2px; }
.donate-uses__item strong { display: block; font-weight: 600; margin-bottom: var(--space-1); }
.donate-uses__item span { color: var(--text-secondary); font-size: var(--text-sm); }

.donate-alt { text-align: center; }
.donate-alt__actions { display: flex; justify-content: center; }

@media (max-width: 900px) {
  .donate-layout { grid-template-columns: 1fr; gap: var(--space-6); }
}
@media (max-width: 480px) {
  .page-head__title { font-size: var(--text-2xl); }
  .donate-cta { padding: var(--space-5); }
}
```

- [ ] **Step 9: Build and verify**

```bash
cd "C:/The Cosmic Microwave/website"
rm -rf public && hugo --quiet
```

Expected: exits 0, no output.

```bash
grep -c 'aria-expanded' public/donate/index.html
```

Expected: `2` or more — the hamburger and the support toggle.

```bash
grep -c '<style' public/donate/index.html
```

Expected: `0`.

```bash
grep -o 'site-footer__wordmark' public/404.html | head -1
```

Expected: `site-footer__wordmark` — confirms the 404 page now inherits the shared
footer from `baseof.html`.

```bash
grep -c 'simpleicons\|role="img"' public/donate/index.html
```

Expected: `0` — no brand icons on the donate page. Brand icons appear only in the
homepage contact section, added in Task 3.

Manual check — serve and open `http://localhost:1313/donate/`:

```bash
python -m http.server 1313 --directory public
```

Confirm: header is fixed and blurred; Support Us opens on click and on Enter; Escape
closes it; at 375px width the hamburger appears and toggles the drawer; Tab shows a
visible purple focus ring on every link and button.

- [ ] **Step 10: Commit**

```bash
cd "C:/The Cosmic Microwave/website"
git add assets/ layouts/partials/header.html layouts/partials/footer.html \
        layouts/partials/brand-icon.html layouts/donate/single.html
git commit -m "feat: add shared header, footer and nav behavior

Header and footer become partials driven by one stylesheet and one script.
The Support Us control is now a button with aria-expanded, and Escape closes
both it and the mobile drawer. Donate page rebuilt as the first full consumer.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Homepage

The largest single conversion: 1170 lines down to content only.

**Files:**
- Modify: `layouts/index.html` (full replace)
- Modify: `assets/css/main.css` (append)

**Interfaces:**
- Consumes: everything from Tasks 1 and 2 — tokens, `.container`, `.section`, `.card`, `.btn`, `partial "icon.html"`, `partial "brand-icon.html"`, and the `[data-count]` and `#contact-form` hooks already handled in `site.js`.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Replace the homepage template**

Replace all of `layouts/index.html`. Note the section id `#blog` becomes `#news` to
match the nav links written in Task 2, the phone row is gone, and the location has no
brackets:

```go-html-template
{{ define "main" }}

<section class="hero" id="home">
  <div class="container hero__grid">
    <div class="hero__content">
      <p class="hero__badge">
        {{ partial "icon.html" (dict "name" "rocket" "class" "icon-sm" "size" 18) }}
        FTC Team 35817
      </p>
      <h1 class="hero__title">The Cosmic<br><span class="hero__title-accent">Microwave</span></h1>
      <p class="hero__motto">
        <span class="hero__motto-latin">&ldquo;Cogitare est coquere&rdquo;</span>
        <span class="hero__motto-en">&mdash; To think is to cook.</span>
      </p>
      <p class="hero__lead">
        A rookie team based in Lake Tapps, Washington, dedicated to building
        competitive robots, fostering STEM education, and inspiring the next
        generation of innovators.
      </p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="#about">
          {{ partial "icon.html" (dict "name" "arrow-right" "class" "icon-sm" "size" 18) }}
          Our story
        </a>
        <a class="btn btn--secondary" href="#contact">
          {{ partial "icon.html" (dict "name" "send" "class" "icon-sm" "size" 18) }}
          Get in touch
        </a>
      </div>
    </div>
    <div class="hero__art">
      <span class="hero__glow" aria-hidden="true"></span>
      <img class="hero__logo" src="/logo_badge_nobg.png" width="400" height="400"
           alt="The Cosmic Microwave team badge">
    </div>
  </div>
</section>

<section class="stats">
  <div class="container stats__grid">
    <div class="stat"><p class="stat__num" data-count="2">0</p><p class="stat__label">Seasons competed</p></div>
    <div class="stat"><p class="stat__num" data-count="7">0</p><p class="stat__label">Team members</p></div>
    <div class="stat"><p class="stat__num" data-count="4">0</p><p class="stat__label">Major awards</p></div>
    <div class="stat"><p class="stat__num" data-count="13">0</p><p class="stat__label">Events attended</p></div>
  </div>
</section>

<section class="section" id="about">
  <div class="container">
    <h2 class="section-title">About The Cosmic Microwave</h2>
    <p class="section-subtitle">A rookie team name, but a veteran crew. We bring experience, passion, and a winning mindset to every match.</p>
    <div class="about__grid">
      <div class="about__text">
        <p><strong>FTC Team 35817</strong> &mdash; The Cosmic Microwave &mdash; is officially a rookie team, but our core members are seasoned competitors. We previously made our mark as <strong>FTC 27393 &ldquo;The FBI &mdash; FIRST Bot Inventors&rdquo;</strong>, where we built a legacy of excellence at North Tapps Middle School.</p>
        <p>Our journey includes being <strong>Finalist Alliance Captain</strong> and winning the <strong>Control 2</strong> award at the Cowtown Premier Event, ranking <strong>4th</strong> at the Washington State Championship, ranking <strong>4th</strong> and winning the <strong>Think 2</strong> award at the Asimov Super Qualifier, winning the <strong>Control 1</strong> award at the Wu League Tournament, and taking home the <strong>Inspire 2</strong> award at the Wu Interleague.</p>
        <blockquote class="quote">
          {{ partial "icon.html" (dict "name" "quote" "class" "icon-sm" "size" 18) }}
          <p><span class="quote__latin">&ldquo;Cogitare est coquere&rdquo;</span> &mdash; To think is to cook.</p>
        </blockquote>
      </div>
      <ul class="about__facts">
        <li class="about__fact card card--interactive">
          {{ partial "icon.html" (dict "name" "trophy" "class" "icon-lg" "size" 32) }}
          <strong>4</strong><span>Major awards</span>
        </li>
        <li class="about__fact card card--interactive">
          {{ partial "icon.html" (dict "name" "cpu" "class" "icon-lg" "size" 32) }}
          <strong>2</strong><span>Seasons of proven design</span>
        </li>
        <li class="about__fact card card--interactive">
          {{ partial "icon.html" (dict "name" "users" "class" "icon-lg" "size" 32) }}
          <strong>7</strong><span>Team members</span>
        </li>
        <li class="about__fact card card--interactive">
          {{ partial "icon.html" (dict "name" "star" "class" "icon-lg" "size" 32) }}
          <strong>1</strong><span>Finalist alliance captain</span>
        </li>
      </ul>
    </div>
  </div>
</section>

<section class="section section--alt" id="team">
  <div class="container">
    <h2 class="section-title">Our Crew</h2>
    <p class="section-subtitle">The dedicated individuals who make The Cosmic Microwave shine.</p>
    <ul class="team__grid">
      <li class="team-card card card--interactive"><span class="team-card__avatar" aria-hidden="true">AS</span><h3 class="team-card__name">AJ Streepy</h3><p class="team-card__role">Team Captain &amp; Mechanical</p><p class="team-card__bio">Experienced at CAD and assembly. Freshman at Auburn Riverside High School, formerly on 27393.</p></li>
      <li class="team-card card card--interactive"><span class="team-card__avatar" aria-hidden="true">NT</span><h3 class="team-card__name">Nathan Tran</h3><p class="team-card__role">Programming Lead &amp; Outreach</p><p class="team-card__bio">Experienced at programming and outreach. Freshman at Auburn Riverside High School, formerly on 27393.</p></li>
      <li class="team-card card card--interactive"><span class="team-card__avatar" aria-hidden="true">ED</span><h3 class="team-card__name">Easton Dixon</h3><p class="team-card__role">Outreach Lead</p><p class="team-card__bio">Experienced at outreach. Freshman at Auburn Riverside High School, formerly on 27393.</p></li>
      <li class="team-card card card--interactive"><span class="team-card__avatar" aria-hidden="true">CW</span><h3 class="team-card__name">Charlotte Wester</h3><p class="team-card__role">Mechanical Lead</p><p class="team-card__bio">Experienced at CAD and assembly. Freshman at Auburn Riverside High School, formerly on 27393.</p></li>
      <li class="team-card card card--interactive"><span class="team-card__avatar" aria-hidden="true">CB</span><h3 class="team-card__name">Christian Bautista</h3><p class="team-card__role">Outreach &amp; Programming</p><p class="team-card__bio">Experienced at programming and outreach. Freshman at Auburn Riverside High School, formerly on 27393.</p></li>
      <li class="team-card card card--interactive"><span class="team-card__avatar" aria-hidden="true">ER</span><h3 class="team-card__name">Emmett Riemer</h3><p class="team-card__role">Mechanical &amp; Outreach</p><p class="team-card__bio">Experienced at assembly and outreach. Freshman at Bellarmine Prep High School, formerly on 27393.</p></li>
      <li class="team-card card card--interactive"><span class="team-card__avatar" aria-hidden="true">QF</span><h3 class="team-card__name">Quinn Feldmann</h3><p class="team-card__role">Mechanical</p><p class="team-card__bio">Experienced at CAD and assembly. Freshman at Auburn Riverside High School, formerly on 27393.</p></li>
    </ul>
  </div>
</section>

<section class="section" id="news">
  <div class="container">
    <h2 class="section-title">Latest News</h2>
    <p class="section-subtitle">Stay up to date with our journey, competitions, and community events.</p>
    {{ $posts := where .Site.RegularPages "Section" "posts" }}
    {{ if $posts }}
    <ul class="post-grid">
      {{ range first 3 $posts }}
      <li class="post-card card card--interactive">
        <p class="post-card__date">
          {{ partial "icon.html" (dict "name" "calendar" "class" "icon-sm" "size" 18) }}
          <time datetime="{{ .Date.Format "2006-01-02" }}">{{ .Date.Format "January 2, 2006" }}</time>
        </p>
        <h3 class="post-card__title"><a href="{{ .Permalink }}">{{ .Title }}</a></h3>
        <p class="post-card__excerpt">{{ .Summary }}</p>
        <span class="post-card__more">Read more {{ partial "icon.html" (dict "name" "chevron-right" "class" "icon-sm" "size" 18) }}</span>
      </li>
      {{ end }}
    </ul>
    <div class="post-grid__more">
      <a class="btn btn--secondary" href="/posts/">All posts</a>
    </div>
    {{ else }}
    <p class="empty-state">No posts yet. Check back once the season starts.</p>
    {{ end }}
  </div>
</section>

<section class="section section--alt" id="contact">
  <div class="container">
    <h2 class="section-title">Get In Touch</h2>
    <p class="section-subtitle">Have questions? Want to collaborate or sponsor us? Reach out.</p>
    <div class="contact__grid">
      <div class="contact__info">
        <h3 class="contact__heading">Let&rsquo;s connect</h3>
        <p class="contact__text">We love meeting fellow robotics enthusiasts, potential sponsors, and community partners. Drop us a line and we&rsquo;ll get back to you faster than a robot in autonomous.</p>
        <ul class="contact__list">
          <li class="contact__row">
            <span class="contact__icon">{{ partial "icon.html" (dict "name" "mail" "class" "icon-sm" "size" 18) }}</span>
            <a href="mailto:thecosmicmicrowave35817@gmail.com">thecosmicmicrowave35817@gmail.com</a>
          </li>
          <li class="contact__row">
            <span class="contact__icon">{{ partial "icon.html" (dict "name" "map-pin" "class" "icon-sm" "size" 18) }}</span>
            <span>Lake Tapps, Washington</span>
          </li>
        </ul>
        <ul class="social">
          <li><a class="social__link" href="#" aria-label="Instagram">{{ partial "brand-icon.html" "instagram" }}</a></li>
          <li><a class="social__link" href="#" aria-label="YouTube">{{ partial "brand-icon.html" "youtube" }}</a></li>
          <li><a class="social__link" href="#" aria-label="X">{{ partial "brand-icon.html" "x" }}</a></li>
          <li><a class="social__link" href="https://github.com/thecosmicmicrowave?tab=repositories" aria-label="GitHub" target="_blank" rel="noopener noreferrer">{{ partial "brand-icon.html" "github" }}</a></li>
          <li><a class="social__link" href="https://discord.gg/FX5WPRqqE" aria-label="Discord" target="_blank" rel="noopener noreferrer">{{ partial "brand-icon.html" "discord" }}</a></li>
        </ul>
      </div>

      <form class="contact__form card" id="contact-form" action="https://formspree.io/f/xzdnbjjr" method="POST">
        <div class="field">
          <label class="field__label" for="name">Your name</label>
          <input class="field__input" type="text" id="name" name="name" autocomplete="name" required>
        </div>
        <div class="field">
          <label class="field__label" for="email">Email address</label>
          <input class="field__input" type="email" id="email" name="email" autocomplete="email" required>
          <p class="field__help">We only use this to reply to you.</p>
        </div>
        <div class="field">
          <label class="field__label" for="message">Message</label>
          <textarea class="field__input field__input--area" id="message" name="message" rows="5" required></textarea>
        </div>
        <button class="btn btn--primary contact__submit" type="submit">
          {{ partial "icon.html" (dict "name" "send" "class" "icon-sm" "size" 18) }}
          Send message
        </button>
        <p class="form-status" id="form-status" role="status" aria-live="polite"></p>
      </form>
    </div>
  </div>
</section>
{{ end }}
```

- [ ] **Step 2: Add homepage styles**

Append to `assets/css/main.css`:

```css
/* ============================================================
   Hero
   ============================================================ */
.hero {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  padding-block: calc(var(--header-h) + var(--space-8)) var(--space-8);
}
.hero__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: var(--space-8);
  align-items: center;
}
.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-pill);
  background: rgba(123, 76, 255, 0.15);
  border: 1px solid rgba(123, 76, 255, 0.32);
  color: var(--accent-3);
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: var(--space-5);
}
.hero__title {
  font-size: clamp(2.25rem, 6vw, var(--text-4xl));
  font-weight: 900;
  margin-bottom: var(--space-3);
}
.hero__title-accent {
  color: var(--accent-3);
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2), var(--accent-3));
  -webkit-background-clip: text;
  background-clip: text;
}
@supports (-webkit-background-clip: text) or (background-clip: text) {
  .hero__title-accent { -webkit-text-fill-color: transparent; }
}
.hero__motto { margin-bottom: var(--space-5); }
.hero__motto-latin {
  font-family: 'Orbitron', system-ui, sans-serif;
  font-weight: 600;
  font-size: var(--text-lg);
  color: var(--accent-2);
}
.hero__motto-en { font-style: italic; color: var(--text-secondary); margin-left: var(--space-2); }
.hero__lead { color: var(--text-secondary); font-size: var(--text-lg); max-width: 52ch; margin-bottom: var(--space-6); }
.hero__actions { display: flex; flex-wrap: wrap; gap: var(--space-4); }

.hero__art { position: relative; display: grid; place-items: center; }
.hero__glow {
  position: absolute;
  width: 115%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 59, 48, 0.18), transparent 70%);
}
@media (prefers-reduced-motion: no-preference) {
  .hero__glow { animation: pulse-glow 5s ease-in-out infinite alternate; }
}
@keyframes pulse-glow {
  from { transform: scale(1);    opacity: 0.5; }
  to   { transform: scale(1.12); opacity: 1; }
}
.hero__logo { position: relative; z-index: 2; width: min(100%, 400px); height: auto; }

/* ============================================================
   Stats
   ============================================================ */
.stats {
  background: var(--bg-secondary);
  border-block: 1px solid var(--border-warm);
  padding-block: var(--space-7);
  position: relative;
  z-index: 1;
}
.stats__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-5);
  text-align: center;
}
.stat__num {
  font-family: 'Orbitron', system-ui, sans-serif;
  font-size: var(--text-3xl);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--accent-3);
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  -webkit-background-clip: text;
  background-clip: text;
}
@supports (-webkit-background-clip: text) or (background-clip: text) {
  .stat__num { -webkit-text-fill-color: transparent; }
}
.stat__label { color: var(--text-secondary); font-size: var(--text-sm); font-weight: 500; margin-top: var(--space-1); }

/* ============================================================
   About
   ============================================================ */
.about__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: var(--space-8);
  align-items: start;
}
.about__text p { color: var(--text-secondary); margin-bottom: var(--space-5); max-width: 68ch; }
.about__text strong { color: var(--text-primary); }

.quote {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-5);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid var(--border-warm);
  border-left: 4px solid var(--accent-2);
}
.quote .icon { color: var(--accent-2); margin-top: 4px; }
.quote p { color: var(--text-primary); font-style: italic; margin: 0; }
.quote__latin {
  font-family: 'Orbitron', system-ui, sans-serif;
  font-style: normal;
  color: var(--accent-2);
  font-size: var(--text-lg);
}

.about__facts {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}
.about__fact {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  text-align: center;
  padding: var(--space-6) var(--space-4);
}
.about__fact .icon { color: var(--accent-2); }
.about__fact strong {
  font-family: 'Orbitron', system-ui, sans-serif;
  font-size: var(--text-2xl);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.about__fact span { color: var(--text-secondary); font-size: var(--text-sm); }

/* ============================================================
   Team
   ============================================================ */
.team__grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: var(--space-6);
}
.team-card { text-align: center; padding: var(--space-6) var(--space-5); }
.team-card__avatar {
  display: grid;
  place-items: center;
  width: 80px;
  height: 80px;
  margin: 0 auto var(--space-3);
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  font-family: 'Orbitron', system-ui, sans-serif;
  font-size: var(--text-xl);
  font-weight: 700;
  color: #fff;
}
.team-card__name { font-size: var(--text-lg); font-weight: 600; }
.team-card__role { color: var(--accent-3); font-size: var(--text-sm); font-weight: 500; margin-top: var(--space-1); }
.team-card__bio { color: var(--text-secondary); font-size: var(--text-sm); margin-top: var(--space-3); }

/* ============================================================
   Post cards — reused by the posts list in Task 5
   ============================================================ */
.post-grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-6);
}
.post-card { display: flex; flex-direction: column; gap: var(--space-3); }
.post-card__date {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  align-self: flex-start;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-pill);
  background: rgba(123, 76, 255, 0.12);
  border: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: 500;
}
.post-card__title { font-size: var(--text-lg); font-weight: 600; }
.post-card__title a { color: var(--text-primary); }
.post-card__title a:hover { color: var(--accent-2); }
.post-card__excerpt { color: var(--text-secondary); font-size: var(--text-sm); }
.post-card__more {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  margin-top: auto;
  color: var(--accent-2);
  font-size: var(--text-sm);
  font-weight: 600;
}
.post-grid__more { display: flex; justify-content: center; margin-top: var(--space-7); }
.empty-state { text-align: center; color: var(--text-secondary); }

/* ============================================================
   Contact
   ============================================================ */
.contact__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-8);
  align-items: start;
}
.contact__heading { font-family: 'Orbitron', system-ui, sans-serif; font-size: var(--text-xl); font-weight: 700; }
.contact__text { color: var(--text-secondary); margin: var(--space-3) 0 var(--space-6); max-width: 56ch; }
.contact__list { list-style: none; display: grid; gap: var(--space-4); }
.contact__row { display: flex; align-items: center; gap: var(--space-4); }
.contact__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex: none;
  border-radius: 50%;
  background: rgba(123, 76, 255, 0.12);
  border: 1px solid var(--border-warm);
  color: var(--accent-3);
}
.contact__row a { color: var(--text-primary); }
.contact__row a:hover { color: var(--accent-2); }

.social { list-style: none; display: flex; flex-wrap: wrap; gap: var(--space-4); margin-top: var(--space-6); }
.social__link {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1px solid var(--border-warm);
  color: var(--text-secondary);
  transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease),
              border-color var(--dur) var(--ease), transform var(--dur) var(--ease);
}
.social__link:hover { background: var(--accent-2); color: #fff; border-color: var(--accent-2); }
@media (prefers-reduced-motion: no-preference) {
  .social__link:hover { transform: translateY(-3px); }
}

/* ---- form ---- */
.contact__form { padding: var(--space-6); }
.field { margin-bottom: var(--space-5); }
.field__label { display: block; font-size: var(--text-sm); font-weight: 500; margin-bottom: var(--space-2); }
.field__input {
  width: 100%;
  min-height: 44px;
  padding: var(--space-3) var(--space-4);
  background: rgba(10, 10, 20, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: inherit;
  font-size: var(--text-base);
  transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
}
.field__input::placeholder { color: rgba(184, 184, 224, 0.55); }
.field__input:hover { border-color: rgba(255, 255, 255, 0.22); }
.field__input:focus-visible { border-color: var(--accent-2); box-shadow: 0 0 0 3px var(--glow-2); }
.field__input--area { resize: vertical; min-height: 120px; }
.field__input:user-invalid { border-color: var(--accent-2); }
.field__help { color: var(--text-secondary); font-size: var(--text-xs); margin-top: var(--space-2); }

.contact__submit { width: 100%; }
.form-status { margin-top: var(--space-4); font-size: var(--text-sm); min-height: 1.2em; text-align: center; }
.form-status.is-pending { color: var(--text-secondary); }
.form-status.is-success { color: #4ade80; }
.form-status.is-error   { color: var(--accent-3); }

/* ============================================================
   Homepage responsive
   ============================================================ */
@media (max-width: 1024px) {
  .hero__grid { grid-template-columns: 1fr; text-align: center; }
  .hero__lead { margin-inline: auto; }
  .hero__actions { justify-content: center; }
  .hero__art { order: -1; }
  .hero__logo { width: min(100%, 280px); }
  .about__grid { grid-template-columns: 1fr; }
  .contact__grid { grid-template-columns: 1fr; }
  .stats__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 768px) {
  .stat__num { font-size: var(--text-2xl); }
  .post-grid { grid-template-columns: 1fr; }
  .team__grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
  .social { justify-content: center; }
  .contact__info { text-align: center; }
  .contact__text { margin-inline: auto; }
  .contact__row { justify-content: center; }
}
@media (max-width: 480px) {
  .hero__actions { flex-direction: column; }
  .hero__actions .btn { width: 100%; }
  .hero__motto-en { display: block; margin-left: 0; margin-top: var(--space-1); }
  .about__facts { grid-template-columns: 1fr; }
  .team__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .team-card { padding: var(--space-5) var(--space-3); }
  .stats__grid { gap: var(--space-3); }
}
```

- [ ] **Step 3: Build and verify**

```bash
cd "C:/The Cosmic Microwave/website"
rm -rf public && hugo --quiet
```

Expected: exits 0, no output.

```bash
grep -c '<style' public/index.html
```

Expected: `0`.

```bash
grep -c '555\|\[Lake Tapps' public/index.html
```

Expected: `0` — both placeholders removed.

```bash
grep -c 'Lake Tapps, Washington' public/index.html
```

Expected: `2` — once in the hero lead, once in the contact row.

```bash
grep -c 'fontawesome\|font-awesome\|fa-' public/index.html
```

Expected: `0`.

```bash
python scripts/check-emoji.py; echo "exit: $?"
```

Expected: `CLEAN: no emoji in built output` and `exit: 0`.

```bash
grep -c 'id="news"' public/index.html
```

Expected: `1` — the nav links written in Task 2 point at `/#news`.

- [ ] **Step 4: Manual verification**

```bash
python -m http.server 1313 --directory public
```

Open `http://localhost:1313/` and confirm:
- Stat counters animate once when scrolled into view.
- With reduced motion forced on (Chrome DevTools → Rendering → Emulate CSS
  `prefers-reduced-motion: reduce`), reload: counters show 2/7/4/13 immediately and
  the starfield and hero glow do not animate.
- Submitting the contact form disables the button, shows "Sending…", then a success
  or error line under it.
- At 375px there is no horizontal scrollbar.
- Tab through the whole page: every link, button and input shows a purple focus ring.

- [ ] **Step 5: Commit**

```bash
cd "C:/The Cosmic Microwave/website"
git add layouts/index.html assets/css/main.css
git commit -m "feat: rebuild homepage on the shared design system

Homepage drops from 1170 lines to content only. Removes the placeholder
phone number and the bracketed location, renames #blog to #news to match
the nav, and adds loading/success/error states to the contact form.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Sponsor page

**Files:**
- Modify: `layouts/sponsor/single.html` (full replace, currently 798 lines)
- Modify: `assets/css/main.css` (append)

**Interfaces:**
- Consumes: tokens, `.container`, `.section`, `.section-title`, `.section-subtitle`, `.card`, `.btn`, `.page-head`, `partial "icon.html"`.
- Produces: nothing later tasks depend on.

The five financial tiers and five in-kind partner types become one `.tier` component.
Every emoji is replaced by a sprite icon: 🌌 → `orbit`, 🌠 → `comet`, ⭐ → `star`,
🪐 → `planet`, ☄️ → `comet`, 🚀 → `hammer`, 🔧 → `wrench`, 🧰 → `cpu`,
🛰️ → `package`, 🌎 → `globe`.

- [ ] **Step 1: Replace the sponsor template**

Replace all of `layouts/sponsor/single.html`:

```go-html-template
{{ define "main" }}
<section class="section page-head">
  <div class="container">
    <h1 class="page-head__title">Sponsorship Program</h1>
    <p class="page-head__lead">
      Partner with FTC Team 35817 and put your name behind the next generation of
      engineers in Lake Tapps, Washington.
    </p>
  </div>
</section>

<section class="section section--alt">
  <div class="container">
    <h2 class="section-title">Why Sponsor Us</h2>
    <p class="section-subtitle">
      Your support reaches students, families and the wider community at every event
      we attend.
    </p>
    <ul class="why-grid">
      <li class="why card card--interactive">
        {{ partial "icon.html" (dict "name" "cpu" "class" "icon-lg" "size" 32) }}
        <h3 class="why__title">Real engineering</h3>
        <p class="why__text">Students design, machine, wire and program a competition robot from scratch every season.</p>
      </li>
      <li class="why card card--interactive">
        {{ partial "icon.html" (dict "name" "users" "class" "icon-lg" "size" 32) }}
        <h3 class="why__title">Community reach</h3>
        <p class="why__text">Our outreach puts robotics in front of younger students across the district.</p>
      </li>
      <li class="why card card--interactive">
        {{ partial "icon.html" (dict "name" "trophy" "class" "icon-lg" "size" 32) }}
        <h3 class="why__title">Proven results</h3>
        <p class="why__text">Four major awards, a finalist alliance captaincy and a 4th-place state finish.</p>
      </li>
      <li class="why card card--interactive">
        {{ partial "icon.html" (dict "name" "globe" "class" "icon-lg" "size" 32) }}
        <h3 class="why__title">Visible branding</h3>
        <p class="why__text">Your logo travels on the robot, our banner, our shirts and this site.</p>
      </li>
    </ul>
  </div>
</section>

<section class="section" id="tiers">
  <div class="container">
    <h2 class="section-title">Financial Support Levels</h2>
    <p class="section-subtitle">Five tiers, each with escalating recognition.</p>
    <ul class="tier-grid">
      <li class="tier card card--interactive tier--featured">
        <span class="tier__badge">Top tier</span>
        {{ partial "icon.html" (dict "name" "orbit" "class" "icon-lg tier__icon" "size" 32) }}
        <h3 class="tier__name">Universe Sponsor</h3>
        <p class="tier__amount">$5,000+</p>
        <p class="tier__tagline">Helping our mission reach beyond the stars.</p>
        <ul class="tier__perks">
          <li>{{ partial "icon.html" (dict "name" "check" "class" "icon-sm" "size" 18) }} Largest logo on robot and banner</li>
          <li>{{ partial "icon.html" (dict "name" "check" "class" "icon-sm" "size" 18) }} Logo on team shirts</li>
          <li>{{ partial "icon.html" (dict "name" "check" "class" "icon-sm" "size" 18) }} Featured placement on this site</li>
          <li>{{ partial "icon.html" (dict "name" "check" "class" "icon-sm" "size" 18) }} Social media feature posts</li>
          <li>{{ partial "icon.html" (dict "name" "check" "class" "icon-sm" "size" 18) }} Invitation to team demos</li>
        </ul>
      </li>
      <li class="tier card card--interactive">
        {{ partial "icon.html" (dict "name" "comet" "class" "icon-lg tier__icon" "size" 32) }}
        <h3 class="tier__name">Galaxy Sponsor</h3>
        <p class="tier__amount">$2,500 &ndash; $4,999</p>
        <p class="tier__tagline">Supporting innovation across the cosmos.</p>
        <ul class="tier__perks">
          <li>{{ partial "icon.html" (dict "name" "check" "class" "icon-sm" "size" 18) }} Large logo on robot and banner</li>
          <li>{{ partial "icon.html" (dict "name" "check" "class" "icon-sm" "size" 18) }} Logo on team shirts</li>
          <li>{{ partial "icon.html" (dict "name" "check" "class" "icon-sm" "size" 18) }} Listed on this site</li>
          <li>{{ partial "icon.html" (dict "name" "check" "class" "icon-sm" "size" 18) }} Social media mentions</li>
        </ul>
      </li>
      <li class="tier card card--interactive">
        {{ partial "icon.html" (dict "name" "star" "class" "icon-lg tier__icon" "size" 32) }}
        <h3 class="tier__name">Star Sponsor</h3>
        <p class="tier__amount">$1,000 &ndash; $2,499</p>
        <p class="tier__tagline">A bright contribution to our journey.</p>
        <ul class="tier__perks">
          <li>{{ partial "icon.html" (dict "name" "check" "class" "icon-sm" "size" 18) }} Logo on robot and banner</li>
          <li>{{ partial "icon.html" (dict "name" "check" "class" "icon-sm" "size" 18) }} Listed on this site</li>
          <li>{{ partial "icon.html" (dict "name" "check" "class" "icon-sm" "size" 18) }} Social media mentions</li>
        </ul>
      </li>
      <li class="tier card card--interactive">
        {{ partial "icon.html" (dict "name" "planet" "class" "icon-lg tier__icon" "size" 32) }}
        <h3 class="tier__name">Planet Sponsor</h3>
        <p class="tier__amount">$500 &ndash; $999</p>
        <p class="tier__tagline">Providing the foundation for exploration.</p>
        <ul class="tier__perks">
          <li>{{ partial "icon.html" (dict "name" "check" "class" "icon-sm" "size" 18) }} Logo on team banner</li>
          <li>{{ partial "icon.html" (dict "name" "check" "class" "icon-sm" "size" 18) }} Listed on this site</li>
        </ul>
      </li>
      <li class="tier card card--interactive">
        {{ partial "icon.html" (dict "name" "comet" "class" "icon-lg tier__icon" "size" 32) }}
        <h3 class="tier__name">Meteor Sponsor</h3>
        <p class="tier__amount">$100 &ndash; $499</p>
        <p class="tier__tagline">Every contribution moves us forward.</p>
        <ul class="tier__perks">
          <li>{{ partial "icon.html" (dict "name" "check" "class" "icon-sm" "size" 18) }} Name on team banner</li>
          <li>{{ partial "icon.html" (dict "name" "check" "class" "icon-sm" "size" 18) }} Listed on this site</li>
        </ul>
      </li>
    </ul>
  </div>
</section>

<section class="section section--alt">
  <div class="container">
    <h2 class="section-title">Mission Support Partners</h2>
    <p class="section-subtitle">
      In-kind support counts just as much as a cheque. If you can supply any of the
      following, we want to hear from you.
    </p>
    <ul class="tier-grid">
      <li class="tier card card--interactive">
        {{ partial "icon.html" (dict "name" "hammer" "class" "icon-lg tier__icon" "size" 32) }}
        <h3 class="tier__name">Launch Partner</h3>
        <p class="tier__amount">Manufacturing &amp; fabrication</p>
        <p class="tier__tagline">CNC machining, laser cutting, waterjet, welding, sheet metal, custom fabrication.</p>
      </li>
      <li class="tier card card--interactive">
        {{ partial "icon.html" (dict "name" "wrench" "class" "icon-lg tier__icon" "size" 32) }}
        <h3 class="tier__name">Engineering Partner</h3>
        <p class="tier__amount">Expertise &amp; mentorship</p>
        <p class="tier__tagline">Mentorship, CAD assistance, programming support, design reviews, industry knowledge.</p>
      </li>
      <li class="tier card card--interactive">
        {{ partial "icon.html" (dict "name" "cpu" "class" "icon-lg tier__icon" "size" 32) }}
        <h3 class="tier__name">Technology Partner</h3>
        <p class="tier__amount">Tools &amp; equipment</p>
        <p class="tier__tagline">3D printers, software licences, electronics, sensors, robotics equipment, computers.</p>
      </li>
      <li class="tier card card--interactive">
        {{ partial "icon.html" (dict "name" "package" "class" "icon-lg tier__icon" "size" 32) }}
        <h3 class="tier__name">Resource Partner</h3>
        <p class="tier__amount">Materials &amp; supplies</p>
        <p class="tier__tagline">Aluminium stock, hardware, consumables, batteries, safety equipment, shop supplies.</p>
      </li>
      <li class="tier card card--interactive">
        {{ partial "icon.html" (dict "name" "globe" "class" "icon-lg tier__icon" "size" 32) }}
        <h3 class="tier__name">Community Partner</h3>
        <p class="tier__amount">Outreach &amp; programs</p>
        <p class="tier__tagline">STEM outreach events, workshops, team events, community programs.</p>
      </li>
    </ul>
  </div>
</section>

<section class="section">
  <div class="container sponsor-cta">
    <h2 class="section-title">Ready to partner?</h2>
    <p class="section-subtitle">
      Email us and we will send a sponsorship packet with everything your finance
      team needs.
    </p>
    <div class="sponsor-cta__actions">
      <a class="btn btn--primary" href="mailto:thecosmicmicrowave35817@gmail.com?subject=Sponsorship%20enquiry%20%E2%80%94%20FTC%2035817">
        {{ partial "icon.html" (dict "name" "mail" "class" "icon-sm" "size" 18) }}
        Email the team
      </a>
      <a class="btn btn--secondary" href="/donate/">
        {{ partial "icon.html" (dict "name" "heart" "class" "icon-sm" "size" 18) }}
        Make a one-off donation
      </a>
    </div>
  </div>
</section>
{{ end }}
```

- [ ] **Step 2: Add sponsor styles**

Append to `assets/css/main.css`:

```css
/* ============================================================
   Sponsor
   ============================================================ */
.why-grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-5);
}
.why { display: flex; flex-direction: column; gap: var(--space-3); }
.why .icon { color: var(--accent-2); }
.why__title { font-size: var(--text-lg); font-weight: 600; }
.why__text { color: var(--text-secondary); font-size: var(--text-sm); }

.tier-grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-5);
  align-items: start;
}
.tier { position: relative; display: flex; flex-direction: column; gap: var(--space-3); }
.tier__icon { color: var(--accent-2); }
.tier--featured { border-color: rgba(123, 76, 255, 0.45); box-shadow: 0 0 40px var(--glow-1); }
.tier__badge {
  position: absolute;
  inset-block-start: calc(var(--space-3) * -1);
  inset-inline-end: var(--space-5);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-pill);
  background: linear-gradient(135deg, var(--accent-1), var(--accent-deep));
  color: #fff;
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.5px;
}
.tier__name {
  font-family: 'Orbitron', system-ui, sans-serif;
  font-size: var(--text-lg);
  font-weight: 700;
}
.tier__amount {
  font-size: var(--text-xl);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--accent-3);
}
.tier__tagline { color: var(--text-secondary); font-size: var(--text-sm); font-style: italic; }
.tier__perks { list-style: none; display: grid; gap: var(--space-2); margin-top: var(--space-2); }
.tier__perks li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  color: var(--text-secondary);
  font-size: var(--text-sm);
}
.tier__perks .icon { color: var(--accent-1); margin-top: 3px; }

.sponsor-cta { text-align: center; }
.sponsor-cta__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-4); }

@media (max-width: 480px) {
  .tier-grid, .why-grid { grid-template-columns: 1fr; }
  .sponsor-cta__actions { flex-direction: column; }
  .sponsor-cta__actions .btn { width: 100%; }
}
```

- [ ] **Step 3: Build and verify**

```bash
cd "C:/The Cosmic Microwave/website"
rm -rf public && hugo --quiet
```

Expected: exits 0, no output.

```bash
grep -c '<style' public/sponsor/index.html
```

Expected: `0`.

```bash
python scripts/check-emoji.py; echo "exit: $?"
```

Expected: `CLEAN: no emoji in built output` and `exit: 0` — every emoji that was on
the sponsor page is gone.

```bash
grep -c 'style="' public/sponsor/index.html
```

Expected: `0` — the inline `style` attributes on the old section headings are gone.

```bash
grep -c 'class="tier ' public/sponsor/index.html
```

Expected: `10` — five financial tiers plus five in-kind partners.

- [ ] **Step 4: Commit**

```bash
cd "C:/The Cosmic Microwave/website"
git add layouts/sponsor/single.html assets/css/main.css
git commit -m "feat: rebuild sponsor page on the shared design system

Ten tier and partner blocks collapse into one .tier component. Replaces
every emoji with a sprite icon and removes the inline style attributes on
section headings.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Posts list and post body

**Files:**
- Modify: `layouts/posts/list.html` (full replace, currently 202 lines)
- Modify: `layouts/posts/single.html` (full replace, currently 521 lines)
- Modify: `assets/css/main.css` (append)

**Interfaces:**
- Consumes: tokens, `.container`, `.section`, `.page-head`, `.post-grid`, `.post-card` (from Task 3), `.btn`, `partial "icon.html"`.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Replace the posts list template**

Replace all of `layouts/posts/list.html`:

```go-html-template
{{ define "main" }}
<section class="section page-head">
  <div class="container">
    <h1 class="page-head__title">News</h1>
    <p class="page-head__lead">Build updates, competition reports and what the team is up to between seasons.</p>
  </div>
</section>

<section class="section section--alt">
  <div class="container">
    {{ $posts := .Pages.ByDate.Reverse }}
    {{ if $posts }}
    <ul class="post-grid">
      {{ range $posts }}
      <li class="post-card card card--interactive">
        <p class="post-card__date">
          {{ partial "icon.html" (dict "name" "calendar" "class" "icon-sm" "size" 18) }}
          <time datetime="{{ .Date.Format "2006-01-02" }}">{{ .Date.Format "January 2, 2006" }}</time>
        </p>
        <h2 class="post-card__title"><a href="{{ .Permalink }}">{{ .Title }}</a></h2>
        <p class="post-card__excerpt">{{ .Summary }}</p>
        <span class="post-card__more">Read more {{ partial "icon.html" (dict "name" "chevron-right" "class" "icon-sm" "size" 18) }}</span>
      </li>
      {{ end }}
    </ul>
    {{ else }}
    <p class="empty-state">No posts yet. Check back once the season starts.</p>
    {{ end }}
  </div>
</section>
{{ end }}
```

`.post-card__title` is an `h2` here and an `h3` on the homepage — correct in both
cases, because the homepage has an `h2` section heading above it and this page does
not. The CSS targets the class, not the tag, so both render identically.

- [ ] **Step 2: Replace the post body template**

Replace all of `layouts/posts/single.html`:

```go-html-template
{{ define "main" }}
<article class="post">
  <header class="section page-head post__head">
    <div class="container">
      <p class="post__date">
        {{ partial "icon.html" (dict "name" "calendar" "class" "icon-sm" "size" 18) }}
        <time datetime="{{ .Date.Format "2006-01-02" }}">{{ .Date.Format "January 2, 2006" }}</time>
        <span class="post__readtime">&middot; {{ .ReadingTime }} min read</span>
      </p>
      <h1 class="page-head__title post__title">{{ .Title }}</h1>
    </div>
  </header>

  <div class="section section--alt post__body">
    <div class="container">
      <div class="prose">
        {{ .Content }}
      </div>
      <nav class="post__nav" aria-label="Post navigation">
        <a class="btn btn--secondary" href="/posts/">
          {{ partial "icon.html" (dict "name" "chevron-right" "class" "icon-sm post__nav-back" "size" 18) }}
          All posts
        </a>
        {{ with .NextInSection }}
        <a class="btn btn--ghost" href="{{ .Permalink }}">
          Next: {{ .Title }}
          {{ partial "icon.html" (dict "name" "chevron-right" "class" "icon-sm" "size" 18) }}
        </a>
        {{ end }}
      </nav>
    </div>
  </div>
</article>
{{ end }}
```

- [ ] **Step 3: Add reading typography**

Append to `assets/css/main.css`:

```css
/* ============================================================
   Posts
   ============================================================ */
.post__head { padding-bottom: var(--space-6); }
.post__title { font-size: var(--text-2xl); }
.post__date {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  margin-bottom: var(--space-4);
}
.post__readtime { color: var(--text-secondary); }

.post__nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  max-width: 72ch;
  margin: var(--space-8) auto 0;
  padding-top: var(--space-6);
  border-top: 1px solid var(--border-warm);
}
.post__nav-back { transform: rotate(180deg); }

/* ---- prose: long-form reading ---- */
.prose {
  max-width: 72ch;
  margin-inline: auto;
  color: var(--text-secondary);
  font-size: var(--text-lg);
  line-height: 1.7;
}
.prose > * + * { margin-top: var(--space-5); }
.prose h2, .prose h3, .prose h4 {
  color: var(--text-primary);
  margin-top: var(--space-8);
  margin-bottom: var(--space-4);
}
.prose h2 { font-family: 'Orbitron', system-ui, sans-serif; font-size: var(--text-xl); font-weight: 700; }
.prose h3 { font-size: var(--text-lg); font-weight: 600; }
.prose h4 { font-size: var(--text-base); font-weight: 600; }
.prose strong { color: var(--text-primary); }
.prose a { text-decoration: underline; text-underline-offset: 3px; }
.prose ul, .prose ol { padding-inline-start: var(--space-6); }
.prose li + li { margin-top: var(--space-2); }
.prose img, .prose video {
  width: 100%;
  height: auto;
  border-radius: var(--radius);
  border: 1px solid var(--border-warm);
}
.prose blockquote {
  padding: var(--space-4) var(--space-5);
  border-left: 4px solid var(--accent-2);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  font-style: italic;
  color: var(--text-primary);
}
.prose code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9em;
  padding: 0.15em 0.4em;
  border-radius: 4px;
  background: rgba(123, 76, 255, 0.14);
  color: var(--text-primary);
}
.prose pre {
  padding: var(--space-5);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-soft);
  background: rgba(10, 10, 20, 0.85);
  overflow-x: auto;
}
.prose pre code { padding: 0; background: none; font-size: var(--text-sm); }
.prose hr { border: none; border-top: 1px solid var(--border-warm); }
.prose table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
.prose th, .prose td { padding: var(--space-3); border-bottom: 1px solid var(--border-warm); text-align: left; }
.prose th { color: var(--text-primary); font-weight: 600; }

@media (max-width: 768px) {
  .prose { font-size: var(--text-base); }
  .post__nav { flex-direction: column; align-items: stretch; }
}
```

- [ ] **Step 4: Build and verify**

```bash
cd "C:/The Cosmic Microwave/website"
rm -rf public && hugo --quiet
```

Expected: exits 0, no output.

```bash
grep -c '<style' public/posts/index.html public/posts/cosmicsim/index.html
```

Expected: both report `0`.

```bash
grep -c 'class="prose"' public/posts/cosmicsim/index.html
```

Expected: `1`.

```bash
grep -c 'min read' public/posts/cosmicsim/index.html
```

Expected: `1`.

- [ ] **Step 5: Commit**

```bash
cd "C:/The Cosmic Microwave/website"
git add layouts/posts/list.html layouts/posts/single.html assets/css/main.css
git commit -m "feat: rebuild post list and post body with reading typography

Post bodies get a 72ch measure, 1.7 line height and styled headings, lists,
code blocks, blockquotes and tables. The post list reuses the homepage card
component.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Full-site verification and cleanup

Runs the whole spec's verification list across every page at once, and removes
anything the earlier tasks left behind.

**Files:**
- Modify: `assets/css/main.css` (only if a check fails)
- Modify: any layout (only if a check fails)

**Interfaces:**
- Consumes: everything.
- Produces: a verified build.

- [ ] **Step 1: Clean build**

```bash
cd "C:/The Cosmic Microwave/website"
rm -rf public resources && hugo --quiet
echo "exit: $?"
```

Expected: `exit: 0` with no other output.

- [ ] **Step 2: Assert nothing forbidden survives anywhere**

```bash
cd "C:/The Cosmic Microwave/website"
echo "--- inline style blocks (want 0) ---"
grep -rl '<style' public --include='*.html' | wc -l
echo "--- font awesome (want 0) ---"
grep -rl 'font-awesome\|fontawesome\|fa-solid\|class="fas\|class="fab' public --include='*.html' | wc -l
echo "--- placeholder phone (want 0) ---"
grep -rl '555) 000-0000' public --include='*.html' | wc -l
echo "--- bracketed location (want 0) ---"
grep -rl '\[Lake Tapps' public --include='*.html' | wc -l
echo "--- emoji ---"
python scripts/check-emoji.py; echo "exit: $?"
```

Expected: all four counts print `0`, then `CLEAN: no emoji in built output` and
`exit: 0`.

If any check fails, fix the offending template and rerun from Step 1.

- [ ] **Step 3: Assert every page shares one stylesheet**

```bash
cd "C:/The Cosmic Microwave/website"
grep -rhoE 'main[^"]*\.css' public --include='*.html' | sort -u
```

Expected: exactly one line. More than one means a template bypassed `baseof.html`.

```bash
find public -name '*.html' | wc -l
grep -rl 'site-footer__wordmark' public --include='*.html' | wc -l
```

Expected: both print the same number — every page inherits the shared footer.

- [ ] **Step 4: Assert accessibility hooks are present on every page**

```bash
cd "C:/The Cosmic Microwave/website"
grep -rc 'class="skip-link"' public --include='*.html'
```

Expected: every line ends in `:1`.

```bash
grep -rc 'aria-expanded' public/index.html public/sponsor/index.html \
     public/donate/index.html public/posts/index.html public/404.html
```

Expected: every file reports `2` or more.

- [ ] **Step 5: Manual pass — breakpoints**

```bash
python -m http.server 1313 --directory public
```

For each of `/`, `/sponsor/`, `/donate/`, `/posts/`, `/posts/cosmicsim/`, `/404.html`,
at widths 375, 768, 1024 and 1440:

- No horizontal scrollbar.
- Header does not overlap the first heading.
- No text is clipped or overflowing its card.
- Buttons and links are at least 44px tall.

- [ ] **Step 6: Manual pass — keyboard**

On the homepage, using only the keyboard:

- Tab once from page load: the "Skip to main content" link appears and works.
- Every link, button and form field shows a visible purple focus ring.
- Tab order matches visual order.
- Enter on "Support Us" opens the menu; Escape closes it and returns focus to the button.
- At 375px, Enter on the hamburger opens the drawer; Escape closes it and returns focus.

- [ ] **Step 7: Manual pass — reduced motion**

In Chrome DevTools → Rendering → Emulate CSS media feature
`prefers-reduced-motion: reduce`, reload the homepage:

- Stat counters read 2, 7, 4, 13 immediately with no count-up.
- The starfield does not twinkle.
- The hero glow does not pulse.
- Hover on a card does not translate it.

- [ ] **Step 8: Confirm the old duplication is gone**

```bash
cd "C:/The Cosmic Microwave/website"
wc -l layouts/index.html layouts/sponsor/single.html layouts/donate/single.html \
      layouts/posts/list.html layouts/posts/single.html layouts/404.html \
      assets/css/main.css assets/js/site.js
```

Expected: every layout is well under 300 lines, and the token block appears exactly
once:

```bash
grep -rc -- '--bg-primary:' layouts/ assets/css/main.css
```

Expected: `assets/css/main.css:1` and `0` for everything under `layouts/`.

- [ ] **Step 9: Commit**

```bash
cd "C:/The Cosmic Microwave/website"
git add -A
git commit -m "chore: verify redesign across all pages

Confirms every page shares one fingerprinted stylesheet, carries the skip
link, and contains no inline styles, Font Awesome references, emoji or
placeholder content.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Post-Implementation Notes

**Left deliberately unchanged**, per the approved spec:

- The three social links to Instagram, YouTube and X still point at `href="#"`. They
  are styled and keyboard-reachable but do not navigate. Replace the `#` with real
  URLs when the accounts exist.
- `baseURL` in `hugo.toml` still carries the comment `# <- replace with your actual
  domain`. The value `https://cosmicmicrowave.org` looks correct; the comment is
  stale but harmless.
- No light mode.
- No new pages.
