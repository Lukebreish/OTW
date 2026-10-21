import { useState } from 'react';
import { HalfWorld } from '../components/ui.jsx';
import { useLang } from '../lib/i18n.jsx';

export default function Services({ categories, services, goToQuote }) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? null);
  const { t, loc } = useLang();
  const active = categories.find((c) => c.id === activeId);
  const activeServices = services.filter((s) => s.category_id === activeId);

  return (
    <section className="section">
      <div className="wrap">
        <div className="eyebrow label"><HalfWorld size={16} />{t('services.tag')}</div>
        <h1>{t('services.title')}</h1>
        <p className="lead" style={{ marginTop: 'var(--space-5)' }}>
          {t('services.lead')}
        </p>

        <div className="tags" style={{ marginTop: 'var(--space-7)' }}>
          {categories.map((c) => (
            <button key={c.id} className="tag tag-lg" aria-pressed={c.id === activeId} onClick={() => setActiveId(c.id)}>
              {loc(c, 'name')}
            </button>
          ))}
        </div>

        {active && (
          <div className="split" style={{ marginTop: 'var(--space-7)' }}>
            <div>
              <h2>{loc(active, 'name')}</h2>
              {active.description && <p className="body" style={{ marginTop: 'var(--space-5)' }}>{loc(active, 'description')}</p>}
              <div className="actions">
                <button className="btn btn-primary" onClick={() => goToQuote([active.slug])}>{t('services.quote')}</button>
              </div>
            </div>
            {activeServices.length > 0 ? (
              <ul className="hw-list">
                {activeServices.map((s) => (
                  <li key={s.id}><HalfWorld size={16} /><span><strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{loc(s, 'name')}</strong>{s.description ? ` · ${loc(s, 'description')}` : ''}</span></li>
                ))}
              </ul>
            ) : (
              <p className="empty">{t('services.empty')}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
