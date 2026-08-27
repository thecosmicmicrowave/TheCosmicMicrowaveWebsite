# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing codebase: Hugo static site (v0.163.3 extended), no JS framework, no package manager. Hugo Pipes only (minify/fingerprint). Deployed to Cloudflare Workers via GitHub Actions on push to `main`.

## Users

Primary: sponsors and donors deciding whether to fund the team (financial sponsorship tiers, in-kind partnerships, one-time donations via Give Lively). Secondary: prospective students/parents evaluating the team's culture and achievements, and the FTC community (judges, other teams) verifying team history and legitimacy. The site is designed to serve all three, but sponsor/donor conversion is the primary success metric.

## Product Purpose

Public marketing and credibility site for FTC (FIRST Tech Challenge) robotics team 35817, "The Cosmic Microwave," based in Lake Tapps, Washington. Exists to attract sponsorship/donation funding, communicate team history and achievements, publish team news, and give prospective members/parents a way to make contact. Success = a sponsor reads the tiers and reaches out or a donor completes a Give Lively donation; secondarily, a visitor comes away with an accurate, credible picture of the team.

## Positioning

The team competed previously as FTC 27393 "The FBI – FIRST Bot Inventors" at North Tapps Middle School with a real competitive record (Finalist Alliance Captain, Control 2 at Cowtown, 4th at WA State Championship, Think 2 at Asimov, Control 1 at Wu League, Inspire 2 at Wu Interleague) before rebranding as 35817. The claim a template team site can't make: veteran competitive results under a technically "rookie" team number, worn without spin.

## Operating Context

Contact form submits to Formspree (`https://formspree.io/f/xzdnbjjr`). Donations route to Give Lively's hosted Washington FIRST Robotics donation page (`secure.givelively.org/donate/washington-first-robotics/the-cosmic-microwave`) — off-site, third-party, tax-deductible. Sponsorship inquiries currently route back to the same on-page contact form regardless of which tier is chosen. News/blog posts are authored as Hugo content pages under `content/posts/`.

## Capabilities and Constraints

- Hugo Pipes only: no npm, no build tooling, no Tailwind. `assets/css/main.css` and `assets/js/site.js` are hand-authored and piped through `minify | fingerprint`.
- Mid-migration: `layouts/_default/baseof.html`, `partials/header.html`, `partials/footer.html`, `partials/icon.html`, `svg-sprite.html`, and `assets/css/main.css` form a shared token/template system already proven on `donate/single.html` and `404.html`. `layouts/index.html`, `layouts/sponsor/single.html`, `layouts/posts/list.html`, `layouts/posts/single.html` are NOT yet migrated — each is still a self-contained document with its own duplicated inline stylesheet, Font Awesome CDN dependency, and JS-driven starfield.
- Do not modify `public/` (build output, gitignored) or the logo assets under `static/`.
- No test framework; verification is `hugo --quiet` (must exit 0) plus manual/grep checks against `public/` output.

## Brand Commitments

- Team name: "The Cosmic Microwave," FTC 35817. Motto: `"Cogitare est coquere" — To think is to cook.` (Latin pun on the team name.)
- Colors are fixed and must not be changed: `--bg-primary #0a0a14`, `--bg-secondary #111128`, `--bg-card rgba(20,20,50,0.7)`, `--text-primary #f0f0ff`, `--text-secondary #b8b8e0`, `--accent-1 #7b4cff`, `--accent-2 #ff3b30`, `--accent-3 #ff6b6b`, `--accent-deep #b30000`. Dark mode only.
- Fonts fixed: Orbitron for display use, Inter for everything else — but per user feedback (2026-08-26), current usage of both reads as generic/AI-template ("slop"): Orbitron is overused as a heavy-handed sci-fi cue on every heading/stat/tier-name instead of a rare accent, and gradient-clip-text (`background-clip: text` purple→red) is repeated on nearly every section title. Keep the two fonts and the palette; the redesign should reduce Orbitron's footprint and the gradient-text pattern's repetition, and replace generic rounded-pill-button/blurred-glass-card chrome with something more specific to the team, without abandoning the cosmic-dark identity.
- No emoji anywhere in rendered output — use the existing inline SVG icon sprite instead. This is a violated-but-established rule (`layouts/sponsor/single.html` currently has 19 emoji instances that need removing).
- Logo assets (`/logo_circle_nobg.png`, `/logo_badge_nobg.png`, `/favicon-96x96.png`) are fixed and must not be modified.

## Evidence on Hand

- Official sponsor packet at `reference/Sponsor Packet (1).pdf` — normative source for tier pricing (Universe $2,500+, Galaxy $1,000–$2,499, Star $500–$999, Planet $250–$499, Meteor $100–$249), tier benefits (all tiers include the monthly "Cosmic Dispatch" newsletter), the season cost breakdown ($600 game elements/field setup, $1,600 competition registration & 501(c)(3) fees, $4,300 robot electronics & supplies, $4,300 travel funds; $10,800 total goal), the team's EIN (81-2908499), and the in-kind/mentorship ask framing. Site copy for sponsor tiers and the donate page's "where it goes" breakdown must match this document; re-check against it if the packet is ever replaced with a newer version.
- Real team roster with names, roles, FTC-experience years, and schools (`layouts/index.html` team section, sourced from the sponsor packet) — 8 members: AJ Streepy, Charlotte Wester, Nathan Tran, Easton Dixon, Sterling Rosquita, Quinn Feldmann, Christian Bautista, Emmett Riemer.
- Real competition results and awards, listed above under Positioning.
- Real blog content: one published post, "Cosmic Sim" (`content/posts/CosmicSim.md`), linking to a real itch.io game (`https://aspect-nil.itch.io/cosmic-sim`).
- Donations currently route through Washington FIRST Robotics' Give Lively page (fiscal sponsorship) because the team does not yet have its own bank account — do not replace this flow with the team's own EIN/direct processing until the user confirms a bank account exists. The EIN belongs on the sponsor page as supporting detail for sponsors' own paperwork, not as a donate-flow change.
- Placeholder content already removed during the 2026-08 redesign: `[Lake Tapps, Washington]` brackets, the `+1 (555) 000-0000` fake phone number, and dead `href="#"` social icons.
- No testimonials, press mentions, or case studies exist — none should be invented.

## Product Principles

1. Sponsor/donor conversion is the primary success metric; visual and content decisions on the sponsor and donate pages take priority over decoration.
2. The competitive-veteran-under-a-rookie-number story is the team's real differentiator and should stay visible, not buried under generic team-site boilerplate.
3. One token system, one shared header/footer/script — no page should carry its own duplicated stylesheet going forward.
4. Cosmic-dark identity stays; execution should read as authored for this specific team, not as a generic dark-mode SaaS/startup template.
5. Never ship placeholder content (fake contact info, dead links, lorem-ipsum-equivalent copy) to production.

## Accessibility & Inclusion

No project-specific requirement beyond general good practice: visible focus states on every interactive element, WCAG AA contrast, full keyboard operability. Already partly established in `assets/css/main.css`; must extend to the pages still pending migration.
