import { useEffect, useState } from 'react';

export default function Djs({ djs, initialSelected, onDone, goTo }) {
  const [selectedId, setSelectedId] = useState(initialSelected);

  useEffect(() => {
    if (initialSelected) {
      setSelectedId(initialSelected);
      onDone();
    }
  }, [initialSelected, onDone]);

  const selected = djs.find((d) => d.id === selectedId);

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
          <div className="dj-grid">
            {djs.map((dj) => (
              <button
                key={dj.id}
                className={`dj-card ${dj.id === selectedId ? 'active' : ''}`}
                onClick={() => setSelectedId(dj.id === selectedId ? null : dj.id)}
                aria-pressed={dj.id === selectedId}
              >
                <div className="dj-photo">
                  {dj.image_url ? <img src={dj.image_url} alt={dj.name} /> : dj.name.slice(0, 1)}
                </div>
                <div className="dj-name">{dj.name}</div>
                <div className="dj-meta">{dj.location}</div>
                {Array.isArray(dj.genres) && dj.genres.length > 0 && (
                  <div className="dj-genres">
                    {dj.genres.slice(0, 3).map((g) => (
                      <span key={g} className="dj-genre-tag">{g}</span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="panel dj-profile">
            <div>
              <div className="dj-photo" style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius)' }}>
                {selected.image_url ? (
                  <img src={selected.image_url} alt={selected.name} />
                ) : (
                  <div style={{ padding: '48px 0' }}>{selected.name.slice(0, 1)}</div>
                )}
              </div>
            </div>
            <div>
              <h3>{selected.name}</h3>
              <p className="small">
                {selected.location}
                {selected.years_experience ? ` · ${selected.years_experience} years playing` : ''}
              </p>
              {selected.bio && <p style={{ marginTop: 12 }}>{selected.bio}</p>}
              {Array.isArray(selected.genres) && selected.genres.length > 0 && (
                <div className="dj-genres" style={{ marginTop: 8 }}>
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
              <button className="btn-solid" style={{ marginTop: 20 }} onClick={() => goTo('quote')}>
                Book {selected.name}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
