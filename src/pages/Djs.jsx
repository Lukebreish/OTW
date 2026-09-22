import { useEffect, useRef, useState } from 'react';

export default function Djs({ djs, initialSelected, onDone, goTo }) {
  const [selectedId, setSelectedId] = useState(initialSelected);
  const panelRef = useRef(null);

  useEffect(() => {
    if (initialSelected) {
      setSelectedId(initialSelected);
      onDone();
    }
  }, [initialSelected, onDone]);

  useEffect(() => {
    if (selectedId && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedId]);

  const selected = djs.find((d) => d.id === selectedId);
  const selectDj = (id) => setSelectedId((current) => (current === id ? null : id));

  return (
    <section className="section">
      <div className="section-wide">
        <h1>The DJs</h1>
        <p className="lead" style={{ marginTop: 12 }}>
          Every DJ here is reviewed and published by Off The World — click a face for genres,
          links and their story.
        </p>

        {djs.length === 0 ? (
          <div className="panel" style={{ marginTop: 24 }}>
            <p>No published DJs yet — check back soon, or ask us directly who's available.</p>
          </div>
        ) : (
          <div className="dj-grid" style={{ marginTop: 32 }}>
            {djs.map((dj) => (
              <button
                key={dj.id}
                type="button"
                className={`dj-card ${dj.id === selectedId ? 'active' : ''}`}
                onClick={() => selectDj(dj.id)}
                aria-pressed={dj.id === selectedId}
              >
                <div className="dj-photo">
                  {dj.image_url ? <img src={dj.image_url} alt={dj.name} loading="lazy" /> : dj.name.slice(0, 1)}
                </div>
                <div className="dj-name">{dj.name}</div>
                <div className="dj-meta">{dj.location}</div>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="dj-profile-panel" ref={panelRef}>
            <div className="dj-profile-head">
              <div className="dj-profile-portrait">
                <div className="dj-profile-ring">
                  {selected.image_url ? (
                    <img src={selected.image_url} alt={selected.name} />
                  ) : (
                    <div className="dj-profile-ring-fallback">{selected.name.slice(0, 1)}</div>
                  )}
                </div>
                <div className="dj-profile-name">{selected.name}</div>
                <div className="dj-profile-location">
                  {selected.location}
                  {selected.years_experience ? ` · ${selected.years_experience}y` : ''}
                </div>
              </div>

              <div className="dj-profile-note">
                <div className="dj-profile-eyebrow">About {selected.name}</div>
                {selected.bio && <blockquote className="dj-profile-quote">&ldquo;{selected.bio}&rdquo;</blockquote>}
                <button type="button" className="dj-profile-close" onClick={() => setSelectedId(null)}>
                  Close ×
                </button>

                {Array.isArray(selected.genres) && selected.genres.length > 0 && (
                  <div className="dj-genres" style={{ marginTop: 18 }}>
                    {selected.genres.map((g) => (
                      <span key={g} className="dj-genre-tag">{g}</span>
                    ))}
                  </div>
                )}

                <div className="dj-profile-links">
                  {selected.instagram && <a href={selected.instagram} target="_blank" rel="noreferrer">Instagram</a>}
                  {selected.soundcloud && <a href={selected.soundcloud} target="_blank" rel="noreferrer">SoundCloud</a>}
                  {selected.mixcloud && <a href={selected.mixcloud} target="_blank" rel="noreferrer">Mixcloud</a>}
                  {selected.spotify && <a href={selected.spotify} target="_blank" rel="noreferrer">Spotify</a>}
                </div>

                <button className="btn-solid" style={{ marginTop: 20, alignSelf: 'flex-start' }} onClick={() => goTo('quote')}>
                  Book {selected.name}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
