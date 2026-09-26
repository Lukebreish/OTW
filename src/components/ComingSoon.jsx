import { HalfWorld } from './ui.jsx';
import { CONTACT_EMAIL } from '../lib/routes.js';

// Division hero + "not open yet" block, used by Academy and Records until
// their own content (courses, releases) is in Supabase.
export function DivisionHero({ tag, title, lead, children }) {
  return (
    <section className="hero hero-division">
      <div className="hero-rise" aria-hidden="true" />
      <div className="wrap hero-inner">
        <div className="eyebrow label"><HalfWorld size={16} />{tag}</div>
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
        {children}
      </div>
    </section>
  );
}

export function ComingSoon({ subject, title, body, points }) {
  return (
    <section className="section">
      <div className="wrap split">
        <div>
          <h2>{title}</h2>
          <p className="body" style={{ marginTop: 'var(--space-5)' }}>{body}</p>
          <div className="actions">
            <a className="btn btn-primary" href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`}>
              Register interest
            </a>
          </div>
        </div>
        {points && (
          <ul className="hw-list">
            {points.map((p) => (
              <li key={p}><HalfWorld size={16} />{p}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
