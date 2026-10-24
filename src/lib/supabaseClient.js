import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — copy .env.example to .env and fill them in (see README).'
  );
}

// In production the browser talks to /sb on our own domain, which Vercel forwards to
// Supabase (see vercel.json). Some networks (e.g. Lebanon) can reach the site but not
// supabase.co. Local dev keeps using the direct URL.
const apiUrl = import.meta.env.PROD && typeof window !== 'undefined' ? `${window.location.origin}/sb` : url;

// PKCE keeps auth codes in the query string, out of the way of hash routing.
export const supabase = createClient(apiUrl, anonKey, { auth: { flowType: 'pkce' } });
