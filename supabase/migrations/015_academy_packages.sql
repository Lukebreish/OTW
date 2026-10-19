-- Academy packages: three one-to-one tiers per track (DJ, Production), plus add-ons.
-- Replaces the placeholder courses from 004 (unpublished, not deleted, so old
-- bookings keep their course). Course buttons now request a free first call:
-- a course_bookings row with status 'call_requested', which becomes a lead.
-- Run after 014.

alter table courses add column if not exists kind text not null default 'course'; -- 'course' | 'addon'
alter table courses add column if not exists tier_label text;     -- e.g. 'Most value'
alter table courses add column if not exists hours numeric;       -- one-to-one hours
alter table courses add column if not exists price_note text;     -- line under the price
alter table courses add column if not exists value_note text;     -- accent line under the price
alter table courses add column if not exists outcome text;        -- what you leave with
alter table courses add column if not exists excludes text[] not null default '{}';
alter table courses add column if not exists audience text;       -- who it's for
alter table courses add column if not exists featured boolean not null default false;
alter table courses add column if not exists compare jsonb not null default '[]'; -- [["Row label", true | false | "text"], ...]

-- Placeholder courses off the site (incl. 1:1 Mentorship, which undercut the new prices).
update courses set published = false
where id in ('dj-mixing-101', 'club-ready', 'production-foundations', 'finish-your-track', 'one-to-one');

insert into courses (id, kind, title, track, level, tier_label, summary, outcome, modules, excludes, audience,
                     length, hours, format, location, price, price_note, value_note, featured, compare, sort_order, published)
values
-- ---------- DJ ----------
('dj-starter', 'course', 'Starter', 'dj', 'Beginner', 'Start here',
 'Mix two tracks together, cleanly, on your own.',
 'Mix two tracks together, cleanly, on your own.',
 '{"Pioneer XDJ-RX3, studio provided","Hardware and Rekordbox explained","Beatmatching, cueing and levels","Basic EQ and transitions","Set structure basics","Your first practice mix, recorded"}',
 '{}',
 'For first-timers. Credited in full if you move up to Club Ready.',
 '1 week', 4, '1:1 · Studio', 'Brussels', 350, '4 hours · €87 per hour', null, false,
 '[["Duration","1 week"],["One-to-one studio time","4 h"],["Gear","XDJ-RX3"],["Beatmatching, cueing, levels, EQ",true],["Rekordbox and library set-up","Basics"],["Harmonic mixing (Mixed In Key)",false],["Storytelling and crowd reading",false],["Effects (RMX-1000, V10 FX)",false],["Exclusive OTW music",false],["Recorded mix",true],["Live gig with OTW",false],["Press kit review and promoter intros",false]]',
 10, true),
('dj-club-ready', 'course', 'Club Ready', 'dj', 'Intermediate', 'Most value',
 'Play a confident set in any club, and play one for real.',
 'Play a confident set in any club, and play one for real.',
 '{"CDJ-3000 + DJM-A9, club-standard gear","Harmonic mixing with Mixed In Key","Storytelling and reading the crowd","Advanced EQ and layered transitions","Playlist curation and library set-up","A real gig at an OTW live event"}',
 '{}',
 'For DJs who want to get on stage, not just practise.',
 '1 month', 12, '1:1 · Studio', 'Brussels', 990, '12 hours · €82 per hour', 'Includes a live gig with OTW', true,
 '[["Duration","1 month"],["One-to-one studio time","12 h"],["Gear","CDJ-3000 + A9"],["Beatmatching, cueing, levels, EQ",true],["Rekordbox and library set-up",true],["Harmonic mixing (Mixed In Key)",true],["Storytelling and crowd reading",true],["Effects (RMX-1000, V10 FX)",false],["Exclusive OTW music",false],["Recorded mix",true],["Live gig with OTW",true],["Press kit review and promoter intros",false]]',
 11, true),
('dj-pro', 'course', 'Pro', 'dj', 'Advanced', 'Go pro',
 'A DJ ready to be booked.',
 'A DJ ready to be booked.',
 '{"CDJ-3000s + DJM-V10 + RMX-1000","Effects, loops and live edits","Curated playlists and exclusive OTW music","OTW gig, professionally filmed","Press kit review: mix, bio, photos","Introductions to promoters"}',
 '{}',
 'For DJs ready to commit and get booked.',
 '2 months', 24, '1:1 · Studio', 'Brussels', 2190, '24 hours · 3 hours a week', null, false,
 '[["Duration","2 months"],["One-to-one studio time","24 h"],["Gear","CDJ-3000 + V10"],["Beatmatching, cueing, levels, EQ",true],["Rekordbox and library set-up",true],["Harmonic mixing (Mixed In Key)",true],["Storytelling and crowd reading",true],["Effects (RMX-1000, V10 FX)",true],["Exclusive OTW music",true],["Recorded mix",true],["Live gig with OTW","Filmed"],["Press kit review and promoter intros",true]]',
 12, true),

-- ---------- Production ----------
('prod-discover', 'course', 'Discover', 'production', 'Beginner', 'Start here',
 'Understand how a track is made.',
 'Understand how a track is made.',
 '{"One-to-one call","How production works","Theory basics","What tools you need"}',
 '{"No software setup","No track at the end"}',
 'For the curious. Credited in full if you move up to First Track.',
 '1 day', 1, '1:1', 'Online or Brussels', 85, '1 hour · €85 per hour', null, false,
 '[["Duration","1 day"],["One-to-one time","1 h"],["Production theory",true],["Software set-up with you",false],["Hands-on in your software",false],["Finished track",false],["Sample packs",false],["Sound design and music theory",false],["Pro plugins",false],["Mix and master",false],["Support by message",false],["Demo review by OTW Records",false]]',
 20, true),
('prod-first-track', 'course', 'First Track', 'production', 'Beginner', 'Most value',
 'Leave with your first finished track.',
 'Leave with your first finished track.',
 '{"6 hours of hands-on, one-to-one sessions in one week","Your software set up with you","OTW sample pack, free","Drums, bass, chords, arrangement","Your project, your sound","30 days of support by message"}',
 '{}',
 'For beginners who want a real result, fast.',
 '1 week', 6, '1:1', 'Online or Brussels', 450, '6 hours · €75 per hour', '€510 value · you save €60', true,
 '[["Duration","1 week"],["One-to-one time","6 h"],["Production theory",true],["Software set-up with you",true],["Hands-on in your software",true],["Finished track",true],["Sample packs","1 pack"],["Sound design and music theory","Basics"],["Pro plugins",false],["Mix and master","Add-on"],["Support by message","30 days"],["Demo review by OTW Records",false]]',
 21, true),
('prod-programme', 'course', 'Producer Programme', 'production', 'Intermediate', 'Go further',
 'Release-ready music, and the skills behind it.',
 'Release-ready music, and the skills behind it.',
 '{"12 hours, one-to-one","Pro software workflow","Sound design and music theory","Pro tricks, packs and plugins","Mix and master of your track","Demo review by OTW Records"}',
 '{}',
 'For producers ready to commit and release.',
 '1 month', 12, '1:1', 'Online or Brussels', 1190, '1 month · 3 hours a week', null, false,
 '[["Duration","1 month"],["One-to-one time","12 h"],["Production theory",true],["Software set-up with you",true],["Hands-on in your software",true],["Finished track",true],["Sample packs","Several"],["Sound design and music theory","In depth"],["Pro plugins",true],["Mix and master",true],["Support by message","2 months"],["Demo review by OTW Records",true]]',
 22, true),

-- ---------- Add-ons ----------
('addon-studio-practice', 'addon', 'Extra practice in the studio', 'dj', 'All levels', null,
 'Book the room on your own between sessions, on the same gear.', null, '{}', '{}', null,
 null, null, 'Studio', 'Brussels', 40, 'per hour', null, false, '[]', 30, true),
('addon-mix-master', 'addon', 'Mix and master by OTW', 'production', 'All levels', null,
 'Your First Track, polished and ready to share.', null, '{}', '{}', null,
 null, null, null, null, 150, 'add to First Track', null, false, '[]', 31, true)
on conflict (id) do update set
  kind = excluded.kind, title = excluded.title, track = excluded.track, level = excluded.level,
  tier_label = excluded.tier_label, summary = excluded.summary, outcome = excluded.outcome,
  modules = excluded.modules, excludes = excluded.excludes, audience = excluded.audience,
  length = excluded.length, hours = excluded.hours, format = excluded.format, location = excluded.location,
  price = excluded.price, price_note = excluded.price_note, value_note = excluded.value_note,
  featured = excluded.featured, compare = excluded.compare, sort_order = excluded.sort_order,
  published = excluded.published;

-- First-call requests read clearly in #ops Leads.
create or replace function public.lead_from_course_booking() returns trigger
language plpgsql security definer set search_path = '' as $$
declare c record;
begin
  select title, track into c from public.courses where id = new.course_id;
  perform public.add_inbound_lead('dj', 'academy_booking', new.name, null, new.email, new.phone, null, null,
    case when new.status = 'call_requested'
      then 'First call: ' || case c.track when 'dj' then 'DJ' when 'production' then 'Production' else 'Academy' end
           || ' · ' || coalesce(c.title, new.course_id, 'course')
           || coalesce(' · ' || new.amount::text || ' EUR', '')
           || coalesce(' · ' || nullif(new.experience, ''), '')
           || coalesce(' · ' || nullif(new.message, ''), '')
      else 'Course booking: ' || coalesce(new.course_id, 'course') || coalesce(' · ' || new.amount::text || ' EUR', '')
           || coalesce(' · ' || new.payment_method, '')
    end,
    null, null, null);
  return new;
end $$;
revoke all on function public.lead_from_course_booking() from public, anon, authenticated;
