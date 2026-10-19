import { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { formatPrice } from '../lib/payments.js';
import { useLang } from '../lib/i18n.jsx';
import Honeypot from './Honeypot.jsx';

const EXPERIENCE = ['academy.call.experience.1', 'academy.call.experience.2', 'academy.call.experience.3', 'academy.call.experience.4'];

// Academy: request a free first call for a package. Saves a course_bookings row
// with status 'call_requested'; a database trigger turns it into a lead in #ops.
export default function FirstCallForm({ courses, courseId, onCourseChange }) {
  const { t, loc } = useLang();
  const [form, setForm] = useState({ name: '', email: '', phone: '', experience: '', message: '' });
  const [trap, setTrap] = useState('');
  const [status, setStatus] = useState('idle');
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const tracks = [['dj', t('academy.track.dj')], ['production', t('academy.track.production')]];
  const course = courses.find((c) => c.id === courseId) || null;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return;
    if (trap) { setStatus('sent'); return; }
    setStatus('sending');
    const { error } = await supabase.from('course_bookings').insert({
      course_id: course?.id || null,
      name: form.name,
      email: form.email,
      phone: form.phone,
      experience: form.experience ? t(form.experience) : null,
      message: form.message || null,
      amount: course?.price ?? null,
      status: 'call_requested',
    });
    setStatus(error ? 'error' : 'sent');
  };

  if (status === 'sent') {
    return (
      <div className="field-block">
        <div className="label label-xs">{t('academy.call.done.tag')}</div>
        <h2 style={{ marginTop: 'var(--space-4)' }}>{t('academy.call.done.title')}</h2>
        <p style={{ marginTop: 'var(--space-4)' }}>{t('academy.call.done.body')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <div className="field">
        <label className="label label-xs" htmlFor="fc-course">{t('academy.call.course')}</label>
        <select id="fc-course" value={courseId || ''} onChange={(e) => onCourseChange(e.target.value)}>
          <option value="">{t('academy.call.course.unsure')}</option>
          {tracks.map(([key, label]) => (
            <optgroup key={key} label={label}>
              {courses.filter((c) => c.track === key).map((c) => (
                <option key={c.id} value={c.id}>{loc(c, 'title')} · {formatPrice(c.price)}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div className="field-row">
        <div className="field">
          <label className="label label-xs" htmlFor="fc-name">{t('form.name')}</label>
          <input id="fc-name" required value={form.name} onChange={set('name')} autoComplete="name" />
        </div>
        <div className="field">
          <label className="label label-xs" htmlFor="fc-email">{t('form.email')}</label>
          <input id="fc-email" type="email" required value={form.email} onChange={set('email')} autoComplete="email" />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label className="label label-xs" htmlFor="fc-phone">{t('academy.call.phone')}</label>
          <input id="fc-phone" type="tel" required value={form.phone} onChange={set('phone')} autoComplete="tel" />
        </div>
        <div className="field">
          <label className="label label-xs" htmlFor="fc-exp">{t('academy.call.experience')}</label>
          <select id="fc-exp" value={form.experience} onChange={set('experience')}>
            <option value="">{t('academy.call.experience.pick')}</option>
            {EXPERIENCE.map((k) => <option key={k} value={k}>{t(k)}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label className="label label-xs" htmlFor="fc-msg">{t('academy.call.message')}</label>
        <textarea id="fc-msg" rows={4} maxLength={4000} value={form.message} onChange={set('message')} />
      </div>
      <Honeypot value={trap} onChange={setTrap} />
      <div className="actions">
        <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? t('form.sending') : t('academy.call.button')}
        </button>
      </div>
      {status === 'error' && <p className="muted" role="alert" style={{ marginTop: 'var(--space-3)' }}>{t('form.error')}</p>}
      <p className="label label-xs muted" style={{ marginTop: 'var(--space-3)' }}>
        {t('form.privacy.before')} <a href="#privacy">{t('form.privacy.link')}</a>.
      </p>
    </form>
  );
}
