-- Simple lead list for both sides of OTW: clients and DJs. Team-only (same lock as bookings).
-- Quote requests, DJ applications and demo submissions add themselves as leads.
-- A confirmed booking marks its client lead as won. Outbound leads are added from #ops.

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('client', 'dj')),
  source text not null default 'manual',
  status text not null default 'new' check (status in ('new', 'contacted', 'replied', 'won', 'lost')),
  name text not null,
  company text,
  email text,
  phone text,
  instagram text,
  city text,
  notes text,
  follow_up date,
  quote_request_id uuid unique references quote_requests(id) on delete set null,
  dj_application_id uuid unique references dj_applications(id) on delete set null,
  demo_submission_id uuid unique references demo_submissions(id) on delete set null
);
create unique index if not exists leads_kind_email_key on leads (kind, lower(email)) where email is not null;
alter table leads enable row level security;
drop policy if exists "team manages leads" on leads;
create policy "team manages leads" on leads for all to authenticated
  using (public.is_team_member()) with check (public.is_team_member());

-- New leads are due today if they came in themselves, tomorrow if added by hand.
-- Moving to contacted sets a follow-up in 3 days, replied in 2, won/lost clears it.
create or replace function public.leads_before_write()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if new.follow_up is null and new.status = 'new' then
      new.follow_up := current_date + (case when new.source in ('quote_form', 'dj_application', 'demo') then 0 else 1 end);
    end if;
  elsif new.status is distinct from old.status and new.follow_up is not distinct from old.follow_up then
    new.follow_up := case new.status when 'contacted' then current_date + 3 when 'replied' then current_date + 2 else null end;
  end if;
  return new;
end $$;
drop trigger if exists leads_before on leads;
create trigger leads_before before insert or update on leads
  for each row execute function public.leads_before_write();

-- Never lets a problem here break the public forms.
create or replace function public.add_inbound_lead(
  p_kind text, p_source text, p_name text, p_company text, p_email text, p_phone text,
  p_instagram text, p_city text, p_note text, p_quote uuid, p_application uuid, p_demo uuid
) returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.leads (kind, source, name, company, email, phone, instagram, city, notes,
                            quote_request_id, dj_application_id, demo_submission_id)
  values (p_kind, p_source, p_name, p_company, nullif(p_email, ''), nullif(p_phone, ''), p_instagram, p_city, p_note,
          p_quote, p_application, p_demo)
  on conflict (kind, lower(email)) where email is not null do update
    set follow_up = current_date,
        status = case when public.leads.status in ('won', 'lost') then 'new' else public.leads.status end,
        notes = coalesce(public.leads.notes || E'\n', '') || excluded.notes;
exception when others then
  raise warning 'add_inbound_lead failed: %', sqlerrm;
end $$;

create or replace function public.lead_from_quote() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform public.add_inbound_lead('client', 'quote_form', new.name, null, new.email, new.phone, null, new.location,
    'Quote request: ' || coalesce(new.event_type, 'event') || coalesce(' · ' || array_to_string(new.services_wanted, ', '), ''),
    new.id, null, null);
  return new;
end $$;

create or replace function public.lead_from_dj_application() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform public.add_inbound_lead('dj', 'dj_application', new.name, new.dj_name, new.email, null, new.instagram, new.location,
    'DJ application: ' || coalesce(array_to_string(new.genres, ', '), ''), null, new.id, null);
  return new;
end $$;

create or replace function public.lead_from_demo() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform public.add_inbound_lead('dj', 'demo', new.artist_name, new.artist_name, new.email, null, null, null,
    'Demo: ' || new.link, null, null, new.id);
  return new;
end $$;

drop trigger if exists quote_requests_to_lead on quote_requests;
create trigger quote_requests_to_lead after insert on quote_requests for each row execute function public.lead_from_quote();
drop trigger if exists dj_applications_to_lead on dj_applications;
create trigger dj_applications_to_lead after insert on dj_applications for each row execute function public.lead_from_dj_application();
drop trigger if exists demo_submissions_to_lead on demo_submissions;
create trigger demo_submissions_to_lead after insert on demo_submissions for each row execute function public.lead_from_demo();

create or replace function public.lead_won_from_booking() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.quote_request_id is not null and new.status in ('confirmed', 'in_preparation', 'completed')
     and new.status is distinct from old.status then
    update public.leads set status = 'won' where quote_request_id = new.quote_request_id and status <> 'won';
  end if;
  return new;
end $$;
drop trigger if exists bookings_mark_lead_won on bookings;
create trigger bookings_mark_lead_won after update on bookings for each row execute function public.lead_won_from_booking();

revoke all on function public.leads_before_write() from public, anon, authenticated;
revoke all on function public.add_inbound_lead(text, text, text, text, text, text, text, text, text, uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.lead_from_quote() from public, anon, authenticated;
revoke all on function public.lead_from_dj_application() from public, anon, authenticated;
revoke all on function public.lead_from_demo() from public, anon, authenticated;
revoke all on function public.lead_won_from_booking() from public, anon, authenticated;

-- Existing enquiries become leads.
insert into leads (kind, source, name, email, phone, city, notes, quote_request_id, created_at)
select 'client', 'quote_form', q.name, nullif(q.email, ''), q.phone, q.location,
       'Quote request: ' || coalesce(q.event_type, 'event') || coalesce(' · ' || array_to_string(q.services_wanted, ', '), ''), q.id, q.created_at
from quote_requests q on conflict do nothing;
insert into leads (kind, source, name, company, email, instagram, city, notes, dj_application_id, created_at)
select 'dj', 'dj_application', a.name, a.dj_name, nullif(a.email, ''), a.instagram, a.location,
       'DJ application: ' || coalesce(array_to_string(a.genres, ', '), ''), a.id, a.created_at
from dj_applications a on conflict do nothing;
insert into leads (kind, source, name, company, email, notes, demo_submission_id, created_at)
select 'dj', 'demo', d.artist_name, d.artist_name, nullif(d.email, ''), 'Demo: ' || d.link, d.id, d.created_at
from demo_submissions d on conflict do nothing;
