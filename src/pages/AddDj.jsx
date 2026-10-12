import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { HalfWorld } from '../components/ui.jsx';
import Honeypot from '../components/Honeypot.jsx';

// Private link (#add-dj/<token>, not in nav). DJs fill this in and go straight onto the
// Artists page. Public: name, photo, role, years, genres. Email, phone and location go to
// dj_contacts (team only). See supabase/migrations/012_dj_invite_links.sql.

const ROLES = ['DJ', 'DJ/Producer', 'Singer'];
const GENRES = [
  'Afro House', 'Afro Tech', 'Amapiano', 'Melodic House', 'Organic House', 'Deep House', 'House',
  'Tech House', 'Melodic Techno', 'Techno', 'Disco / Nu-Disco', 'Arabic / Oriental', 'Latin',
  'Hip Hop / R&B', 'Commercial / Open Format', 'Drum & Bass',
];
const MAX_GENRES = 5;
const MAX_PHOTO = 5 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const tokenFromHash = () => (window.location.hash.split('/')[1] || '').trim();

function GenrePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  const toggle = (g) => {
    if (value.includes(g)) onChange(value.filter((x) => x !== g));
    else if (value.length < MAX_GENRES) onChange([...value, g]);
  };

  return (
    <div className="multi" ref={ref}>
      <button type="button" id="d-genres" className="multi-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {value.length ? value.join(', ') : <span className="multi-placeholder">Select up to {MAX_GENRES}</span>}
      </button>
      {open && (
        <div className="multi-panel" role="listbox" aria-multiselectable="true">
          {GENRES.map((g) => {
            const on = value.includes(g);
            return (
              <button key={g} type="button" role="option" className="check-row multi-option" aria-checked={on} aria-selected={on}
                disabled={!on && value.length >= MAX_GENRES} onClick={() => toggle(g)}>
                <span className="check-box">{on && <svg viewBox="0 0 16 16"><path d="M3 8l3 3 7-7" /></svg>}</span>
                <span className="check-label">{g}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AddDj() {
  const token = useMemo(tokenFromHash, []);
  const [linkState, setLinkState] = useState('checking'); // checking | ok | bad
  const [form, setForm] = useState({ djName: '', location: '', years: '', role: '', email: '', phone: '' });
  const [genres, setGenres] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [trap, setTrap] = useState('');
  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : ''), [photo]);

  useEffect(() => {
    if (!/^[0-9a-f-]{36}$/i.test(token)) { setLinkState('bad'); return; }
    supabase.rpc('check_dj_invite', { p_token: token }).then(({ data, error: err }) => setLinkState(!err && data ? 'ok' : 'bad'));
  }, [token]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const pickPhoto = (e) => {
    const file = e.target.files?.[0];
    setPhotoError('');
    if (!file) { setPhoto(null); return; }
    if (!PHOTO_TYPES.includes(file.type)) { setPhotoError('Use a JPG, PNG or WebP image.'); setPhoto(null); return; }
    if (file.size > MAX_PHOTO) { setPhotoError('That photo is over 5 MB. Pick a smaller one.'); setPhoto(null); return; }
    setPhoto(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (trap) { setStatus('sent'); return; }
    if (!photo) { setPhotoError('Add a photo of you.'); return; }
    if (genres.length === 0) { setError('Pick at least one genre.'); return; }
    setStatus('sending');
    const ext = photo.type === 'image/png' ? 'png' : photo.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `applications/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage.from('artist-photos').upload(path, photo, { contentType: photo.type });
    if (up.error) { setStatus('idle'); setError("The photo didn't upload. Try again in a moment."); return; }
    const photoUrl = supabase.storage.from('artist-photos').getPublicUrl(path).data.publicUrl;
    const { error: err } = await supabase.rpc('add_dj_via_invite', {
      p_token: token,
      p_data: {
        dj_name: form.djName, location: form.location, years_experience: Number(form.years),
        role: form.role, genres, email: form.email, phone: form.phone, photo_url: photoUrl,
      },
    });
    if (err) { setStatus('idle'); setError(err.message || "That didn't send. Try again in a moment."); return; }
    setStatus('sent');
  };

  if (linkState === 'checking') return <div className="wrap status-page label">Loading</div>;

  if (linkState === 'bad') {
    return (
      <section className="section">
        <div className="wrap wrap-narrow">
          <div className="eyebrow label"><HalfWorld size={16} />OTW Artists</div>
          <h1>This link isn't active.</h1>
          <p className="lead" style={{ marginTop: 'var(--space-5)' }}>Ask whoever sent it for a new one.</p>
        </div>
      </section>
    );
  }

  if (status === 'sent') {
    return (
      <section className="section">
        <div className="wrap wrap-narrow">
          <div className="eyebrow label"><HalfWorld size={16} />You're on</div>
          <h1>Welcome to OTW.</h1>
          <p className="lead" style={{ marginTop: 'var(--space-5)' }}>Your profile is live on the Artists page.</p>
          <div className="actions"><a className="btn btn-primary" href="#artists">See the roster →</a></div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="wrap wrap-narrow">
        <div className="eyebrow label"><HalfWorld size={16} />OTW Artists · Private link</div>
        <h1>Add your profile</h1>
        <p className="lead" style={{ marginTop: 'var(--space-5)' }}>
          Goes live on the Artists page as soon as you send it. We only show your name, photo,
          role, years playing and genres. Email, phone and location stay with us.
        </p>

        <form style={{ marginTop: 'var(--space-8)' }} onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label className="label label-xs" htmlFor="d-name">DJ name</label>
              <input id="d-name" required maxLength={80} value={form.djName} onChange={set('djName')} />
            </div>
            <div className="field">
              <label className="label label-xs" htmlFor="d-role">Role</label>
              <select id="d-role" required value={form.role} onChange={set('role')}>
                <option value="">Select one</option>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label className="label label-xs" htmlFor="d-location">Location</label>
              <input id="d-location" required placeholder="Brussels" value={form.location} onChange={set('location')} />
            </div>
            <div className="field">
              <label className="label label-xs" htmlFor="d-years">Years playing</label>
              <input id="d-years" type="number" min="0" max="60" required value={form.years} onChange={set('years')} />
            </div>
          </div>

          <div className="field">
            <label className="label label-xs" htmlFor="d-genres">Genres</label>
            <GenrePicker value={genres} onChange={setGenres} />
          </div>

          <div className="field">
            <label className="label label-xs" htmlFor="d-photo">Photo (JPG, PNG or WebP, up to 5 MB)</label>
            <input id="d-photo" type="file" accept="image/jpeg,image/png,image/webp" required onChange={pickPhoto} />
            {preview && <img src={preview} alt="Your photo preview" style={{ marginTop: 'var(--space-3)', width: 160, height: 160, objectFit: 'cover' }} />}
            {photoError && <p className="form-status error">{photoError}</p>}
          </div>

          <div className="field-row">
            <div className="field">
              <label className="label label-xs" htmlFor="d-email">Email · private</label>
              <input id="d-email" type="email" required value={form.email} onChange={set('email')} />
            </div>
            <div className="field">
              <label className="label label-xs" htmlFor="d-phone">Phone · private</label>
              <input id="d-phone" type="tel" required value={form.phone} onChange={set('phone')} />
            </div>
          </div>

          <Honeypot value={trap} onChange={setTrap} />
          <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending' : 'Go live'}
          </button>
          {error && <p className="form-status error">{error}</p>}
        </form>
      </div>
    </section>
  );
}
