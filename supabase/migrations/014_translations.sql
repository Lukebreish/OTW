-- Translations for public content. English stays in the existing columns;
-- French and Dutch go in `translations`, e.g.
--   {"fr": {"title": "…", "summary": "…"}, "nl": {"title": "…"}}
-- The site reads them with loc(row, 'title') (src/lib/i18n.jsx) and falls back to English.
alter table service_categories add column if not exists translations jsonb not null default '{}';
alter table services           add column if not exists translations jsonb not null default '{}';
alter table packages           add column if not exists translations jsonb not null default '{}';
alter table djs                add column if not exists translations jsonb not null default '{}';
alter table events             add column if not exists translations jsonb not null default '{}';
alter table courses            add column if not exists translations jsonb not null default '{}';
alter table releases           add column if not exists translations jsonb not null default '{}';
alter table stats              add column if not exists translations jsonb not null default '{}';
alter table testimonials       add column if not exists translations jsonb not null default '{}';
