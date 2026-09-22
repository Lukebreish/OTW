import { CONTACT_EMAIL } from './Footer.jsx';

export default function DivisionComingSoon({ tag, colorVar, tintVar, icon, headline, body, bullets, goTo }) {
  return (
    <section className="section">
      <div className="section-wide" style={{ maxWidth: 720 }}>
        <span
          className="subsection-tag"
          style={{ color: colorVar, background: tintVar, borderColor: colorVar }}
        >
          {tag}
        </span>
        <h1 style={{ marginTop: 16, maxWidth: '18ch' }}>{headline}</h1>
        <p className="lead" style={{ marginTop: 12 }}>{body}</p>

        {bullets && bullets.length > 0 && (
          <ul style={{ marginTop: 24, paddingLeft: 20, color: 'var(--ink-soft)', lineHeight: 1.8, fontSize: 15 }}>
            {bullets.map((b) => <li key={b}>{b}</li>)}
          </ul>
        )}

        <div className="panel" style={{ marginTop: 32, textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: 34, marginBottom: 10 }} aria-hidden="true">{icon}</div>
          <h3 style={{ margin: 0 }}>Coming soon</h3>
          <p style={{ marginTop: 8, marginLeft: 'auto', marginRight: 'auto' }}>
            We're building this out. Want to be first in line when it opens?
          </p>
          <a
            className="btn-solid"
            style={{ marginTop: 8, display: 'inline-flex' }}
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(tag + ' — interested')}`}
          >
            Get in touch
          </a>
        </div>

        <div style={{ marginTop: 24 }}>
          <button className="btn-outline" onClick={() => goTo('home')}>← Back to OTW</button>
        </div>
      </div>
    </section>
  );
}
