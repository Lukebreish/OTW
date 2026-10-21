import { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { HalfWorld } from '../components/ui.jsx';
import Honeypot from '../components/Honeypot.jsx';
import { useLang } from '../lib/i18n.jsx';

// [slug stored in the database, translation key].
const SERVICES = [
  ['events', 'events'],
  ['photoshoot', 'photoshoot'],
  ['ghost-production', 'production'],
  ['spotify-promotion', 'spotify'],
  ['mix-mastering', 'mix'],
  ['training', 'training'],
  ['mentoring', 'mentoring'],
];

export default function ArtistServices({ go }) {
  const [service, setService] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', instagram: '', message: '' });
  const [trap, setTrap] = useState('');
  const [status, setStatus] = useState('idle');
  const { t } = useLang();
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
          <div className="eyebrow label"><HalfWorld size={16} />{t('work.sent.tag')}</div>
          <h1>{t('work.sent.title')}</h1>
          <p className="lead" style={{ marginTop: 'var(--space-5)' }}>
            {t('work.sent.body')}
          </p>
          <div className="actions"><button className="btn btn-secondary" onClick={() => go('artists')}>{t('work.sent.artists')}</button></div>
        </div>
      </section>
    );
  }

  const picked = SERVICES.find(([slug]) => slug === service);

  return (
    <section className="section">
      <div className="wrap wrap-narrow">
        <div className="eyebrow label"><HalfWorld size={16} />{t('work.tag')}</div>
        <h1>{t('work.title')}</h1>
        <p className="lead" style={{ marginTop: 'var(--space-5)' }}>
          {t('work.lead')}
        </p>

        <form style={{ marginTop: 'var(--space-8)' }} onSubmit={submit}>
          <span className="label label-xs">{t('work.need')}</span>
          <div className="tags" style={{ marginTop: 'var(--space-3)' }}>
            {SERVICES.map(([slug, key]) => (
              <button key={slug} type="button" className="tag tag-lg" aria-pressed={service === slug} onClick={() => setService(slug)}>{t(`work.service.${key}`)}</button>
            ))}
          </div>
          {picked && <p className="muted" style={{ marginTop: 'var(--space-4)' }}>{t(`work.service.${picked[1]}.body`)}</p>}

          <div className="field-row" style={{ marginTop: 'var(--space-7)' }}>
            <div className="field">
              <label className="label label-xs" htmlFor="as-name">{t('work.name')}</label>
              <input id="as-name" required value={form.name} onChange={set('name')} />
            </div>
            <div className="field">
              <label className="label label-xs" htmlFor="as-ig">{t('work.instagram')}</label>
              <input id="as-ig" placeholder="https://instagram.com/…" value={form.instagram} onChange={set('instagram')} />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="label label-xs" htmlFor="as-email">{t('work.email')}</label>
              <input id="as-email" type="email" required value={form.email} onChange={set('email')} />
            </div>
            <div className="field">
              <label className="label label-xs" htmlFor="as-phone">{t('work.phone')}</label>
              <input id="as-phone" type="tel" required value={form.phone} onChange={set('phone')} />
            </div>
          </div>
          <div className="field">
            <label className="label label-xs" htmlFor="as-msg">{t('work.message')}</label>
            <textarea id="as-msg" value={form.message} onChange={set('message')} />
          </div>

          <Honeypot value={trap} onChange={setTrap} />
          <button className="btn btn-primary" type="submit" disabled={status === 'sending' || !service}>
            {status === 'sending' ? t('work.sending') : t('work.send')}
          </button>
          {!service && <p className="muted" style={{ marginTop: 'var(--space-3)' }}>{t('work.pick')}</p>}
          {status === 'error' && <p className="form-status error">{t('work.error')}</p>}
        </form>
      </div>
    </section>
  );
}
