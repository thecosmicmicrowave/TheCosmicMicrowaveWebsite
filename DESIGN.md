# Design System: The Cosmic Microwave — FTC 35817

Reset 2026-10-08. Replaces the earlier violet + red "Night-Shift Galley" system, which the team judged generic. References: seattlesolvers.com (loud type, one accent, 3D robot) and theseusrobotics.org (mono labels, hairline sponsor cards).

## Concept

The team name is the theme. Two halves:

- **Cosmic microwave background.** A procedural CMB sky map (`layouts/partials/cmb.html`, SVG noise posterised into a red oval) fills the home hero behind the robot and rises off the edge of the sponsor page heads and 404. A faint film grain (`.grain`) covers every page. No starfields, nebulae, or glows.
- **Microwave.** Numbers read like an appliance display: two-digit, red, tabular (`.readout`). The footer ends on `00:00`. Keep kitchen jokes to one per page.

## Rules

1. **One accent, used as a surface.** `--red` (#ff3b30) is the only color. It appears as text and lines, and also as solid blocks (`.block-red`: red fill, dark ink, faint grid) for the ticker, the zero-fees statement, the featured Star tier, and closing CTAs. Roughly one red block per screen. No violet, no gradients, no shadows, no glows.
2. **Square corners.** No border-radius on UI. The only circle is the tinted plate behind the hero robot.
3. **Hairlines, not boxes.** Lists are rows divided by `--line`. A bordered box is for a real container (sponsor card, featured tier, closing CTA).
4. **Three type voices.**
   - Orbitron 500, uppercase: h1, h2, names, readout digits.
   - Inter: body copy and h3.
   - JetBrains Mono, uppercase, tracked: labels, buttons, nav, dates, metadata (`.mono`, `.eyebrow`).
5. **Every section opens with an eyebrow**: red diamond, mono label, hairline rule, optional right-hand metadata.
6. **Left-aligned.** No centered section titles.
7. **No decorative icons.** Brand marks only. Buttons carry a text arrow.
8. **Real facts only.** Readouts, the event log, and sponsor names come from PRODUCT.md evidence. Nothing invented.

## Tokens

Defined at the top of `assets/css/main.css`: colors, 4/8px spacing scale (`--space-1` to `--space-10`), fluid type sizes (`--text-2xl`, `--text-3xl`), one motion pair (`--dur`, `--ease`).

## Components

- **Buttons** (`.btn`): 48px square block, mono caps. Primary is red with dark text; secondary is a hairline outline.
- **Ticker** (`.ticker`): red marquee of the motto under the hero; static under reduced motion.
- **Split** (`.split`): red statement block beside the season budget bars (figures from the sponsor packet).
- **Logo wall** (`.logo-wall`): home-page mosaic of every sponsor logo on white cells.
- **Footer**: four columns plus the wordmark at full viewport width in red.
- **Readout** (`.readout`): four-cell hairline grid of big red digits with mono labels.
- **Log / crew tables** (`.log`, `.crew`): numbered hairline rows.
- **Sponsor wall** (`.sponsor-tier`, `.sponsor-card`): one section per tier. Eyebrow shows the tier name and the real size of that object (galaxy: 100,000 light-years). Card columns grow as tiers shrink (2, 3, 4, 5, 6). Every logo sits on a white plate so mixed logo backgrounds look uniform.
- **Tier table** (`.tiers`, `.tier`): name and price, benefit list, CTA. Star stays flagged "Most popular" in a red-bordered row; that is a deliberate pricing nudge.
- **Forms**: underline-only fields, mono labels.

## Open slots

- No team or event photos exist in `static/`. Both reference sites lean on them; add duotone photo bands when photos arrive.
- Sponsor cards have no description line because none have been supplied. Add a `blurb` field to `data/sponsors.yaml` if sponsors provide one.
