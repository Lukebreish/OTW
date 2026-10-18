import { HalfWorld, Logo } from './ui.jsx';
import { CONTACT_EMAIL, INSTAGRAM_URL, SOUNDCLOUD_URL } from '../lib/routes.js';
import MessageForm from './MessageForm.jsx';
import { useLang } from '../lib/i18n.jsx';

const COLUMNS = [
  ['events', [['events', 'upcoming'], ['services', 'services'], ['packages', 'packages'], ['quote', 'quote']]],
  ['academy', [['academy', 'courses'], ['artists', 'artists'], ['join', 'join'], ['artist-services', 'work']]],
  ['records', [['records', 'releases'], ['records', 'demo']]],
];

export default function Footer({ go }) {
  const { t } = useLang();
  return (
    <footer className="footer" data-entity="main">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo layout="stacked" className="footer-logo" />
          </div>

          {COLUMNS.map(([entity, links]) => (
            <div key={entity} className="footer-col" data-entity={entity}>
              <h4 className="label"><HalfWorld size={16} />{t(`nav.${entity}`)}</h4>
              <ul>
                {links.map(([key, id]) => (
                  <li key={id}><button onClick={() => go(key)}>{t(`footer.${entity}.${id}`)}</button></li>
                ))}
              </ul>
            </div>
          ))}

          <div className="footer-col footer-news">
            <h4 className="label"><HalfWorld size={16} />{t('footer.news.title')}</h4>
            <p className="muted" style={{ marginBottom: 'var(--space-4)' }}>{t('footer.news.body')}</p>
            <MessageForm topic="newsletter" variant="inline" id="nl" button={t('footer.news.button')} done={t('footer.news.done')} />
          </div>
        </div>

        <div className="footer-bottom label label-xs">
          <span>© {new Date().getFullYear()} OTW · Off The World · Brussels</span>
          <div className="footer-socials">
            <button onClick={() => go('privacy')}>{t('footer.privacy')}</button>
            <a href={`mailto:${CONTACT_EMAIL}`}>{t('footer.email')}</a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">Instagram</a>
            <a href={SOUNDCLOUD_URL} target="_blank" rel="noreferrer">SoundCloud</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
