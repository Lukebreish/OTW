import { HalfWorld } from '../components/ui.jsx';
import { useLang } from '../lib/i18n.jsx';

export default function Packages({ packages, goToQuote }) {
  const { t, loc } = useLang();
  return (
    <section className="section">
      <div className="wrap">
        <div className="eyebrow label"><HalfWorld size={16} />{t('packages.tag')}</div>
        <h1>{t('packages.title')}</h1>
        <p className="lead" style={{ marginTop: 'var(--space-5)' }}>
          {t('packages.lead')}
        </p>

        <div className="card-grid" style={{ marginTop: 'var(--space-8)' }}>
          {packages.map((p) => {
            const includes = loc(p, 'includes');
            return (
              <div key={p.id} className={`card ${p.is_featured ? 'card-featured' : ''}`}>
                {p.is_featured && <span className="tag tag-fill" style={{ alignSelf: 'flex-start', marginBottom: 'var(--space-4)' }}>{t('packages.featured')}</span>}
                <h3>{loc(p, 'name')}</h3>
                <p className="muted" style={{ marginTop: 'var(--space-3)' }}>{loc(p, 'tagline')}</p>
                <div className="package-price">{p.price_from ? t('packages.from', { price: p.price_from }) : t('packages.request')}</div>
                {Array.isArray(includes) && includes.length > 0 && (
                  <ul className="package-includes">
                    {includes.map((item) => <li key={item}><HalfWorld size={16} />{item}</li>)}
                  </ul>
                )}
                <button className={`btn ${p.is_featured ? 'btn-primary' : 'btn-secondary'}`} style={{ marginTop: 'auto', alignSelf: 'flex-start' }} onClick={() => goToQuote()}>
                  {t('packages.start')}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
