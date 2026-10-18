import { HalfWorld, Logo } from './ui.jsx';
import { CONTACT_EMAIL } from '../lib/routes.js';
import MessageForm from './MessageForm.jsx';

const COLUMNS = [
  ['events', 'Events', [['events', 'Upcoming nights'], ['services', 'Production'], ['packages', 'Packages'], ['quote', 'Get a quote']]],
  ['academy', 'Academy', [['academy', 'Courses'], ['artists', 'Artists'], ['join', 'Join OTW'], ['artist-services', 'Work with us']]],
  ['records', 'Records', [['records', 'Releases'], ['records', 'Submit a demo']]],
];

export default function Footer({ go }) {
  return (
    <footer className="footer" data-entity="main">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo layout="stacked" className="footer-logo" />
          </div>

          {COLUMNS.map(([entity, name, links]) => (
            <div key={entity} className="footer-col" data-entity={entity}>
              <h4 className="label"><HalfWorld size={16} />{name}</h4>
              <ul>
                {links.map(([key, label]) => (
                  <li key={label}><button onClick={() => go(key)}>{label}</button></li>
                ))}
              </ul>
            </div>
          ))}

          <div className="footer-col footer-news">
            <h4 className="label"><HalfWorld size={16} />Newsletter</h4>
            <p className="muted" style={{ marginBottom: 'var(--space-4)' }}>Nights, courses and releases. Once a month.</p>
            <MessageForm topic="newsletter" variant="inline" id="nl" button="Sign up" done="You're on the list." />
          </div>
        </div>

        <div className="footer-bottom label label-xs">
          <span>© {new Date().getFullYear()} OTW · Off The World · Brussels</span>
          <div className="footer-socials">
            <button onClick={() => go('privacy')}>Privacy</button>
            <a href={`mailto:${CONTACT_EMAIL}`}>Email</a>
            <a href="https://instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
