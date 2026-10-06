-- Artist flow for #ops. OTW sells services to artists (not just events):
-- events, photoshoots, ghost productions, Spotify promotion, mix and mastering,
-- training, mentoring. One row per job, each with its own short checklist.
-- Team-only (same lock as bookings and leads).

create table if not exists artist_jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  service text not null check (service in
    ('events', 'photoshoot', 'ghost-production', 'spotify-promotion', 'mix-mastering', 'training', 'mentoring')),
  status text not null default 'enquiry'
    check (status in ('enquiry', 'quoted', 'in_progress', 'delivered', 'paid', 'cancelled')),
  title text,
  artist_name text not null,
  artist_email text,
  artist_phone text not null check (length(trim(artist_phone)) > 0),   -- phone is mandatory
  instagram text,
  brief text,
  due_date date,
  owner text,
  price numeric,            -- what the artist pays (EUR)
  cost numeric,             -- what OTW pays out for it (material, collaborators)
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'deposit_paid', 'paid')),
  notes text,
  lead_id uuid references leads(id) on delete set null
);
alter table artist_jobs enable row level security;
drop policy if exists "team manages artist jobs" on artist_jobs;
create policy "team manages artist jobs" on artist_jobs for all to authenticated
  using (public.is_team_member()) with check (public.is_team_member());

drop trigger if exists artist_jobs_touch on artist_jobs;
create trigger artist_jobs_touch before update on artist_jobs
  for each row execute function public.touch_updated_at();

-- Short checklist per service. Edit rows here; applies to new jobs only.
create table if not exists artist_service_template (
  id uuid primary key default gen_random_uuid(),
  service text not null,
  label text not null,
  sort_order int not null
);
alter table artist_service_template enable row level security;
drop policy if exists "team manages artist template" on artist_service_template;
create policy "team manages artist template" on artist_service_template for all to authenticated
  using (public.is_team_member()) with check (public.is_team_member());

create table if not exists artist_job_steps (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references artist_jobs(id) on delete cascade,
  label text not null,
  sort_order int not null,
  done boolean not null default false,
  done_at timestamptz,
  done_by text
);
create index if not exists artist_job_steps_job_idx on artist_job_steps (job_id);
alter table artist_job_steps enable row level security;
drop policy if exists "team manages artist steps" on artist_job_steps;
create policy "team manages artist steps" on artist_job_steps for all to authenticated
  using (public.is_team_member()) with check (public.is_team_member());

create or replace function public.seed_artist_job_steps() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.artist_job_steps (job_id, label, sort_order)
  select new.id, t.label, t.sort_order from public.artist_service_template t where t.service = new.service;
  return new;
end $$;
drop trigger if exists artist_jobs_seed_steps on artist_jobs;
create trigger artist_jobs_seed_steps after insert on artist_jobs
  for each row execute function public.seed_artist_job_steps();
revoke all on function public.seed_artist_job_steps() from public, anon, authenticated;

insert into artist_service_template (service, label, sort_order)
select * from (values
  ('events', 'Brief and date agreed', 1),
  ('events', 'Quote accepted', 2),
  ('events', 'Event delivered', 3),
  ('events', 'Paid', 4),
  ('photoshoot', 'Brief and look agreed', 1),
  ('photoshoot', 'Date and location booked', 2),
  ('photoshoot', 'Shoot done', 3),
  ('photoshoot', 'Photos delivered', 4),
  ('photoshoot', 'Paid', 5),
  ('ghost-production', 'Brief and references received', 1),
  ('ghost-production', 'Quote accepted, deposit received', 2),
  ('ghost-production', 'Draft sent', 3),
  ('ghost-production', 'Revisions done', 4),
  ('ghost-production', 'Final delivered', 5),
  ('ghost-production', 'Paid', 6),
  ('spotify-promotion', 'Track and goal received', 1),
  ('spotify-promotion', 'Campaign set up', 2),
  ('spotify-promotion', 'Campaign finished, report sent', 3),
  ('spotify-promotion', 'Paid', 4),
  ('mix-mastering', 'Stems or mix received', 1),
  ('mix-mastering', 'First version sent', 2),
  ('mix-mastering', 'Revisions done', 3),
  ('mix-mastering', 'Final files delivered', 4),
  ('mix-mastering', 'Paid', 5),
  ('training', 'Topic and goals agreed', 1),
  ('training', 'Sessions booked', 2),
  ('training', 'Sessions done', 3),
  ('training', 'Paid', 4),
  ('mentoring', 'Goals agreed', 1),
  ('mentoring', 'Sessions scheduled', 2),
  ('mentoring', 'Progress reviewed', 3),
  ('mentoring', 'Paid', 4)
) as v(service, label, sort_order)
where not exists (select 1 from artist_service_template);
