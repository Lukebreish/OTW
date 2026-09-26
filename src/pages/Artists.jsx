import { useEffect, useRef, useState } from 'react';
import { HalfWorld } from '../components/ui.jsx';

export default function Artists({ djs, initialSelected, onDone, go, goToQuote }) {
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
  const toggle = (id) => setSelectedId((current) => (current === id ? null : id));
  const links = selected
    ? [['Instagram', selected.instagram], ['SoundCloud', selected.soundcloud], ['Mixcloud', selected.mixcloud], ['Spotify', selected.spotify]].filter(([, url]) => url)
    : [];

  return (
    <>
      <section className="section">
        <div className="wrap">
          <div className="eyebrow label"><HalfWorld size={16} />OTW Academy · Artists</div>
          <h1>The artists</h1>
          <p className="lead" style={{ marginTop: 'var(--space-5)' }}>
            Every artist here is reviewed and published by OTW. Pick one for genres, links and their story.
          </p>

          {djs.length === 0 ? (
            <p className="empty" style={{ marginTop: 'var(--space-7)' }}>No published artists yet. Ask us who's available.</p>
          ) : (
            <div className="artist-grid" style={{ marginTop: 'var(--space-8)' }}>
              {djs.map((dj) => (
                <button key={dj.id} type="button" className="artist-card" onClick={() => toggle(dj.id)} aria-pressed={dj.id === selectedId}>
                  <div className="artist-photo">
                    {dj.image_url ? <img src={dj.image_url} alt="" loading="lazy" /> : <span className="artist-initial">{dj.name.slice(0, 1)}</span>}
                  </div>
                  <div className="artist-name">{dj.name}</div>
                  <div className="artist-meta label label-xs">{[dj.role, dj.location].filter(Boolean).join(' · ')}</div>
                </button>
              ))}
            </div>
          )}

          {selected && (
            <div className="profile" ref={panelRef}>
              <div className="profile-photo">
                {selected.image_url && <img src={selected.image_url} alt={selected.name} />}
              </div>
              <div>
                <div className="profile-head">
                  <div>
                    <div className="label label-xs muted">
                      {[selected.role, selected.location, selected.years_experience ? `${selected.years_experience} yrs` : null].filter(Boolean).join(' · ')}
                    </div>
                    <h2 style={{ marginTop: 'var(--space-3)' }}>{selected.name}</h2>
                  </div>
                  <button type="button" className="btn btn-ghost" onClick={() => setSelectedId(null)}>Close</button>
                </div>
                {selected.bio && <p className="profile-bio">{selected.bio}</p>}
                {Array.isArray(selected.genres) && selected.genres.length > 0 && (
                  <div className="tags" style={{ marginTop: 'var(--space-5)' }}>
                    {selected.genres.map((g) => <span key={g} className="tag">{g}</span>)}
                  </div>
                )}
                {links.length > 0 && (
                  <div className="profile-links label label-xs">
                    {links.map(([name, url]) => <a key={name} href={url} target="_blank" rel="noreferrer">{name} →</a>)}
                  </div>
                )}
                <div className="actions">
                  <button className="btn btn-primary" onClick={() => goToQuote(['djs'])}>Book {selected.name}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="band" data-entity="academy">
        <div className="wrap band-inner">
          <h2>Play with us</h2>
          <p>More than a roster. If you play and want in, we'd like to hear what you do.</p>
          <button className="btn" onClick={() => go('join')}>Join OTW →</button>
        </div>
      </section>
    </>
  );
}
