import { formatEventDate } from '../components/EventCard.jsx';
import ArtistsGrid from '../components/ArtistsGrid.jsx';
import CourseCard from '../components/CourseCard.jsx';
import { HalfWorld } from '../components/ui.jsx';
import { formatPrice } from '../lib/payments.js';

const DOORS = [
  ['events', 'Events', 'Event management, DJs, sound, lighting and crew.'],
  ['academy', 'Academy', 'DJ and production courses. Our certified artists.'],
  ['records', 'Records', 'Our label. Releases, pre-saves and demos.'],
];

// Must match the quote builder's event types so the tap pre-fills step 1.
const OCCASIONS = [
  ['Wedding', 'Weddings'],
  ['Corporate event', 'Corporate'],
  ['Private party', 'Private parties'],
  ['Brand event', 'Brand events'],
  ['Club / nightlife', 'Clubs'],
  ['Festival', 'Festivals'],
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
  const nextCourses = [...courses]
    .sort((a, b) => (a.starts_on ? new Date(a.starts_on) : Infinity) - (b.starts_on ? new Date(b.starts_on) : Infinity))
    .slice(0, 3);
  const upcomingRelease = releases.filter((r) => r.release_date && new Date(r.release_date) > new Date()).pop();
  const release = upcomingRelease || releases.find((r) => !r.release_date || new Date(r.release_date) <= new Date()) || null;
  const releaseUpcoming = release && release === upcomingRelease;

  return (
    <>
      {/* 1. Hero */}
      <section className="home-hero">
        <div className="home-hero-copy wrap">
          <div className="eyebrow label"><HalfWorld size={16} />Off The World · Brussels</div>
          <h1>We run the night.</h1>
          <p className="lead">Event production, certified DJs, courses and a record label. One crew.</p>
          <div className="actions" data-entity="events">
            <button className="btn btn-primary" onClick={() => goToQuote()}>Get a quote</button>
            <button className="btn btn-secondary" onClick={() => goToQuote(['djs'])}>Book a DJ</button>
          </div>
        </div>
        <div className="home-hero-media photo">
          <img src="/assets/hero-dj-booth.webp" alt="OTW DJ booth in front of an empty, lit stage" />
          <div className="hero-rise" aria-hidden="true" />
        </div>
      </section>

      {/* Three doors */}
      <nav className="doors" aria-label="OTW entities">
        {DOORS.map(([key, name, line]) => (
          <button key={key} className="door" data-entity={key} onClick={() => go(key)}>
            <HalfWorld size={48} />
            <span className="door-name">{name}</span>
            <span className="door-line">{line}</span>
            <span className="label label-xs door-cta">Go →</span>
          </button>
        ))}
      </nav>

      {/* 2. Events */}
      <div data-entity="events">
        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow label"><HalfWorld size={16} />OTW Events</div>
                <h2 className="h-xl">Your event, handled end to end.</h2>
                <p className="lead">We plan it, supply it and run it. Tell us the occasion and we'll build the setup.</p>
              </div>
            </div>

            <div className="label label-xs muted" style={{ marginBottom: 'var(--space-4)' }}>What's the occasion?</div>
            <div className="tags occasions">
              {OCCASIONS.map(([value, label]) => (
                <button key={value} className="tag tag-lg" onClick={() => goToQuote(null, value)}>{label} →</button>
              ))}
            </div>

            {supply.length > 0 && (
              <div className="cells cells-4 supply" style={{ marginTop: 'var(--space-7)' }}>
                {supply.map((c) => {
                  const items = services.filter((s) => s.category_id === c.id).slice(0, 3);
                  return (
                    <button key={c.id} className="supply-cell" onClick={() => goToQuote([c.slug])}>
                      <h3>{c.name}</h3>
                      {items.length > 0 && <ul>{items.map((s) => <li key={s.id}>{s.name}</li>)}</ul>}
                      <span className="label label-xs supply-cta">Quote →</span>
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
                    <div className="label label-xs muted">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="home-events-foot">
              <div>
                <div className="label label-xs muted">Packages</div>
                <div className="label">{fromPrice != null ? `From ${formatPrice(fromPrice)}` : 'On request'}</div>
                <button className="btn btn-ghost btn-sm" onClick={() => go('packages')}>Compare →</button>
              </div>
              <div>
                <div className="label label-xs muted">Our own nights</div>
                <div className="label">
                  {nextNight
                    ? `${formatEventDate(nextNight.starts_at)} · ${[nextNight.venue, nextNight.city].filter(Boolean).join(', ')}`
                    : 'Next night soon'}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => go('events')}>{nextNight ? 'Details →' : 'All events →'}</button>
              </div>
              <div>
                <div className="label label-xs muted">Everything we supply</div>
                <div className="label">DJs to staging</div>
                <button className="btn btn-ghost btn-sm" onClick={() => go('events')}>OTW Events →</button>
              </div>
            </div>
          </div>
        </section>
        <button className="cta-bar" onClick={() => goToQuote()}>
          <span>Get a quote</span>
          <span>2 min · Reply in 1 day →</span>
        </button>
      </div>

      {/* 3. Proof (only real content, hidden when empty) */}
      {(clients.length > 0 || testimonials.length > 0) && (
        <section className="section" data-entity="main">
          <div className="wrap">
            {clients.length > 0 && (
              <>
                <div className="label label-xs muted" style={{ marginBottom: 'var(--space-5)' }}>Trusted by</div>
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
                {testimonials.slice(0, 2).map((t) => (
                  <figure key={t.id}>
                    <blockquote>{t.quote}</blockquote>
                    <figcaption className="label label-xs">{t.name}{t.context ? ` · ${t.context}` : ''}</figcaption>
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
                <div className="eyebrow label"><HalfWorld size={16} />OTW Academy · Artists</div>
                <h2 className="h-xl">{anyCertified ? 'Certified DJs.' : 'Our DJs.'}</h2>
                <p className="lead">
                  {anyCertified
                    ? 'Trained and vetted through OTW Academy. Book one for your event.'
                    : 'Artists we vouch for. Book one for your event.'}
                </p>
              </div>
              <div className="actions" style={{ marginTop: 0 }}>
                <button className="btn btn-secondary" onClick={() => go('artists')}>All artists</button>
              </div>
            </div>
            <ArtistsGrid djs={artists} limit={4} onBook={() => goToQuote(['djs'])} />
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow label"><HalfWorld size={16} />OTW Academy · Courses</div>
                <h2 className="h-xl">Learn to DJ. Learn to produce.</h2>
                <p className="lead">Small groups on club gear in Brussels. DJ courses also on Plug The Jack.</p>
              </div>
              <button className="btn btn-ghost" onClick={() => go('academy')}>All courses →</button>
            </div>
            {nextCourses.length > 0 ? (
              <div className="card-grid">
                {nextCourses.map((c) => <CourseCard key={c.id} course={c} onEnrol={() => go('academy')} />)}
              </div>
            ) : (
              <p className="empty">First courses open soon. <button className="btn-ghost label" onClick={() => go('academy')}>Register interest →</button></p>
            )}
            <div className="path-strip label">
              <span>Learn</span><span aria-hidden="true">→</span><span>Play an OTW night</span><span aria-hidden="true">→</span><span>Join the roster</span>
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
                {release.artwork_url ? <img src={release.artwork_url} alt={`${release.title} artwork`} /> : <span className="label muted">{release.id}</span>}
              </div>
              <div>
                <div className="eyebrow label"><HalfWorld size={16} />OTW Records · {releaseUpcoming ? 'Out soon' : 'Latest release'}</div>
                <div className="label accent">{release.id}</div>
                <h2 className="h-xl" style={{ marginTop: 'var(--space-3)' }}>{release.title}</h2>
                <p className="lead">{release.artist}</p>
                <div className="actions">
                  {releaseUpcoming && release.presave_url && <a className="btn btn-primary" href={release.presave_url} target="_blank" rel="noreferrer">Pre-save</a>}
                  {!releaseUpcoming && release.listen_url && <a className="btn btn-primary" href={release.listen_url} target="_blank" rel="noreferrer">Listen</a>}
                  <button className="btn btn-secondary" onClick={() => go('records')}>Catalogue</button>
                  <button className="btn btn-ghost" onClick={() => go('records')}>Send a demo →</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="section-head" style={{ marginBottom: 0 }}>
              <div>
                <div className="eyebrow label"><HalfWorld size={16} />OTW Records</div>
                <h2 className="h-xl">OTW001 is on the way.</h2>
                <p className="lead">Our label. Tracks and EPs from the crew and beyond.</p>
              </div>
              <button className="btn btn-secondary" onClick={() => go('records')}>Send a demo</button>
            </div>
          )}
        </div>
      </section>

      {/* 7. Last call */}
      <button className="cta-bar" data-entity="events" onClick={() => goToQuote()}>
        <span>Planning an event?</span>
        <span>Get a quote →</span>
      </button>
    </>
  );
}
