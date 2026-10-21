import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { ONLINE_PAYMENTS_LIVE, formatPrice } from '../lib/payments.js';
import { formatStart } from './CourseCard.jsx';
import { useLang } from '../lib/i18n.jsx';

// [value stored in the database, translation key].
const EXPERIENCE = [
  ['Never played', 'never'],
  ['Played at home', 'home'],
  ['Played out a few times', 'few'],
  ['Play out regularly', 'regular'],
];

// Two steps: your details, then payment. Payment is a placeholder until a
// provider is connected (see lib/payments.js): bookings save as
// pending_payment and OTW follows up by email.
export default function EnrolForm({ courses, sessions, courseId, sessionId, onCourseChange }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ sessionId: sessionId || '', name: '', email: '', phone: '', experience: '', message: '' });
  const [method, setMethod] = useState(ONLINE_PAYMENTS_LIVE ? 'card' : 'transfer');
  const [status, setStatus] = useState('idle');
  const { t, loc, locale } = useLang();

  useEffect(() => { setForm((f) => ({ ...f, sessionId: sessionId || '' })); }, [sessionId, courseId]);

  const course = courses.find((c) => c.id === courseId) || null;
  const courseSessions = sessions.filter((s) => s.course_id === courseId);
  const session = courseSessions.find((s) => s.id === form.sessionId) || null;
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const toPayment = (e) => {
    e.preventDefault();
    if (!course || !form.name || !form.email) return;
    setStep(1);
  };

  const confirm = async () => {
    setStatus('sending');
    const { error } = await supabase.from('course_bookings').insert({
      course_id: course.id,
      session_id: session?.id || null,
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      experience: form.experience || null,
      message: form.message || null,
      payment_method: method,
      amount: course.price,
      status: 'pending_payment',
    });
    setStatus(error ? 'error' : 'sent');
  };

  if (status === 'sent') {
    return (
      <div className="field-block">
        <div className="label label-xs">{t('enrol.sent.tag')}</div>
        <h2 style={{ marginTop: 'var(--space-4)' }}>{t('enrol.sent.title')}</h2>
        <p style={{ marginTop: 'var(--space-4)' }}>
          {t('enrol.sent.body', { course: loc(course, 'title') })}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="progress progress-2" aria-hidden="true">
        <span className="done" /><span className={step === 1 ? 'done' : ''} />
      </div>

      {step === 0 && (
        <form onSubmit={toPayment}>
          <div className="step-label label">{t('enrol.step1')}</div>
          <div className="field-row">
            <div className="field">
              <label className="label label-xs" htmlFor="e-course">{t('enrol.course')}</label>
              <select id="e-course" required value={courseId || ''} onChange={(e) => onCourseChange(e.target.value)}>
                <option value="">{t('enrol.course.pick')}</option>
                {courses.filter((c) => !c.booking_url).map((c) => <option key={c.id} value={c.id}>{loc(c, 'title')} · {formatPrice(c.price)}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label label-xs" htmlFor="e-session">{t('enrol.class')}</label>
              <select id="e-session" value={form.sessionId} onChange={set('sessionId')} disabled={courseSessions.length === 0}>
                <option value="">{courseSessions.length ? t('enrol.class.any') : t('enrol.class.agree')}</option>
                {courseSessions.map((s) => (
                  <option key={s.id} value={s.id}>{s.day} {s.time_range}{s.label ? ` · ${s.label}` : ''}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="label label-xs" htmlFor="e-name">{t('enrol.name')}</label>
              <input id="e-name" required value={form.name} onChange={set('name')} />
            </div>
            <div className="field">
              <label className="label label-xs" htmlFor="e-email">{t('enrol.email')}</label>
              <input id="e-email" type="email" required value={form.email} onChange={set('email')} />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="label label-xs" htmlFor="e-phone">{t('enrol.phone')}</label>
              <input id="e-phone" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="field">
              <label className="label label-xs" htmlFor="e-exp">{t('enrol.experience')}</label>
              <select id="e-exp" value={form.experience} onChange={set('experience')}>
                <option value="">{t('enrol.select')}</option>
                {EXPERIENCE.map(([value, key]) => <option key={value} value={value}>{t(`enrol.exp.${key}`)}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label className="label label-xs" htmlFor="e-msg">{t('enrol.message')}</label>
            <textarea id="e-msg" value={form.message} onChange={set('message')} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={!course}>{t('enrol.continue')}</button>
        </form>
      )}

      {step === 1 && course && (
        <>
          <div className="step-label label">{t('enrol.step2')}</div>
          <div className="cells cells-3 summary-cells">
            <div><span className="label label-xs muted">{t('enrol.course')}</span><span className="label">{loc(course, 'title')}</span></div>
            <div><span className="label label-xs muted">{t('enrol.class')}</span><span className="label">{session ? `${session.day} ${session.time_range}` : t('enrol.starts', { date: formatStart(course.starts_on, t('course.rolling'), locale) })}</span></div>
            <div><span className="label label-xs muted">{t('enrol.total')}</span><span className="label">{formatPrice(course.price)}</span></div>
          </div>

          <div className="pay-options" role="radiogroup" aria-label={t('enrol.pay.label')}>
            <button type="button" role="radio" className="pay-option" aria-checked={method === 'card'} disabled={!ONLINE_PAYMENTS_LIVE} onClick={() => setMethod('card')}>
              <span className="label">{t('enrol.pay.card')}</span>
              <span className="muted">{ONLINE_PAYMENTS_LIVE ? t('enrol.pay.card.live') : t('enrol.pay.card.soon')}</span>
            </button>
            <button type="button" role="radio" className="pay-option" aria-checked={method === 'transfer'} onClick={() => setMethod('transfer')}>
              <span className="label">{t('enrol.pay.transfer')}</span>
              <span className="muted">{t('enrol.pay.transfer.body')}</span>
            </button>
          </div>

          <div className="quote-nav">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>{t('enrol.back')}</button>
            <button type="button" className="btn btn-primary" onClick={confirm} disabled={status === 'sending'}>
              {status === 'sending' ? t('enrol.sending') : t('enrol.confirm')}
            </button>
          </div>
          {status === 'error' && <p className="form-status error">{t('enrol.error')}</p>}
        </>
      )}
    </div>
  );
}
