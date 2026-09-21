export default function Packages({ packages, goToQuote }) {
  return (
    <section className="section">
      <div className="section-wide">
        <h1>Packages</h1>
        <p className="lead" style={{ marginTop: 12 }}>
          A starting point, not a limit. Already have a DJ, or don't need staging? Say so in the
          quote form and we'll adjust it.
        </p>

        <div className="packages-grid" style={{ marginTop: 32 }}>
          {packages.map((p) => (
            <div key={p.id} className={`panel package-panel ${p.is_featured ? 'featured' : ''}`}>
              <h3>{p.name}</h3>
              <p className="small">{p.tagline}</p>
              <div className="package-price">{p.price_from ? `From €${p.price_from}` : 'On request'}</div>
              {Array.isArray(p.includes) && p.includes.length > 0 && (
                <ul className="package-includes">
                  {p.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              <button className="btn-outline" style={{ marginTop: 'auto' }} onClick={() => goToQuote()}>
                Start with this
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
