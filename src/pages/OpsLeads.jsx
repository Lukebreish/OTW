import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { HalfWorld } from '../components/ui.jsx';

// Simple lead list for #ops: clients and DJs in one place. Team-only via RLS
// (supabase/migrations/007_leads.sql). Forms add leads on their own.

const STAGES = [
  ['new', 'New'],
  ['contacted', 'Contacted'],
  ['replied', 'Replied'],
  ['won', 'Won'],
  ['lost', 'Lost'],
];
const STAGE_LABEL = Object.fromEntries(STAGES);
const today = () => new Date().toISOString().slice(0, 10);

function dueLabel(r) {
  if (!r.follow_up || ['won', 'lost'].includes(r.status)) return '';
  const t = today();
  if (r.follow_up < t) return 'Overdue';
  if (r.follow_up === t) return 'Due today';
  return `Due ${new Date(`${r.follow_up}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()}`;
}
const isDue = (r) => r.follow_up && r.follow_up <= today() && !['won', 'lost'].includes(r.status);

function igUrl(v) {
  if (!v) return '';
  return v.startsWith('http') ? v : `https://instagram.com/${v.replace('@', '')}`;
}

function AddLead({ email, onAdded, onCancel }) {
  const [f, setF] = useState({ kind: 'client', name: '', company: '', email: '', phone: '', instagram: '', city: '', notes: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const row = { ...f, source: 'manual' };
    Object.keys(row).forEach((k) => { if (row[k] === '') row[k] = null; });
    const { data, error: err } = await supabase.from('leads').insert(row).select('*').single();
    setSaving(false);
    if (err) setError(err.code === '23505' ? 'That email is already in the list.' : err.message);
    else onAdded(data);
  };

  return (
    <form onSubmit={submit} className="ops-block" style={{ marginTop: 'var(--space-7)' }}>
      <div className="tags">
        {[['client', 'Client'], ['dj', 'DJ']].map(([k, l]) => (
          <button key={k} type="button" className="tag tag-lg" aria-pressed={f.kind === k} onClick={() => setF({ ...f, kind: k })}>{l}</button>
        ))}
      </div>
      <div className="ops-fields" style={{ marginTop: 'var(--space-6)' }}>
        <div className="field"><label className="label label-xs" htmlFor="l-name">Name</label><input id="l-name" required value={f.name} onChange={set('name')} /></div>
        <div className="field"><label className="label label-xs" htmlFor="l-company">{f.kind === 'dj' ? 'DJ name' : 'Venue / company'}</label><input id="l-company" value={f.company} onChange={set('company')} /></div>
        <div className="field"><label className="label label-xs" htmlFor="l-city">City</label><input id="l-city" value={f.city} onChange={set('city')} /></div>
        <div className="field"><label className="label label-xs" htmlFor="l-email">Email</label><input id="l-email" type="email" value={f.email} onChange={set('email')} /></div>
        <div className="field"><label className="label label-xs" htmlFor="l-phone">Phone</label><input id="l-phone" value={f.phone} onChange={set('phone')} /></div>
        <div className="field"><label className="label label-xs" htmlFor="l-ig">Instagram</label><input id="l-ig" value={f.instagram} onChange={set('instagram')} /></div>
      </div>
      <div className="field"><label className="label label-xs" htmlFor="l-notes">Notes</label><textarea id="l-notes" value={f.notes} onChange={set('notes')} /></div>
      <div className="actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving' : 'Add lead'}</button>
        <button className="btn btn-ghost" type="button" onClick={onCancel}>Cancel</button>
      </div>
      {error && <p className="form-status error">{error}</p>}
    </form>
  );
}

function LeadDetail({ lead, onChange }) {
  const [notes, setNotes] = useState(lead.notes || '');
  const [followUp, setFollowUp] = useState(lead.follow_up || '');
  const [error, setError] = useState('');

  const patch = async (p) => {
    const { data, error: err } = await supabase.from('leads').update(p).eq('id', lead.id).select('*').single();
    if (err) setError(err.message);
    else { setError(''); onChange(data); setFollowUp(data.follow_up || ''); }
  };
  const dirty = notes !== (lead.notes || '') || followUp !== (lead.follow_up || '');

  return (
    <div className="ops-block" style={{ marginTop: 0, padding: 'var(--space-6) 0' }}>
      <div className="tags">
        {STAGES.map(([k, l]) => (
          <button key={k} type="button" className="tag" aria-pressed={lead.status === k} onClick={() => lead.status !== k && patch({ status: k })}>{l}</button>
        ))}
      </div>
      <p className="muted" style={{ marginTop: 'var(--space-5)' }}>
        {[lead.email && <a key="e" href={`mailto:${lead.email}`}>{lead.email}</a>,
          lead.phone && <a key="p" href={`tel:${lead.phone}`}>{lead.phone}</a>,
          lead.instagram && <a key="i" href={igUrl(lead.instagram)} target="_blank" rel="noreferrer">{lead.instagram}</a>]
          .filter(Boolean).reduce((acc, el, i) => (i ? [...acc, ' · ', el] : [el]), []) }
        {!lead.email && !lead.phone && !lead.instagram && 'No contact details yet.'}
      </p>
      <div className="field-row" style={{ marginTop: 'var(--space-5)' }}>
        <div className="field">
          <label className="label label-xs" htmlFor={`fu-${lead.id}`}>Follow up on</label>
          <input id={`fu-${lead.id}`} type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label className="label label-xs" htmlFor={`n-${lead.id}`}>Notes</label>
        <textarea id={`n-${lead.id}`} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="actions" style={{ marginTop: 0 }}>
        <button type="button" className="btn btn-primary btn-sm" disabled={!dirty} onClick={() => patch({ notes: notes || null, follow_up: followUp || null })}>Save</button>
      </div>
      {error && <p className="form-status error">{error}</p>}
    </div>
  );
}

export default function OpsLeads({ email }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('due');
  const [openId, setOpenId] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error: err } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (err) setError(err.message); else setRows(data);
    })();
  }, []);

  const counts = useMemo(() => {
    const open = (rows || []).filter((r) => !['won', 'lost'].includes(r.status));
    return {
      due: (rows || []).filter(isDue).length,
      client: open.filter((r) => r.kind === 'client').length,
      dj: open.filter((r) => r.kind === 'dj').length,
      all: rows?.length || 0,
    };
  }, [rows]);

  const visible = (rows || []).filter((r) => {
    if (filter === 'due') return isDue(r);
    if (filter === 'all') return true;
    return r.kind === filter && !['won', 'lost'].includes(r.status);
  }).sort((a, b) => (filter === 'due' ? (a.follow_up || '').localeCompare(b.follow_up || '') : 0));

  const replace = (row) => setRows((all) => all.map((r) => (r.id === row.id ? row : r)));
  const filters = [['due', 'Due today'], ['client', 'Clients'], ['dj', 'DJs'], ['all', 'All']];

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow label"><HalfWorld size={16} />OTW Operations</div>
            <h1>Leads</h1>
            <p className="lead">Clients and DJs in one list. Quote, join and demo forms add themselves.</p>
          </div>
          <button className="btn btn-primary" type="button" onClick={() => setAdding(true)}>Add lead</button>
        </div>

        {adding && <AddLead email={email} onCancel={() => setAdding(false)} onAdded={(row) => { setRows((all) => [row, ...all]); setAdding(false); setFilter(row.kind); setOpenId(row.id); }} />}

        <div className="tags">
          {filters.map(([k, l]) => (
            <button key={k} type="button" className="tag" aria-pressed={filter === k} onClick={() => setFilter(k)}>{l} · {counts[k]}</button>
          ))}
        </div>

        {error && <p className="form-status error">{error}</p>}
        {!rows && !error && <p className="label muted" style={{ marginTop: 'var(--space-7)' }}>Loading</p>}

        {rows && (
          <div className="ops-list">
            {visible.length === 0 && <p className="muted ops-empty">{filter === 'due' ? 'Nothing due. Nice.' : 'Nothing here.'}</p>}
            {visible.map((r) => (
              <div key={r.id}>
                <button type="button" className="ops-row" aria-expanded={openId === r.id} onClick={() => setOpenId(openId === r.id ? null : r.id)}>
                  <span className="label ops-row-date">{r.kind === 'dj' ? 'DJ' : 'Client'}</span>
                  <span className="ops-row-main">
                    <span className="label ops-row-name">{r.company || r.name}</span>
                    <span className="muted">{[r.company && r.name, r.city, r.notes?.split('\n')[0]].filter(Boolean).join(' · ') || '—'}</span>
                  </span>
                  <span className={`tag ${r.status === 'won' ? 'tag-fill' : ''}`}>{STAGE_LABEL[r.status]}</span>
                  <span className="label label-xs muted">{dueLabel(r)}</span>
                </button>
                {openId === r.id && <LeadDetail lead={r} onChange={replace} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
