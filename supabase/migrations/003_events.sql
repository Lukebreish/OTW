-- OTW Events: public club nights and parties listed on the Events page.
-- Run once in the Supabase SQL Editor after 001 and 002.
-- Manage rows in the Table Editor: published = false hides a night without
-- deleting it; sold_out = true swaps the TICKETS link for a SOLD OUT tag.

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,                 -- e.g. 'OTW Night 01'
  starts_at timestamptz not null,      -- shown as SAT 14 NOV · 22:00 (Brussels time)
  venue text,                          -- e.g. 'Fuse'
  city text,                           -- e.g. 'Brussels'
  lineup text[] not null default '{}', -- artist names, in running order
  description text,
  ticket_url text,
  image_url text,                      -- photo, shown in grayscale per the DS
  sold_out boolean not null default false,
  published boolean not null default true
);

create index if not exists events_starts_at_idx on events (starts_at);

alter table events enable row level security;
create policy "public read published events" on events for select using (published = true);
