import { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

const AVAILABILITY = ['Weekends only', 'Weekdays too', 'Flexible', 'Limited — ask me'];
const ROLES = ['DJ', 'DJ/Producer', 'Singer'];

export default function Join() {
  const [form, setForm] = useState({
    name: '', email: '', location: '', djName: '', role: '', genres: '', yearsExperience: '',
    bio: '', instagram: '', soundcloud: '', mixcloud: '', spotify: '', languages: '',
    availability: '', rate: '', notes: '',
  });
  const [status, setStatus] = useState('idle');

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.djName) return;
    setStatus('sending');
    const { error } = await supabase.from('dj_applications').insert({
      name: form.name,
      email: form.email,
      location: form.location || null,
      dj_name: form.djName,
      role: form.role || null,
      genres: form.genres ? form.genres.split(',').map((g) => g.trim()).filter(Boolean) : [],
      years_experience: form.yearsExperience ? Number(form.yearsExperience) : null,
      bio: form.bio || null,
      instagram: form.instagram || null,
      soundcloud: form.soundcloud || null,
      mixcloud: form.mixcloud || null,
      spotify: form.spotify || null,
      languages: form.languages ? form.languages.split(',').map((g) => g.trim()).filter(Boolean) : [],
      availability: form.availability || null,
      rate: form.rate || null,
      notes: form.notes || null,
      status: 'pending',
    });
    setStatus(error ? 'error' : 'sent');
  };

  if (status === 'sent') {
    return (
      <section className="section">
        <div className="section-narrow">
          <h1>Got it — thanks.</h1>
          <p style={{ marginTop: 16 }}>
            Your application is in front of our team. We listen to everyone who applies — if it's
            a fit, we'll be in touch to build your profile and get you on the site.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="section-narrow">
        <h1>Join OTW</h1>
        <p className="lead" style={{ marginTop: 12 }}>
          More than a booking list — a network of artists we actually vouch for. Tell us about what
          you play and where you've played it.
        </p>

        <form className="panel" style={{ marginTop: 32 }} onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="j-name">Your name</label>
              <input id="j-name" required value={form.name} onChange={set('name')} />
            </div>
            <div className="field">
              <label htmlFor="j-email">Email</label>
              <input id="j-email" type="email" required value={form.email} onChange={set('email')} />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="j-djname">Artist name</label>
              <input id="j-djname" required value={form.djName} onChange={set('djName')} />
            </div>
            <div className="field">
              <label htmlFor="j-role">Role</label>
              <select id="j-role" value={form.role} onChange={set('role')}>
                <option value="">Select one</option>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="j-location">Location</label>
              <input id="j-location" value={form.location} onChange={set('location')} />
            </div>
            <div className="field">
              <label htmlFor="j-years">Years playing</label>
              <input id="j-years" type="number" min="0" value={form.yearsExperience} onChange={set('yearsExperience')} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="j-genres">Genres (comma separated)</label>
            <input id="j-genres" placeholder="Afro House, Tech House" value={form.genres} onChange={set('genres')} />
          </div>

          <div className="field">
            <label htmlFor="j-bio">Bio</label>
            <textarea id="j-bio" placeholder="Who you are, what you play, what a set with you feels like." value={form.bio} onChange={set('bio')} />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="j-ig">Instagram</label>
              <input id="j-ig" placeholder="https://instagram.com/…" value={form.instagram} onChange={set('instagram')} />
            </div>
            <div className="field">
              <label htmlFor="j-sc">SoundCloud</label>
              <input id="j-sc" placeholder="https://soundcloud.com/…" value={form.soundcloud} onChange={set('soundcloud')} />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="j-mc">Mixcloud</label>
              <input id="j-mc" value={form.mixcloud} onChange={set('mixcloud')} />
            </div>
            <div className="field">
              <label htmlFor="j-sp">Spotify</label>
              <input id="j-sp" value={form.spotify} onChange={set('spotify')} />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="j-lang">Languages (comma separated)</label>
              <input id="j-lang" placeholder="English, French" value={form.languages} onChange={set('languages')} />
            </div>
            <div className="field">
              <label htmlFor="j-availability">Availability</label>
              <select id="j-availability" value={form.availability} onChange={set('availability')}>
                <option value="">Select one</option>
                {AVAILABILITY.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="j-rate">Rate (optional — kept internal)</label>
            <input id="j-rate" value={form.rate} onChange={set('rate')} />
          </div>

          <div className="field">
            <label htmlFor="j-notes">Anything else — events played, links to press, whatever's relevant</label>
            <textarea id="j-notes" value={form.notes} onChange={set('notes')} />
          </div>

          <button className="btn-solid" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send application'}
          </button>
          {status === 'error' && (
            <div className="form-status error">Something went wrong sending this — try again in a moment.</div>
          )}
        </form>
      </div>
    </section>
  );
}
