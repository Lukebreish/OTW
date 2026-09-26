import { HalfWorld, Logo } from './ui.jsx';
import { CONTACT_EMAIL } from '../lib/routes.js';

const COLUMNS = [
  ['events', 'Events', [['events', 'Upcoming nights'], ['services', 'Production'], ['packages', 'Packages'], ['quote', 'Get a quote']]],
  ['academy', 'Academy', [['academy', 'Courses'], ['artists', 'Artists'], ['join', 'Join OTW']]],
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
            <form
              className="inline-form"
              onSubmit={(e) => {
                e.preventDefault();
                const email = new FormData(e.currentTarget).get('email');
                window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Newsletter')}&body=${encodeURIComponent(`Add me: ${email}`)}`;
              }}
            >
              <div className="field">
                <label htmlFor="nl-email" className="label label-xs">Email</label>
                <input id="nl-email" name="email" type="email" required placeholder="you@example.com" />
              </div>
              <button className="btn btn-primary" type="submit">Sign up</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom label label-xs">
          <span>© {new Date().getFullYear()} OTW · Off The World · Brussels</span>
          <div className="footer-socials">
            <a href={`mailto:${CONTACT_EMAIL}`}>Email</a>
            <a href="https://instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
