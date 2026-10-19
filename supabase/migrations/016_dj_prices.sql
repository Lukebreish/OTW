-- DJ packages 10% lower (rounded). Run after 015. Already applied on 2026-10-19.
update courses set price = 315, price_note = '4 hours · €79 per hour' where id = 'dj-starter';
update courses set price = 890, price_note = '12 hours · €74 per hour' where id = 'dj-club-ready';
update courses set price = 1970 where id = 'dj-pro';
-- Plug The Jack is no longer a partner.
update courses set partner = null where partner ilike '%plug%jack%';
