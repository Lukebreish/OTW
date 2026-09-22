import { useEffect, useRef, useState } from 'react';

const FLIP_WORDS = [
  { key: 'events', text: 'EVENTS', color: 'var(--amber)' },
  { key: 'artists', text: 'ARTISTS', color: 'var(--violet)' },
  { key: 'academy', text: 'ACADEMY', color: 'var(--magenta)' },
  { key: 'label', text: 'LABEL', color: 'var(--cyan)' },
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
  },
  {
    key: 'academy',
    icon: '\u{1F393}',
    color: 'var(--magenta)',
    tint: 'var(--magenta-tint)',
    for: 'For aspiring DJs & producers',
    name: 'OTW Academy',
    pitch: 'Learn to DJ and produce with mentorship and studio time.',
    cta: "See what's coming",
  },
  {
    key: 'label',
    icon: '\u{1F4BF}',
    color: 'var(--cyan)',
    tint: 'var(--cyan-tint)',
    for: 'For artists & platforms',
    name: 'OTW Label',
    pitch: 'Music released under the OTW name — tracks, EPs, distribution.',
    cta: "See what's coming",
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

export default function Home({ goTo }) {
  const { word, prevWord, index } = useFlipWord();

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
            <button className="btn-solid" onClick={() => goTo('events')}>Get a quote</button>
            <button
              className="btn-outline"
              onClick={() => document.getElementById('divisions')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              See what we do
            </button>
          </div>
        </div>
      </section>

      <section className="division-section" id="divisions">
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
                onClick={() => goTo(d.key)}
              >
                <div className="division-icon" aria-hidden="true">{d.icon}</div>
                <div className="division-for">{d.for}</div>
                <div className="division-name">{d.name}</div>
                <div className="division-pitch">{d.pitch}</div>
                <div className="division-cta">
                  {d.cta}
                  <span className="arrow" aria-hidden="true">→</span>
                </div>
              </button>
            ))}
          </div>

          <div className="pipeline">
            <div className="pipeline-label">How it fits together</div>
            <div className="pipeline-row">
              <span className="pipeline-step" style={{ '--step-tint': 'var(--magenta-tint)', '--step-color': 'var(--magenta)' }}>
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
              <span className="pipeline-step" style={{ '--step-tint': 'var(--cyan-tint)', '--step-color': 'var(--cyan)' }}>
                💿 Label releases
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
