import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient.js';
import { ENTITY_OF, resolveRoute } from './lib/routes.js';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Events from './pages/Events.jsx';
import Services from './pages/Services.jsx';
import Packages from './pages/Packages.jsx';
import Quote from './pages/Quote.jsx';
import Academy from './pages/Academy.jsx';
import Artists from './pages/Artists.jsx';
import Join from './pages/Join.jsx';
import Records from './pages/Records.jsx';
import About from './pages/About.jsx';

function useOtwData() {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [categoriesRes, servicesRes, packagesRes, djsRes, eventsRes, coursesRes, sessionsRes, releasesRes] = await Promise.all([
          supabase.from('service_categories').select('*').order('sort_order'),
          supabase.from('services').select('*').order('sort_order'),
          supabase.from('packages').select('*').order('sort_order'),
          supabase.from('djs').select('*').eq('published', true).order('sort_order'),
          supabase.from('events').select('*').eq('published', true).order('starts_at'),
          supabase.from('courses').select('*').eq('published', true).order('sort_order'),
          supabase.from('course_sessions').select('*').order('sort_order'),
          supabase.from('releases').select('*').eq('published', true).order('id', { ascending: false }),
        ]);
        const firstError = categoriesRes.error || servicesRes.error || packagesRes.error || djsRes.error;
        if (firstError) throw firstError;
        if (cancelled) return;
        setState({
          status: 'ready',
          categories: categoriesRes.data || [],
          services: servicesRes.data || [],
          packages: packagesRes.data || [],
          djs: djsRes.data || [],
          // The events table arrives with migration 003. Until it's run, the
          // listing just shows its empty state rather than breaking the site.
          events: eventsRes.error ? [] : eventsRes.data || [],
          // Migration 004 tables: same graceful fallback.
          courses: coursesRes.error ? [] : coursesRes.data || [],
          sessions: sessionsRes.error ? [] : sessionsRes.data || [],
          releases: releasesRes.error ? [] : releasesRes.data || [],
        });
      } catch (err) {
        if (!cancelled) setState({ status: 'error', error: err });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return state;
}

export default function App() {
  const [route, setRoute] = useState(() => resolveRoute(typeof window !== 'undefined' ? window.location.hash : ''));
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [quotePrefill, setQuotePrefill] = useState(null);
  const data = useOtwData();
  const entity = ENTITY_OF[route] || 'main';

  useEffect(() => {
    window.location.hash = route;
  }, [route]);

  useEffect(() => {
    const onHash = () => setRoute(resolveRoute(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = (r) => {
    setRoute(r);
    window.scrollTo({ top: 0 });
  };

  const goToQuote = (prefill) => {
    setQuotePrefill(prefill || null);
    go('quote');
  };

  return (
    <>
      <Header route={route} go={go} />

      <main data-entity={entity}>
        {data.status === 'loading' && <div className="wrap status-page label">Loading</div>}

        {data.status === 'error' && (
          <div className="wrap status-page">
            <p className="body">
              We couldn't load the site right now. Try again shortly. Site owner: check the Supabase
              connection (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
            </p>
          </div>
        )}

        {data.status === 'ready' && (
          <>
            {route === 'home' && <Home events={data.events} go={go} />}
            {route === 'events' && (
              <Events events={data.events} categories={data.categories} services={data.services} packages={data.packages} djs={data.djs} go={go} goToQuote={goToQuote} />
            )}
            {route === 'services' && <Services categories={data.categories} services={data.services} goToQuote={goToQuote} />}
            {route === 'packages' && <Packages packages={data.packages} goToQuote={goToQuote} />}
            {route === 'quote' && <Quote key={JSON.stringify(quotePrefill)} categories={data.categories} prefill={quotePrefill} />}
            {route === 'academy' && (
              <Academy courses={data.courses} sessions={data.sessions} djs={data.djs} go={go} goToQuote={goToQuote} />
            )}
            {route === 'artists' && (
              <Artists djs={data.djs} initialSelected={selectedArtist} onDone={() => setSelectedArtist(null)} go={go} goToQuote={goToQuote} />
            )}
            {route === 'join' && <Join />}
            {route === 'records' && <Records releases={data.releases} />}
            {route === 'about' && <About go={go} />}
          </>
        )}
      </main>

      <Footer go={go} />
    </>
  );
}
