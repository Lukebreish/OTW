import { useEffect, useState } from 'react';
import { HalfWorld, Icon, Logo } from './ui.jsx';
import { ENTITY_OF, NAV } from '../lib/routes.js';

export default function Header({ route, go }) {
  const [open, setOpen] = useState(false);
  const entity = ENTITY_OF[route] || 'main';
  const activeKey = route === 'about' ? 'about' : entity;

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const nav = (key) => { setOpen(false); go(key); };

  return (
    <header className="header" data-entity={entity}>
      <div className="wrap header-inner">
        <button className="header-logo" onClick={() => nav('home')} aria-label="Off The World, home">
          <Logo entity={entity} />
        </button>

        <nav className="header-nav" aria-label="Main">
          {NAV.map(([key, label]) => (
            <button
              key={key}
              data-entity={key === 'about' ? 'main' : key}
              className={`label ${activeKey === key ? 'active' : ''}`}
              aria-current={activeKey === key ? 'page' : undefined}
              onClick={() => nav(key)}
            >
              <HalfWorld size={16} />
              {label}
            </button>
          ))}
        </nav>

        <div className="header-right">
          <button className="btn btn-primary btn-sm header-cta" data-entity="events" onClick={() => nav('quote')}>
            Get a quote
          </button>
          <button className="header-menu-btn" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
            <Icon name="menu" />
          </button>
        </div>
      </div>

      {open && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="wrap overlay-top">
            <span className="header-logo"><Logo entity={entity} /></span>
            <button className="header-menu-btn" style={{ display: 'inline-flex' }} onClick={() => setOpen(false)} aria-label="Close menu">
              <Icon name="x" />
            </button>
          </div>
          <nav className="wrap overlay-nav" aria-label="Mobile">
            {NAV.map(([key, label]) => (
              <button key={key} data-entity={key === 'about' ? 'main' : key} onClick={() => nav(key)}>
                <HalfWorld size={24} />
                {label}
              </button>
            ))}
            <button data-entity="events" onClick={() => nav('quote')}>
              <HalfWorld size={24} />
              Get a quote
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
