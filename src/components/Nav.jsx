import { useState } from 'react';

const LINKS = [
  ['services', 'Services'],
  ['djs', 'DJs'],
  ['packages', 'Packages'],
  ['join', 'Join OTW'],
];

export default function Nav({ tab, setTab }) {
  const [open, setOpen] = useState(false);

  const go = (t) => { setTab(t); setOpen(false); };

  return (
    <header className="nav">
      <div className="nav-inner">
        <button className="otw-mark" onClick={() => go('home')} aria-label="Off The World, home">
          OTW <span>·</span>
        </button>

        <nav className="nav-links">
          {LINKS.map(([key, label]) => (
            <button key={key} className={tab === key ? 'active' : ''} onClick={() => go(key)}>
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
            <button key={key} className={tab === key ? 'active' : ''} onClick={() => go(key)}>
              {label}
            </button>
          ))}
          <button className={tab === 'quote' ? 'active' : ''} onClick={() => go('quote')}>Get a quote</button>
        </div>
      )}
    </header>
  );
}
