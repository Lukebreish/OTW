# Off The World (OTW)

## Backend setup (Supabase) — do this once

The site reads services/packages/DJs from Supabase, and quote requests and
DJ applications write there too — that's the CRM.

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste `supabase/migrations/001_initial_schema.sql`,
   run it. Then do the same with `002_seed_content.sql` to load starter
   content (categories, services, three packages, and a Luke Breish DJ
   profile plus two placeholder DJs to replace).
3. Open **Project Settings → API**, copy the **Project URL** and the
   **anon/public key**.
4. Copy `.env.example` to `.env` here and paste those two values in.
5. Add the same two variables in the Vercel project (**Settings →
   Environment Variables**) so production can reach Supabase too.

The anon key is meant to be public. Row Level Security (in the migration)
controls what it can actually do: read services/packages/published DJs,
insert quote requests and DJ applications, nothing else. Never put the
database password or the `service_role` key in `.env` or anywhere
client-side.

## Run locally
```
npm install
npm run dev
```

## Deploy
This is already wired to the `off-the-world` Vercel project, with
`otw.lukebreish.com` attached. Push to the connected repo (or redeploy from
this folder) once the Supabase env vars are set — until then the site
loads with a "couldn't load the site's content" message instead of
services/packages/DJs.

## Managing content
Everything lives in Supabase — no code, no redeploy needed for content
changes.

- **Services**: edit `service_categories` and `services` in the Table
  Editor. A new row shows up on the Services page and homepage bubble
  field on next visit.
- **Packages**: edit the `packages` table — `includes` is a text array,
  `price_from` blank means "on request".
- **DJs**: edit the `djs` table. `published = false` hides a profile
  without deleting it. `genres`/`languages` are text arrays.
- **Events (OTW nights)**: run `supabase/migrations/003_events.sql` once,
  then add rows to `events`. `starts_at` drives upcoming vs past,
  `sold_out` swaps the ticket link for a SOLD OUT tag, `published = false`
  hides a night. Until 003 is run the listing simply shows its empty state.
- **Academy & Records**: run `supabase/migrations/004_academy_records.sql`
  once (it seeds placeholder courses and weekly classes — edit them in
  `courses` / `course_sessions`). Set a course's `booking_url` to its Plug The
  Jack listing and its Enrol button goes there instead of the on-site form.
  Add releases to `releases` (catalogue no. as `id`, e.g. `OTW001`). A
  future `release_date` + `presave_url` shows the pre-save bar.
- **Home page proof**: run `supabase/migrations/005_home_proof.sql`. Tick
  `djs.certified` for artists who get the OTW CERTIFIED tag. Add rows to
  `stats` (e.g. `120+` / `Events delivered`), `clients` (name + logo URL)
  and `testimonials`. Each home section stays hidden until it has rows.
- **Course bookings & demos**: read from `course_bookings` and
  `demo_submissions`. Bookings arrive as `pending_payment`; email payment
  details, then set `paid` / `confirmed`. Online card payment is a
  placeholder — see `src/lib/payments.js` to wire Stripe or Mollie.
- **Quote requests & DJ applications**: read-only from the site's side —
  view and update `status` from the Table Editor (or Supabase's own admin
  view). There's no separate admin dashboard in this build; see DESIGN.md
  for why, and when to reconsider.

## What's deliberately not in this build (Phase 2, per the brief)
- Online booking, payments, customer/DJ accounts
- Automated quote emails (the site shows the brief's own confirmation
  copy on submit; sending the actual quote is still a manual email today)
- A custom admin dashboard (Supabase Table Editor stands in for now)
- DJ photo/gallery upload (profiles take an `image_url` — a Supabase
  Storage link or a file already in `/public`)
