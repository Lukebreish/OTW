-- Off The World — starter content so the site isn't empty on first load.
-- Everything here is a placeholder except the Luke Breish DJ profile —
-- replace copy, pricing and the placeholder DJs with the real thing
-- from the Table Editor whenever OTW is ready. Safe to re-run.

delete from services;
delete from service_categories;
delete from packages;
delete from djs;

insert into service_categories (slug, name, description, sort_order) values
  ('djs', 'DJs', 'Resident and guest DJs for whatever the night calls for.', 1),
  ('dj-equipment', 'DJ Equipment', 'Decks, mixers, controllers — booth-ready.', 2),
  ('sound', 'Sound', 'Speakers, subs and PA systems sized to the room.', 3),
  ('lighting', 'Lighting', 'From ambient wash to full dancefloor rigs.', 4),
  ('installation', 'Installation', 'Delivery, setup and breakdown handled for you.', 5),
  ('technicians', 'Event Technicians', 'People on-site running sound, lights and the booth.', 6),
  ('staging', 'Staging', 'Stages, risers and backdrops for bigger events.', 7),
  ('photo-video', 'Photo & Video', 'Coverage of the night, from stills to a highlight reel.', 8);

insert into services (category_id, name, sort_order)
  select id, v.name, v.sort_order from service_categories, (values
    ('Resident DJ', 1), ('Guest DJ booking', 2), ('Back-to-back sets', 3), ('MC / hosting', 4)
  ) as v(name, sort_order) where slug = 'djs';

insert into services (category_id, name, sort_order)
  select id, v.name, v.sort_order from service_categories, (values
    ('Decks (CDJ / turntables)', 1), ('Mixers', 2), ('Controllers', 3), ('Full booth setup', 4)
  ) as v(name, sort_order) where slug = 'dj-equipment';

insert into services (category_id, name, sort_order)
  select id, v.name, v.sort_order from service_categories, (values
    ('Speakers', 1), ('Subwoofers', 2), ('Microphones', 3), ('DJ sound systems', 4), ('PA systems', 5)
  ) as v(name, sort_order) where slug = 'sound';

insert into services (category_id, name, sort_order)
  select id, v.name, v.sort_order from service_categories, (values
    ('Ambient lighting', 1), ('Dancefloor lighting', 2), ('Architectural lighting', 3), ('Event lighting', 4), ('Special effects', 5)
  ) as v(name, sort_order) where slug = 'lighting';

insert into services (category_id, name, sort_order)
  select id, v.name, v.sort_order from service_categories, (values
    ('Delivery & setup', 1), ('Breakdown & collection', 2), ('On-site technical support', 3)
  ) as v(name, sort_order) where slug = 'installation';

insert into services (category_id, name, sort_order)
  select id, v.name, v.sort_order from service_categories, (values
    ('Sound engineer', 1), ('Lighting operator', 2), ('General event technician', 3)
  ) as v(name, sort_order) where slug = 'technicians';

insert into services (category_id, name, sort_order)
  select id, v.name, v.sort_order from service_categories, (values
    ('Modular stage', 1), ('Riser platforms', 2), ('Backdrop & drape', 3), ('Crowd barriers', 4)
  ) as v(name, sort_order) where slug = 'staging';

insert into services (category_id, name, sort_order)
  select id, v.name, v.sort_order from service_categories, (values
    ('Event photography', 1), ('Highlight reel video', 2), ('Live streaming', 3), ('Drone coverage', 4)
  ) as v(name, sort_order) where slug = 'photo-video';

insert into packages (id, name, tagline, price_from, includes, is_featured, sort_order) values
  ('the-party', 'The Party', 'A simple, solid entertainment setup.', 450,
    array['DJ', 'Basic sound system', 'Basic DJ equipment'], false, 1),
  ('the-experience', 'The Experience', 'The complete party setup — our most booked.', 950,
    array['DJ', 'Professional sound', 'Party lighting', 'DJ equipment', 'Installation'], true, 2),
  ('full-production', 'Full Production', 'A full event build, top to bottom.', null,
    array['DJ', 'Sound', 'Lighting', 'Equipment', 'Installation', 'Technician', 'Staging'], false, 3);

insert into djs (id, name, location, bio, genres, languages, published, sort_order) values
  ('luke-breish', 'Luke Breish', 'Brussels, Belgium',
    'One of OTW''s own resident artists — moving between Afro House, Afro Tech and melodic, organic techno.',
    array['Afro House', 'Afro Tech', 'Melodic House', 'Tech House', 'Organic/Melodic Techno'],
    array['English', 'French', 'Arabic'], true, 1),
  ('placeholder-dj-2', 'Placeholder DJ', 'Belgium',
    'Placeholder profile — replace with a real OTW DJ. Bio, genres and links all editable from the Table Editor.',
    array['Genre one', 'Genre two'], array['English'], true, 2),
  ('placeholder-dj-3', 'Placeholder DJ', 'Belgium',
    'Placeholder profile — replace with a real OTW DJ.',
    array['Genre one'], array['English'], true, 3);
