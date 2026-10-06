-- Event booking updates: event address, material cost (what OTW pays), invoicing details,
-- "Booking a DJ only" request type, and a much shorter checklist.

alter table quote_requests add column if not exists request_type text not null default 'event'
  check (request_type in ('event', 'dj_only'));

alter table bookings
  add column if not exists booking_type text not null default 'event' check (booking_type in ('event', 'dj_only')),
  add column if not exists address text,
  add column if not exists material_cost numeric,
  add column if not exists invoice_company text,
  add column if not exists invoice_vat text,
  add column if not exists invoice_address text,
  add column if not exists invoice_email text,
  add column if not exists invoice_number text,
  add column if not exists invoice_amount numeric,
  add column if not exists invoice_due date,
  add column if not exists invoice_status text not null default 'none'
    check (invoice_status in ('none', 'draft', 'sent', 'paid'));

-- Quote requests now carry their type into the booking.
create or replace function public.booking_from_quote()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.bookings (
    quote_request_id, status, booking_type, event_name, client_name, client_email, client_phone,
    event_type, event_date, location, expected_guests, services, notes
  ) values (
    new.id, 'prospect', new.request_type,
    case when new.request_type = 'dj_only' then 'DJ booking' else coalesce(new.event_type, 'Event') end || ' · ' || new.name,
    new.name, new.email, new.phone,
    new.event_type, new.event_date, new.location, new.event_size,
    coalesce(new.services_wanted, '{}'), new.additional_info
  )
  on conflict (quote_request_id) do nothing;
  return new;
end $$;
revoke all on function public.booking_from_quote() from public, anon, authenticated;

-- Short checklist (97 items down to 9). New bookings get this one.
delete from checklist_template;
insert into checklist_template (phase, section, section_order, label, sort_order) values
  ('sell',  'Sell',      1, 'Details confirmed (date, place, guests, contact)', 1),
  ('sell',  'Sell',      1, 'Quote sent and accepted', 2),
  ('sell',  'Sell',      1, 'Deposit received', 3),
  ('run',   'Run',       2, 'Line-up and gear confirmed', 1),
  ('run',   'Run',       2, 'Crew, transport and material booked', 2),
  ('run',   'Run',       2, 'Client briefed, load-in time set', 3),
  ('run',   'Run',       2, 'Event delivered', 4),
  ('learn', 'Close out', 3, 'Invoice sent and paid', 1),
  ('learn', 'Close out', 3, 'Artists and crew paid, material returned', 2);

-- Existing bookings where nothing has been ticked yet switch to the short list too.
-- Bookings with progress keep what they have.
delete from booking_checklist bc
where not exists (select 1 from booking_checklist x where x.booking_id = bc.booking_id and x.done);

insert into booking_checklist (booking_id, phase, section, section_order, label, sort_order)
select b.id, t.phase, t.section, t.section_order, t.label, t.sort_order
from bookings b cross join checklist_template t
where not exists (select 1 from booking_checklist x where x.booking_id = b.id);
