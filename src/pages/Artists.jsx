import { useEffect } from 'react';
import ArtistsGrid from '../components/ArtistsGrid.jsx';
import { HalfWorld } from '../components/ui.jsx';

export default function Artists({ djs, initialSelected, onDone, go, goToQuote }) {
  useEffect(() => { if (initialSelected) onDone(); }, [initialSelected, onDone]);

  return (
    <>
      <section className="section">
        <div className="wrap">
          <div className="eyebrow label"><HalfWorld size={16} />OTW Academy · Artists</div>
          <h1>The artists</h1>
          <p className="lead" style={{ marginTop: 'var(--space-5)', marginBottom: 'var(--space-8)' }}>
            DJs, producers and singers we vouch for. Pick one for genres, links and their story, or book them for your event.
          </p>
          <ArtistsGrid djs={djs} initialSelected={initialSelected} onBook={() => goToQuote(['djs'])} />
        </div>
      </section>

      <section className="band" data-entity="academy">
        <div className="wrap band-inner">
          <h2>Play with us</h2>
          <p>More than a roster. If you play and want in, we'd like to hear what you do.</p>
          <button className="btn" onClick={() => go('join')}>Join OTW →</button>
        </div>
      </section>
    </>
  );
}
