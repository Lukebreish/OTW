-- Private DJ link: DJs with the link add themselves straight to the Artists page.
-- Public profile (djs): name, photo, role, years playing, genres.
-- Private (dj_contacts, team only): email, phone, location.
-- The link carries a token from dj_invite_links. Turn a link off with active = false.
-- Run after 011.

create table if not exists dj_invite_links (
  token uuid primary key default gen_random_uuid(),
  label text,
  active boolean not null default true,
  uses int not null default 0,
  created_at timestamptz not null default now()
);
alter table dj_invite_links enable row level security;
drop policy if exists "team manages dj invite links" on dj_invite_links;
create policy "team manages dj invite links" on dj_invite_links for all to authenticated
  using (public.is_team_member()) with check (public.is_team_member());

create table if not exists dj_contacts (
  dj_id text primary key references djs(id) on delete cascade,
  created_at timestamptz not null default now(),
  email text not null,
  phone text not null,
  location text,
  invite_token uuid references dj_invite_links(token) on delete set null
);
alter table dj_contacts enable row level security;
drop policy if exists "team manages dj contacts" on dj_contacts;
create policy "team manages dj contacts" on dj_contacts for all to authenticated
  using (public.is_team_member()) with check (public.is_team_member());
-- No public policies on either table.

create or replace function public.check_dj_invite(p_token uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.dj_invite_links where token = p_token and active);
$$;

create or replace function public.add_dj_via_invite(p_token uuid, p_data jsonb) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_name text := left(trim(coalesce(p_data->>'dj_name', '')), 80);
  v_email text := lower(left(trim(coalesce(p_data->>'email', '')), 200));
  v_phone text := left(trim(coalesce(p_data->>'phone', '')), 50);
  v_location text := left(nullif(trim(coalesce(p_data->>'location', '')), ''), 120);
  v_role text := trim(coalesce(p_data->>'role', ''));
  v_years int;
  v_photo text := trim(coalesce(p_data->>'photo_url', ''));
  v_genres text[];
  v_base text; v_id text; n int;
begin
  if not exists (select 1 from public.dj_invite_links where token = p_token and active) then
    raise exception 'This link is not active';
  end if;
  if v_name = '' then raise exception 'Add your DJ name'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Check your email'; end if;
  if v_phone = '' then raise exception 'Add your phone number'; end if;
  if v_role not in ('DJ', 'DJ/Producer', 'Singer') then raise exception 'Pick a role'; end if;
  begin
    v_years := (p_data->>'years_experience')::int;
  exception when others then v_years := null;
  end;
  if v_years is null or v_years < 0 or v_years > 60 then raise exception 'Check years playing'; end if;
  if v_photo !~ '/storage/v1/object/public/artist-photos/applications/[0-9a-f-]+\.(jpg|png|webp)$' then
    raise exception 'Add a photo';
  end if;
  select coalesce(array_agg(left(trim(g), 40)), '{}') into v_genres
    from (select jsonb_array_elements_text(coalesce(p_data->'genres', '[]'::jsonb)) g limit 8) s where trim(g) <> '';
  if cardinality(v_genres) = 0 then raise exception 'Pick at least one genre'; end if;

  -- Spam guard: max 3 per email per hour.
  select count(*) into n from public.dj_contacts where email = v_email and created_at > now() - interval '1 hour';
  if n >= 3 then raise exception 'Too many requests, try again later'; end if;

  v_base := trim(both '-' from regexp_replace(lower(v_name), '[^a-z0-9]+', '-', 'g'));
  if v_base = '' then v_base := 'artist'; end if;
  v_id := v_base;
  while exists (select 1 from public.djs where id = v_id) loop
    v_id := v_base || '-' || substr(md5(random()::text), 1, 4);
  end loop;

  insert into public.djs (id, name, role, years_experience, genres, image_url, published, sort_order)
  values (v_id, v_name, v_role, v_years, v_genres, v_photo, true, 100);
  insert into public.dj_contacts (dj_id, email, phone, location, invite_token)
  values (v_id, v_email, v_phone, v_location, p_token);
  update public.dj_invite_links set uses = uses + 1 where token = p_token;
  return v_id;
end $$;

revoke all on function public.check_dj_invite(uuid) from public;
revoke all on function public.add_dj_via_invite(uuid, jsonb) from public;
grant execute on function public.check_dj_invite(uuid) to anon, authenticated;
grant execute on function public.add_dj_via_invite(uuid, jsonb) to anon, authenticated;

-- First link. Get its token with: select token from dj_invite_links;
insert into dj_invite_links (label)
select 'Main DJ link' where not exists (select 1 from dj_invite_links);
