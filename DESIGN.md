# Design System: The Cosmic Microwave — FTC 35817

Reset 2026-10-08. Replaces the earlier violet + red "Night-Shift Galley" system, which the team judged generic. References: seattlesolvers.com (loud type, one accent, 3D robot) and theseusrobotics.org (mono labels, hairline sponsor cards).

## Concept

Real space photography, not drawn shapes. Flat drawn stars, orbits and planets were tried and rejected on 2026-10-08, as was a procedural microwave-background texture.

- **Hero background:** Webb's Carina Nebula ("Cosmic Cliffs"), `static/space/nebula.webp`, color-graded to violet shadows and red highlights (team colors), darkened by an overlay where text sits.
- **Sponsor tiers:** each tier on `/sponsors/` opens with a banner photo of the thing it is named after, set in `data/tiers.yaml` (Hubble deep field, Whirlpool Galaxy slowly turning, the Sun, Saturn, a Perseid meteor). Banner height and title size step down from Universe to Meteor. Thumbnails of the same photos sit on the tier rows of `/sponsor/`.
- **Page heads (sponsor pages, 404):** Cassini's Saturn portrait, `static/space/saturn.webp`, screened onto the dark page so its black sky disappears.
- **Footer wordmark:** the nebula photo clipped inside the letters.
- Both images are NASA public-domain releases (credit line in the footer). Add further photos the same way; do not add illustrated space art.
- UI on top of the photos stays flat: red and violet blocks, square corners, hairlines.

## Rules

1. **Two team colors, each with a job.** Red `--red` (#ff3b30) is hot: actions, numbers, the ticker, the featured tier. Violet `--violet` (#6d3ff2, text variant `--violet-ink` #a98cff) is cold: the robot's own color, the hero plate, hover and focus states, right-hand eyebrow metadata, and secondary surfaces. Both appear as solid blocks (`.block-red`, `.block-violet`), usually paired side by side. Never blend them into a gradient. No shadows, no glows.
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
- **Split** (`.split`): red block with the season total beside violet budget bars. Figures come from the team's budget sheet ($12,200 as of 2026-10-08).
- **Sponsor logos** (`partials/sponsor-logo.html`): monochrome at rest, crossfade to full color on a white plate on hover or focus. Used on the home logo wall and the sponsors page.
- **Footer**: four columns plus the wordmark at full viewport width in red.
- **Readout** (`.readout`): four-cell hairline grid of big red digits with mono labels.
- **Log** (`.log`): numbered hairline rows.
- **Crew** (`.crew`): numbered rows from `data/crew.yaml`; each is a `<details>` that opens a file with focus, experience, school, and an optional `bio` and `photo`. One open at a time.
- **Sponsor wall** (`.sponsor-tier`, `.sponsor-card`): one section per tier. Eyebrow shows the tier name and the real size of that object (galaxy: 100,000 light-years). Card columns grow as tiers shrink (2, 3, 4, 5, 6).
- **Tier table** (`.tiers`, `.tier`): name and price, benefit list, CTA. Star stays flagged "Most popular" in a red-bordered row; that is a deliberate pricing nudge.
- **Forms**: underline-only fields, mono labels.

## Open slots

- No team or event photos exist in `static/`. Both reference sites lean on them; add duotone photo bands when photos arrive.
- Sponsor cards have no description line because none have been supplied. Add a `blurb` field to `data/sponsors.yaml` if sponsors provide one.
