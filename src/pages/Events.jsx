import { useState } from 'react';
import EventCard from '../components/EventCard.jsx';
import ArtistsGrid from '../components/ArtistsGrid.jsx';
import { HalfWorld } from '../components/ui.jsx';

const EVENT_TYPES = [
  ['Weddings', 'Ceremony to last dance. Sound for the speeches, a DJ who reads the room.'],
  ['Corporate', 'Launches, galas, team nights. On brief, on time, no surprises.'],
  ['Private parties', 'Birthdays, house parties, anniversaries. Any size.'],
  ['Brand events', 'Activations and pop-ups that need to look and sound right.'],
  ['Clubs & festivals', 'Line-ups, production and crew for promoters and venues.'],
];

const STEPS = [
  ['Brief', 'Tell us the date, the place, the crowd. Two minutes.'],
  ['Plan', 'We build the setup: DJ, sound, lighting, staging, crew. Nothing you don’t need.'],
  ['Quote', 'A real person checks every request. You get one clear price.'],
  ['Run', 'We deliver, set up, run the night and break down. You enjoy it.'],
];

export default function Events({ events, categories, services, packages, djs, go, goToQuote }) {
  const [tab, setTab] = useState('upcoming');
  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.starts_at).getTime() >= now);
  const past = events.filter((e) => new Date(e.starts_at).getTime() < now).reverse();
  const list = tab === 'upcoming' ? upcoming : past;
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <>
      <section className="hero hero-division">
        <div className="hero-rise" aria-hidden="true" />
        <div className="wrap hero-inner">
          <div className="eyebrow label"><HalfWorld size={16} />OTW Events · Event management</div>
          <h1>Your event, handled end to end.</h1>
          <p className="lead">
            We plan it, supply it and run it. DJs, sound, lighting, staging, crew, photo and video. One team, one quote.
          </p>
          <div className="actions">
            <button className="btn btn-primary" onClick={() => goToQuote()}>Request an event</button>
            <button className="btn btn-secondary" onClick={() => goToQuote(['djs'])}>Book a DJ</button>
          </div>
        </div>
      </section>

      {/* Everything we supply */}
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2>Everything, from one team</h2>
              <p className="lead">Take the full package or just what you're missing. Tap any line to start a quote with it.</p>
            </div>
            <button className="btn btn-ghost" onClick={() => go('services')}>Service details →</button>
          </div>
          <div className="cells cells-4 supply">
            {categories.map((c) => {
              const items = services.filter((s) => s.category_id === c.id).slice(0, 4);
              return (
                <button key={c.id} className="supply-cell" onClick={() => goToQuote([c.slug])}>
                  <h3>{c.name}</h3>
                  {c.description && <p className="muted">{c.description}</p>}
                  {items.length > 0 && (
                    <ul>
                      {items.map((s) => <li key={s.id}>{s.name}</li>)}
                    </ul>
                  )}
                  <span className="label label-xs supply-cta">Quote →</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="section">
        <div className="wrap">
          <div className="section-head"><h2>Events we run</h2></div>
          <div className="cat-list">
            {EVENT_TYPES.map(([name, body]) => (
              <div key={name} className="cat-row">
                <h3><HalfWorld size={24} />{name}</h3>
                <p className="muted">{body}</p>
                <button className="btn btn-ghost" onClick={() => goToQuote()}>Request →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="wrap">
          <div className="section-head"><h2>How it works</h2></div>
          <div className="cells cells-4">
            {STEPS.map(([title, body], i) => (
              <div key={title}>
                <div className="step-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="step-title label">{title}</div>
                <p className="muted">{body}</p>
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
                <div className="eyebrow label"><HalfWorld size={16} />Book a DJ</div>
                <h2>Our DJs</h2>
                <p className="lead">Pick an artist from the roster, or tell us the vibe and we'll match one.</p>
              </div>
              <button className="btn btn-ghost" onClick={() => go('artists')}>All artists →</button>
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
                <h2>Packages</h2>
                <p className="lead">A starting point if you'd rather not build from scratch.</p>
              </div>
              <button className="btn btn-ghost" onClick={() => go('packages')}>Compare packages →</button>
            </div>
            <div className="card-grid">
              {packages.slice(0, 3).map((p) => (
                <div key={p.id} className={`card ${p.is_featured ? 'card-featured' : ''}`}>
                  <h3>{p.name}</h3>
                  <p className="muted" style={{ marginTop: 'var(--space-3)' }}>{p.tagline}</p>
                  <div className="package-price">{p.price_from ? `From €${p.price_from}` : 'On request'}</div>
                  <button className="btn btn-ghost" style={{ marginTop: 'auto' }} onClick={() => goToQuote()}>Start here →</button>
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
              <div className="eyebrow label"><HalfWorld size={16} />Our own nights</div>
              <h2>OTW nights</h2>
              <p className="lead">We throw our own parties too. This is what's on.</p>
            </div>
          </div>
          <div className="tabs" role="tablist">
            {[['upcoming', `Upcoming · ${upcoming.length}`], ['past', `Past · ${past.length}`]].map(([key, label]) => (
              <button key={key} role="tab" className="label" aria-selected={tab === key} onClick={() => setTab(key)}>{label}</button>
            ))}
          </div>
          {list.length > 0 ? (
            <div className="card-grid">
              {list.map((e) => <EventCard key={e.id} event={e} past={tab === 'past'} />)}
            </div>
          ) : (
            <p className="empty">
              {tab === 'upcoming' ? 'Nothing announced yet. Sign up to the newsletter below to hear first.' : 'No past nights listed yet.'}
            </p>
          )}
        </div>
      </section>

      <button className="cta-bar" onClick={() => goToQuote()}>
        <span>Request an event</span>
        <span>2 min · Reply in 1 day →</span>
      </button>
    </>
  );
}
