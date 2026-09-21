# Design System — Off The World (OTW)

First-pass design system for review. Nothing here is locked — treat it as a
proposal to react to, not a finished brand.

## Product Context
- **What this is:** An end-to-end event entertainment and production company
  (DJs, sound, lighting, staging, installation, photo/video), plus a network
  of DJs customers can browse and book through.
- **Who it's for:** People planning an event who don't necessarily know what
  equipment they need — private parties, weddings, corporate events, brand
  events, clubs — and DJs who want to join a curated network rather than
  submit a CV.
- **Project type:** React + Vite SPA with a Supabase backend (services,
  packages, DJs, quote requests, DJ applications).

## Aesthetic Direction
- **Direction:** Professional and classy, with an energetic, contemporary
  edge — closer to a well-run production company than a nightclub flyer or
  a generic corporate events agency.
- **Concept:** A lighting rig, not a nightclub. The dark stage-surface
  background with two accent "lights" — a warm amber for trust/commercial
  moments (CTAs, packages) and a cool violet used only for the creative,
  interactive layer (the services bubble field, the quote builder's
  recommendation) — is a deliberate two-light system tied to what OTW
  actually does, rather than a single neon accent.
- **What to avoid:** neon nightclub clichés, stock-photo corporate imagery,
  a self-serve marketplace feel, dense information-heavy layouts.

## Typography
- **Display/headings:** Bricolage Grotesque — a geometric sans with enough
  irregularity to read as contemporary/creative rather than a generic
  system font, without borrowing Studio Margarita's Space Grotesk.
- **Body/UI:** Inter, for legibility at small sizes (forms, chips, labels).
- **Labels:** sentence case, not tracked-out uppercase — OTW's own choice,
  distinct from Studio Margarita's uppercase label convention.

## Color
- **Background:** `#0d0d0f` (near-black stage surface)
- **Surface:** `#17171a` / **Surface 2:** `#1f1f23`
- **Ink:** `#f4f2ee` / **Ink-soft:** `#9d9aa0`
- **Rule:** `#2a2a2f`
- **Amber (primary accent):** `#d7a94a` — CTAs, packages, trust moments
- **Violet (creative accent):** `#8b7bff` — services bubbles, quote builder
  recommendation, used nowhere else
- Dark-only for now; revisit if a real need for a light mode appears.

## Layout
- `section-narrow` (640px) for forms and text-heavy content, `section-wide`
  (1200px) for grids.
- Small consistent border-radius (3px) on interactive elements — a deliberate
  departure from Studio Margarita's "0 always," so OTW doesn't visually
  inherit the print-gallery rule from the site it was structurally built on.
- **Signature motif:** the floating bubble field for services — the one
  place motion and the violet accent are used together, per the brief.

## Motion
- Bubbles idle-float gently (respecting `prefers-reduced-motion`); everything
  else is instant state changes or short hover transitions. No entrance
  animations on scroll.

## Content Architecture
- Client side: Home → Services → Packages → Get a Quote (5-step builder with
  a client-side recommendation preview; OTW reviews and can override every
  recommendation from the Supabase dashboard before a quote goes out).
- DJ side: DJs directory (click a face to expand their profile in place,
  same pattern as Studio Margarita's artist directory) → Join OTW
  application → OTW reviews in Supabase → profile published.
- No custom admin dashboard in this pass — DJs, services, packages and
  incoming requests are managed from the Supabase Table Editor, same
  workflow as Studio Margarita used for artists/artwork. A dedicated admin
  UI is a reasonable Phase 2 if that workflow starts to feel limiting.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-09-21 | Documented as first-pass DESIGN.md, not a finished system | Brief calls for repurposing Studio Margarita's *framework*, not its visual identity — flagging every choice as reviewable |
| 2026-09-21 | Two-accent (amber/violet) system instead of one bright accent on near-black | Grounded in the brief's own subject matter (lighting), and avoids the generic "near-black + single bright accent" AI-design default |
| 2026-09-21 | No admin dashboard, no email automation in MVP | Brief lists these as full requirements, but Studio Margarita shipped without a custom admin by using Supabase's own Table Editor — same trade-off keeps this buildable in one pass; flagged as Phase 2 |
