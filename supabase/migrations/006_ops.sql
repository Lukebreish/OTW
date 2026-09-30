-- Internal operations: bookings + the OTW event checklist (SOP).
-- Internal only. Nothing here is readable by the public site: every table is
-- locked to confirmed accounts whose email is on team_members.
--
-- Flow: a client sends the quote form -> quote_requests row -> a 'prospect'
-- booking is created automatically -> the booking gets its own copy of the
-- checklist from checklist_template. Bookings can also be added by hand from
-- the ops page (same checklist is attached).
--
-- To give someone access: add their email to team_members, then they create
-- an account on /#ops with that email and confirm it.

-- ---------- Team allowlist ----------
create table if not exists team_members (
  email text primary key,
  name text,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);
alter table team_members enable row level security;

-- True only for a signed-in user with a confirmed email that is on the list.
create or replace function public.is_team_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.team_members tm
    join auth.users u on lower(u.email) = lower(tm.email)
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.is_team_member() from public, anon;
grant execute on function public.is_team_member() to authenticated;

drop policy if exists "team reads team" on team_members;
create policy "team reads team" on team_members
  for select to authenticated using (public.is_team_member());

-- ---------- Bookings ----------
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  quote_request_id uuid unique references quote_requests(id) on delete set null,
  status text not null default 'prospect'
    check (status in ('prospect', 'confirmed', 'in_preparation', 'completed', 'cancelled')),
  event_name text,
  client_name text,
  client_email text,
  client_phone text,
  event_type text,
  event_date date,
  opening_hours text,
  location text,
  expected_guests text,
  owner text,                              -- OTW person responsible
  services text[] not null default '{}',
  agreed_price numeric,
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'deposit_paid', 'paid')),
  notes text
);
alter table bookings enable row level security;

drop policy if exists "team manages bookings" on bookings;
create policy "team manages bookings" on bookings
  for all to authenticated
  using (public.is_team_member())
  with check (public.is_team_member());

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists bookings_touch on bookings;
create trigger bookings_touch before update on bookings
  for each row execute function public.touch_updated_at();

-- ---------- Checklist template (the SOP) ----------
-- phase: sell = win and price it, run = deliver it, learn = close it out.
-- Edit rows here to change the checklist for every new booking.
create table if not exists checklist_template (
  id uuid primary key default gen_random_uuid(),
  phase text not null check (phase in ('sell', 'run', 'learn')),
  section text not null,
  section_order int not null,
  label text not null,
  sort_order int not null
);
alter table checklist_template enable row level security;

drop policy if exists "team manages template" on checklist_template;
create policy "team manages template" on checklist_template
  for all to authenticated
  using (public.is_team_member())
  with check (public.is_team_member());

-- ---------- Per-booking checklist ----------
create table if not exists booking_checklist (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  phase text not null,
  section text not null,
  section_order int not null,
  label text not null,
  sort_order int not null,
  done boolean not null default false,
  done_at timestamptz,
  done_by text,
  note text
);
create index if not exists booking_checklist_booking_idx on booking_checklist (booking_id);
alter table booking_checklist enable row level security;

drop policy if exists "team manages checklists" on booking_checklist;
create policy "team manages checklists" on booking_checklist
  for all to authenticated
  using (public.is_team_member())
  with check (public.is_team_member());

-- Every new booking gets its own copy of the template.
create or replace function public.seed_booking_checklist()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.booking_checklist (booking_id, phase, section, section_order, label, sort_order)
  select new.id, t.phase, t.section, t.section_order, t.label, t.sort_order
  from public.checklist_template t;
  return new;
end;
$$;

drop trigger if exists bookings_seed_checklist on bookings;
create trigger bookings_seed_checklist after insert on bookings
  for each row execute function public.seed_booking_checklist();

-- Every quote request becomes a prospect booking.
create or replace function public.booking_from_quote()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.bookings (
    quote_request_id, status, event_name, client_name, client_email, client_phone,
    event_type, event_date, location, expected_guests, services, notes
  ) values (
    new.id, 'prospect',
    coalesce(new.event_type, 'Event') || ' · ' || new.name,
    new.name, new.email, new.phone,
    new.event_type, new.event_date, new.location, new.event_size,
    coalesce(new.services_wanted, '{}'), new.additional_info
  )
  on conflict (quote_request_id) do nothing;
  return new;
end;
$$;

drop trigger if exists quote_requests_to_booking on quote_requests;
create trigger quote_requests_to_booking after insert on quote_requests
  for each row execute function public.booking_from_quote();

revoke all on function public.seed_booking_checklist() from public, anon, authenticated;
revoke all on function public.booking_from_quote() from public, anon, authenticated;
revoke all on function public.touch_updated_at() from public, anon, authenticated;

-- ---------- Template content ----------
-- Seeded once. Re-running this file will not duplicate it.
insert into checklist_template (phase, section, section_order, label, sort_order)
select * from (values
  -- SELL IT
  ('sell', 'General event info', 1, 'Event name and type confirmed', 1),
  ('sell', 'General event info', 1, 'Date and opening hours confirmed', 2),
  ('sell', 'General event info', 1, 'Location confirmed', 3),
  ('sell', 'General event info', 1, 'Expected guest count confirmed', 4),
  ('sell', 'General event info', 1, 'Client contact person and details on file', 5),
  ('sell', 'Management overview', 2, 'OTW scope agreed with the client', 1),
  ('sell', 'Management overview', 2, 'OTW owner assigned', 2),
  ('sell', 'Management overview', 2, 'Key objectives noted', 3),
  ('sell', 'Management overview', 2, 'Key deadlines set', 4),
  ('sell', 'Management overview', 2, 'Open points and pending decisions listed', 5),
  ('sell', 'Financial', 3, 'Quote sent', 1),
  ('sell', 'Financial', 3, 'Quote accepted', 2),
  ('sell', 'Financial', 3, 'Deposit invoiced', 3),
  ('sell', 'Financial', 3, 'Deposit received', 4),
  ('sell', 'Financial', 3, 'Artist fees budgeted', 5),
  ('sell', 'Financial', 3, 'Crew, transport and equipment costs budgeted', 6),
  ('sell', 'Financial', 3, 'Extra costs logged', 7),
  ('sell', 'Financial', 3, 'Expected margin checked', 8),
  -- RUN IT
  ('run', 'Artists & DJs', 4, 'Line-up confirmed', 1),
  ('run', 'Artists & DJs', 4, 'Set times and durations agreed', 2),
  ('run', 'Artists & DJs', 4, 'Artist contact details on file', 3),
  ('run', 'Artists & DJs', 4, 'Riders received', 4),
  ('run', 'Artists & DJs', 4, 'Technical riders received', 5),
  ('run', 'Artists & DJs', 4, 'Gear requirements confirmed', 6),
  ('run', 'Artists & DJs', 4, 'Fees agreed', 7),
  ('run', 'Artists & DJs', 4, 'Hospitality arranged', 8),
  ('run', 'Artists & DJs', 4, 'Transport arranged', 9),
  ('run', 'Artists & DJs', 4, 'Hotels booked (if needed)', 10),
  ('run', 'Technical', 5, 'PA / sound', 1),
  ('run', 'Technical', 5, 'DJ gear', 2),
  ('run', 'Technical', 5, 'Booth', 3),
  ('run', 'Technical', 5, 'Monitors', 4),
  ('run', 'Technical', 5, 'Lighting', 5),
  ('run', 'Technical', 5, 'Truss', 6),
  ('run', 'Technical', 5, 'LED / screens', 7),
  ('run', 'Technical', 5, 'Smoke / haze', 8),
  ('run', 'Technical', 5, 'Microphones', 9),
  ('run', 'Technical', 5, 'Power', 10),
  ('run', 'Technical', 5, 'Cables', 11),
  ('run', 'Technical', 5, 'Backup equipment', 12),
  ('run', 'Logistics', 6, 'Load-in time set', 1),
  ('run', 'Logistics', 6, 'Load-out time set', 2),
  ('run', 'Logistics', 6, 'Parking arranged', 3),
  ('run', 'Logistics', 6, 'Crew arrival time set', 4),
  ('run', 'Logistics', 6, 'Transport and vans booked', 5),
  ('run', 'Logistics', 6, 'Materials packed', 6),
  ('run', 'Logistics', 6, 'Storage arranged', 7),
  ('run', 'Logistics', 6, 'Access badges ready', 8),
  ('run', 'Logistics', 6, 'Artist entrance arranged', 9),
  ('run', 'Communication', 7, 'Client briefed', 1),
  ('run', 'Communication', 7, 'Venue briefed', 2),
  ('run', 'Communication', 7, 'Artists briefed', 3),
  ('run', 'Communication', 7, 'Technical team briefed', 4),
  ('run', 'Communication', 7, 'Security briefed', 5),
  ('run', 'Communication', 7, 'Catering briefed', 6),
  ('run', 'Communication', 7, 'Photographer / videographer briefed', 7),
  ('run', 'Communication', 7, 'Other partners briefed', 8),
  ('run', 'Safety & practicalities', 8, 'Security booked', 1),
  ('run', 'Safety & practicalities', 8, 'First aid covered', 2),
  ('run', 'Safety & practicalities', 8, 'Fire safety checked', 3),
  ('run', 'Safety & practicalities', 8, 'Capacity confirmed', 4),
  ('run', 'Safety & practicalities', 8, 'Emergency contacts shared', 5),
  ('run', 'Safety & practicalities', 8, 'Noise restrictions checked', 6),
  ('run', 'Safety & practicalities', 8, 'Permits in place', 7),
  ('run', 'Safety & practicalities', 8, 'Insurance in place', 8),
  ('run', 'Safety & practicalities', 8, 'Backup plan agreed', 9),
  ('run', 'Event day', 9, 'Crew present', 1),
  ('run', 'Event day', 9, 'Materials delivered', 2),
  ('run', 'Event day', 9, 'Soundcheck done', 3),
  ('run', 'Event day', 9, 'Lighting tested', 4),
  ('run', 'Event day', 9, 'DJ gear tested', 5),
  ('run', 'Event day', 9, 'Artists received', 6),
  ('run', 'Event day', 9, 'Hospitality sorted', 7),
  ('run', 'Event day', 9, 'Security present', 8),
  ('run', 'Event day', 9, 'Branding in place', 9),
  ('run', 'Event day', 9, 'Doors ready', 10),
  ('run', 'Event day', 9, 'Event started', 11),
  ('run', 'Event day', 9, 'Closing', 12),
  ('run', 'Event day', 9, 'Load-out', 13),
  ('run', 'Event day', 9, 'Materials checked', 14),
  -- LEARN FROM IT
  ('learn', 'Content & media', 10, 'Photographer booked', 1),
  ('learn', 'Content & media', 10, 'Videographer booked', 2),
  ('learn', 'Content & media', 10, 'Content briefing sent', 3),
  ('learn', 'Content & media', 10, 'Shot list agreed', 4),
  ('learn', 'Content & media', 10, 'Branding and logos ready', 5),
  ('learn', 'Content & media', 10, 'Social media plan set', 6),
  ('learn', 'Content & media', 10, 'Aftermovie planned', 7),
  ('learn', 'Post-event', 11, 'Materials returned', 1),
  ('learn', 'Post-event', 11, 'Invoice sent', 2),
  ('learn', 'Post-event', 11, 'Artists paid', 3),
  ('learn', 'Post-event', 11, 'Crew paid', 4),
  ('learn', 'Post-event', 11, 'Photos received', 5),
  ('learn', 'Post-event', 11, 'Video received', 6),
  ('learn', 'Post-event', 11, 'Social media published', 7),
  ('learn', 'Post-event', 11, 'Client feedback collected', 8),
  ('learn', 'Post-event', 11, 'OTW evaluation done (what went well, what could be better)', 9),
  ('learn', 'Post-event', 11, 'Final financial result logged', 10)
) as v(phase, section, section_order, label, sort_order)
where not exists (select 1 from checklist_template);

-- Existing quote requests become prospect bookings too.
insert into bookings (
  quote_request_id, status, event_name, client_name, client_email, client_phone,
  event_type, event_date, location, expected_guests, services, notes, created_at
)
select q.id, 'prospect',
  coalesce(q.event_type, 'Event') || ' · ' || q.name,
  q.name, q.email, q.phone, q.event_type, q.event_date, q.location, q.event_size,
  coalesce(q.services_wanted, '{}'), q.additional_info, q.created_at
from quote_requests q
on conflict (quote_request_id) do nothing;
