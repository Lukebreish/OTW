import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { HalfWorld } from '../components/ui.jsx';

// Artist flow for #ops: services OTW sells to artists, one job per row with a
// short checklist. Team-only via RLS (supabase/migrations/008_artist_jobs.sql).

const SERVICES = [
  ['events', 'Events'],
  ['photoshoot', 'Photoshoot'],
  ['ghost-production', 'Production'],
  ['spotify-promotion', 'Spotify promotion'],
  ['mix-mastering', 'Mix and mastering'],
  ['training', 'Training'],
  ['mentoring', 'Mentoring'],
];
const SERVICE_LABEL = Object.fromEntries(SERVICES);

const STATUSES = [
  ['enquiry', 'Enquiry'],
  ['quoted', 'Quoted'],
  ['in_progress', 'In progress'],
  ['delivered', 'Delivered'],
  ['paid', 'Paid'],
  ['cancelled', 'Cancelled'],
];
const STATUS_LABEL = Object.fromEntries(STATUSES);
const CLOSED = ['paid', 'cancelled'];

const PAYMENTS = [
  ['unpaid', 'Unpaid'],
  ['deposit_paid', 'Deposit paid'],
  ['paid', 'Paid'],
];

const FIELDS = [
  ['title', 'Job title', 'text'],
  ['artist_name', 'Artist name', 'text'],
  ['artist_email', 'Email', 'email'],
  ['artist_phone', 'Phone (required)', 'tel'],
  ['instagram', 'Instagram', 'text'],
  ['due_date', 'Due date', 'date'],
  ['owner', 'OTW owner', 'text'],
  ['price', 'Price (EUR)', 'number'],
  ['cost', 'What we pay (EUR)', 'number'],
];
const SAVE_KEYS = FIELDS.map(([k]) => k).concat(['service', 'status', 'payment_status', 'brief', 'notes']);

const eur = (n) => (n === null || n === undefined || n === '' ? '—' : `€${Number(n).toLocaleString('en-GB', { maximumFractionDigits: 2 })}`);

function formatDate(value) {
  if (!value) return 'No date';
  const d = new Date(`${value}T00:00:00`);
  const opts = { weekday: 'short', day: '2-digit', month: 'short' };
  if (d.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric';
  return d.toLocaleDateString('en-GB', opts).replace(/,/g, '').toUpperCase();
}

function Bar({ pct }) {
  return (
    <span className="ops-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${pct}%` }} />
    </span>
  );
}
const progressOf = (items) => {
  const done = items.filter((i) => i.done).length;
  return { done, total: items.length, pct: items.length ? Math.round((done / items.length) * 100) : 0 };
};

function CheckIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5 9.5 18 20 6" /></svg>;
}

// ---------- New job ----------

function NewJob({ email, onCreated, onCancel }) {
  const [f, setF] = useState({ service: 'mix-mastering', artist_name: '', artist_phone: '', artist_email: '', instagram: '', brief: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const row = { ...f, owner: email, title: `${SERVICE_LABEL[f.service]} · ${f.artist_name}` };
    Object.keys(row).forEach((k) => { if (typeof row[k] === 'string' && row[k].trim() === '') row[k] = null; });
    const { data, error: err } = await supabase.from('artist_jobs').insert(row).select('id').single();
    setSaving(false);
    if (err) setError(err.message);
    else onCreated(data.id);
  };

  return (
    <form onSubmit={submit} className="ops-block" style={{ marginTop: 'var(--space-7)' }}>
      <span className="label label-xs">Service</span>
      <div className="tags" style={{ marginTop: 'var(--space-2)' }}>
        {SERVICES.map(([k, l]) => (
          <button key={k} type="button" className="tag tag-lg" aria-pressed={f.service === k} onClick={() => setF({ ...f, service: k })}>{l}</button>
        ))}
      </div>
      <div className="ops-fields" style={{ marginTop: 'var(--space-6)' }}>
        <div className="field"><label className="label label-xs" htmlFor="a-name">Artist name</label><input id="a-name" required value={f.artist_name} onChange={set('artist_name')} /></div>
        <div className="field"><label className="label label-xs" htmlFor="a-phone">Phone (required)</label><input id="a-phone" type="tel" required value={f.artist_phone} onChange={set('artist_phone')} /></div>
        <div className="field"><label className="label label-xs" htmlFor="a-email">Email</label><input id="a-email" type="email" value={f.artist_email} onChange={set('artist_email')} /></div>
        <div className="field"><label className="label label-xs" htmlFor="a-ig">Instagram</label><input id="a-ig" value={f.instagram} onChange={set('instagram')} /></div>
      </div>
      <div className="field"><label className="label label-xs" htmlFor="a-brief">Brief</label><textarea id="a-brief" value={f.brief} onChange={set('brief')} /></div>
      <div className="actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Creating' : 'Create job'}</button>
        <button className="btn btn-ghost" type="button" onClick={onCancel}>Cancel</button>
      </div>
      {error && <p className="form-status error">{error}</p>}
    </form>
  );
}

// ---------- List ----------

function JobsList({ email, onOpen }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('active');
  const [service, setService] = useState('all');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error: err } = await supabase
        .from('artist_jobs')
        .select('id, title, artist_name, service, status, due_date, price, cost, created_at, artist_job_steps(done)')
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      if (err) setError(err.message);
      else setRows(data);
    })();
  }, []);

  const counts = useMemo(() => {
    const c = { active: 0, all: rows?.length || 0 };
    (rows || []).forEach((r) => {
      c[r.status] = (c[r.status] || 0) + 1;
      if (!CLOSED.includes(r.status)) c.active += 1;
    });
    return c;
  }, [rows]);

  const visible = (rows || []).filter((r) => {
    if (service !== 'all' && r.service !== service) return false;
    if (filter === 'all') return true;
    if (filter === 'active') return !CLOSED.includes(r.status);
    return r.status === filter;
  });

  const open = (rows || []).filter((r) => !CLOSED.includes(r.status));
  const pipeline = open.reduce((s, r) => s + Number(r.price || 0), 0);

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow label"><HalfWorld size={16} />OTW Operations</div>
            <h1>Artists</h1>
            <p className="lead">Services sold to artists. One job per service, each with a short checklist.</p>
          </div>
          {!adding && <button className="btn btn-primary" type="button" onClick={() => setAdding(true)}>New job</button>}
        </div>

        {adding && <NewJob email={email} onCreated={onOpen} onCancel={() => setAdding(false)} />}

        <div className="tags">
          {[['active', 'Active'], ...STATUSES, ['all', 'All']].map(([key, label]) => (
            <button key={key} type="button" className="tag" aria-pressed={filter === key} onClick={() => setFilter(key)}>
              {label} · {counts[key] || 0}
            </button>
          ))}
        </div>
        <div className="tags">
          {[['all', 'All services'], ...SERVICES].map(([key, label]) => (
            <button key={key} type="button" className="tag" aria-pressed={service === key} onClick={() => setService(key)}>{label}</button>
          ))}
        </div>

        {rows && open.length > 0 && (
          <p className="label label-xs muted" style={{ marginTop: 'var(--space-5)' }}>Open jobs: {open.length} · {eur(pipeline)} quoted</p>
        )}
        {error && <p className="form-status error">{error}</p>}
        {!rows && !error && <p className="label muted" style={{ marginTop: 'var(--space-7)' }}>Loading</p>}

        {rows && (
          <div className="ops-list">
            {visible.length === 0 && <p className="muted ops-empty">Nothing here.</p>}
            {visible.map((r) => {
              const p = progressOf(r.artist_job_steps || []);
              return (
                <button key={r.id} type="button" className="ops-row" onClick={() => onOpen(r.id)}>
                  <span className="label ops-row-date">{formatDate(r.due_date)}</span>
                  <span className="ops-row-main">
                    <span className="label ops-row-name">{r.artist_name}</span>
                    <span className="muted">{[SERVICE_LABEL[r.service], r.price != null && eur(r.price)].filter(Boolean).join(' · ')}</span>
                  </span>
                  <span className={`tag ${r.status === 'in_progress' ? 'tag-fill' : ''}`}>{STATUS_LABEL[r.status]}</span>
                  <span className="ops-progress"><Bar pct={p.pct} /><span className="label label-xs">{p.done}/{p.total}</span></span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ---------- Detail ----------

function JobDetail({ id, email, onBack }) {
  const [job, setJob] = useState(null);
  const [draft, setDraft] = useState(null);
  const [steps, setSteps] = useState([]);
  const [saveState, setSaveState] = useState('idle');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [j, s] = await Promise.all([
      supabase.from('artist_jobs').select('*').eq('id', id).single(),
      supabase.from('artist_job_steps').select('*').eq('job_id', id).order('sort_order'),
    ]);
    if (j.error || s.error) { setError((j.error || s.error).message); return; }
    setJob(j.data); setDraft(j.data); setSteps(s.data);
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const dirty = job && draft && SAVE_KEYS.some((k) => String(job[k] ?? '') !== String(draft[k] ?? ''));
  const set = (key) => (e) => setDraft({ ...draft, [key]: e.target.value });

  const save = async () => {
    if (!String(draft.artist_phone || '').trim()) { setError('Phone is required.'); return; }
    setSaveState('saving'); setError('');
    const patch = {};
    SAVE_KEYS.forEach((k) => {
      let v = draft[k];
      if (v === '') v = null;
      if ((k === 'price' || k === 'cost') && v !== null) v = Number(v);
      patch[k] = v;
    });
    const { data, error: err } = await supabase.from('artist_jobs').update(patch).eq('id', id).select('*').single();
    if (err) { setSaveState('error'); setError(err.message); return; }
    setJob(data); setDraft(data); setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 1500);
  };

  const toggle = async (step) => {
    const next = !step.done;
    const patch = { done: next, done_at: next ? new Date().toISOString() : null, done_by: next ? email : null };
    setSteps((all) => all.map((s) => (s.id === step.id ? { ...s, ...patch } : s)));
    const { error: err } = await supabase.from('artist_job_steps').update(patch).eq('id', step.id);
    if (err) { setSteps((all) => all.map((s) => (s.id === step.id ? step : s))); setError(err.message); }
  };

  if (error && !job) {
    return (
      <section className="section"><div className="wrap">
        <p className="form-status error">{error}</p>
        <button type="button" className="btn btn-ghost" onClick={onBack}>← All jobs</button>
      </div></section>
    );
  }
  if (!job) return <div className="wrap status-page label">Loading</div>;

  const p = progressOf(steps);
  const margin = job.price != null && job.cost != null ? Number(job.price) - Number(job.cost) : null;

  return (
    <section className="section">
      <div className="wrap">
        <button type="button" className="btn btn-ghost" onClick={onBack}>← All jobs</button>

        <div className="ops-detail-head">
          <div>
            <div className="eyebrow label" style={{ marginTop: 'var(--space-6)' }}>
              <HalfWorld size={16} />{STATUS_LABEL[job.status]} · {SERVICE_LABEL[job.service]} · {formatDate(job.due_date)}
            </div>
            <h1>{job.artist_name}</h1>
            <p className="lead" style={{ marginTop: 'var(--space-4)' }}>
              {[eur(job.price) + ' price', eur(job.cost) + ' cost', margin !== null && `${eur(margin)} margin`].filter(Boolean).join(' · ')}
            </p>
          </div>
          <div className="ops-progress ops-progress-lg"><Bar pct={p.pct} /><span className="label">{p.pct}%</span></div>
        </div>

        <div className="ops-block">
          <div className="ops-block-head">
            <h2>Details</h2>
            <div className="actions" style={{ marginTop: 0 }}>
              {saveState === 'saved' && <span className="label label-xs muted">Saved</span>}
              <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={!dirty || saveState === 'saving'}>
                {saveState === 'saving' ? 'Saving' : 'Save changes'}
              </button>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label className="label label-xs" htmlFor="j-service">Service</label>
              <select id="j-service" value={draft.service} onChange={set('service')}>
                {SERVICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label label-xs" htmlFor="j-status">Status</label>
              <select id="j-status" value={draft.status} onChange={set('status')}>
                {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label label-xs" htmlFor="j-payment">Payment</label>
              <select id="j-payment" value={draft.payment_status} onChange={set('payment_status')}>
                {PAYMENTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="ops-fields">
            {FIELDS.map(([key, label, type]) => (
              <div className="field" key={key}>
                <label className="label label-xs" htmlFor={`j-${key}`}>{label}</label>
                <input id={`j-${key}`} type={type} step={type === 'number' ? '0.01' : undefined} required={key === 'artist_phone' || key === 'artist_name'} value={draft[key] ?? ''} onChange={set(key)} />
              </div>
            ))}
          </div>

          <div className="field"><label className="label label-xs" htmlFor="j-brief">Brief</label><textarea id="j-brief" value={draft.brief ?? ''} onChange={set('brief')} /></div>
          <div className="field"><label className="label label-xs" htmlFor="j-notes">Notes</label><textarea id="j-notes" value={draft.notes ?? ''} onChange={set('notes')} /></div>
          {error && <p className="form-status error">{error}</p>}
        </div>

        <div className="ops-block">
          <div className="ops-block-head">
            <h2>Checklist</h2>
            <span className="label muted">{p.done}/{p.total} done</span>
          </div>
          {steps.length === 0 && <p className="muted">No steps for this service. Add rows to artist_service_template.</p>}
          {steps.map((s) => (
            <button key={s.id} type="button" role="checkbox" aria-checked={s.done} className="check-row" onClick={() => toggle(s)}>
              <span className="check-box">{s.done && <CheckIcon />}</span>
              <span className="check-label">{s.label}</span>
              {s.done && s.done_by && <span className="check-meta">{s.done_by.split('@')[0]} · {formatDate(s.done_at?.slice(0, 10))}</span>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function OpsArtists({ email }) {
  const [openId, setOpenId] = useState(null);
  const go = (id) => { setOpenId(id); window.scrollTo({ top: 0 }); };
  return openId
    ? <JobDetail key={openId} id={openId} email={email} onBack={() => go(null)} />
    : <JobsList email={email} onOpen={go} />;
}
