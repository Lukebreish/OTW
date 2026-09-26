-- OTW Academy (courses, weekly sessions, bookings) and OTW Records
-- (releases, demo submissions). Run once in the Supabase SQL Editor after 003.
-- Courses below are PLACEHOLDERS: edit titles, prices and dates in the
-- Table Editor, or set published = false until they're real.

-- ---------- Academy ----------
create table if not exists courses (
  id text primary key,                  -- slug, e.g. 'dj-mixing-101'
  title text not null,                  -- shown in caps: DJ MIXING 101
  track text not null default 'dj',     -- 'dj' | 'production'
  level text not null default 'Beginner', -- Beginner | Intermediate | Advanced | All levels
  summary text,                         -- one line on the card
  description text,
  modules text[] not null default '{}', -- what you'll learn, in order
  length text,                          -- e.g. '8 weeks'
  format text,                          -- e.g. 'Group · max 6', '1:1'
  location text,                        -- e.g. 'Brussels'
  starts_on date,                       -- next intake; null = rolling / on request
  price numeric,                        -- EUR; null = on request
  partner text,                         -- e.g. 'Plug The Jack'
  booking_url text,                     -- external booking page (e.g. the Plug The Jack listing). If set, ENROL goes there.
  published boolean not null default true,
  sort_order int not null default 0
);

create table if not exists course_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references courses(id) on delete cascade,
  day text not null,                    -- 'MON' .. 'SUN'
  time_range text not null,             -- '19:00–21:00'
  label text,                           -- e.g. 'Group A'
  spaces_left int,                      -- null = don't show
  sort_order int not null default 0
);

create table if not exists course_bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  course_id text references courses(id) on delete set null,
  session_id uuid references course_sessions(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  experience text,
  message text,
  payment_method text,                  -- 'card' | 'transfer'
  amount numeric,
  status text not null default 'pending_payment' -- pending_payment | paid | confirmed | cancelled
);

-- ---------- Records ----------
create table if not exists releases (
  id text primary key,                  -- catalogue no, e.g. 'OTW001'
  title text not null,
  artist text not null,
  release_date date,
  formats text[] not null default '{}', -- e.g. {'Digital','Vinyl'}
  artwork_url text,                     -- square, full colour
  listen_url text,
  presave_url text,                     -- shown while release_date is in the future
  published boolean not null default true
);

create table if not exists demo_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  artist_name text not null,
  email text not null,
  link text not null,
  genre text,
  message text,
  status text not null default 'new'    -- new | listened | shortlisted | declined
);

-- ---------- Security ----------
alter table courses enable row level security;
alter table course_sessions enable row level security;
alter table course_bookings enable row level security;
alter table releases enable row level security;
alter table demo_submissions enable row level security;

create policy "public read published courses" on courses for select using (published = true);
create policy "public read course sessions" on course_sessions for select using (true);
create policy "public read published releases" on releases for select using (published = true);
create policy "public can book a course" on course_bookings for insert with check (true);
create policy "public can submit a demo" on demo_submissions for insert with check (true);
-- Bookings and demos are readable only from the dashboard (service role).

-- ---------- Placeholder courses (edit in the Table Editor) ----------
insert into courses (id, title, track, level, summary, modules, length, format, location, starts_on, price, partner, booking_url, sort_order) values
  ('dj-mixing-101', 'DJ Mixing 101', 'dj', 'Beginner',
   'From your first blend to a 60-minute set.',
   '{"Gear, software and the booth","Beatmatching by ear","EQ and phrasing","Building a set","Recording your first mix"}',
   '8 weeks', 'Group · max 6', 'Brussels', null, 390, 'Plug The Jack', null, 1),
  ('club-ready', 'Club Ready', 'dj', 'Intermediate',
   'Read a room, hold a floor, play out.',
   '{"Track selection and energy","Advanced transitions","Playing on club gear","Warm-up vs peak time","Your first OTW night"}',
   '6 weeks', 'Group · max 4', 'Brussels', null, 450, 'Plug The Jack', null, 2),
  ('production-foundations', 'Production Foundations', 'production', 'Beginner',
   'Ableton from zero to a finished track.',
   '{"Ableton workflow","Drums and groove","Bass and harmony","Arrangement","Mixdown basics"}',
   '8 weeks', 'Group · max 6', 'Brussels', null, 490, null, null, 3),
  ('finish-your-track', 'Finish Your Track', 'production', 'Intermediate',
   'Bring an idea. Leave with a release-ready track.',
   '{"Arrangement that holds","Sound design","Mixdown","Mastering for club and streaming","Pitching to labels"}',
   '6 weeks', 'Group · max 4', 'Brussels', null, 520, null, null, 4),
  ('one-to-one', '1:1 Mentorship', 'production', 'All levels',
   'DJ or production. Your goals, your pace.',
   '{"Built around what you want to learn"}',
   'Per session', '1:1', 'Brussels or online', null, 65, null, null, 5)
on conflict (id) do nothing;

insert into course_sessions (course_id, day, time_range, label, spaces_left, sort_order) values
  ('dj-mixing-101', 'TUE', '19:00–21:00', 'Group A', 3, 1),
  ('production-foundations', 'WED', '19:00–21:30', 'Group A', 4, 2),
  ('club-ready', 'THU', '19:00–21:00', 'Group A', 2, 3),
  ('finish-your-track', 'SAT', '11:00–14:00', 'Group A', 4, 4),
  ('dj-mixing-101', 'SAT', '15:00–17:00', 'Group B', 5, 5);
