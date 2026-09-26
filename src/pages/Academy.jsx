import { DivisionHero, ComingSoon } from '../components/ComingSoon.jsx';
import { HalfWorld } from '../components/ui.jsx';

export default function Academy({ djs, go }) {
  return (
    <>
      <DivisionHero
        tag="OTW Academy"
        title="Learn to mix. Learn to produce."
        lead="Mentorship and studio time from the crew already playing out every weekend. Graduates who are ready join the OTW artists roster."
      >
        <div className="actions">
          <button className="btn btn-primary" onClick={() => go('artists')}>Meet the artists</button>
          <button className="btn btn-secondary" onClick={() => go('join')}>Join OTW</button>
        </div>
      </DivisionHero>

      <ComingSoon
        subject="OTW Academy · interested"
        title="Courses open soon"
        body="We're building the first courses now. Register interest and you'll get first pick of places."
        points={[
          'DJ mixing 101 · from first blend to a performance-ready set',
          'Production mentorship for your own tracks',
          'A path onto the OTW artists roster',
        ]}
      />

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow label"><HalfWorld size={16} />The roster</div>
              <h2>OTW artists</h2>
              <p className="lead">DJs, producers and singers we vouch for. Reviewed and published by us, never self-listed.</p>
            </div>
            <button className="btn btn-ghost" onClick={() => go('artists')}>
              {djs.length > 0 ? `All ${djs.length} artists →` : 'See the roster →'}
            </button>
          </div>
          <div className="cells cells-2">
            <div>
              <h3>Book an artist</h3>
              <p className="muted" style={{ margin: 'var(--space-4) 0 var(--space-5)' }}>For your venue, night or private event.</p>
              <button className="btn btn-ghost" onClick={() => go('artists')}>Browse →</button>
            </div>
            <div>
              <h3>Play with us</h3>
              <p className="muted" style={{ margin: 'var(--space-4) 0 var(--space-5)' }}>Tell us what you play and where you've played it.</p>
              <button className="btn btn-ghost" onClick={() => go('join')}>Apply →</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
