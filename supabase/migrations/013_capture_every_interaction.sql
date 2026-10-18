-- Every public interaction becomes a lead in #ops.
-- 1. site_messages: newsletter, contact form, "register interest" (public insert, team read).
-- 2. Academy course bookings and private-link DJs now create leads too.
-- 3. Every inbound lead is due today; only hand-added leads wait a day.
-- Run after 012.

create table if not exists site_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  topic text not null check (topic in ('newsletter', 'contact', 'academy_interest', 'records_interest', 'events_interest')),
  name text,
  email text not null check (position('@' in email) > 1),
  phone text,
  message text check (message is null or length(message) <= 4000)
);
alter table site_messages enable row level security;
drop policy if exists "public can send a message" on site_messages;
create policy "public can send a message" on site_messages for insert to anon, authenticated with check (true);
drop policy if exists "team reads messages" on site_messages;
create policy "team reads messages" on site_messages for select to authenticated using (public.is_team_member());

drop trigger if exists site_messages_rate on site_messages;
create trigger site_messages_rate before insert on site_messages for each row execute function public.rate_limit_by_email();

create or replace function public.lead_from_site_message() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform public.add_inbound_lead(
    case when new.topic in ('academy_interest', 'records_interest') then 'dj' else 'client' end,
    new.topic, coalesce(nullif(trim(new.name), ''), new.email), null, new.email, new.phone, null, null,
    case new.topic
      when 'newsletter' then 'Newsletter sign-up'
      when 'contact' then 'Contact form: ' || coalesce(new.message, '')
      when 'academy_interest' then 'Academy interest' || coalesce(': ' || new.message, '')
      when 'records_interest' then 'Records interest' || coalesce(': ' || new.message, '')
      else 'Events interest' || coalesce(': ' || new.message, '')
    end,
    null, null, null);
  return new;
end $$;
revoke all on function public.lead_from_site_message() from public, anon, authenticated;
drop trigger if exists site_messages_to_lead on site_messages;
create trigger site_messages_to_lead after insert on site_messages for each row execute function public.lead_from_site_message();

-- Academy course bookings
drop trigger if exists course_bookings_rate on course_bookings;
create trigger course_bookings_rate before insert on course_bookings for each row execute function public.rate_limit_by_email();

create or replace function public.lead_from_course_booking() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform public.add_inbound_lead('dj', 'academy_booking', new.name, null, new.email, new.phone, null, null,
    'Course booking: ' || coalesce(new.course_id, 'course') || coalesce(' · ' || new.amount::text || ' EUR', '')
      || coalesce(' · ' || new.payment_method, ''),
    null, null, null);
  return new;
end $$;
revoke all on function public.lead_from_course_booking() from public, anon, authenticated;
drop trigger if exists course_bookings_to_lead on course_bookings;
create trigger course_bookings_to_lead after insert on course_bookings for each row execute function public.lead_from_course_booking();

-- DJs added through a private invite link
create or replace function public.lead_from_dj_contact() returns trigger
language plpgsql security definer set search_path = '' as $$
declare dj_name text;
begin
  select name into dj_name from public.djs where id = new.dj_id;
  perform public.add_inbound_lead('dj', 'dj_invite', coalesce(dj_name, new.dj_id), dj_name, new.email, new.phone, null,
    new.location, 'Added via private DJ link (already on the site)', null, null, null);
  return new;
end $$;
revoke all on function public.lead_from_dj_contact() from public, anon, authenticated;
drop trigger if exists dj_contacts_to_lead on dj_contacts;
create trigger dj_contacts_to_lead after insert on dj_contacts for each row execute function public.lead_from_dj_contact();

-- Inbound leads are always due today.
create or replace function public.leads_before_write()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if new.follow_up is null and new.status = 'new' then
      new.follow_up := current_date + (case when new.source = 'manual' then 1 else 0 end);
    end if;
  elsif new.status is distinct from old.status and new.follow_up is not distinct from old.follow_up then
    new.follow_up := case new.status when 'contacted' then current_date + 3 when 'replied' then current_date + 2 else null end;
  end if;
  return new;
end $$;
revoke all on function public.leads_before_write() from public, anon, authenticated;
