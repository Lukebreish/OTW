import { useEffect, useState } from 'react';
import { HalfWorld, Icon, Logo } from './ui.jsx';
import { ENTITY_OF, NAV } from '../lib/routes.js';
import { useLang, readyLangs } from '../lib/i18n.jsx';

// EN / FR / NL. Hidden until a second language is marked ready in lib/i18n.jsx.
function LangSwitch({ className = '' }) {
  const { lang, setLang, t } = useLang();
  const langs = readyLangs();
  if (langs.length < 2) return null;
  return (
    <div className={`lang-switch ${className}`} role="group" aria-label={t('nav.lang')}>
      {langs.map((l) => (
        <button key={l.code} className="label label-xs" lang={l.code} title={l.name}
          aria-pressed={lang === l.code} onClick={() => setLang(l.code)}>{l.label}</button>
      ))}
    </div>
  );
}

export default function Header({ route, go }) {
  const [open, setOpen] = useState(false);
  const { t } = useLang();
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
        <button className="header-logo" onClick={() => nav('home')} aria-label={t('nav.home')}>
          <Logo entity={entity} />
        </button>

        <nav className="header-nav" aria-label="Main">
          {NAV.map(([key]) => (
            <button
              key={key}
              data-entity={key === 'about' ? 'main' : key}
              className={`label ${activeKey === key ? 'active' : ''}`}
              aria-current={activeKey === key ? 'page' : undefined}
              onClick={() => nav(key)}
            >
              <HalfWorld size={16} />
              {t(`nav.${key}`)}
            </button>
          ))}
        </nav>

        <div className="header-right">
          <LangSwitch />
          <button className="btn btn-primary btn-sm header-cta" data-entity="events" onClick={() => nav('quote')}>
            {t('nav.quote')}
          </button>
          <button className="header-menu-btn" onClick={() => setOpen(true)} aria-label={t('nav.menu.open')} aria-expanded={open}>
            <Icon name="menu" />
          </button>
        </div>
      </div>

      {open && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="wrap overlay-top">
            <span className="header-logo"><Logo entity={entity} /></span>
            <button className="header-menu-btn" style={{ display: 'inline-flex' }} onClick={() => setOpen(false)} aria-label={t('nav.menu.close')}>
              <Icon name="x" />
            </button>
          </div>
          <nav className="wrap overlay-nav" aria-label="Mobile">
            {NAV.map(([key]) => (
              <button key={key} data-entity={key === 'about' ? 'main' : key} onClick={() => nav(key)}>
                <HalfWorld size={24} />
                {t(`nav.${key}`)}
              </button>
            ))}
            <button data-entity="events" onClick={() => nav('quote')}>
              <HalfWorld size={24} />
              {t('nav.quote')}
            </button>
            <LangSwitch className="lang-switch-overlay" />
          </nav>
        </div>
      )}
    </header>
  );
}
