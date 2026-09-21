## Design system
Read DESIGN.md before making any visual or UI decision. It's a first-pass
proposal, not a locked system — but changes to color, type, spacing or the
bubble-field motif should update DESIGN.md too, not just the CSS.

## Content and data
Services, packages, DJs, DJ applications and quote requests live in
Supabase (see `supabase/migrations/`), not in hardcoded arrays. Do not
reintroduce hardcoded content arrays for these.

## Recommendation logic
`src/lib/recommend.js` is intentionally simple and rule-based — OTW reviews
every recommendation in the Supabase dashboard before a quote goes out, so
this only needs to be a reasonable starting point, not a finished model.
