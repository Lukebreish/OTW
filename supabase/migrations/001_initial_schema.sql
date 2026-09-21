-- Off The World — initial schema.
-- Run this once in the Supabase SQL Editor, then 002_seed_content.sql.

create extension if not exists "pgcrypto";

create table if not exists service_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  sort_order int not null default 0
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references service_categories(id) on delete cascade,
  name text not null,
  description text,
  sort_order int not null default 0
);

create table if not exists packages (
  id text primary key,               -- slug, e.g. 'the-party'
  name text not null,
  tagline text,
  price_from numeric,                -- null = "on request"
  includes text[] not null default '{}',
  is_featured boolean not null default false,
  sort_order int not null default 0
);

create table if not exists djs (
  id text primary key,               -- slug, e.g. 'luke-breish'
  name text not null,
  location text,
  bio text,
  genres text[] not null default '{}',
  years_experience int,
  languages text[] not null default '{}',
  instagram text,
  soundcloud text,
  mixcloud text,
  spotify text,
  image_url text,
  published boolean not null default true,
  sort_order int not null default 0
);

create table if not exists dj_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  location text,
  dj_name text not null,
  genres text[] not null default '{}',
  years_experience int,
  bio text,
  instagram text,
  soundcloud text,
  mixcloud text,
  spotify text,
  languages text[] not null default '{}',
  availability text,
  rate text,
  notes text,
  status text not null default 'pending'   -- pending | approved | rejected
);

create table if not exists quote_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  event_type text,
  event_size text,
  event_duration text,
  setting text,
  services_wanted text[] not null default '{}',
  location text,
  event_date date,
  additional_info text,
  recommended_package text,          -- what the client-side algorithm suggested
  final_package text,                -- what OTW actually confirms, once reviewed
  quoted_price numeric,
  status text not null default 'new'       -- new | reviewed | quoted | booked | declined
);

alter table service_categories enable row level security;
alter table services enable row level security;
alter table packages enable row level security;
alter table djs enable row level security;
alter table dj_applications enable row level security;
alter table quote_requests enable row level security;

create policy "public read service_categories" on service_categories for select using (true);
create policy "public read services" on services for select using (true);
create policy "public read packages" on packages for select using (true);
create policy "public read published djs" on djs for select using (published = true);

create policy "public can apply to join" on dj_applications for insert with check (true);
create policy "public can request a quote" on quote_requests for insert with check (true);
-- No public select policy on dj_applications or quote_requests: with RLS
-- enabled and no such policy, only the service_role key (used from the
-- Supabase dashboard, never shipped client-side) can read them.
