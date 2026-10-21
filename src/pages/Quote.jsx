import { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { recommendPackageId } from '../lib/recommend.js';
import { HalfWorld } from '../components/ui.jsx';
import Honeypot from '../components/Honeypot.jsx';
import { useLang } from '../lib/i18n.jsx';

// [value stored in the database, translation key]. The value stays English so
// ops and the pipeline read one language whatever the visitor picked.
export const EVENT_TYPES = [
  ['Birthday', 'birthday'],
  ['Wedding', 'wedding'],
  ['Corporate event', 'corporate'],
  ['Private party', 'private'],
  ['Brand event', 'brand'],
  ['Club / nightlife', 'club'],
  ['Festival', 'festival'],
  ['Other', 'other'],
];
const SIZES = [['lt30', 'lt30'], ['30-100', 'mid'], ['100-300', 'large'], ['300+', 'xl']];
const DURATIONS = [['2-4', 'short'], ['4-6', 'mid'], ['6-8', 'long'], ['8+', 'xl']];
const SETTINGS = [['Indoor', 'indoor'], ['Outdoor', 'outdoor'], ['Not sure yet', 'unsure']];

const PACKAGE_LABELS = {
  'the-party': 'The Party',
  'the-experience': 'The Experience',
  'full-production': 'Full Production',
};

function Choice({ active, onClick, children }) {
  return (
    <button type="button" className="tag tag-lg" onClick={onClick} aria-pressed={active}>
      {children}
    </button>
  );
}

export default function Quote({ categories, prefill }) {
  const [step, setStep] = useState(prefill?.eventType ? 1 : 0);
  const [djOnly, setDjOnly] = useState(false);
  const [eventType, setEventType] = useState(prefill?.eventType || '');
  const [eventSize, setEventSize] = useState('');
  const [duration, setDuration] = useState('');
  const [setting, setSetting] = useState('');
  const [servicesWanted, setServicesWanted] = useState(prefill?.services || []);
  const [contact, setContact] = useState({ name: '', email: '', phone: '', location: '', eventDate: '', notes: '' });
  const [submitState, setSubmitState] = useState('idle');
  const [trap, setTrap] = useState('');
  const { t, loc } = useLang();

  const chooseDjOnly = (value) => {
    setDjOnly(value);
    setServicesWanted(value ? ['djs'] : prefill?.services || []);
  };
  const next = () => setStep((s) => (s === 2 && djOnly ? 4 : s + 1));
  const back = () => setStep((s) => (s === 4 && djOnly ? 2 : Math.max(0, s - 1)));

  const toggleService = (slug) => {
    setServicesWanted((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  };
  const setField = (key) => (e) => setContact({ ...contact, [key]: e.target.value });

  const totalSteps = 5;
  const canAdvance = [!!eventType, !!eventSize && !!duration, !!setting, servicesWanted.length > 0, true][step];
  const recommendedId = recommendPackageId({ eventSize, duration, servicesWanted });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (trap) { setSubmitState('sent'); return; }
    if (!contact.name || !contact.email || !contact.phone.trim()) return;
    setSubmitState('sending');
    const { error } = await supabase.from('quote_requests').insert({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || null,
      event_type: eventType,
      event_size: eventSize,
      event_duration: duration,
      setting,
      services_wanted: servicesWanted,
      request_type: djOnly ? 'dj_only' : 'event',
      location: contact.location || null,
      event_date: contact.eventDate || null,
      additional_info: contact.notes || null,
      recommended_package: recommendedId,
      status: 'new',
    });
    setSubmitState(error ? 'error' : 'sent');
  };

  if (submitState === 'sent') {
    return (
      <section className="section">
        <div className="wrap wrap-narrow">
          <div className="eyebrow label"><HalfWorld size={16} />{t('quote.sent.tag')}</div>
          <h1>{t('quote.sent.title')}</h1>
          <p className="lead" style={{ marginTop: 'var(--space-5)' }}>
            {t('quote.sent.body')}
          </p>
        </div>
      </section>
    );
  }

  const stepLabel = () => (
    <div className="step-label label">
      {t('quote.step', { n: step + 1, total: totalSteps, title: t(`quote.step.${step}`) })}
    </div>
  );

  return (
    <section className="section">
      <div className="wrap wrap-narrow">
        <div className="eyebrow label"><HalfWorld size={16} />{t('quote.tag')}</div>
        <h1>{t('quote.title')}</h1>
        <p className="lead" style={{ marginTop: 'var(--space-5)' }}>{t('quote.lead')}</p>

        <div className="progress" aria-hidden="true">
          {Array.from({ length: totalSteps }).map((_, i) => <span key={i} className={i <= step ? 'done' : ''} />)}
        </div>

        {step === 0 && (
          <>
            {stepLabel()}
            <p className="label label-xs muted" style={{ marginBottom: 'var(--space-3)' }}>{t('quote.after')}</p>
            <div className="tags" style={{ marginBottom: 'var(--space-6)' }}>
              <Choice active={!djOnly} onClick={() => chooseDjOnly(false)}>{t('quote.after.event')}</Choice>
              <Choice active={djOnly} onClick={() => chooseDjOnly(true)}>{t('quote.after.dj')}</Choice>
            </div>
            <p className="label label-xs muted" style={{ marginBottom: 'var(--space-3)' }}>{t('quote.event')}</p>
            <div className="tags">
              {EVENT_TYPES.map(([value, key]) => (
                <Choice key={value} active={eventType === value} onClick={() => setEventType(value)}>{t(`quote.type.${key}`)}</Choice>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            {stepLabel()}
            <p className="label label-xs muted" style={{ marginBottom: 'var(--space-3)' }}>{t('quote.guests')}</p>
            <div className="tags" style={{ marginBottom: 'var(--space-6)' }}>
              {SIZES.map(([val, key]) => <Choice key={val} active={eventSize === val} onClick={() => setEventSize(val)}>{t(`quote.size.${key}`)}</Choice>)}
            </div>
            <p className="label label-xs muted" style={{ marginBottom: 'var(--space-3)' }}>{t('quote.duration')}</p>
            <div className="tags">
              {DURATIONS.map(([val, key]) => <Choice key={val} active={duration === val} onClick={() => setDuration(val)}>{t(`quote.duration.${key}`)}</Choice>)}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {stepLabel()}
            <div className="tags">
              {SETTINGS.map(([value, key]) => (
                <Choice key={value} active={setting === value} onClick={() => setSetting(value)}>{t(`quote.setting.${key}`)}</Choice>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            {stepLabel()}
            <p className="muted" style={{ marginBottom: 'var(--space-5)' }}>{t('quote.services.lead')}</p>
            <div className="tags">
              {categories.map((c) => (
                <Choice key={c.id} active={servicesWanted.includes(c.slug)} onClick={() => toggleService(c.slug)}>{loc(c, 'name')}</Choice>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            {!djOnly && (
              <div className="field-block">
                <div className="label label-xs">{t('quote.rec.label')}</div>
                <h2 style={{ marginTop: 'var(--space-4)' }}>{PACKAGE_LABELS[recommendedId]}</h2>
                <p style={{ marginTop: 'var(--space-4)' }}>{t('quote.rec.body')}</p>
              </div>
            )}

            <form style={{ marginTop: 'var(--space-7)' }} onSubmit={handleSubmit}>
              {stepLabel()}
              <div className="field-row">
                <div className="field">
                  <label className="label label-xs" htmlFor="q-name">{t('quote.name')}</label>
                  <input id="q-name" required value={contact.name} onChange={setField('name')} />
                </div>
                <div className="field">
                  <label className="label label-xs" htmlFor="q-email">{t('quote.email')}</label>
                  <input id="q-email" type="email" required value={contact.email} onChange={setField('email')} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="label label-xs" htmlFor="q-phone">{t('quote.phone')}</label>
                  <input id="q-phone" type="tel" required value={contact.phone} onChange={setField('phone')} />
                </div>
                <div className="field">
                  <label className="label label-xs" htmlFor="q-date">{t('quote.date')}</label>
                  <input id="q-date" type="date" value={contact.eventDate} onChange={setField('eventDate')} />
                </div>
              </div>
              <div className="field">
                <label className="label label-xs" htmlFor="q-location">{t('quote.location')}</label>
                <input id="q-location" placeholder={t('quote.location.placeholder')} value={contact.location} onChange={setField('location')} />
              </div>
              <div className="field">
                <label className="label label-xs" htmlFor="q-notes">{t('quote.notes')}</label>
                <textarea id="q-notes" value={contact.notes} onChange={setField('notes')} />
              </div>
              <Honeypot value={trap} onChange={setTrap} />
              <button className="btn btn-primary" type="submit" disabled={submitState === 'sending'}>
                {submitState === 'sending' ? t('quote.sending') : t('quote.send')}
              </button>
              {submitState === 'error' && <p className="form-status error">{t('quote.error')}</p>}
            </form>
          </>
        )}

        <div className="quote-nav">
          <button type="button" className="btn btn-ghost" onClick={back} disabled={step === 0}>
            {t('quote.back')}
          </button>
          {step < totalSteps - 1 && (
            <button type="button" className="btn btn-primary" onClick={next} disabled={!canAdvance}>
              {t('quote.continue')}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
