import { useState } from 'react';
import { HalfWorld } from '../components/ui.jsx';

export default function Services({ categories, services, goToQuote }) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? null);
  const active = categories.find((c) => c.id === activeId);
  const activeServices = services.filter((s) => s.category_id === activeId);

  return (
    <section className="section">
      <div className="wrap">
        <div className="eyebrow label"><HalfWorld size={16} />OTW Events · Production</div>
        <h1>What we bring</h1>
        <p className="lead" style={{ marginTop: 'var(--space-5)' }}>
          Pick a category to see what's in it. Most events mix a few.
        </p>

        <div className="tags" style={{ marginTop: 'var(--space-7)' }}>
          {categories.map((c) => (
            <button key={c.id} className="tag tag-lg" aria-pressed={c.id === activeId} onClick={() => setActiveId(c.id)}>
              {c.name}
            </button>
          ))}
        </div>

        {active && (
          <div className="split" style={{ marginTop: 'var(--space-7)' }}>
            <div>
              <h2>{active.name}</h2>
              {active.description && <p className="body" style={{ marginTop: 'var(--space-5)' }}>{active.description}</p>}
              <div className="actions">
                <button className="btn btn-primary" onClick={() => goToQuote([active.slug])}>Quote this</button>
              </div>
            </div>
            {activeServices.length > 0 ? (
              <ul className="hw-list">
                {activeServices.map((s) => (
                  <li key={s.id}><HalfWorld size={16} /><span><strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{s.name}</strong>{s.description ? ` · ${s.description}` : ''}</span></li>
                ))}
              </ul>
            ) : (
              <p className="empty">Details for this category are on the way. Ask us directly.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
