-- Artists add themselves to the site: they apply on /#join with a photo, OTW reviews the
-- application in #ops and publishes it to the Artists page with one click.
-- Photos go to a public storage bucket. Anyone can upload an image there (max 5 MB,
-- images only, into applications/ only); only the team can publish a profile.

alter table dj_applications
  add column if not exists role text,
  add column if not exists photo_url text,
  add column if not exists dj_id text references djs(id) on delete set null;
alter table djs add column if not exists role text;

-- Team access for reviewing applications and publishing profiles.
drop policy if exists "team manages dj applications" on dj_applications;
create policy "team manages dj applications" on dj_applications for all to authenticated
  using (public.is_team_member()) with check (public.is_team_member());
drop policy if exists "team manages djs" on djs;
create policy "team manages djs" on djs for all to authenticated
  using (public.is_team_member()) with check (public.is_team_member());

-- Photo bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('artist-photos', 'artist-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "anyone can upload an application photo" on storage.objects;
create policy "anyone can upload an application photo" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'artist-photos' and (storage.foldername(name))[1] = 'applications');

drop policy if exists "anyone can view artist photos" on storage.objects;
create policy "anyone can view artist photos" on storage.objects
  for select to anon, authenticated using (bucket_id = 'artist-photos');
