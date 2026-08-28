# Handoff — Sponsor Wall Redesign (2026-08-28)

## Context

Kimoni Eatss became the team's first sponsor. Their logo (meteor tier) rendered at 44px,
grayscaled, on the wall at the bottom of `/sponsor/` — too small to be a real thank-you.
The team looked at how Seattle Solvers (FTC 23511) presents sponsors and decided to upgrade
the wall and move it to its own page.

## Decisions (from brainstorm)

1. **Separate page.** The sponsor wall lives on its own page, `/sponsors/` ("Our Sponsors").
   `/sponsor/` keeps the sponsorship program (tiers, CTA) and links to the wall.
2. **Nav labeling.** In the "Support Us" dropdown, the old "Sponsor" entry is now
   **"Become a Sponsor"** (goes to `/sponsor/`), and a new **"Our Sponsors"** entry goes to
   `/sponsors/`. Footer updated to match.
3. **No grayscale.** Logos render full color at full opacity. Hover keeps the subtle lift
   (translateY), nothing else.
4. **Tier-based sizing, compressed with a higher floor** (chosen over uniform size):
   | Tier | Logo height |
   |------|-------------|
   | Universe | 200px |
   | Galaxy | 184px |
   | Star | 168px |
   | Planet | 152px |
   | Meteor | 136px |
   (Started at 96px → 44px; raised to 160px → 96px after Kimoni's logo looked too small, then scaled up again to the current set so every logo is clearly visible.)
5. **Tier group headers.** Each tier that has sponsors gets its own section — "Universe Sponsors",
   "Meteor Sponsors", etc. — with a centered uppercase header, so tier prominence doesn't rely on
   size alone. Each section has an anchor (`#universe` … `#meteor`) used by the page's tier-jump nav.
6. **Names under logos.** Every logo shows a small name label beneath it.

## What changed

| File | Change |
|------|--------|
| `data/sponsors.yaml` | Added Kimoni Eatss (meteor) — the first real entry |
| `static/sponsors/kimonieatsMeteor.png` | Kimoni's logo (already in place) |
| `content/sponsors.md` | New page front matter (`layout: "sponsors"`) |
| `layouts/sponsors/single.html` | **New.** "Our Sponsors" page: page-head + tier-jump nav + tier-grouped wall; empty state if no sponsors |
| `layouts/sponsor/single.html` | Removed the wall section; replaced with a "See our sponsors" CTA to `/sponsors/`; tier-jump "Our sponsors" link now points to `/sponsors/` |
| `layouts/partials/header.html` | Support Us dropdown: "Become a Sponsor" + new "Our Sponsors" entry |
| `layouts/partials/footer.html` | Footer: "Become a Sponsor" + new "Our Sponsors" link |
| `assets/css/main.css` | Rewrote sponsor wall block: no grayscale, new heights, `.sponsor-tier__title`, `.sponsor-wall__name`, `.sponsor-wall__row`; responsive gap query updated |

## How to add a new sponsor

1. Put the logo file (SVG or PNG, transparent background) in `static/sponsors/`.
2. Add an entry to `data/sponsors.yaml`:
   ```yaml
   - name: "Company Name"
     tier: meteor          # universe, galaxy, star, planet, or meteor
     logo: "company.png"   # must match the file in static/sponsors/
     url: "https://example.com"
   ```
3. Build (or the dev server picks it up automatically). The wall groups by tier order
   (universe → meteor), so no template edits needed.

The file `data/donors.yaml` is the separate, simpler mechanism for individual donors on `/donate/`.

## Notes / future ideas

- **Seattle Solvers comparison** (for reference): featured (top-tier) sponsors get a big two-column
  row with logo, name, and description; lower tiers are logo-only in a 210×150 grid. Their logos
  are full color. We kept our tier-scaling approach with a higher floor instead.
- **In-kind partners** ("Mission Support Partners") exist as a concept on the sponsor page but
  aren't yet data-driven; if the wall gets big, they could get their own group on `/sponsors/`.
- Hugo prints a deprecation warning for `.Site.Data` (use `hugo.Data` instead). Left as-is to match
  the existing donate page — worth a small cleanup pass later.
- No commits were made for this work; `public/` was rebuilt locally.
