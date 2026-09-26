import { HalfWorld } from '../components/ui.jsx';

export default function Packages({ packages, goToQuote }) {
  return (
    <section className="section">
      <div className="wrap">
        <div className="eyebrow label"><HalfWorld size={16} />OTW Events · Packages</div>
        <h1>Packages</h1>
        <p className="lead" style={{ marginTop: 'var(--space-5)' }}>
          A starting point, not a limit. Already have a DJ, or don't need staging? Say so in the quote and we'll adjust.
        </p>

        <div className="card-grid" style={{ marginTop: 'var(--space-8)' }}>
          {packages.map((p) => (
            <div key={p.id} className={`card ${p.is_featured ? 'card-featured' : ''}`}>
              {p.is_featured && <span className="tag tag-fill" style={{ alignSelf: 'flex-start', marginBottom: 'var(--space-4)' }}>Most booked</span>}
              <h3>{p.name}</h3>
              <p className="muted" style={{ marginTop: 'var(--space-3)' }}>{p.tagline}</p>
              <div className="package-price">{p.price_from ? `From €${p.price_from}` : 'On request'}</div>
              {Array.isArray(p.includes) && p.includes.length > 0 && (
                <ul className="package-includes">
                  {p.includes.map((item) => <li key={item}><HalfWorld size={16} />{item}</li>)}
                </ul>
              )}
              <button className={`btn ${p.is_featured ? 'btn-primary' : 'btn-secondary'}`} style={{ marginTop: 'auto', alignSelf: 'flex-start' }} onClick={() => goToQuote()}>
                Start here
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
