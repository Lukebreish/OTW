const CONTACT_EMAIL = 'hello@offtheworld.events';

export default function Footer({ setTab }) {
  return (
    <footer className="site-footer">
      <div className="section-wide">
        <div className="otw-mark" style={{ marginBottom: 4 }}>OTW <span>·</span></div>
        <p className="small" style={{ maxWidth: 420 }}>
          DJs, sound, lighting and production for events in Brussels and across Belgium.
        </p>
        <nav className="footer-links">
          <button onClick={() => setTab('services')}>Services</button>
          <button onClick={() => setTab('djs')}>DJs</button>
          <button onClick={() => setTab('packages')}>Packages</button>
          <button onClick={() => setTab('quote')}>Get a quote</button>
          <button onClick={() => setTab('join')}>Join OTW</button>
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
