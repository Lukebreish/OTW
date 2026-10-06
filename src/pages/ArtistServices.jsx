import { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { HalfWorld } from '../components/ui.jsx';
import Honeypot from '../components/Honeypot.jsx';

const SERVICES = [
  ['events', 'Events', 'Your own night, launch or showcase, produced for you.'],
  ['photoshoot', 'Photoshoot', 'Press and social photos that look like your sound.'],
  ['ghost-production', 'Production', 'Tracks made to your brief and references.'],
  ['spotify-promotion', 'Spotify promotion', 'A campaign to put a release in front of listeners.'],
  ['mix-mastering', 'Mix and mastering', 'Your stems, club-ready.'],
  ['training', 'Training', 'Production and DJ skills, one to one or in a group.'],
  ['mentoring', 'Mentoring', 'Ongoing guidance on your career and releases.'],
];

export default function ArtistServices({ go }) {
  const [service, setService] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', instagram: '', message: '' });
  const [trap, setTrap] = useState('');
  const [status, setStatus] = useState('idle');
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (trap) { setStatus('sent'); return; }
    if (!service || !form.name || !form.email || !form.phone.trim()) return;
    setStatus('sending');
    const { error } = await supabase.from('artist_requests').insert({
      service,
      name: form.name,
      email: form.email,
      phone: form.phone,
      instagram: form.instagram || null,
      message: form.message || null,
    });
    setStatus(error ? 'error' : 'sent');
  };

  if (status === 'sent') {
    return (
      <section className="section">
        <div className="wrap wrap-narrow">
          <div className="eyebrow label"><HalfWorld size={16} />Request sent</div>
          <h1>Got it. Thanks.</h1>
          <p className="lead" style={{ marginTop: 'var(--space-5)' }}>
            We'll come back to you within a couple of days to talk through what you need.
          </p>
          <div className="actions"><button className="btn btn-secondary" onClick={() => go('artists')}>See the artists →</button></div>
        </div>
      </section>
    );
  }

  const picked = SERVICES.find(([k]) => k === service);

  return (
    <section className="section">
      <div className="wrap wrap-narrow">
        <div className="eyebrow label"><HalfWorld size={16} />OTW Academy · For artists</div>
        <h1>Work with us</h1>
        <p className="lead" style={{ marginTop: 'var(--space-5)' }}>
          For artists. Pick what you need and tell us a little. We'll take it from there.
        </p>

        <form style={{ marginTop: 'var(--space-8)' }} onSubmit={submit}>
          <span className="label label-xs">What do you need?</span>
          <div className="tags" style={{ marginTop: 'var(--space-3)' }}>
            {SERVICES.map(([k, label]) => (
              <button key={k} type="button" className="tag tag-lg" aria-pressed={service === k} onClick={() => setService(k)}>{label}</button>
            ))}
          </div>
          {picked && <p className="muted" style={{ marginTop: 'var(--space-4)' }}>{picked[2]}</p>}

          <div className="field-row" style={{ marginTop: 'var(--space-7)' }}>
            <div className="field">
              <label className="label label-xs" htmlFor="as-name">Artist name</label>
              <input id="as-name" required value={form.name} onChange={set('name')} />
            </div>
            <div className="field">
              <label className="label label-xs" htmlFor="as-ig">Instagram</label>
              <input id="as-ig" placeholder="https://instagram.com/…" value={form.instagram} onChange={set('instagram')} />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="label label-xs" htmlFor="as-email">Email</label>
              <input id="as-email" type="email" required value={form.email} onChange={set('email')} />
            </div>
            <div className="field">
              <label className="label label-xs" htmlFor="as-phone">Phone</label>
              <input id="as-phone" type="tel" required value={form.phone} onChange={set('phone')} />
            </div>
          </div>
          <div className="field">
            <label className="label label-xs" htmlFor="as-msg">Tell us a little (optional)</label>
            <textarea id="as-msg" value={form.message} onChange={set('message')} />
          </div>

          <Honeypot value={trap} onChange={setTrap} />
          <button className="btn btn-primary" type="submit" disabled={status === 'sending' || !service}>
            {status === 'sending' ? 'Sending' : 'Send request'}
          </button>
          {!service && <p className="muted" style={{ marginTop: 'var(--space-3)' }}>Pick a service first.</p>}
          {status === 'error' && <p className="form-status error">That didn't send. Try again in a moment.</p>}
        </form>
      </div>
    </section>
  );
}
