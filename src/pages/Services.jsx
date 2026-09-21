import { useState } from 'react';
import { iconFor } from '../lib/categoryIcons.js';

export default function Services({ categories, services, goToQuote }) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? null);
  const active = categories.find((c) => c.id === activeId);
  const activeServices = services.filter((s) => s.category_id === activeId);

  return (
    <section className="section">
      <div className="section-wide">
        <h1>What we bring</h1>
        <p className="lead" style={{ marginTop: 12 }}>
          Pick a category to see what's in it. Nothing here is exclusive — most events end up
          mixing a few.
        </p>

        <div className="bubble-field">
          {categories.map((c, i) => (
            <button
              key={c.id}
              className={`bubble ${c.id === activeId ? 'active' : ''}`}
              style={{ '--float-delay': `${(i % 5) * 0.6}s` }}
              onClick={() => setActiveId(c.id)}
              aria-pressed={c.id === activeId}
            >
              <span className="bubble-icon" aria-hidden="true">{iconFor(c.slug)}</span>
              {c.name}
            </button>
          ))}
        </div>

        {active && (
          <div className="bubble-detail panel">
            <h3>{active.name}</h3>
            {active.description && <p style={{ marginTop: 8 }}>{active.description}</p>}
            <div className="bubble-detail-list">
              {activeServices.length > 0 ? (
                activeServices.map((s) => (
                  <span key={s.id} className="bubble-detail-item">{s.name}</span>
                ))
              ) : (
                <span className="small">Details for this category are being added — ask us directly.</span>
              )}
            </div>
            <div style={{ marginTop: 24 }}>
              <button className="btn-solid" onClick={() => goToQuote([active.slug])}>
                Get a quote for {active.name.toLowerCase()}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
