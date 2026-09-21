import { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { recommendPackageId } from '../lib/recommend.js';

const EVENT_TYPES = ['Birthday', 'Wedding', 'Corporate event', 'Private party', 'Brand event', 'Club / nightlife', 'Festival', 'Other'];
const SIZES = [['lt30', 'Up to 30'], ['30-100', '30–100'], ['100-300', '100–300'], ['300+', '300+']];
const DURATIONS = [['2-4', '2–4 hours'], ['4-6', '4–6 hours'], ['6-8', '6–8 hours'], ['8+', '8+ hours']];
const SETTINGS = ['Indoor', 'Outdoor', 'Not sure yet'];

const PACKAGE_LABELS = {
  'the-party': 'The Party',
  'the-experience': 'The Experience',
  'full-production': 'Full Production',
};

function Chip({ active, onClick, children }) {
  return (
    <button type="button" className={`chip ${active ? 'active' : ''}`} onClick={onClick} aria-pressed={active}>
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

  const totalSteps = 5;
  const canAdvance = [
    !!eventType,
    !!eventSize && !!duration,
    !!setting,
    servicesWanted.length > 0,
    true,
  ][step];

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
        <div className="section-narrow">
          <h1>Thanks — we've got it.</h1>
          <p style={{ marginTop: 16 }}>
            We've received your event details. Our team will review your request and get back to
            you with a tailored quotation within 1 business day.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="section-narrow">
        <h1>Get a quote</h1>
        <p className="lead" style={{ marginTop: 12 }}>Tell us about your event. We'll figure out the rest.</p>

        <div className="quote-progress" style={{ marginTop: 32 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`quote-progress-dot ${i <= step ? 'done' : ''}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="panel">
            <div className="quote-step-title">Step 1 of {totalSteps} — what's the event?</div>
            <div className="chip-group">
              {EVENT_TYPES.map((t) => (
                <Chip key={t} active={eventType === t} onClick={() => setEventType(t)}>{t}</Chip>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="panel">
            <div className="quote-step-title">Step 2 of {totalSteps} — size and length</div>
            <p className="small" style={{ marginBottom: 8 }}>Guests</p>
            <div className="chip-group" style={{ marginBottom: 20 }}>
              {SIZES.map(([val, label]) => (
                <Chip key={val} active={eventSize === val} onClick={() => setEventSize(val)}>{label}</Chip>
              ))}
            </div>
            <p className="small" style={{ marginBottom: 8 }}>Duration</p>
            <div className="chip-group">
              {DURATIONS.map(([val, label]) => (
                <Chip key={val} active={duration === val} onClick={() => setDuration(val)}>{label}</Chip>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="panel">
            <div className="quote-step-title">Step 3 of {totalSteps} — the setting</div>
            <div className="chip-group">
              {SETTINGS.map((s) => (
                <Chip key={s} active={setting === s} onClick={() => setSetting(s)}>{s}</Chip>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="panel">
            <div className="quote-step-title">Step 4 of {totalSteps} — what do you need?</div>
            <p className="small" style={{ marginBottom: 8 }}>Pick as many as apply — not sure is fine too, leave it to us.</p>
            <div className="chip-group">
              {categories.map((c) => (
                <Chip key={c.id} active={servicesWanted.includes(c.slug)} onClick={() => toggleService(c.slug)}>
                  {c.name}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <>
            <div className="panel recommendation-panel">
              <div className="quote-step-title">Based on what you've told us</div>
              <h3>{PACKAGE_LABELS[recommendedId]}</h3>
              <p className="small" style={{ marginTop: 8 }}>
                This is a starting point — our team reviews every request and adjusts it before
                sending your quote.
              </p>
            </div>

            <form className="panel" style={{ marginTop: 20 }} onSubmit={handleSubmit}>
              <div className="quote-step-title">Step 5 of {totalSteps} — your details</div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="q-name">Name</label>
                  <input id="q-name" required value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="q-email">Email</label>
                  <input id="q-email" type="email" required value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="q-phone">Phone (optional)</label>
                  <input id="q-phone" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="q-date">Event date (optional)</label>
                  <input id="q-date" type="date" value={contact.eventDate} onChange={(e) => setContact({ ...contact, eventDate: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="q-location">Location</label>
                <input id="q-location" placeholder="Brussels, or elsewhere in Belgium" value={contact.location} onChange={(e) => setContact({ ...contact, location: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="q-notes">Anything else we should know? (optional)</label>
                <textarea id="q-notes" value={contact.notes} onChange={(e) => setContact({ ...contact, notes: e.target.value })} />
              </div>
              <button className="btn-solid" type="submit" disabled={submitState === 'sending'}>
                {submitState === 'sending' ? 'Sending…' : 'Send request'}
              </button>
              {submitState === 'error' && (
                <div className="form-status error">Something went wrong sending this — try again, or email us directly.</div>
              )}
            </form>
          </>
        )}

        <div className="hero-actions" style={{ justifyContent: 'space-between', marginTop: 24 }}>
          <button type="button" className="btn-ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Back
          </button>
          {step < totalSteps - 1 && (
            <button type="button" className="btn-solid" onClick={() => setStep((s) => s + 1)} disabled={!canAdvance}>
              Continue
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
