import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { HalfWorld } from '../components/ui.jsx';

// Personal client link: /#client/<token>. The client fills in their event and billing
// details; it updates their booking. Reads and writes go through two database functions
// that only accept the unguessable token (supabase/migrations/011).

const EVENT_FIELDS = [
  ['event_name', 'Event name', 'text'],
  ['event_date', 'Date', 'date'],
  ['opening_hours', 'Opening hours', 'text'],
  ['address', 'Event address', 'text'],
  ['expected_guests', 'Expected guests', 'text'],
];
const CONTACT_FIELDS = [
  ['client_name', 'Your name', 'text'],
  ['client_phone', 'Phone', 'tel'],
  ['client_email', 'Email', 'email'],
];
const BILLING_FIELDS = [
  ['invoice_company', 'Company / legal name', 'text'],
  ['invoice_vat', 'VAT number', 'text'],
  ['invoice_address', 'Billing address', 'text'],
  ['invoice_email', 'Billing email', 'email'],
];

export default function ClientPage() {
  const token = window.location.hash.replace('#client/', '').trim();
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading');
  const [saveState, setSaveState] = useState('idle');

  useEffect(() => {
    (async () => {
      const valid = /^[0-9a-f-]{36}$/i.test(token);
      if (!valid) { setState('missing'); return; }
      const { data: row, error } = await supabase.rpc('get_client_booking', { p_token: token });
      if (error || !row) setState('missing');
      else { setData(row); setState('ready'); }
    })();
  }, [token]);

  const set = (key) => (e) => setData({ ...data, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaveState('saving');
    const { data: ok, error } = await supabase.rpc('update_client_booking', { p_token: token, p_data: data });
    setSaveState(error || !ok ? 'error' : 'saved');
  };

  if (state === 'loading') return <div className="wrap status-page label">Loading</div>;
  if (state === 'missing') {
    return (
      <section className="section">
        <div className="wrap wrap-narrow">
          <div className="eyebrow label"><HalfWorld size={16} />Off The World</div>
          <h1>Link not found</h1>
          <p className="lead" style={{ marginTop: 'var(--space-5)' }}>This link isn't valid any more. Ask your OTW contact for a new one.</p>
        </div>
      </section>
    );
  }

  const field = ([key, label, type]) => (
    <div className="field" key={key}>
      <label className="label label-xs" htmlFor={`c-${key}`}>{label}</label>
      <input id={`c-${key}`} type={type} required={key === 'client_phone' || key === 'client_name'} value={data[key] ?? ''} onChange={set(key)} />
    </div>
  );

  return (
    <section className="section">
      <div className="wrap wrap-narrow">
        <div className="eyebrow label"><HalfWorld size={16} />Off The World</div>
        <h1>{data.booking_type === 'dj_only' ? 'Your DJ booking' : 'Your event'}</h1>
        <p className="lead" style={{ marginTop: 'var(--space-5)' }}>
          Fill in what you can. You can come back to this link and change it any time.
        </p>

        <form style={{ marginTop: 'var(--space-8)' }} onSubmit={submit}>
          <h2>The event</h2>
          <div className="ops-fields" style={{ marginTop: 'var(--space-5)' }}>{EVENT_FIELDS.map(field)}</div>
          <h2 style={{ marginTop: 'var(--space-7)' }}>Your details</h2>
          <div className="ops-fields" style={{ marginTop: 'var(--space-5)' }}>{CONTACT_FIELDS.map(field)}</div>
          <h2 style={{ marginTop: 'var(--space-7)' }}>Invoicing</h2>
          <div className="ops-fields" style={{ marginTop: 'var(--space-5)' }}>{BILLING_FIELDS.map(field)}</div>
          <div className="field">
            <label className="label label-xs" htmlFor="c-notes">Anything else we should know?</label>
            <textarea id="c-notes" value={data.client_notes ?? ''} onChange={set('client_notes')} />
          </div>

          <button className="btn btn-primary" type="submit" disabled={saveState === 'saving'}>
            {saveState === 'saving' ? 'Saving' : 'Save details'}
          </button>
          {saveState === 'saved' && <p className="form-status">Saved. Thank you.</p>}
          {saveState === 'error' && <p className="form-status error">That didn't save. Check the phone number is filled in, then try again.</p>}
        </form>
      </div>
    </section>
  );
}
