import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { HalfWorld } from '../components/ui.jsx';
import OpsLeads from './OpsLeads.jsx';
import OpsArtists from './OpsArtists.jsx';
import OpsProfiles from './OpsProfiles.jsx';
import { openInvoice } from '../lib/invoice.js';

// Internal operations page (#ops). Not in the nav. Everything it reads is
// locked by RLS to confirmed accounts on the team_members list — see
// supabase/migrations/006_ops.sql. The public site never touches these tables.

const STATUSES = [
  ['prospect', 'Prospect'],
  ['confirmed', 'Confirmed'],
  ['in_preparation', 'In preparation'],
  ['completed', 'Completed'],
  ['cancelled', 'Cancelled'],
];
const STATUS_LABEL = Object.fromEntries(STATUSES);

const PAYMENTS = [
  ['unpaid', 'Unpaid'],
  ['deposit_paid', 'Deposit paid'],
  ['paid', 'Paid'],
];

const PHASES = [
  ['sell', 'Sell it', 'Win and price the booking'],
  ['run', 'Run it', 'Deliver it on the day'],
  ['learn', 'Learn from it', 'Capture it and close it out'],
];

const OPS_URL = () => `${window.location.origin}/?to=ops`;

function formatDate(value) {
  if (!value) return 'No date';
  const d = new Date(`${value}T00:00:00`);
  const opts = { weekday: 'short', day: '2-digit', month: 'short' };
  if (d.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric';
  return d.toLocaleDateString('en-GB', opts).replace(/,/g, '').toUpperCase();
}

function progressOf(items) {
  const total = items.length;
  const done = items.filter((i) => i.done).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

function Bar({ pct }) {
  return (
    <span className="ops-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${pct}%` }} />
    </span>
  );
}

// ---------- Auth ----------

function useSession() {
  const [state, setState] = useState({ loading: true, session: null });
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setState({ loading: false, session: data.session });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ loading: false, session });
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);
  return state;
}

function AuthPanel() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ kind: 'idle', message: '' });

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ kind: 'sending', message: '' });
    let error = null;
    let done = '';
    if (mode === 'signin') {
      ({ error } = await supabase.auth.signInWithPassword({ email, password }));
    } else if (mode === 'signup') {
      ({ error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: OPS_URL() } }));
      done = 'Check your inbox and confirm your email, then sign in here.';
    } else {
      ({ error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${OPS_URL()}&reset=1` }));
      done = 'If that email has an account, a reset link is on its way. Open it in this browser.';
    }
    if (error) setStatus({ kind: 'error', message: error.message });
    else setStatus({ kind: 'done', message: done });
  };

  const titles = { signin: 'Sign in', signup: 'Create account', reset: 'Reset password' };

  return (
    <section className="section">
      <div className="wrap wrap-narrow">
        <div className="eyebrow label"><HalfWorld size={16} />OTW Operations</div>
        <h1>{titles[mode]}</h1>
        <p className="lead" style={{ marginTop: 'var(--space-5)' }}>
          Internal only. Use the email the OTW team added for you.
        </p>

        <div className="tags" style={{ marginTop: 'var(--space-7)' }}>
          {['signin', 'signup'].map((m) => (
            <button key={m} type="button" className="tag tag-lg" aria-pressed={mode === m} onClick={() => { setMode(m); setStatus({ kind: 'idle', message: '' }); }}>
              {titles[m]}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={{ marginTop: 'var(--space-7)' }}>
          <div className="field">
            <label className="label label-xs" htmlFor="ops-email">Email</label>
            <input id="ops-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {mode !== 'reset' && (
            <div className="field">
              <label className="label label-xs" htmlFor="ops-password">Password</label>
              <input
                id="ops-password"
                type="password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                minLength={mode === 'signup' ? 8 : undefined}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
          <div className="actions">
            <button className="btn btn-primary" type="submit" disabled={status.kind === 'sending'}>
              {status.kind === 'sending' ? 'Working' : titles[mode]}
            </button>
            {mode === 'signin' && (
              <button type="button" className="btn btn-ghost" onClick={() => { setMode('reset'); setStatus({ kind: 'idle', message: '' }); }}>
                Forgot password →
              </button>
            )}
            {mode === 'reset' && (
              <button type="button" className="btn btn-ghost" onClick={() => setMode('signin')}>
                Back to sign in →
              </button>
            )}
          </div>
          {status.message && <p className={`form-status ${status.kind === 'error' ? 'error' : ''}`}>{status.message}</p>}
        </form>
      </div>
    </section>
  );
}

function SetPassword({ onDone }) {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ kind: 'idle', message: '' });
  const submit = async (e) => {
    e.preventDefault();
    setStatus({ kind: 'sending', message: '' });
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setStatus({ kind: 'error', message: error.message });
    else onDone();
  };
  return (
    <section className="section">
      <div className="wrap wrap-narrow">
        <div className="eyebrow label"><HalfWorld size={16} />OTW Operations</div>
        <h1>New password</h1>
        <form onSubmit={submit} style={{ marginTop: 'var(--space-7)' }}>
          <div className="field">
            <label className="label label-xs" htmlFor="ops-new-password">New password</label>
            <input id="ops-new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={status.kind === 'sending'}>Save password</button>
          {status.message && <p className="form-status error">{status.message}</p>}
        </form>
      </div>
    </section>
  );
}

// ---------- New booking ----------

function NewBooking({ email, onCreated, onCancel }) {
  const [f, setF] = useState({ booking_type: 'event', event_name: '', client_name: '', client_phone: '', client_email: '', event_date: '', address: '', location: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const row = { ...f, owner: email, event_name: f.event_name || (f.booking_type === 'dj_only' ? 'DJ booking' : 'New booking') };
    Object.keys(row).forEach((k) => { if (typeof row[k] === 'string' && row[k].trim() === '') row[k] = null; });
    const { data, error: err } = await supabase.from('bookings').insert(row).select('id').single();
    setSaving(false);
    if (err) setError(err.message);
    else onCreated(data.id);
  };

  return (
    <form onSubmit={submit} className="ops-block" style={{ marginTop: 'var(--space-7)' }}>
      <div className="tags">
        {[['event', 'Event'], ['dj_only', 'DJ only']].map(([k, l]) => (
          <button key={k} type="button" className="tag tag-lg" aria-pressed={f.booking_type === k} onClick={() => setF({ ...f, booking_type: k })}>{l}</button>
        ))}
      </div>
      <div className="ops-fields" style={{ marginTop: 'var(--space-6)' }}>
        <div className="field"><label className="label label-xs" htmlFor="n-name">Event name</label><input id="n-name" value={f.event_name} onChange={set('event_name')} /></div>
        <div className="field"><label className="label label-xs" htmlFor="n-client">Client / organiser</label><input id="n-client" required value={f.client_name} onChange={set('client_name')} /></div>
        <div className="field"><label className="label label-xs" htmlFor="n-phone">Client phone (required)</label><input id="n-phone" type="tel" required value={f.client_phone} onChange={set('client_phone')} /></div>
        <div className="field"><label className="label label-xs" htmlFor="n-email">Client email</label><input id="n-email" type="email" value={f.client_email} onChange={set('client_email')} /></div>
        <div className="field"><label className="label label-xs" htmlFor="n-date">Date</label><input id="n-date" type="date" value={f.event_date} onChange={set('event_date')} /></div>
        <div className="field"><label className="label label-xs" htmlFor="n-city">City / area</label><input id="n-city" value={f.location} onChange={set('location')} /></div>
      </div>
      <div className="field"><label className="label label-xs" htmlFor="n-address">Event address</label><input id="n-address" placeholder="Street, number, postcode, city" value={f.address} onChange={set('address')} /></div>
      <div className="actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Creating' : 'Create booking'}</button>
        <button className="btn btn-ghost" type="button" onClick={onCancel}>Cancel</button>
      </div>
      {error && <p className="form-status error">{error}</p>}
    </form>
  );
}

// ---------- Bookings list ----------

function BookingsList({ onOpen, email }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('active');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error: err } = await supabase
        .from('bookings')
        .select('id, event_name, client_name, location, address, booking_type, event_date, status, owner, payment_status, created_at, booking_checklist(done)')
        .order('event_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      if (err) setError(err.message);
      else setRows(data);
    })();
  }, []);

  const counts = useMemo(() => {
    const c = { active: 0, all: rows?.length || 0 };
    (rows || []).forEach((r) => {
      c[r.status] = (c[r.status] || 0) + 1;
      if (!['completed', 'cancelled'].includes(r.status)) c.active += 1;
    });
    return c;
  }, [rows]);

  const visible = (rows || []).filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'active') return !['completed', 'cancelled'].includes(r.status);
    return r.status === filter;
  });

  const filters = [['active', 'Active'], ...STATUSES, ['all', 'All']];

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow label"><HalfWorld size={16} />OTW Operations</div>
            <h1>Bookings</h1>
            <p className="lead">Every quote request lands here as a prospect. Open one to run its checklist.</p>
          </div>
          {!adding && <button className="btn btn-primary" type="button" onClick={() => setAdding(true)}>New booking</button>}
        </div>

        {adding && <NewBooking email={email} onCreated={onOpen} onCancel={() => setAdding(false)} />}

        <div className="tags">
          {filters.map(([key, label]) => (
            <button key={key} type="button" className="tag" aria-pressed={filter === key} onClick={() => setFilter(key)}>
              {label} · {counts[key] || 0}
            </button>
          ))}
        </div>

        {error && <p className="form-status error">{error}</p>}
        {!rows && !error && <p className="label muted" style={{ marginTop: 'var(--space-7)' }}>Loading</p>}

        {rows && (
          <div className="ops-list">
            {visible.length === 0 && <p className="muted ops-empty">Nothing here.</p>}
            {visible.map((r) => {
              const p = progressOf(r.booking_checklist || []);
              return (
                <button key={r.id} type="button" className="ops-row" onClick={() => onOpen(r.id)}>
                  <span className="label ops-row-date">{formatDate(r.event_date)}</span>
                  <span className="ops-row-main">
                    <span className="label ops-row-name">{r.event_name || 'Untitled booking'}</span>
                    <span className="muted">{[r.booking_type === 'dj_only' && 'DJ only', r.client_name, r.address || r.location, r.owner && `Owner: ${r.owner}`].filter(Boolean).join(' · ') || '—'}</span>
                  </span>
                  <span className={`tag ${r.status === 'confirmed' || r.status === 'in_preparation' ? 'tag-fill' : ''}`}>{STATUS_LABEL[r.status]}</span>
                  <span className="ops-progress">
                    <Bar pct={p.pct} />
                    <span className="label label-xs">{p.done}/{p.total}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ---------- Booking detail ----------

const FIELDS = [
  ['event_name', 'Event name', 'text'],
  ['event_type', 'Event type', 'text'],
  ['event_date', 'Date', 'date'],
  ['opening_hours', 'Opening hours', 'text'],
  ['location', 'City / area', 'text'],
  ['address', 'Event address', 'text'],
  ['expected_guests', 'Expected guests', 'text'],
  ['client_name', 'Client / organiser', 'text'],
  ['client_email', 'Client email', 'email'],
  ['client_phone', 'Client phone (required)', 'tel'],
  ['owner', 'OTW owner', 'text'],
  ['agreed_price', 'Agreed price (EUR)', 'number'],
  ['material_cost', 'Material cost, what we pay (EUR)', 'number'],
];

const INVOICE_FIELDS = [
  ['invoice_company', 'Company / legal name', 'text'],
  ['invoice_vat', 'VAT number', 'text'],
  ['invoice_address', 'Billing address', 'text'],
  ['invoice_email', 'Billing email', 'email'],
  ['invoice_number', 'Invoice number', 'text'],
  ['invoice_amount', 'Invoice amount (EUR)', 'number'],
  ['invoice_due', 'Due date', 'date'],
];
const INVOICE_STATUSES = [['none', 'Not invoiced'], ['draft', 'Draft'], ['sent', 'Sent'], ['paid', 'Paid']];
const NUMERIC_KEYS = ['agreed_price', 'material_cost', 'invoice_amount'];
const ALL_KEYS = FIELDS.concat(INVOICE_FIELDS, [['status'], ['payment_status'], ['invoice_status'], ['notes']]);

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5 9.5 18 20 6" /></svg>
  );
}

function BookingDetail({ id, email, onBack }) {
  const [booking, setBooking] = useState(null);
  const [draft, setDraft] = useState(null);
  const [items, setItems] = useState([]);
  const [phase, setPhase] = useState(null);
  const [saveState, setSaveState] = useState('idle');
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    const [b, c] = await Promise.all([
      supabase.from('bookings').select('*').eq('id', id).single(),
      supabase.from('booking_checklist').select('*').eq('booking_id', id).order('section_order').order('sort_order'),
    ]);
    if (b.error || c.error) { setError((b.error || c.error).message); return; }
    setBooking(b.data);
    setDraft(b.data);
    setItems(c.data);
    setPhase((current) => {
      if (current) return current;
      const firstOpen = PHASES.find(([key]) => c.data.some((i) => i.phase === key && !i.done));
      return firstOpen ? firstOpen[0] : 'sell';
    });
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const dirty = booking && draft && ALL_KEYS
    .some(([key]) => String(booking[key] ?? '') !== String(draft[key] ?? ''));

  const set = (key) => (e) => setDraft({ ...draft, [key]: e.target.value });

  const save = async () => {
    if (!String(draft.client_phone || '').trim()) { setError('Client phone is required.'); return; }
    setSaveState('saving');
    setError('');
    const patch = {};
    ALL_KEYS.forEach(([key]) => {
      let v = draft[key];
      if (v === '') v = null;
      if (NUMERIC_KEYS.includes(key) && v !== null) v = Number(v);
      patch[key] = v;
    });
    const { data, error: err } = await supabase.from('bookings').update(patch).eq('id', id).select('*').single();
    if (err) { setSaveState('error'); setError(err.message); return; }
    setBooking(data);
    setDraft(data);
    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 1500);
  };

  const copyClientLink = async () => {
    const link = `${window.location.origin}/#client/${booking.client_token}`;
    try { await navigator.clipboard.writeText(link); setNote('Client link copied.'); }
    catch { setNote(link); }
    setTimeout(() => setNote(''), 4000);
  };

  const invoice = () => {
    const msg = openInvoice({ ...booking, ...draft });
    if (msg) setError(msg);
  };

  const toggle = async (item) => {
    const next = !item.done;
    const patch = { done: next, done_at: next ? new Date().toISOString() : null, done_by: next ? email : null };
    setItems((all) => all.map((i) => (i.id === item.id ? { ...i, ...patch } : i)));
    const { error: err } = await supabase.from('booking_checklist').update(patch).eq('id', item.id);
    if (err) {
      setItems((all) => all.map((i) => (i.id === item.id ? item : i)));
      setError(err.message);
    }
  };

  if (error && !booking) {
    return (
      <section className="section"><div className="wrap">
        <p className="form-status error">{error}</p>
        <button type="button" className="btn btn-ghost" onClick={onBack}>← All bookings</button>
      </div></section>
    );
  }
  if (!booking) return <div className="wrap status-page label">Loading</div>;

  const overall = progressOf(items);
  const phaseItems = items.filter((i) => i.phase === phase);
  const sections = [];
  phaseItems.forEach((i) => {
    let s = sections.find((x) => x.name === i.section);
    if (!s) { s = { name: i.section, items: [] }; sections.push(s); }
    s.items.push(i);
  });

  return (
    <section className="section">
      <div className="wrap">
        <button type="button" className="btn btn-ghost" onClick={onBack}>← All bookings</button>

        <div className="ops-detail-head">
          <div>
            <div className="eyebrow label" style={{ marginTop: 'var(--space-6)' }}>
              <HalfWorld size={16} />{STATUS_LABEL[booking.status]} · {formatDate(booking.event_date)}
            </div>
            <h1>{booking.event_name || 'Untitled booking'}</h1>
            <p className="lead" style={{ marginTop: 'var(--space-4)' }}>
              {[booking.booking_type === 'dj_only' && 'DJ only', booking.client_name, booking.address || booking.location, booking.expected_guests && `${booking.expected_guests} guests`, booking.agreed_price != null && booking.material_cost != null && `Margin €${(Number(booking.agreed_price) - Number(booking.material_cost)).toLocaleString('en-GB')}`].filter(Boolean).join(' · ') || 'Fill in the details below.'}
            </p>
          </div>
          <div className="ops-progress ops-progress-lg">
            <Bar pct={overall.pct} />
            <span className="label">{overall.pct}%</span>
          </div>
        </div>

        {/* Details */}
        <div className="ops-block">
          <div className="ops-block-head">
            <h2>Details</h2>
            <div className="actions" style={{ marginTop: 0 }}>
              {note && <span className="label label-xs muted">{note}</span>}
              <button type="button" className="btn btn-secondary btn-sm" onClick={copyClientLink}>Copy client link</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={invoice}>Invoice PDF</button>
              {saveState === 'saved' && <span className="label label-xs muted">Saved</span>}
              <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={!dirty || saveState === 'saving'}>
                {saveState === 'saving' ? 'Saving' : 'Save changes'}
              </button>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label className="label label-xs" htmlFor="b-status">Status</label>
              <select id="b-status" value={draft.status} onChange={set('status')}>
                {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label label-xs" htmlFor="b-payment">Payment status</label>
              <select id="b-payment" value={draft.payment_status} onChange={set('payment_status')}>
                {PAYMENTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="ops-fields">
            {FIELDS.map(([key, label, type]) => (
              <div className="field" key={key}>
                <label className="label label-xs" htmlFor={`b-${key}`}>{label}</label>
                <input id={`b-${key}`} type={type} step={type === 'number' ? '0.01' : undefined} required={key === 'client_phone'} value={draft[key] ?? ''} onChange={set(key)} />
              </div>
            ))}
          </div>

          {booking.services?.length > 0 && (
            <div className="field">
              <span className="label label-xs">Services requested</span>
              <div className="tags" style={{ marginTop: 'var(--space-2)' }}>
                {booking.services.map((s) => <span key={s} className="tag">{s.replace(/-/g, ' ')}</span>)}
              </div>
            </div>
          )}

          <div className="ops-block-head" style={{ marginTop: 'var(--space-7)' }}><h2>Invoicing</h2></div>
          <div className="field-row">
            <div className="field">
              <label className="label label-xs" htmlFor="b-invoice-status">Invoice status</label>
              <select id="b-invoice-status" value={draft.invoice_status} onChange={set('invoice_status')}>
                {INVOICE_STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="ops-fields">
            {INVOICE_FIELDS.map(([key, label, type]) => (
              <div className="field" key={key}>
                <label className="label label-xs" htmlFor={`b-${key}`}>{label}</label>
                <input id={`b-${key}`} type={type} step={type === 'number' ? '0.01' : undefined} value={draft[key] ?? ''} onChange={set(key)} />
              </div>
            ))}
          </div>

          {booking.client_notes && (
            <div className="field"><span className="label label-xs">Notes from the client</span><p style={{ marginTop: 'var(--space-2)' }}>{booking.client_notes}</p></div>
          )}
          <div className="field">
            <label className="label label-xs" htmlFor="b-notes">Notes, open points, decisions to make</label>
            <textarea id="b-notes" value={draft.notes ?? ''} onChange={set('notes')} />
          </div>
          {error && <p className="form-status error">{error}</p>}
        </div>

        {/* Checklist */}
        <div className="ops-block">
          <div className="ops-block-head">
            <h2>Checklist</h2>
            <span className="label muted">{overall.done}/{overall.total} done</span>
          </div>

          <div className="cells cells-3 ops-phases">
            {PHASES.map(([key, label, sub]) => {
              const p = progressOf(items.filter((i) => i.phase === key));
              return (
                <button key={key} type="button" className="ops-phase" aria-pressed={phase === key} onClick={() => setPhase(key)}>
                  <span className="label">{label}</span>
                  <span className="muted">{sub}</span>
                  <span className="ops-progress"><Bar pct={p.pct} /><span className="label label-xs">{p.done}/{p.total}</span></span>
                </button>
              );
            })}
          </div>

          {sections.map((s) => {
            const p = progressOf(s.items);
            return (
              <div className="ops-section" key={s.name}>
                <div className="ops-section-head">
                  <h3 className="label">{s.name}</h3>
                  <span className="label label-xs muted">{p.done}/{p.total}</span>
                </div>
                {s.items.map((i) => (
                  <button key={i.id} type="button" role="checkbox" aria-checked={i.done} className="check-row" onClick={() => toggle(i)}>
                    <span className="check-box">{i.done && <CheckIcon />}</span>
                    <span className="check-label">{i.label}</span>
                    {i.done && i.done_by && (
                      <span className="check-meta">{i.done_by.split('@')[0]} · {formatDate(i.done_at?.slice(0, 10))}</span>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------- Page ----------

export default function Ops() {
  const { loading, session } = useSession();
  const [member, setMember] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [tab, setTab] = useState('bookings');
  // A password-reset link lands on /?to=ops&reset=1&code=… — remember the
  // flag, then tidy the URL back to /#ops.
  const [resetting, setResetting] = useState(() => new URLSearchParams(window.location.search).get('reset') === '1');

  // By the time loading ends, supabase-js has already exchanged any ?code=
  // from an email link, so the query string can go.
  useEffect(() => {
    if (loading) return;
    if (window.location.search) window.history.replaceState(null, '', `${window.location.pathname}#ops`);
    if (!session) setResetting(false); // link opened in another browser: just sign in
  }, [loading, session]);

  useEffect(() => {
    if (!session) { setMember(null); return; }
    supabase.rpc('is_team_member').then(({ data }) => setMember(Boolean(data)));
  }, [session]);

  if (loading) return <div className="wrap status-page label">Loading</div>;
  if (!session) return <AuthPanel />;
  if (resetting) return <SetPassword onDone={() => setResetting(false)} />;
  if (member === null) return <div className="wrap status-page label">Checking access</div>;

  const email = session.user.email;
  const signOut = () => supabase.auth.signOut();

  if (!member) {
    return (
      <section className="section">
        <div className="wrap wrap-narrow">
          <div className="eyebrow label"><HalfWorld size={16} />OTW Operations</div>
          <h1>No access yet</h1>
          <p className="lead" style={{ marginTop: 'var(--space-5)' }}>
            {email} isn't on the OTW team list. Ask an admin to add it, then sign in again.
          </p>
          <div className="actions"><button type="button" className="btn btn-secondary" onClick={signOut}>Sign out</button></div>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="ops-bar-top">
        <div className="wrap ops-bar-top-inner">
          <span className="tags" style={{ margin: 0 }}>
            {[['bookings', 'Bookings'], ['artists', 'Artists'], ['profiles', 'Profiles'], ['leads', 'Leads']].map(([k, l]) => (
              <button key={k} type="button" className="tag" aria-pressed={tab === k} onClick={() => { setTab(k); setOpenId(null); }}>{l}</button>
            ))}
          </span>
          <button type="button" className="btn btn-ghost label-xs" onClick={signOut}>Sign out</button>
        </div>
      </div>
      {tab === 'leads' ? <OpsLeads email={email} /> : tab === 'artists' ? <OpsArtists email={email} /> : tab === 'profiles' ? <OpsProfiles /> : openId
        ? <BookingDetail key={openId} id={openId} email={email} onBack={() => { setOpenId(null); window.scrollTo({ top: 0 }); }} />
        : <BookingsList email={email} onOpen={(bid) => { setOpenId(bid); window.scrollTo({ top: 0 }); }} />}
    </>
  );
}
