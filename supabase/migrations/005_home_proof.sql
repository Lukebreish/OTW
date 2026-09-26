-- Home page proof: certified artists, headline numbers, client logos and
-- testimonials. Run once after 004. Every home section that reads these
-- tables stays hidden until it has rows, so only add real content.

-- Tick for artists who completed OTW Academy / are vetted by OTW.
-- Shows an OTW CERTIFIED tag on their card.
alter table djs add column if not exists certified boolean not null default false;

-- Number row on the home page, e.g. value '120+', label 'Events delivered'.
create table if not exists stats (
  id uuid primary key default gen_random_uuid(),
  value text not null,
  label text not null,
  sort_order int not null default 0
);

-- Venue / client logos. Use a white or mono logo (shown in grayscale).
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  sort_order int not null default 0
);

-- Short client quotes. Only publish ones you have permission to use.
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  name text not null,
  context text,                        -- e.g. 'Wedding · Ghent' or 'Events lead, Brand X'
  published boolean not null default true,
  sort_order int not null default 0
);

alter table stats enable row level security;
alter table clients enable row level security;
alter table testimonials enable row level security;
create policy "public read stats" on stats for select using (true);
create policy "public read clients" on clients for select using (true);
create policy "public read published testimonials" on testimonials for select using (published = true);
