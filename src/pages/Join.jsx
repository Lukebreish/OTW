import { useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { HalfWorld } from '../components/ui.jsx';
import Honeypot from '../components/Honeypot.jsx';
import { useLang } from '../lib/i18n.jsx';

// [value stored in the database, translation key].
const AVAILABILITY = [
  ['Weekends only', 'weekends'],
  ['Weekdays too', 'weekdays'],
  ['Flexible', 'flexible'],
  ['Limited, ask me', 'limited'],
];
const ROLES = [['DJ', 'dj'], ['DJ/Producer', 'djproducer'], ['Singer', 'singer']];
const MAX_PHOTO = 5 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function Join() {
  const [form, setForm] = useState({
    name: '', email: '', location: '', djName: '', role: '', genres: '', yearsExperience: '',
    bio: '', instagram: '', soundcloud: '', mixcloud: '', spotify: '', languages: '',
    availability: '', rate: '', notes: '',
  });
  const [status, setStatus] = useState('idle');
  const [trap, setTrap] = useState('');
  const [photo, setPhoto] = useState(null);
  // Holds a translation key, so the message follows the language switch.
  const [photoError, setPhotoError] = useState('');
  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : ''), [photo]);
  const { t } = useLang();

  const pickPhoto = (e) => {
    const file = e.target.files?.[0];
    setPhotoError('');
    if (!file) { setPhoto(null); return; }
    if (!PHOTO_TYPES.includes(file.type)) { setPhotoError('join.photo.type'); setPhoto(null); return; }
    if (file.size > MAX_PHOTO) { setPhotoError('join.photo.size'); setPhoto(null); return; }
    setPhoto(file);
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (trap) { setStatus('sent'); return; }
    if (!form.name || !form.email || !form.djName) return;
    if (!photo) { setPhotoError('join.photo.required'); return; }
    setStatus('sending');
    const ext = photo.type === 'image/png' ? 'png' : photo.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `applications/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('artist-photos').upload(path, photo, { contentType: photo.type });
    if (uploadError) { setStatus('error'); return; }
    const photoUrl = supabase.storage.from('artist-photos').getPublicUrl(path).data.publicUrl;
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
      photo_url: photoUrl,
      status: 'pending',
    });
    setStatus(error ? 'error' : 'sent');
  };

  if (status === 'sent') {
    return (
      <section className="section">
        <div className="wrap wrap-narrow">
          <div className="eyebrow label"><HalfWorld size={16} />{t('join.sent.tag')}</div>
          <h1>{t('join.sent.title')}</h1>
          <p className="lead" style={{ marginTop: 'var(--space-5)' }}>
            {t('join.sent.body')}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="wrap wrap-narrow">
        <div className="eyebrow label"><HalfWorld size={16} />{t('join.tag')}</div>
        <h1>{t('join.title')}</h1>
        <p className="lead" style={{ marginTop: 'var(--space-5)' }}>
          {t('join.lead')}
        </p>

        <form style={{ marginTop: 'var(--space-8)' }} onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label className="label label-xs" htmlFor="j-name">{t('join.name')}</label>
              <input id="j-name" required value={form.name} onChange={set('name')} />
            </div>
            <div className="field">
              <label className="label label-xs" htmlFor="j-email">{t('join.email')}</label>
              <input id="j-email" type="email" required value={form.email} onChange={set('email')} />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label className="label label-xs" htmlFor="j-djname">{t('join.djname')}</label>
              <input id="j-djname" required value={form.djName} onChange={set('djName')} />
            </div>
            <div className="field">
              <label className="label label-xs" htmlFor="j-role">{t('join.role')}</label>
              <select id="j-role" value={form.role} onChange={set('role')}>
                <option value="">{t('join.select')}</option>
                {ROLES.map(([value, key]) => <option key={value} value={value}>{t(`join.role.${key}`)}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label className="label label-xs" htmlFor="j-photo">{t('join.photo')}</label>
            <input id="j-photo" type="file" accept="image/jpeg,image/png,image/webp" required onChange={pickPhoto} />
            {preview && <img src={preview} alt={t('join.photo.alt')} style={{ marginTop: 'var(--space-3)', width: 160, height: 160, objectFit: 'cover' }} />}
            {photoError && <p className="form-status error">{t(photoError)}</p>}
          </div>

          <div className="field-row">
            <div className="field">
              <label className="label label-xs" htmlFor="j-location">{t('join.location')}</label>
              <input id="j-location" value={form.location} onChange={set('location')} />
            </div>
            <div className="field">
              <label className="label label-xs" htmlFor="j-years">{t('join.years')}</label>
              <input id="j-years" type="number" min="0" value={form.yearsExperience} onChange={set('yearsExperience')} />
            </div>
          </div>

          <div className="field">
            <label className="label label-xs" htmlFor="j-genres">{t('join.genres')}</label>
            <input id="j-genres" placeholder={t('join.genres.placeholder')} value={form.genres} onChange={set('genres')} />
          </div>

          <div className="field">
            <label className="label label-xs" htmlFor="j-bio">{t('join.bio')}</label>
            <textarea id="j-bio" placeholder={t('join.bio.placeholder')} value={form.bio} onChange={set('bio')} />
          </div>

          <div className="field-row">
            <div className="field">
              <label className="label label-xs" htmlFor="j-ig">{t('join.instagram')}</label>
              <input id="j-ig" placeholder="https://instagram.com/…" value={form.instagram} onChange={set('instagram')} />
            </div>
            <div className="field">
              <label className="label label-xs" htmlFor="j-sc">{t('join.soundcloud')}</label>
              <input id="j-sc" placeholder="https://soundcloud.com/…" value={form.soundcloud} onChange={set('soundcloud')} />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label className="label label-xs" htmlFor="j-mc">{t('join.mixcloud')}</label>
              <input id="j-mc" value={form.mixcloud} onChange={set('mixcloud')} />
            </div>
            <div className="field">
              <label className="label label-xs" htmlFor="j-sp">{t('join.spotify')}</label>
              <input id="j-sp" value={form.spotify} onChange={set('spotify')} />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label className="label label-xs" htmlFor="j-lang">{t('join.languages')}</label>
              <input id="j-lang" placeholder={t('join.languages.placeholder')} value={form.languages} onChange={set('languages')} />
            </div>
            <div className="field">
              <label className="label label-xs" htmlFor="j-availability">{t('join.availability')}</label>
              <select id="j-availability" value={form.availability} onChange={set('availability')}>
                <option value="">{t('join.select')}</option>
                {AVAILABILITY.map(([value, key]) => <option key={value} value={value}>{t(`join.avail.${key}`)}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label className="label label-xs" htmlFor="j-rate">{t('join.rate')}</label>
            <input id="j-rate" value={form.rate} onChange={set('rate')} />
          </div>

          <div className="field">
            <label className="label label-xs" htmlFor="j-notes">{t('join.notes')}</label>
            <textarea id="j-notes" value={form.notes} onChange={set('notes')} />
          </div>

          <Honeypot value={trap} onChange={setTrap} />
          <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? t('join.sending') : t('join.send')}
          </button>
          {status === 'error' && (
            <p className="form-status error">{t('join.error')}</p>
          )}
        </form>
      </div>
    </section>
  );
}
