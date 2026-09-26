import { useState } from 'react';
import EventCard from '../components/EventCard.jsx';
import { HalfWorld } from '../components/ui.jsx';

const SHOWCASE_SLUGS = ['djs', 'dj-equipment', 'sound', 'lighting'];

const STEPS = [
  ['Tell us about it', 'Party, wedding, corporate, club night. Start with a few basics.'],
  ['We build a setup', 'DJ, sound, lighting, staging. What the event needs, nothing it doesn’t.'],
  ['We check and quote', 'A real person reviews every request before anything is sent to you.'],
  ['You book, we run it', 'One team handles the DJ, the gear and the crew on the night.'],
];

export default function Events({ events, categories, packages, go, goToQuote }) {
  const [tab, setTab] = useState('upcoming');
  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.starts_at).getTime() >= now);
  const past = events.filter((e) => new Date(e.starts_at).getTime() < now).reverse();
  const list = tab === 'upcoming' ? upcoming : past;
  const showcase = SHOWCASE_SLUGS.map((s) => categories.find((c) => c.slug === s)).filter(Boolean);

  return (
    <>
      <section className="hero hero-division">
        <div className="hero-rise" aria-hidden="true" />
        <div className="wrap hero-inner">
          <div className="eyebrow label"><HalfWorld size={16} />OTW Events</div>
          <h1>Nights we run. Events we produce.</h1>
          <p className="lead">Our own club nights in Brussels, and full production for yours. DJs, sound, lighting and crew from one team.</p>
          <div className="actions">
            <button className="btn btn-primary" onClick={() => goToQuote()}>Get a quote</button>
            <button className="btn btn-secondary" onClick={() => document.getElementById('nights')?.scrollIntoView({ block: 'start' })}>
              Upcoming nights
            </button>
          </div>
        </div>
      </section>

      <section className="section" id="nights" style={{ scrollMarginTop: 80 }}>
        <div className="wrap">
          <div className="section-head"><h2>OTW nights</h2></div>
          <div className="tabs" role="tablist">
            {[['upcoming', `Upcoming · ${upcoming.length}`], ['past', `Past · ${past.length}`]].map(([key, label]) => (
              <button key={key} role="tab" className="label" aria-selected={tab === key} onClick={() => setTab(key)}>
                {label}
              </button>
            ))}
          </div>
          {list.length > 0 ? (
            <div className="card-grid">
              {list.map((e) => <EventCard key={e.id} event={e} past={tab === 'past'} />)}
            </div>
          ) : (
            <p className="empty">
              {tab === 'upcoming'
                ? 'Nothing announced yet. Sign up to the newsletter below and you’ll hear first.'
                : 'No past nights listed yet.'}
            </p>
          )}
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow label"><HalfWorld size={16} />Production</div>
              <h2>Your event, handled</h2>
              <p className="lead">You bring the guest list. We bring the DJ, the sound, the lighting and the people to run it.</p>
            </div>
          </div>
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

      {showcase.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <h2>What we bring</h2>
              <button className="btn btn-ghost" onClick={() => go('services')}>All services →</button>
            </div>
            <div className="cat-list">
              {showcase.map((c) => (
                <div key={c.id} className="cat-row">
                  <h3><HalfWorld size={24} />{c.name}</h3>
                  <p className="muted">{c.description}</p>
                  <button className="btn btn-ghost" onClick={() => goToQuote([c.slug])}>Quote →</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {packages.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <h2>Packages</h2>
              <button className="btn btn-ghost" onClick={() => go('packages')}>Compare packages →</button>
            </div>
            <div className="card-grid">
              {packages.slice(0, 3).map((p) => (
                <div key={p.id} className={`card ${p.is_featured ? 'card-featured' : ''}`}>
                  <h3>{p.name}</h3>
                  <p className="muted" style={{ marginTop: 'var(--space-3)' }}>{p.tagline}</p>
                  <div className="package-price">{p.price_from ? `From €${p.price_from}` : 'On request'}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <button className="cta-bar" onClick={() => goToQuote()}>
        <span>Get a quote</span>
        <span>2 min · No obligation →</span>
      </button>
    </>
  );
}
