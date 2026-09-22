const CONTACT_EMAIL = 'hello@offtheworld.events';

export default function Footer({ setTab }) {
  return (
    <footer className="site-footer">
      <div className="section-wide">
        <div className="otw-mark" style={{ marginBottom: 4 }}>OTW <span>·</span></div>
        <p className="small" style={{ maxWidth: 420 }}>
          Events, artists, training and releases — one name, four ways in.
        </p>
        <nav className="footer-links">
          <button onClick={() => setTab('events')}>Events</button>
          <button onClick={() => setTab('artists')}>Artists</button>
          <button onClick={() => setTab('academy')}>Academy</button>
          <button onClick={() => setTab('label')}>Label</button>
          <button onClick={() => setTab('quote')}>Get a quote</button>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </nav>
        <div className="footer-bottom">
          © {new Date().getFullYear()} Off The World.
        </div>
      </div>
    </footer>
  );
}

export { CONTACT_EMAIL };
