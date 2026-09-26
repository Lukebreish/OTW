import { HalfWorld } from '../components/ui.jsx';
import { CONTACT_EMAIL } from '../lib/routes.js';

const SIDES = [
  ['events', 'Events', 'Club nights we run and events we produce. DJs, sound, lighting, staging and crew.'],
  ['academy', 'Academy', 'DJ and production courses, and the roster of artists we vouch for.'],
  ['records', 'Records', 'Our label. Tracks, EPs and distribution under the OTW name.'],
];

export default function About({ go }) {
  return (
    <>
      <section className="hero hero-division">
        <div className="hero-rise" aria-hidden="true" />
        <div className="wrap hero-inner">
          <div className="eyebrow label"><HalfWorld size={16} />About OTW</div>
          <h1>From the scene. For the scene.</h1>
          <p className="lead">Off The World is a Brussels crew of DJs, producers and technicians. One name, three sides.</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="cells cells-3">
            {SIDES.map(([entity, name, body]) => (
              <div key={entity} data-entity={entity}>
                <HalfWorld size={48} />
                <h3 style={{ marginTop: 'var(--space-5)' }}>{name}</h3>
                <p className="muted" style={{ margin: 'var(--space-4) 0 var(--space-5)' }}>{body}</p>
                <button className="btn btn-ghost" onClick={() => go(entity)}>Go →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap split">
          <div>
            <h2>Contact</h2>
            <p className="body" style={{ marginTop: 'var(--space-5)' }}>
              Bookings, courses, demos or anything else. We reply within one business day.
            </p>
          </div>
          <div>
            <ul className="hw-list">
              <li><HalfWorld size={16} /><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
              <li><HalfWorld size={16} />Brussels, Belgium</li>
            </ul>
            <div className="actions" data-entity="events">
              <button className="btn btn-primary" onClick={() => go('quote')}>Get a quote</button>
              <a className="btn btn-secondary" href={`mailto:${CONTACT_EMAIL}`}>Email us</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
