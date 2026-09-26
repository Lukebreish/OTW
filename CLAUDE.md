## Design system
Read DESIGN.md before making any visual or UI decision. The site follows the
OTW design system package (tokens in `src/styles/ds/`, logos in
`public/logos/`). Build only on those tokens: no new colours, fonts or radii,
0 radius, 2px rules, no shadows/gradients/emoji. Record structural changes in
DESIGN.md's decisions log.

## Content and data
Services, packages, DJs, events, DJ applications and quote requests live in
Supabase (see `supabase/migrations/`), not in hardcoded arrays. Do not
reintroduce hardcoded content arrays for these.

## Recommendation logic
`src/lib/recommend.js` is intentionally simple and rule-based — OTW reviews
every recommendation in the Supabase dashboard before a quote goes out, so
this only needs to be a reasonable starting point, not a finished model.
