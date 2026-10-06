-- 1. Spam guard, 2. artist service requests, 3. personal client links.
-- Run after 009 and 010.

-- ---------- 1. Spam guard: max 3 submissions per email per hour, per form ----------
create or replace function public.rate_limit_by_email() returns trigger
language plpgsql security definer set search_path = '' as $$
declare n int; e text := lower(coalesce(to_jsonb(new)->>'email', ''));
begin
  if e = '' then return new; end if;
  execute format('select count(*) from public.%I where lower(email) = $1 and created_at > now() - interval ''1 hour''', tg_table_name)
    into n using e;
  if n >= 3 then raise exception 'Too many requests, try again later'; end if;
  return new;
end $$;
revoke all on function public.rate_limit_by_email() from public, anon, authenticated;

drop trigger if exists quote_requests_rate on quote_requests;
create trigger quote_requests_rate before insert on quote_requests for each row execute function public.rate_limit_by_email();
drop trigger if exists dj_applications_rate on dj_applications;
create trigger dj_applications_rate before insert on dj_applications for each row execute function public.rate_limit_by_email();
drop trigger if exists demo_submissions_rate on demo_submissions;
create trigger demo_submissions_rate before insert on demo_submissions for each row execute function public.rate_limit_by_email();

-- ---------- 2. Artist service requests (public form -> enquiry job + lead) ----------
create table if not exists artist_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text not null check (length(trim(phone)) > 0),
  instagram text,
  service text not null check (service in
    ('events', 'photoshoot', 'ghost-production', 'spotify-promotion', 'mix-mastering', 'training', 'mentoring')),
  message text
);
alter table artist_requests enable row level security;
drop policy if exists "public can request an artist service" on artist_requests;
create policy "public can request an artist service" on artist_requests for insert to anon, authenticated with check (true);
drop policy if exists "team reads artist requests" on artist_requests;
create policy "team reads artist requests" on artist_requests for select to authenticated using (public.is_team_member());

drop trigger if exists artist_requests_rate on artist_requests;
create trigger artist_requests_rate before insert on artist_requests for each row execute function public.rate_limit_by_email();

create or replace function public.job_from_artist_request() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.artist_jobs (service, status, title, artist_name, artist_email, artist_phone, instagram, brief)
  values (new.service, 'enquiry', new.service || ' · ' || new.name, new.name, new.email, new.phone, new.instagram, new.message);
  perform public.add_inbound_lead('dj', 'artist_request', new.name, null, new.email, new.phone, new.instagram, null,
    'Artist service request: ' || new.service, null, null, null);
  return new;
end $$;
revoke all on function public.job_from_artist_request() from public, anon, authenticated;
drop trigger if exists artist_requests_to_job on artist_requests;
create trigger artist_requests_to_job after insert on artist_requests for each row execute function public.job_from_artist_request();

-- ---------- 3. Personal client links ----------
alter table bookings add column if not exists client_token uuid not null default gen_random_uuid();
alter table bookings add column if not exists client_notes text;
create unique index if not exists bookings_client_token_key on bookings (client_token);

create or replace function public.get_client_booking(p_token uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'event_name', event_name, 'event_date', event_date, 'opening_hours', opening_hours,
    'address', address, 'location', location, 'expected_guests', expected_guests,
    'client_name', client_name, 'client_phone', client_phone, 'client_email', client_email,
    'invoice_company', invoice_company, 'invoice_vat', invoice_vat,
    'invoice_address', invoice_address, 'invoice_email', invoice_email,
    'client_notes', client_notes, 'booking_type', booking_type)
  from public.bookings where client_token = p_token and status <> 'cancelled';
$$;

create or replace function public.update_client_booking(p_token uuid, p_data jsonb) returns boolean
language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  update public.bookings set
    event_name      = case when p_data ? 'event_name'      then left(nullif(trim(p_data->>'event_name'), ''), 200)      else event_name end,
    event_date      = case when p_data ? 'event_date'      then nullif(trim(p_data->>'event_date'), '')::date            else event_date end,
    opening_hours   = case when p_data ? 'opening_hours'   then left(nullif(trim(p_data->>'opening_hours'), ''), 100)   else opening_hours end,
    address         = case when p_data ? 'address'         then left(nullif(trim(p_data->>'address'), ''), 300)         else address end,
    expected_guests = case when p_data ? 'expected_guests' then left(nullif(trim(p_data->>'expected_guests'), ''), 50)  else expected_guests end,
    client_name     = case when p_data ? 'client_name'     then coalesce(left(nullif(trim(p_data->>'client_name'), ''), 200), client_name) else client_name end,
    client_phone    = case when p_data ? 'client_phone'    then coalesce(left(nullif(trim(p_data->>'client_phone'), ''), 50), client_phone) else client_phone end,
    client_email    = case when p_data ? 'client_email'    then left(nullif(trim(p_data->>'client_email'), ''), 200)    else client_email end,
    invoice_company = case when p_data ? 'invoice_company' then left(nullif(trim(p_data->>'invoice_company'), ''), 200) else invoice_company end,
    invoice_vat     = case when p_data ? 'invoice_vat'     then left(nullif(trim(p_data->>'invoice_vat'), ''), 50)      else invoice_vat end,
    invoice_address = case when p_data ? 'invoice_address' then left(nullif(trim(p_data->>'invoice_address'), ''), 300) else invoice_address end,
    invoice_email   = case when p_data ? 'invoice_email'   then left(nullif(trim(p_data->>'invoice_email'), ''), 200)   else invoice_email end,
    client_notes    = case when p_data ? 'client_notes'    then left(nullif(trim(p_data->>'client_notes'), ''), 2000)   else client_notes end
  where client_token = p_token and status <> 'cancelled';
  get diagnostics n = row_count;
  return n > 0;
end $$;

revoke all on function public.get_client_booking(uuid) from public;
revoke all on function public.update_client_booking(uuid, jsonb) from public;
grant execute on function public.get_client_booking(uuid) to anon, authenticated;
grant execute on function public.update_client_booking(uuid, jsonb) to anon, authenticated;
