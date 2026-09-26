import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { ONLINE_PAYMENTS_LIVE, formatPrice } from '../lib/payments.js';
import { formatStart } from './CourseCard.jsx';

const EXPERIENCE = ['Never played', 'Played at home', 'Played out a few times', 'Play out regularly'];

// Two steps: your details, then payment. Payment is a placeholder until a
// provider is connected (see lib/payments.js): bookings save as
// pending_payment and OTW follows up by email.
export default function EnrolForm({ courses, sessions, courseId, sessionId, onCourseChange }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ sessionId: sessionId || '', name: '', email: '', phone: '', experience: '', message: '' });
  const [method, setMethod] = useState(ONLINE_PAYMENTS_LIVE ? 'card' : 'transfer');
  const [status, setStatus] = useState('idle');

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
        <div className="label label-xs">Booking received</div>
        <h2 style={{ marginTop: 'var(--space-4)' }}>You're on the list.</h2>
        <p style={{ marginTop: 'var(--space-4)' }}>
          We'll email payment details for {course.title} within one business day. Your place is confirmed once payment is in.
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
          <div className="step-label label">Step 1 of 2 · Your class</div>
          <div className="field-row">
            <div className="field">
              <label className="label label-xs" htmlFor="e-course">Course</label>
              <select id="e-course" required value={courseId || ''} onChange={(e) => onCourseChange(e.target.value)}>
                <option value="">Select a course</option>
                {courses.filter((c) => !c.booking_url).map((c) => <option key={c.id} value={c.id}>{c.title} · {formatPrice(c.price)}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label label-xs" htmlFor="e-session">Class</label>
              <select id="e-session" value={form.sessionId} onChange={set('sessionId')} disabled={courseSessions.length === 0}>
                <option value="">{courseSessions.length ? 'Any / first available' : 'We’ll agree a time with you'}</option>
                {courseSessions.map((s) => (
                  <option key={s.id} value={s.id}>{s.day} {s.time_range}{s.label ? ` · ${s.label}` : ''}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="label label-xs" htmlFor="e-name">Name</label>
              <input id="e-name" required value={form.name} onChange={set('name')} />
            </div>
            <div className="field">
              <label className="label label-xs" htmlFor="e-email">Email</label>
              <input id="e-email" type="email" required value={form.email} onChange={set('email')} />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="label label-xs" htmlFor="e-phone">Phone (optional)</label>
              <input id="e-phone" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="field">
              <label className="label label-xs" htmlFor="e-exp">Experience</label>
              <select id="e-exp" value={form.experience} onChange={set('experience')}>
                <option value="">Select one</option>
                {EXPERIENCE.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label className="label label-xs" htmlFor="e-msg">What do you want to get out of it? (optional)</label>
            <textarea id="e-msg" value={form.message} onChange={set('message')} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={!course}>Continue to payment →</button>
        </form>
      )}

      {step === 1 && course && (
        <>
          <div className="step-label label">Step 2 of 2 · Payment</div>
          <div className="cells cells-3 summary-cells">
            <div><span className="label label-xs muted">Course</span><span className="label">{course.title}</span></div>
            <div><span className="label label-xs muted">Class</span><span className="label">{session ? `${session.day} ${session.time_range}` : `Starts ${formatStart(course.starts_on)}`}</span></div>
            <div><span className="label label-xs muted">Total</span><span className="label">{formatPrice(course.price)}</span></div>
          </div>

          <div className="pay-options" role="radiogroup" aria-label="Payment method">
            <button type="button" role="radio" className="pay-option" aria-checked={method === 'card'} disabled={!ONLINE_PAYMENTS_LIVE} onClick={() => setMethod('card')}>
              <span className="label">Card · Bancontact</span>
              <span className="muted">{ONLINE_PAYMENTS_LIVE ? 'Pay now, secure checkout.' : 'Online payment opens soon.'}</span>
            </button>
            <button type="button" role="radio" className="pay-option" aria-checked={method === 'transfer'} onClick={() => setMethod('transfer')}>
              <span className="label">Bank transfer</span>
              <span className="muted">We email the details. Your place is held while it clears.</span>
            </button>
          </div>

          <div className="quote-nav">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
            <button type="button" className="btn btn-primary" onClick={confirm} disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending' : 'Confirm booking'}
            </button>
          </div>
          {status === 'error' && <p className="form-status error">That didn't send. Try again, or email us.</p>}
        </>
      )}
    </div>
  );
}
