import { useState } from 'react';

const LINKS = [
  ['events', 'Events'],
  ['artists', 'Artists'],
  ['academy', 'Academy'],
  ['label', 'Label'],
];

// Sub-pages reached from within a division still highlight that division's nav item.
const DIVISION_OF = {
  events: 'events',
  services: 'events',
  packages: 'events',
  quote: 'events',
  artists: 'artists',
  join: 'artists',
  academy: 'academy',
  label: 'label',
};

export default function Nav({ tab, setTab }) {
  const [open, setOpen] = useState(false);
  const activeDivision = DIVISION_OF[tab] || null;

  const go = (t) => { setTab(t); setOpen(false); };

  return (
    <header className="nav">
      <div className="nav-inner">
        <button className="otw-mark" onClick={() => go('home')} aria-label="Off The World, home">
          OTW <span>·</span>
        </button>

        <nav className="nav-links">
          {LINKS.map(([key, label]) => (
            <button key={key} className={activeDivision === key ? 'active' : ''} onClick={() => go(key)}>
              {label}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-solid nav-cta" onClick={() => go('quote')}>Get a quote</button>
          <button className="nav-mobile-toggle" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {open && (
        <div className="nav-mobile-panel">
          {LINKS.map(([key, label]) => (
            <button key={key} className={activeDivision === key ? 'active' : ''} onClick={() => go(key)}>
              {label}
            </button>
          ))}
          <button className={tab === 'quote' ? 'active' : ''} onClick={() => go('quote')}>Get a quote</button>
        </div>
      )}
    </header>
  );
}
