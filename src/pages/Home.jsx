import { useEffect, useRef, useState } from 'react';
import { iconFor } from '../lib/categoryIcons.js';

const BUBBLE_SLUGS = ['djs', 'dj-equipment', 'sound', 'lighting'];

const SUB_ITEMS = {
  djs: ['Commercial music', 'Electronic', 'Wedding', 'Corporate', 'Lounge'],
  'dj-equipment': ['DJ controller', 'Club standard gear', 'Custom setup'],
  sound: ['Tops', 'Subs', 'Full range', 'Mic'],
  lighting: ['LEDs', 'Moving heads', 'Full event lighting'],
};

const STEPS = [
  ['Tell us about it', 'Party, wedding, corporate, club night — whatever it is, start with a few basics.'],
  ['We put a setup together', 'DJ, sound, lighting, staging — whatever the event actually needs, nothing you don’t.'],
  ['We check it and quote it', 'A real person reviews every request before anything gets sent to you.'],
  ['You book, we run it', 'One team handles the DJ, the gear and the people on the ground on the night.'],
];

const FLIP_WORDS = [
  { key: 'events', text: 'EVENTS', color: 'var(--amber)' },
  { key: 'artists', text: 'ARTISTS', color: 'var(--violet)' },
  { key: 'academy', text: 'ACADEMY', color: 'var(--cyan)' },
  { key: 'label', text: 'LABEL', color: 'var(--magenta)' },
];

const DIVISIONS = [
  {
    key: 'events',
    icon: '\u{1F39B}️',
    color: 'var(--amber)',
    tint: 'var(--amber-tint)',
    for: 'For people throwing an event',
    name: 'OTW Events',
    pitch: 'We produce your event, start to finish — DJs, sound, lighting, staging.',
    cta: 'Get a quote',
    status: 'live',
  },
  {
    key: 'artists',
    icon: '\u{1F3A7}',
    color: 'var(--violet)',
    tint: 'var(--violet-tint)',
    for: 'For venues & promoters',
    name: 'OTW Artists',
    pitch: "Meet OTW's roster of DJs, booked for your venue or night.",
    cta: 'Meet the artists',
    status: 'live',
  },
  {
    key: 'academy',
    icon: '\u{1F393}',
    color: 'var(--cyan)',
    tint: 'var(--cyan-tint)',
    for: 'For aspiring DJs & producers',
    name: 'OTW Academy',
    pitch: 'Learn to DJ and produce with mentorship and studio time.',
    cta: 'Coming soon',
    status: 'soon',
  },
  {
    key: 'label',
    icon: '\u{1F3A4}',
    color: 'var(--magenta)',
    tint: 'var(--magenta-tint)',
    for: 'For artists & platforms',
    name: 'OTW Label',
    pitch: 'Music released under the OTW name — tracks, EPs, distribution.',
    cta: 'Coming soon',
    status: 'soon',
  },
];

function useFlipWord(intervalMs = 2200, exitMs = 380) {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const exitTimeout = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((current) => {
        setPrevIndex(current);
        if (exitTimeout.current) clearTimeout(exitTimeout.current);
        exitTimeout.current = setTimeout(() => setPrevIndex(null), exitMs);
        return (current + 1) % FLIP_WORDS.length;
      });
    }, intervalMs);
    return () => {
      clearInterval(id);
      if (exitTimeout.current) clearTimeout(exitTimeout.current);
    };
  }, [intervalMs, exitMs]);

  return { word: FLIP_WORDS[index], prevWord: prevIndex !== null ? FLIP_WORDS[prevIndex] : null, index };
}

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Home({ packages, djs, categories, goTo, goToQuote, goToDj }) {
  const previewDjs = djs.slice(0, 4);
  const previewPackages = packages.slice(0, 3);
  const [activeSlug, setActiveSlug] = useState(null);
  const bubbleCategories = BUBBLE_SLUGS
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter(Boolean);
  const activeCategory = bubbleCategories.find((c) => c.slug === activeSlug) || null;
  const { word, prevWord, index } = useFlipWord();

  const handleDivisionClick = (division) => {
    if (division.status !== 'live') return;
    if (division.key === 'events') { scrollToId('events-intro'); return; }
    if (division.key === 'artists') { goTo('djs'); return; }
  };

  return (
    <>
      <section className="hub-hero">
        <div className="hub-hero-glow" style={{ '--glow-color': word.color }} />
        <div className="section-wide hub-hero-inner">
          <div className="hub-hero-lockup">
            <span className="hub-hero-otw">OTW</span>
            <span className="flip-stage">
              {prevWord && (
                <span className="flip-word leave" style={{ '--word-color': prevWord.color }}>
                  {prevWord.text}
                </span>
              )}
              <span key={index} className="flip-word enter" style={{ '--word-color': word.color }}>
                {word.text}
              </span>
            </span>
          </div>
          <div className="hub-hero-underline" style={{ background: word.color }} />
          <p className="hub-hero-sub">
            One name, four ways in — production, artists, training and releases, all under one roof.
          </p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <button className="btn-solid" onClick={() => goToQuote()}>Get a quote</button>
            <button className="btn-outline" onClick={() => scrollToId('events-intro')}>See how it works</button>
          </div>
        </div>
      </section>

      <section className="division-section">
        <div className="section-wide">
          <div className="division-head">
            <h2>Four doors, one OTW</h2>
            <p>Pick the one that's you — each has its own path from here.</p>
          </div>

          <div className="division-grid">
            {DIVISIONS.map((d) => (
              <button
                key={d.key}
                type="button"
                className="division-card"
                style={{ '--card-color': d.color, '--card-tint': d.tint }}
                onClick={() => handleDivisionClick(d)}
                disabled={d.status !== 'live'}
              >
                {d.status !== 'live' && <span className="division-soon-tag">Coming soon</span>}
                <div className="division-icon" aria-hidden="true">{d.icon}</div>
                <div className="division-for">{d.for}</div>
                <div className="division-name">{d.name}</div>
                <div className="division-pitch">{d.pitch}</div>
                <div className="division-cta">
                  {d.cta}
                  {d.status === 'live' && <span className="arrow" aria-hidden="true">→</span>}
                </div>
              </button>
            ))}
          </div>

          <div className="pipeline">
            <div className="pipeline-label">How it fits together</div>
            <div className="pipeline-row">
              <span className="pipeline-step" style={{ '--step-tint': 'var(--cyan-tint)', '--step-color': 'var(--cyan)' }}>
                🎓 Academy trains
              </span>
              <span className="pipeline-arrow" aria-hidden="true">→</span>
              <span className="pipeline-step" style={{ '--step-tint': 'var(--violet-tint)', '--step-color': 'var(--violet)' }}>
                🎧 Artists books
              </span>
              <span className="pipeline-arrow" aria-hidden="true">→</span>
              <span className="pipeline-step" style={{ '--step-tint': 'var(--amber-tint)', '--step-color': 'var(--amber)' }}>
                🎛️ Events produces
              </span>
              <span className="pipeline-arrow" aria-hidden="true">→</span>
              <span className="pipeline-step" style={{ '--step-tint': 'var(--magenta-tint)', '--step-color': 'var(--magenta)' }}>
                🎤 Label releases
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight" id="events-intro" style={{ paddingBottom: 0 }}>
        <div className="section-wide">
          <span className="subsection-tag">OTW Events</span>
          <h2 style={{ marginTop: 14, maxWidth: '20ch' }}>Everything your event needs, handled by one team.</h2>
          <p className="lead" style={{ marginTop: 12 }}>
            You bring the guest list. We bring the DJ, the sound, the lighting and the people to run
            it — sized to your event, not a one-size-fits-all package.
          </p>
        </div>
      </section>

      <section className="section-tight">
        <div className="section-wide">
          <h2>How it works</h2>
          <div className="steps">
            {STEPS.map(([title, body], i) => (
              <div key={title}>
                <div className="step-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="step-title">{title}</div>
                <p className="small">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {bubbleCategories.length > 0 && (
        <section className="section-tight">
          <div className="section-wide">
            <h2>What we bring</h2>
            <p style={{ marginTop: 8 }}>
              {activeCategory
                ? `${activeCategory.name} — tap an option, or hit back.`
                : 'DJs, equipment, sound and lighting — tap one to see how it breaks down.'}
            </p>
            {!activeCategory ? (
              <div className="bubble-field" style={{ paddingTop: 32 }}>
                {bubbleCategories.map((c, i) => (
                  <button
                    key={c.id}
                    className="bubble"
                    style={{ '--float-delay': `${(i % 5) * 0.6}s` }}
                    onClick={() => setActiveSlug(c.slug)}
                  >
                    <span className="bubble-icon" aria-hidden="true">{iconFor(c.slug)}</span>
                    {c.name}
                    <span className="bubble-hint" aria-hidden="true">+</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bubble-cluster">
                <button
                  className="bubble-fan-header"
                  onClick={() => setActiveSlug(null)}
                  aria-label={`Close ${activeCategory.name}`}
                >
                  <span className="bubble-icon" aria-hidden="true">{iconFor(activeCategory.slug)}</span>
                  {activeCategory.name}
                  <span className="bubble-fan-header-x" aria-hidden="true">✕</span>
                </button>
                <div className="bubble-fan">
                  {(SUB_ITEMS[activeCategory.slug] || []).map((label, i) => (
                    <button
                      key={label}
                      className="bubble-fan-sub"
                      style={{ '--sub-delay': `${i * 0.05}s` }}
                      onClick={() => goToQuote([activeCategory.slug])}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button type="button" className="bubble-back" onClick={() => setActiveSlug(null)}>
                  ← Back
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {previewPackages.length > 0 && (
        <section className="section-tight">
          <div className="section-wide">
            <h2>Fixed packages, if that's easier</h2>
            <p style={{ marginTop: 8 }}>A starting point — every one of these can be adjusted to what you actually need.</p>
            <div className="packages-grid">
              {previewPackages.map((p) => (
                <div key={p.id} className={`panel package-panel ${p.is_featured ? 'featured' : ''}`}>
                  <h3>{p.name}</h3>
                  <p className="small">{p.tagline}</p>
                  <div className="package-price">{p.price_from ? `From €${p.price_from}` : 'On request'}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24 }}>
              <button className="btn-outline" onClick={() => goTo('packages')}>Compare packages</button>
            </div>
          </div>
        </section>
      )}

      {previewDjs.length > 0 && (
        <section className="section-tight">
          <div className="section-wide">
            <h2>The DJs</h2>
            <p style={{ marginTop: 8 }}>A network of resident and guest DJs across house, techno and everything between.</p>
            <div className="dj-grid">
              {previewDjs.map((dj) => (
                <button key={dj.id} className="dj-card" onClick={() => goToDj(dj.id)}>
                  <div className="dj-photo">
                    {dj.image_url ? <img src={dj.image_url} alt={dj.name} /> : dj.name.slice(0, 1)}
                  </div>
                  <div className="dj-name">{dj.name}</div>
                  <div className="dj-meta">{dj.location}</div>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 24 }}>
              <button className="btn-outline" onClick={() => goTo('djs')}>Meet the DJs</button>
            </div>
          </div>
        </section>
      )}

      <section className="section-tight">
        <div className="section-wide panel" style={{ textAlign: 'center', padding: '56px 32px' }}>
          <h2>Tell us about your event. We'll figure out the rest.</h2>
          <p style={{ margin: '12px auto 0', textAlign: 'center' }}>Two minutes, no obligation, a real answer within a business day.</p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <button className="btn-solid" onClick={() => goToQuote()}>Get a quote</button>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="section-wide" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, alignItems: 'center' }}>
          <div>
            <h2>More than a roster. A community of artists.</h2>
            <p style={{ marginTop: 12 }}>
              Every DJ on Off The World is reviewed and published by us, not self-listed. If you play
              and want to be part of the network, we'd like to hear what you do.
            </p>
            <button className="btn-outline" onClick={() => goTo('join')}>Join OTW</button>
          </div>
        </div>
      </section>
    </>
  );
}
