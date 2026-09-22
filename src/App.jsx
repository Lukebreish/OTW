import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient.js';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Events from './pages/Events.jsx';
import Artists from './pages/Artists.jsx';
import Academy from './pages/Academy.jsx';
import Label from './pages/Label.jsx';
import Services from './pages/Services.jsx';
import Packages from './pages/Packages.jsx';
import Quote from './pages/Quote.jsx';
import Join from './pages/Join.jsx';

function useOtwData() {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [categoriesRes, servicesRes, packagesRes, djsRes] = await Promise.all([
          supabase.from('service_categories').select('*').order('sort_order'),
          supabase.from('services').select('*').order('sort_order'),
          supabase.from('packages').select('*').order('sort_order'),
          supabase.from('djs').select('*').eq('published', true).order('sort_order'),
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
  const [tab, setTab] = useState(
    () => (typeof window !== 'undefined' && window.location.hash.replace('#', '')) || 'home'
  );
  const [selectedDj, setSelectedDj] = useState(null);
  const [quotePrefill, setQuotePrefill] = useState(null);
  const data = useOtwData();

  useEffect(() => {
    if (typeof window !== 'undefined') window.location.hash = tab;
  }, [tab]);

  const goToQuote = (prefillServices) => {
    setQuotePrefill(prefillServices || null);
    setTab('quote');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const go = (t) => {
    setTab(t);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <Nav tab={tab} setTab={go} />

      {data.status === 'loading' && (
        <div style={{ padding: '120px 24px', textAlign: 'center', color: 'var(--ink-soft)' }}>
          Loading OTW…
        </div>
      )}

      {data.status === 'error' && (
        <div style={{ padding: '120px 24px', textAlign: 'center', color: 'var(--ink-soft)' }}>
          Couldn't load the site's content right now — check back shortly, or if you're the site
          owner, check the Supabase connection (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
        </div>
      )}

      {data.status === 'ready' && (
        <>
          {tab === 'home' && <Home goTo={go} />}
          {tab === 'events' && (
            <Events packages={data.packages} categories={data.categories} goTo={go} goToQuote={goToQuote} />
          )}
          {tab === 'artists' && (
            <Artists djs={data.djs} initialSelected={selectedDj} onDone={() => setSelectedDj(null)} goTo={go} />
          )}
          {tab === 'academy' && <Academy goTo={go} />}
          {tab === 'label' && <Label goTo={go} />}
          {tab === 'services' && (
            <Services categories={data.categories} services={data.services} goToQuote={goToQuote} />
          )}
          {tab === 'packages' && <Packages packages={data.packages} goToQuote={goToQuote} />}
          {tab === 'quote' && <Quote categories={data.categories} services={data.services} prefill={quotePrefill} />}
          {tab === 'join' && <Join />}
        </>
      )}

      <Footer setTab={go} />
    </div>
  );
}
