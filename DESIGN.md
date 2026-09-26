# Design System — OTW Off The World

The site follows the OTW design system package (`Branding/DS.zip`,
`otw-ds-package`). Its `readme.md` is the source of truth. This file records
how the site maps onto it. Do not invent new colours, fonts or radii.

## Where it lives in the code
- `src/styles/ds/` — the DS tokens and fonts, copied verbatim from the
  package (`styles.css` is the entry point). Update these only by re-copying
  from a newer package.
- `src/styles/site.css` — every site component, built only on those tokens.
- `public/logos/` — the 56 supplied SVG logos. Always use these; never retype
  or recolour the logo.
- `src/components/ui.jsx` — `HalfWorld`, `Icon` (inlined Lucide, 2px, square
  caps), `Logo`.

## Entities and routes
One master identity, three entities. `data-entity` on a wrapper switches
`--accent`. `src/lib/routes.js` maps every route to one entity.

| Entity | Colour | Routes |
| --- | --- | --- |
| Master | gold `#D4AA4C` | home, about |
| Events | green `#8FBF5A` | events (nights + production), services, packages, quote |
| Academy | coral `#FF5A3C` | academy, artists, join |
| Records | teal `#5CC8D4` | records (formerly "Label"; `#label` still resolves) |

The header shows the current entity's horizontal logo; the active nav item
gets a 16×8 half-world in its entity colour. "Get a quote" always uses the
Events accent.

## Rules applied (from the DS readme)
- Ink `#0F1113` site, white text, 2px white rules between sections, cells,
  rows and cards. Flush left, no centred copy.
- 0 radius everywhere. The half-world is the only curve.
- No shadows, gradients, blur or transparency. No emoji.
- Headlines: Archivo Expanded 800, caps, 0.92 leading. Labels: Expanded 700,
  12–14px, 0.14em tracking. Body: Archivo 400, 16–18px. Unbounded is logo only
  (served via the SVGs).
- Buttons: primary (accent fill, ink label, inverts on hover), secondary (2px
  border), ghost (text + →). 48px / 40px. Disabled 45%.
- Photography grayscale. Release artwork is the only colour image.
- Motion: 120–200ms colour transitions; hero half-world rises on load (400ms,
  off under `prefers-reduced-motion`).
- Copy: short, "we"/"you", no exclamation marks, middle dot ` · ` between
  facts, dates as `SAT 14 NOV`, 24-hour times.

## Components
Header, Footer, Button, Tag (also used as toggle chips in the quote builder),
EventCard, CtaBar, TextField/Select (2px bottom border), ruled cells,
half-world list, entity bands (full accent fields on home), accent field
block (quote recommendation).

Academy/Records: CourseCard (coral rule, Starts/Length/Level ruled cells,
price, ENROL →), ScheduleTable (next open row in accent fill), EnrolForm
(details → payment step), ReleaseCard (square colour artwork), FAQ (ruled
details rows, half-world marker lights up when open), ArtistsGrid (shared by
Artists, Academy and Events).

Not built yet: course and release detail pages, Tracklist.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-09-21 | First-pass amber/violet system | Superseded |
| 2026-09-26 | Adopted the OTW DS package in full | Official brand system now exists |
| 2026-09-26 | Label renamed Records | Matches DS entity |
| 2026-09-26 | Artists roster + Join moved under Academy | DS has three entities; artists sit with training |
| 2026-09-26 | Events = public nights + production/quote flow | Keeps the revenue flow and adds the DS events listing |
| 2026-09-26 | Bubble field and flip hero removed | Round bubbles, glow and emoji break the DS rules (one curve, no gradients, no emoji). Replaced by ruled category rows and tag toggles |
| 2026-09-26 | New `events` table (migration 003) | Nights live in Supabase like all other content |
| 2026-09-26 | Events page leads with event management and DJ booking; OTW nights moved lower | The site's job is winning clients; nights are secondary |
| 2026-09-26 | Academy: courses, schedule, enrol + payment placeholder, artists spotlight | Academy sells courses and showcases the roster |
| 2026-09-26 | Courses can link out via `booking_url` (e.g. Plug The Jack) or book on-site | DJ courses are also sold through Plug The Jack |
| 2026-09-26 | Payment is a placeholder (`src/lib/payments.js`); bookings save as pending_payment, paid by bank transfer | No payment provider yet |
