-- 017_explicit_grants.sql
-- From 30 Oct 2026, Supabase no longer auto-grants Data API access to new
-- tables in "public". This migration states the grants explicitly so that a
-- fresh rebuild (supabase db reset, preview branches, new projects) matches
-- the live OTW project. On the live project it changes nothing: these grants
-- already exist. Access is still controlled by RLS policies on every table.
--
-- Rule for every new migration from 018 onwards: add grants in the same
-- migration that creates the table, and grant only what the site needs.

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
