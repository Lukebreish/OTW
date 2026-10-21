import { useState } from 'react';
import EventCard from '../components/EventCard.jsx';
import ArtistsGrid from '../components/ArtistsGrid.jsx';
import { HalfWorld } from '../components/ui.jsx';
import { useLang } from '../lib/i18n.jsx';

const EVENT_TYPES = ['weddings', 'corporate', 'private', 'brand', 'clubs'];
const STEPS = ['brief', 'plan', 'quote', 'run'];

export default function Events({ events, categories, services, packages, djs, go, goToQuote }) {
  const [tab, setTab] = useState('upcoming');
  const { t, loc } = useLang();
  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.starts_at).getTime() >= now);
  const past = events.filter((e) => new Date(e.starts_at).getTime() < now).reverse();
  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <>
      <section className="hero hero-division">
        <div className="hero-rise" aria-hidden="true" />
        <div className="wrap hero-inner">
          <div className="eyebrow label"><HalfWorld size={16} />{t('events.hero.tag')}</div>
          <h1>{t('events.hero.title')}</h1>
          <p className="lead">
            {t('events.hero.lead')}
          </p>
          <div className="actions">
            <button className="btn btn-primary" onClick={() => goToQuote()}>{t('events.hero.request')}</button>
            <button className="btn btn-secondary" onClick={() => goToQuote(['djs'])}>{t('events.hero.dj')}</button>
          </div>
        </div>
      </section>

      {/* Everything we supply */}
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2>{t('events.supply.title')}</h2>
              <p className="lead">{t('events.supply.lead')}</p>
            </div>
            <button className="btn btn-ghost" onClick={() => go('services')}>{t('events.supply.details')}</button>
          </div>
          <div className="cells cells-4 supply">
            {categories.map((c) => {
              const items = services.filter((s) => s.category_id === c.id).slice(0, 4);
              return (
                <button key={c.id} className="supply-cell" onClick={() => goToQuote([c.slug])}>
                  <h3>{loc(c, 'name')}</h3>
                  {c.description && <p className="muted">{loc(c, 'description')}</p>}
                  {items.length > 0 && (
                    <ul>
                      {items.map((s) => <li key={s.id}>{loc(s, 'name')}</li>)}
                    </ul>
                  )}
                  <span className="label label-xs supply-cta">{t('events.supply.quote')}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="section">
        <div className="wrap">
          <div className="section-head"><h2>{t('events.types.title')}</h2></div>
          <div className="cat-list">
            {EVENT_TYPES.map((key) => (
              <div key={key} className="cat-row">
                <h3><HalfWorld size={24} />{t(`events.types.${key}`)}</h3>
                <p className="muted">{t(`events.types.${key}.body`)}</p>
                <button className="btn btn-ghost" onClick={() => goToQuote()}>{t('events.types.request')}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="wrap">
          <div className="section-head"><h2>{t('events.steps.title')}</h2></div>
          <div className="cells cells-4">
            {STEPS.map((key, i) => (
              <div key={key}>
                <div className="step-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="step-title label">{t(`events.steps.${key}`)}</div>
                <p className="muted">{t(`events.steps.${key}.body`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Book a DJ */}
      {djs.length > 0 && (
        <section className="section" id="djs">
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow label"><HalfWorld size={16} />{t('events.djs.tag')}</div>
                <h2>{t('events.djs.title')}</h2>
                <p className="lead">{t('events.djs.lead')}</p>
              </div>
              <button className="btn btn-ghost" onClick={() => go('artists')}>{t('events.djs.all')}</button>
            </div>
            <ArtistsGrid djs={djs} limit={4} onBook={() => goToQuote(['djs'])} />
          </div>
        </section>
      )}

      {/* Packages */}
      {packages.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <div>
                <h2>{t('events.packages.title')}</h2>
                <p className="lead">{t('events.packages.lead')}</p>
              </div>
              <button className="btn btn-ghost" onClick={() => go('packages')}>{t('events.packages.compare')}</button>
            </div>
            <div className="card-grid">
              {packages.slice(0, 3).map((p) => (
                <div key={p.id} className={`card ${p.is_featured ? 'card-featured' : ''}`}>
                  <h3>{loc(p, 'name')}</h3>
                  <p className="muted" style={{ marginTop: 'var(--space-3)' }}>{loc(p, 'tagline')}</p>
                  <div className="package-price">{p.price_from ? t('packages.from', { price: p.price_from }) : t('packages.request')}</div>
                  <button className="btn btn-ghost" style={{ marginTop: 'auto' }} onClick={() => goToQuote()}>{t('events.packages.start')}</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* OTW nights */}
      <section className="section" id="nights" style={{ scrollMarginTop: 80 }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow label"><HalfWorld size={16} />{t('events.nights.tag')}</div>
              <h2>{t('events.nights.title')}</h2>
              <p className="lead">{t('events.nights.lead')}</p>
            </div>
          </div>
          <div className="tabs" role="tablist">
            {[['upcoming', t('events.nights.upcoming', { n: upcoming.length })], ['past', t('events.nights.past', { n: past.length })]].map(([key, label]) => (
              <button key={key} role="tab" className="label" aria-selected={tab === key} onClick={() => setTab(key)}>{label}</button>
            ))}
          </div>
          {list.length > 0 ? (
            <div className="card-grid">
              {list.map((e) => <EventCard key={e.id} event={e} past={tab === 'past'} />)}
            </div>
          ) : (
            <p className="empty">
              {tab === 'upcoming' ? t('events.nights.empty.upcoming') : t('events.nights.empty.past')}
            </p>
          )}
        </div>
      </section>

      <button className="cta-bar" onClick={() => goToQuote()}>
        <span>{t('events.cta.title')}</span>
        <span>{t('events.cta.meta')}</span>
      </button>
    </>
  );
}
