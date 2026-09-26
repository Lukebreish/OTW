import { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { recommendPackageId } from '../lib/recommend.js';
import { HalfWorld } from '../components/ui.jsx';

const EVENT_TYPES = ['Birthday', 'Wedding', 'Corporate event', 'Private party', 'Brand event', 'Club / nightlife', 'Festival', 'Other'];
const SIZES = [['lt30', 'Up to 30'], ['30-100', '30–100'], ['100-300', '100–300'], ['300+', '300+']];
const DURATIONS = [['2-4', '2–4 hours'], ['4-6', '4–6 hours'], ['6-8', '6–8 hours'], ['8+', '8+ hours']];
const SETTINGS = ['Indoor', 'Outdoor', 'Not sure yet'];

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
  const [step, setStep] = useState(0);
  const [eventType, setEventType] = useState('');
  const [eventSize, setEventSize] = useState('');
  const [duration, setDuration] = useState('');
  const [setting, setSetting] = useState('');
  const [servicesWanted, setServicesWanted] = useState(prefill || []);
  const [contact, setContact] = useState({ name: '', email: '', phone: '', location: '', eventDate: '', notes: '' });
  const [submitState, setSubmitState] = useState('idle');

  const toggleService = (slug) => {
    setServicesWanted((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  };
  const setField = (key) => (e) => setContact({ ...contact, [key]: e.target.value });

  const totalSteps = 5;
  const canAdvance = [!!eventType, !!eventSize && !!duration, !!setting, servicesWanted.length > 0, true][step];
  const recommendedId = recommendPackageId({ eventSize, duration, servicesWanted });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contact.name || !contact.email) return;
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
          <div className="eyebrow label"><HalfWorld size={16} />Request sent</div>
          <h1>Thanks. We've got it.</h1>
          <p className="lead" style={{ marginTop: 'var(--space-5)' }}>
            Our team will review your request and come back with a tailored quote within one business day.
          </p>
        </div>
      </section>
    );
  }

  const stepLabel = (title) => <div className="step-label label">Step {step + 1} of {totalSteps} · {title}</div>;

  return (
    <section className="section">
      <div className="wrap wrap-narrow">
        <div className="eyebrow label"><HalfWorld size={16} />OTW Events</div>
        <h1>Get a quote</h1>
        <p className="lead" style={{ marginTop: 'var(--space-5)' }}>Tell us about your event. We'll work out the rest.</p>

        <div className="progress" aria-hidden="true">
          {Array.from({ length: totalSteps }).map((_, i) => <span key={i} className={i <= step ? 'done' : ''} />)}
        </div>

        {step === 0 && (
          <>
            {stepLabel('What’s the event?')}
            <div className="tags">
              {EVENT_TYPES.map((t) => <Choice key={t} active={eventType === t} onClick={() => setEventType(t)}>{t}</Choice>)}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            {stepLabel('Size and length')}
            <p className="label label-xs muted" style={{ marginBottom: 'var(--space-3)' }}>Guests</p>
            <div className="tags" style={{ marginBottom: 'var(--space-6)' }}>
              {SIZES.map(([val, label]) => <Choice key={val} active={eventSize === val} onClick={() => setEventSize(val)}>{label}</Choice>)}
            </div>
            <p className="label label-xs muted" style={{ marginBottom: 'var(--space-3)' }}>Duration</p>
            <div className="tags">
              {DURATIONS.map(([val, label]) => <Choice key={val} active={duration === val} onClick={() => setDuration(val)}>{label}</Choice>)}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {stepLabel('The setting')}
            <div className="tags">
              {SETTINGS.map((s) => <Choice key={s} active={setting === s} onClick={() => setSetting(s)}>{s}</Choice>)}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            {stepLabel('What do you need?')}
            <p className="muted" style={{ marginBottom: 'var(--space-5)' }}>Pick as many as apply. Not sure is fine too.</p>
            <div className="tags">
              {categories.map((c) => (
                <Choice key={c.id} active={servicesWanted.includes(c.slug)} onClick={() => toggleService(c.slug)}>{c.name}</Choice>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="field-block">
              <div className="label label-xs">Based on what you've told us</div>
              <h2 style={{ marginTop: 'var(--space-4)' }}>{PACKAGE_LABELS[recommendedId]}</h2>
              <p style={{ marginTop: 'var(--space-4)' }}>A starting point. Our team reviews every request and adjusts it before your quote goes out.</p>
            </div>

            <form style={{ marginTop: 'var(--space-7)' }} onSubmit={handleSubmit}>
              {stepLabel('Your details')}
              <div className="field-row">
                <div className="field">
                  <label className="label label-xs" htmlFor="q-name">Name</label>
                  <input id="q-name" required value={contact.name} onChange={setField('name')} />
                </div>
                <div className="field">
                  <label className="label label-xs" htmlFor="q-email">Email</label>
                  <input id="q-email" type="email" required value={contact.email} onChange={setField('email')} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="label label-xs" htmlFor="q-phone">Phone (optional)</label>
                  <input id="q-phone" value={contact.phone} onChange={setField('phone')} />
                </div>
                <div className="field">
                  <label className="label label-xs" htmlFor="q-date">Event date (optional)</label>
                  <input id="q-date" type="date" value={contact.eventDate} onChange={setField('eventDate')} />
                </div>
              </div>
              <div className="field">
                <label className="label label-xs" htmlFor="q-location">Location</label>
                <input id="q-location" placeholder="Brussels, or elsewhere in Belgium" value={contact.location} onChange={setField('location')} />
              </div>
              <div className="field">
                <label className="label label-xs" htmlFor="q-notes">Anything else we should know? (optional)</label>
                <textarea id="q-notes" value={contact.notes} onChange={setField('notes')} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={submitState === 'sending'}>
                {submitState === 'sending' ? 'Sending' : 'Send request'}
              </button>
              {submitState === 'error' && <p className="form-status error">That didn't send. Try again, or email us directly.</p>}
            </form>
          </>
        )}

        <div className="quote-nav">
          <button type="button" className="btn btn-ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            ← Back
          </button>
          {step < totalSteps - 1 && (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)} disabled={!canAdvance}>
              Continue →
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
