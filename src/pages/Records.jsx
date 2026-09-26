import { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { HalfWorld } from '../components/ui.jsx';

const DATE_FMT = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', timeZone: 'Europe/Brussels' });
const shortDate = (d) => DATE_FMT.format(new Date(d)).replace('/', '.');

// ReleaseCard per the DS brief: square colour artwork, catalogue no. in label
// style, title in display 28px, artist in body, format tags.
function ReleaseCard({ release }) {
  const upcoming = release.release_date && new Date(release.release_date) > new Date();
  const href = upcoming ? release.presave_url : release.listen_url;
  return (
    <article className="card release-card">
      <div className="release-art">
        {release.artwork_url ? <img src={release.artwork_url} alt={`${release.title} artwork`} loading="lazy" /> : <span className="label label-xs muted">{release.id}</span>}
      </div>
      <div className="label label-xs accent">{release.id}{release.release_date ? ` · ${shortDate(release.release_date)}` : ''}</div>
      <h3 className="release-title">{release.title}</h3>
      <p className="muted">{release.artist}</p>
      {release.formats?.length > 0 && (
        <div className="tags" style={{ marginTop: 'var(--space-4)' }}>
          {release.formats.map((f) => <span key={f} className="tag">{f}</span>)}
        </div>
      )}
      {href && (
        <a className="btn btn-ghost" style={{ marginTop: 'var(--space-5)' }} href={href} target="_blank" rel="noreferrer">
          {upcoming ? 'Pre-save →' : 'Listen →'}
        </a>
      )}
    </article>
  );
}

function DemoForm() {
  const [form, setForm] = useState({ artistName: '', email: '', link: '', genre: '', message: '' });
  const [status, setStatus] = useState('idle');
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.artistName || !form.email || !form.link) return;
    setStatus('sending');
    const { error } = await supabase.from('demo_submissions').insert({
      artist_name: form.artistName,
      email: form.email,
      link: form.link,
      genre: form.genre || null,
      message: form.message || null,
    });
    setStatus(error ? 'error' : 'sent');
  };

  if (status === 'sent') {
    return (
      <div className="field-block">
        <div className="label label-xs">Demo received</div>
        <h2 style={{ marginTop: 'var(--space-4)' }}>Thanks. We'll listen.</h2>
        <p style={{ marginTop: 'var(--space-4)' }}>If it's a fit for the label, we'll be in touch.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <div className="field-row">
        <div className="field">
          <label className="label label-xs" htmlFor="d-name">Artist name</label>
          <input id="d-name" required value={form.artistName} onChange={set('artistName')} />
        </div>
        <div className="field">
          <label className="label label-xs" htmlFor="d-email">Email</label>
          <input id="d-email" type="email" required value={form.email} onChange={set('email')} />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label className="label label-xs" htmlFor="d-link">Private link</label>
          <input id="d-link" type="url" required placeholder="SoundCloud, Dropbox, Drive" value={form.link} onChange={set('link')} />
        </div>
        <div className="field">
          <label className="label label-xs" htmlFor="d-genre">Genre</label>
          <input id="d-genre" placeholder="Afro House, Melodic Techno" value={form.genre} onChange={set('genre')} />
        </div>
      </div>
      <div className="field">
        <label className="label label-xs" htmlFor="d-msg">About the track (optional)</label>
        <textarea id="d-msg" value={form.message} onChange={set('message')} />
      </div>
      <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending' : 'Send demo'}</button>
      {status === 'error' && <p className="form-status error">That didn't send. Try again in a moment.</p>}
    </form>
  );
}

export default function Records({ releases }) {
  const [format, setFormat] = useState(null);
  const now = new Date();
  const upcoming = releases.filter((r) => r.release_date && new Date(r.release_date) > now);
  const out = releases.filter((r) => !r.release_date || new Date(r.release_date) <= now);
  const featured = upcoming[upcoming.length - 1] || out[0] || null; // nearest upcoming, else latest
  const formats = [...new Set(releases.flatMap((r) => r.formats || []))];
  const catalogue = releases.filter((r) => !format || (r.formats || []).includes(format));
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <>
      {featured ? (
        <section className="hero">
          <div className="wrap hero-inner release-hero">
            <div>
              <div className="eyebrow label"><HalfWorld size={16} />OTW Records · {upcoming.includes(featured) ? 'Out soon' : 'Latest release'}</div>
              <div className="label accent">{featured.id}</div>
              <h1 style={{ marginTop: 'var(--space-4)' }}>{featured.title}</h1>
              <p className="lead">{featured.artist}{featured.release_date ? ` · ${shortDate(featured.release_date)}` : ''}</p>
              <div className="actions">
                {featured.listen_url && !upcoming.includes(featured) && <a className="btn btn-primary" href={featured.listen_url} target="_blank" rel="noreferrer">Listen</a>}
                {featured.presave_url && upcoming.includes(featured) && <a className="btn btn-primary" href={featured.presave_url} target="_blank" rel="noreferrer">Pre-save</a>}
                <button className="btn btn-secondary" onClick={() => scrollTo('demos')}>Send a demo</button>
              </div>
            </div>
            <div className="release-art release-art-lg">
              {featured.artwork_url ? <img src={featured.artwork_url} alt={`${featured.title} artwork`} /> : <span className="label muted">{featured.id}</span>}
            </div>
          </div>
        </section>
      ) : (
        <section className="hero hero-division">
          <div className="hero-rise" aria-hidden="true" />
          <div className="wrap hero-inner">
            <div className="eyebrow label"><HalfWorld size={16} />OTW Records</div>
            <h1>Music released under the OTW name.</h1>
            <p className="lead">Tracks, EPs and distribution for artists in and around the crew. The catalogue starts at OTW001.</p>
            <div className="actions">
              <button className="btn btn-primary" onClick={() => scrollTo('demos')}>Send a demo</button>
            </div>
          </div>
        </section>
      )}

      {featured?.presave_url && upcoming.includes(featured) && (
        <a className="cta-bar" href={featured.presave_url} target="_blank" rel="noreferrer">
          <span>Pre-save · {featured.id}</span>
          <span>{shortDate(featured.release_date)} →</span>
        </a>
      )}

      <section className="section">
        <div className="wrap">
          <div className="section-head"><h2>Catalogue</h2></div>
          {releases.length === 0 ? (
            <p className="empty">OTW001 is on the way. Sign up to the newsletter below to hear it first.</p>
          ) : (
            <>
              {formats.length > 1 && (
                <div className="tags" style={{ marginBottom: 'var(--space-7)' }}>
                  {formats.map((f) => <button key={f} className="tag" aria-pressed={format === f} onClick={() => setFormat(format === f ? null : f)}>{f}</button>)}
                </div>
              )}
              <div className="release-grid">
                {catalogue.map((r) => <ReleaseCard key={r.id} release={r} />)}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="cells cells-3">
            {[
              ['For artists', 'Open to OTW artists and outside submissions.'],
              ['What we handle', 'Distribution, artwork and release scheduling.'],
              ['Where it goes', 'Releases get played out at OTW nights and by the roster.'],
            ].map(([t, b]) => (
              <div key={t}>
                <HalfWorld size={24} />
                <div className="step-title label">{t}</div>
                <p className="muted">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="demos" style={{ scrollMarginTop: 80 }}>
        <div className="wrap split">
          <div>
            <div className="eyebrow label"><HalfWorld size={16} />Demos</div>
            <h2>Send us your music</h2>
            <p className="body" style={{ marginTop: 'var(--space-5)' }}>
              Private links only, no attachments. Finished or near-finished tracks. We listen to everything and reply if it's a fit.
            </p>
          </div>
          <DemoForm />
        </div>
      </section>
    </>
  );
}
