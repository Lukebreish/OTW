import { formatEventDate } from '../components/EventCard.jsx';
import ArtistsGrid from '../components/ArtistsGrid.jsx';
import { useLang } from '../lib/i18n.jsx';
import { HalfWorld } from '../components/ui.jsx';
import { formatPrice } from '../lib/payments.js';

const DOORS = ['events', 'academy', 'records'];

// [value stored in the database, translation key]. Must match the quote
// builder's event types so the tap pre-fills step 1.
const OCCASIONS = [
  ['Wedding', 'wedding'],
  ['Corporate event', 'corporate'],
  ['Private party', 'private'],
  ['Brand event', 'brand'],
  ['Club / nightlife', 'club'],
  ['Festival', 'festival'],
];

const SUPPLY_SLUGS = ['djs', 'sound', 'lighting', 'staging'];

export default function Home({ data, go, goToQuote }) {
  const { categories, services, packages, djs, events, courses, releases, stats, clients, testimonials } = data;
  const now = Date.now();
  const nextNight = events.find((e) => new Date(e.starts_at).getTime() >= now);
  const supply = SUPPLY_SLUGS.map((s) => categories.find((c) => c.slug === s)).filter(Boolean);
  const prices = packages.map((p) => p.price_from).filter((p) => p != null);
  const fromPrice = prices.length ? Math.min(...prices) : null;
  const artists = [...djs].sort((a, b) => Number(!!b.certified) - Number(!!a.certified));
  const anyCertified = djs.some((d) => d.certified);
  const { t, loc, locale } = useLang();
  const courseFrom = (track) => {
    const prices = courses.filter((c) => (c.kind || 'course') === 'course' && c.track === track && c.price != null).map((c) => Number(c.price));
    return prices.length ? Math.min(...prices) : null;
  };
  const openAcademy = (track) => {
    try { window.sessionStorage.setItem('otw-academy-track', track); } catch { /* storage blocked */ }
    go('academy');
  };
  const upcomingRelease = releases.filter((r) => r.release_date && new Date(r.release_date) > new Date()).pop();
  const release = upcomingRelease || releases.find((r) => !r.release_date || new Date(r.release_date) <= new Date()) || null;
  const releaseUpcoming = release && release === upcomingRelease;

  return (
    <>
      {/* 1. Hero */}
      <section className="home-hero">
        <div className="home-hero-copy wrap">
          <div className="eyebrow label"><HalfWorld size={16} />{t('home.hero.tag')}</div>
          <h1>{t('home.hero.title')}</h1>
          <p className="lead">{t('home.hero.lead')}</p>
          <div className="actions" data-entity="events">
            <button className="btn btn-primary" onClick={() => goToQuote()}>{t('home.hero.quote')}</button>
            <button className="btn btn-secondary" onClick={() => goToQuote(['djs'])}>{t('home.hero.dj')}</button>
          </div>
        </div>
        <div className="home-hero-media photo">
          <img src="/assets/hero-dj-booth.webp" alt={t('home.hero.alt')} />
          <div className="hero-rise" aria-hidden="true" />
        </div>
      </section>

      {/* Three doors */}
      <nav className="doors" aria-label={t('home.doors.label')}>
        {DOORS.map((key) => (
          <button key={key} className="door" data-entity={key} onClick={() => go(key)}>
            <HalfWorld size={48} />
            <span className="door-name">{t(`nav.${key}`)}</span>
            <span className="door-line">{t(`home.doors.${key}.line`)}</span>
            <span className="label label-xs door-cta">{t('home.doors.go')}</span>
          </button>
        ))}
      </nav>

      {/* 2. Events */}
      <div data-entity="events">
        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow label"><HalfWorld size={16} />{t('home.events.tag')}</div>
                <h2 className="h-xl">{t('home.events.title')}</h2>
                <p className="lead">{t('home.events.lead')}</p>
              </div>
            </div>

            <div className="label label-xs muted" style={{ marginBottom: 'var(--space-4)' }}>{t('home.events.occasion')}</div>
            <div className="tags occasions">
              {OCCASIONS.map(([value, key]) => (
                <button key={value} className="tag tag-lg" onClick={() => goToQuote(null, value)}>{t(`home.occasion.${key}`)} →</button>
              ))}
            </div>

            {supply.length > 0 && (
              <div className="cells cells-4 supply" style={{ marginTop: 'var(--space-7)' }}>
                {supply.map((c) => {
                  const items = services.filter((s) => s.category_id === c.id).slice(0, 3);
                  return (
                    <button key={c.id} className="supply-cell" onClick={() => goToQuote([c.slug])}>
                      <h3>{loc(c, 'name')}</h3>
                      {items.length > 0 && <ul>{items.map((s) => <li key={s.id}>{loc(s, 'name')}</li>)}</ul>}
                      <span className="label label-xs supply-cta">{t('home.supply.quote')}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {stats.length > 0 && (
              <div className="stats">
                {stats.map((s) => (
                  <div key={s.id}>
                    <div className="stat-value">{s.value}</div>
                    <div className="label label-xs muted">{loc(s, 'label')}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="home-events-foot">
              <div>
                <div className="label label-xs muted">{t('home.foot.packages')}</div>
                <div className="label">{fromPrice != null ? t('home.foot.from', { price: formatPrice(fromPrice) }) : t('home.foot.request')}</div>
                <button className="btn btn-ghost btn-sm" onClick={() => go('packages')}>{t('home.foot.compare')}</button>
              </div>
              <div>
                <div className="label label-xs muted">{t('home.foot.nights')}</div>
                <div className="label">
                  {nextNight
                    ? `${formatEventDate(nextNight.starts_at, locale)} · ${[nextNight.venue, nextNight.city].filter(Boolean).join(', ')}`
                    : t('home.foot.nights.soon')}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => go('events')}>{nextNight ? t('home.foot.nights.details') : t('home.foot.nights.all')}</button>
              </div>
              <div>
                <div className="label label-xs muted">{t('home.foot.supply')}</div>
                <div className="label">{t('home.foot.supply.value')}</div>
                <button className="btn btn-ghost btn-sm" onClick={() => go('events')}>{t('home.foot.supply.link')}</button>
              </div>
            </div>
          </div>
        </section>
        <button className="cta-bar" onClick={() => goToQuote()}>
          <span>{t('home.cta.quote')}</span>
          <span>{t('home.cta.meta')}</span>
        </button>
      </div>

      {/* 3. Proof (only real content, hidden when empty) */}
      {(clients.length > 0 || testimonials.length > 0) && (
        <section className="section" data-entity="main">
          <div className="wrap">
            {clients.length > 0 && (
              <>
                <div className="label label-xs muted" style={{ marginBottom: 'var(--space-5)' }}>{t('home.proof.trusted')}</div>
                <div className="clients">
                  {clients.map((c) => (
                    <div key={c.id} className="client">
                      {c.logo_url ? <img src={c.logo_url} alt={c.name} loading="lazy" /> : <span className="label">{c.name}</span>}
                    </div>
                  ))}
                </div>
              </>
            )}
            {testimonials.length > 0 && (
              <div className="cells cells-2 quotes" style={{ marginTop: clients.length ? 'var(--space-7)' : 0 }}>
                {testimonials.slice(0, 2).map((item) => (
                  <figure key={item.id}>
                    <blockquote>{loc(item, 'quote')}</blockquote>
                    <figcaption className="label label-xs">{item.name}{item.context ? ` · ${loc(item, 'context')}` : ''}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4 + 5. Academy: DJs, then courses */}
      <div data-entity="academy">
        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow label"><HalfWorld size={16} />{t('home.artists.tag')}</div>
                <h2 className="h-xl">{anyCertified ? t('home.artists.title.certified') : t('home.artists.title.plain')}</h2>
                <p className="lead">
                  {anyCertified ? t('home.artists.lead.certified') : t('home.artists.lead.plain')}
                </p>
              </div>
              <div className="actions" style={{ marginTop: 0 }}>
                <button className="btn btn-secondary" onClick={() => go('artists')}>{t('home.artists.all')}</button>
              </div>
            </div>
            <ArtistsGrid djs={artists} limit={4} onBook={() => goToQuote(['djs'])} />
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow label"><HalfWorld size={16} />{t('home.academy.tag')}</div>
                <h2 className="h-xl">{t('home.academy.title')}</h2>
                <p className="lead">{t('home.academy.lead')}</p>
              </div>
              <button className="btn btn-ghost" onClick={() => go('academy')}>{t('home.academy.all')}</button>
            </div>
            {courseFrom('dj') != null || courseFrom('production') != null ? (
              <div className="cells cells-2">
                {['dj', 'production'].filter((k) => courseFrom(k) != null).map((k) => (
                  <button key={k} className="track-door" onClick={() => openAcademy(k)}>
                    <span className="label label-xs muted">{t('home.academy.from', { price: formatPrice(courseFrom(k)) })}</span>
                    <h3>{t(`home.academy.${k}.title`)}</h3>
                    <p className="muted">{t(`home.academy.${k}.body`)}</p>
                    <span className="btn btn-ghost">{t('home.academy.go')}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="empty">{t('home.academy.empty')} <button className="btn-ghost label" onClick={() => go('academy')}>{t('home.academy.empty.link')}</button></p>
            )}
            <div className="path-strip label">
              <span>{t('home.path.learn')}</span><span aria-hidden="true">→</span><span>{t('home.path.play')}</span><span aria-hidden="true">→</span><span>{t('home.path.join')}</span>
            </div>
          </div>
        </section>
      </div>

      {/* 6. Records */}
      <section className="section" data-entity="records">
        <div className="wrap">
          {release ? (
            <div className="home-release">
              <div className="release-art release-art-lg">
                {release.artwork_url ? <img src={release.artwork_url} alt={t('records.artwork.alt', { title: release.title })} /> : <span className="label muted">{release.id}</span>}
              </div>
              <div>
                <div className="eyebrow label"><HalfWorld size={16} />{t('home.records.tag')} · {releaseUpcoming ? t('home.records.soon') : t('home.records.latest')}</div>
                <div className="label accent">{release.id}</div>
                <h2 className="h-xl" style={{ marginTop: 'var(--space-3)' }}>{release.title}</h2>
                <p className="lead">{release.artist}</p>
                <div className="actions">
                  {releaseUpcoming && release.presave_url && <a className="btn btn-primary" href={release.presave_url} target="_blank" rel="noreferrer">{t('home.records.presave')}</a>}
                  {!releaseUpcoming && release.listen_url && <a className="btn btn-primary" href={release.listen_url} target="_blank" rel="noreferrer">{t('home.records.listen')}</a>}
                  <button className="btn btn-secondary" onClick={() => go('records')}>{t('home.records.catalogue')}</button>
                  <button className="btn btn-ghost" onClick={() => go('records')}>{t('home.records.demo')}</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="section-head" style={{ marginBottom: 0 }}>
              <div>
                <div className="eyebrow label"><HalfWorld size={16} />{t('home.records.tag')}</div>
                <h2 className="h-xl">{t('home.records.empty.title')}</h2>
                <p className="lead">{t('home.records.empty.lead')}</p>
              </div>
              <button className="btn btn-secondary" onClick={() => go('records')}>{t('home.records.empty.button')}</button>
            </div>
          )}
        </div>
      </section>

      {/* 7. Last call */}
      <button className="cta-bar" data-entity="events" onClick={() => goToQuote()}>
        <span>{t('home.last.title')}</span>
        <span>{t('home.last.cta')}</span>
      </button>
    </>
  );
}
