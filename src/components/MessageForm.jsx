import { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import Honeypot from './Honeypot.jsx';

// Small public form that saves to `site_messages`; the database turns each one
// into a lead in #ops (migration 013). Used for the newsletter, the contact form
// and "register interest" blocks.
//   variant="inline"  → email + button on one line (newsletter)
//   variant="full"    → name, email, phone, message (contact)
//   variant="short"   → name + email (register interest)
export default function MessageForm({ topic, variant = 'short', button = 'Send', done = 'Thanks. We\'ll be in touch.', id = topic }) {
  const [f, setF] = useState({ name: '', email: '', phone: '', message: '' });
  const [trap, setTrap] = useState('');
  const [status, setStatus] = useState('idle');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (trap) { setStatus('sent'); return; }
    if (!f.email) return;
    setStatus('sending');
    const { error } = await supabase.from('site_messages').insert({
      topic,
      name: f.name || null,
      email: f.email,
      phone: f.phone || null,
      message: f.message || null,
    });
    setStatus(error ? 'error' : 'sent');
  };

  if (status === 'sent') return <p className="body" role="status">{done}</p>;

  const email = (
    <div className="field">
      <label htmlFor={`${id}-email`} className="label label-xs">Email</label>
      <input id={`${id}-email`} type="email" required value={f.email} onChange={set('email')} placeholder="you@example.com" />
    </div>
  );
  const error = status === 'error' && (
    <p className="muted" role="alert" style={{ marginTop: 'var(--space-3)' }}>
      That didn't go through. Try again in a minute.
    </p>
  );

  if (variant === 'inline') {
    return (
      <form className="inline-form" onSubmit={submit}>
        <Honeypot value={trap} onChange={setTrap} />
        {email}
        <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>{button}</button>
        {error}
      </form>
    );
  }

  return (
    <form onSubmit={submit}>
      <Honeypot value={trap} onChange={setTrap} />
      <div className="field-row">
        <div className="field">
          <label htmlFor={`${id}-name`} className="label label-xs">Name</label>
          <input id={`${id}-name`} required value={f.name} onChange={set('name')} />
        </div>
        {email}
      </div>
      {variant === 'full' && (
        <>
          <div className="field">
            <label htmlFor={`${id}-phone`} className="label label-xs">Phone (optional)</label>
            <input id={`${id}-phone`} type="tel" value={f.phone} onChange={set('phone')} />
          </div>
          <div className="field">
            <label htmlFor={`${id}-msg`} className="label label-xs">Message</label>
            <textarea id={`${id}-msg`} rows={5} required maxLength={4000} value={f.message} onChange={set('message')} />
          </div>
        </>
      )}
      <div className="actions">
        <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : button}
        </button>
      </div>
      {error}
      <p className="label label-xs muted" style={{ marginTop: 'var(--space-3)' }}>
        We only use this to reply. See <a href="#privacy">privacy</a>.
      </p>
    </form>
  );
}
