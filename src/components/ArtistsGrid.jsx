import { useEffect, useRef, useState } from 'react';
import { useLang } from '../lib/i18n.jsx';

// Roster grid with in-place profile. Used on the Artists page, the Academy
// spotlight and the Events "book a DJ" section.
export default function ArtistsGrid({ djs, limit, initialSelected, onBook }) {
  const [selectedId, setSelectedId] = useState(initialSelected || null);
  const { t, loc } = useLang();
  const panelRef = useRef(null);

  useEffect(() => {
    if (selectedId && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedId]);

  const shown = limit ? djs.slice(0, limit) : djs;
  const selected = djs.find((d) => d.id === selectedId);
  const toggle = (id) => setSelectedId((current) => (current === id ? null : id));
  const links = selected
    ? [['Instagram', selected.instagram], ['SoundCloud', selected.soundcloud], ['Mixcloud', selected.mixcloud], ['Spotify', selected.spotify]].filter(([, url]) => url)
    : [];

  if (djs.length === 0) {
    return <p className="empty">{t('grid.empty')}</p>;
  }

  return (
    <>
      <div className="artist-grid">
        {shown.map((dj) => (
          <button key={dj.id} type="button" className="artist-card" onClick={() => toggle(dj.id)} aria-pressed={dj.id === selectedId}>
            <div className="artist-photo">
              {dj.image_url ? <img src={dj.image_url} alt="" loading="lazy" /> : <span className="artist-initial">{dj.name.slice(0, 1)}</span>}
              {dj.certified && <span className="tag tag-fill artist-cert">{t('grid.certified')}</span>}
            </div>
            <div className="artist-name">{dj.name}</div>
            <div className="artist-meta label label-xs">{[loc(dj, 'role'), dj.location].filter(Boolean).join(' · ')}</div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="profile" ref={panelRef}>
          <div className="profile-photo">
            {selected.image_url && <img src={selected.image_url} alt={selected.name} />}
          </div>
          <div>
            <div className="profile-head">
              <div>
                <div className="label label-xs muted">
                  {[loc(selected, 'role'), selected.location, selected.years_experience ? t('grid.years', { n: selected.years_experience }) : null].filter(Boolean).join(' · ')}
                </div>
                <h2 style={{ marginTop: 'var(--space-3)' }}>{selected.name}</h2>
              </div>
              <button type="button" className="btn btn-ghost" onClick={() => setSelectedId(null)}>{t('grid.close')}</button>
            </div>
            {selected.bio && <p className="profile-bio">{loc(selected, 'bio')}</p>}
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
            {onBook && (
              <div className="actions" data-entity="events">
                <button className="btn btn-primary" onClick={() => onBook(selected)}>{t('grid.book', { name: selected.name })}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
