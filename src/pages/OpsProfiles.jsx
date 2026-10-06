import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { HalfWorld } from '../components/ui.jsx';

// Review artist applications and publish them to the Artists page. Team-only via RLS
// (supabase/migrations/010_artist_profiles.sql). Nothing goes public until Publish.

const FILTERS = [['pending', 'Pending'], ['approved', 'Published'], ['rejected', 'Rejected']];

const slugify = (v) => v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function OpsProfiles() {
  const [rows, setRows] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [openId, setOpenId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const { data, error: err } = await supabase.from('dj_applications').select('*').order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setRows(data);
  };
  useEffect(() => { load(); }, []);

  const counts = useMemo(() => Object.fromEntries(FILTERS.map(([k]) => [k, (rows || []).filter((r) => r.status === k).length])), [rows]);
  const visible = (rows || []).filter((r) => r.status === filter);
  const open = (rows || []).find((r) => r.id === openId);

  const publish = async (a) => {
    setBusy(true); setError('');
    const base = slugify(a.dj_name) || 'artist';
    const profile = {
      name: a.dj_name, role: a.role || 'DJ', location: a.location, bio: a.bio, genres: a.genres || [],
      years_experience: a.years_experience, languages: a.languages || [], instagram: a.instagram,
      soundcloud: a.soundcloud, mixcloud: a.mixcloud, spotify: a.spotify, image_url: a.photo_url,
      published: true, sort_order: 100,
    };
    let id = base;
    let res = await supabase.from('djs').insert({ id, ...profile });
    if (res.error?.code === '23505') {
      id = `${base}-${Math.random().toString(36).slice(2, 6)}`;
      res = await supabase.from('djs').insert({ id, ...profile });
    }
    if (res.error) { setBusy(false); setError(res.error.message); return; }
    const upd = await supabase.from('dj_applications').update({ status: 'approved', dj_id: id }).eq('id', a.id);
    setBusy(false);
    if (upd.error) setError(upd.error.message);
    else { setOpenId(null); load(); }
  };

  const reject = async (a) => {
    setBusy(true);
    const { error: err } = await supabase.from('dj_applications').update({ status: 'rejected' }).eq('id', a.id);
    setBusy(false);
    if (err) setError(err.message); else { setOpenId(null); load(); }
  };

  const unpublish = async (a) => {
    setBusy(true);
    const r1 = await supabase.from('djs').update({ published: false }).eq('id', a.dj_id);
    const r2 = r1.error ? r1 : await supabase.from('dj_applications').update({ status: 'pending' }).eq('id', a.id);
    setBusy(false);
    if (r2.error) setError(r2.error.message); else { setOpenId(null); load(); }
  };

  if (open) {
    const links = [['Instagram', open.instagram], ['SoundCloud', open.soundcloud], ['Mixcloud', open.mixcloud], ['Spotify', open.spotify]].filter(([, v]) => v);
    return (
      <section className="section">
        <div className="wrap">
          <button type="button" className="btn btn-ghost" onClick={() => setOpenId(null)}>← All applications</button>
          <div className="profile" style={{ marginTop: 'var(--space-6)' }}>
            <div className="profile-photo">{open.photo_url ? <img src={open.photo_url} alt={open.dj_name} /> : <span className="artist-initial">{open.dj_name.slice(0, 1)}</span>}</div>
            <div>
              <div className="label label-xs muted">{[open.role, open.location, open.years_experience ? `${open.years_experience} yrs` : null].filter(Boolean).join(' · ')}</div>
              <h1 style={{ marginTop: 'var(--space-3)' }}>{open.dj_name}</h1>
              <p className="muted" style={{ marginTop: 'var(--space-3)' }}>{open.name} · {open.email}</p>
              {open.bio && <p className="profile-bio">{open.bio}</p>}
              {open.genres?.length > 0 && <div className="tags" style={{ marginTop: 'var(--space-5)' }}>{open.genres.map((g) => <span key={g} className="tag">{g}</span>)}</div>}
              {links.length > 0 && <div className="profile-links label label-xs">{links.map(([n, u]) => <a key={n} href={u} target="_blank" rel="noreferrer">{n} →</a>)}</div>}
              {(open.availability || open.rate || open.notes) && (
                <p className="muted" style={{ marginTop: 'var(--space-5)' }}>
                  {[open.availability && `Availability: ${open.availability}`, open.rate && `Rate: ${open.rate}`, open.notes].filter(Boolean).join(' · ')}
                </p>
              )}
              <div className="actions">
                {open.status !== 'approved' && <button className="btn btn-primary" disabled={busy} onClick={() => publish(open)}>{busy ? 'Working' : 'Publish to site'}</button>}
                {open.status === 'approved' && <button className="btn btn-secondary" disabled={busy} onClick={() => unpublish(open)}>Unpublish</button>}
                {open.status === 'pending' && <button className="btn btn-ghost" disabled={busy} onClick={() => reject(open)}>Reject</button>}
              </div>
              {error && <p className="form-status error">{error}</p>}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="wrap">
        <div className="eyebrow label"><HalfWorld size={16} />OTW Operations</div>
        <h1>Profiles</h1>
        <p className="lead">Artists who applied with a photo. Publish one and it appears on the Artists page.</p>
        <div className="tags">
          {FILTERS.map(([k, l]) => <button key={k} type="button" className="tag" aria-pressed={filter === k} onClick={() => setFilter(k)}>{l} · {counts[k] || 0}</button>)}
        </div>
        {error && <p className="form-status error">{error}</p>}
        {!rows && !error && <p className="label muted" style={{ marginTop: 'var(--space-7)' }}>Loading</p>}
        {rows && (
          <div className="ops-list">
            {visible.length === 0 && <p className="muted ops-empty">Nothing here.</p>}
            {visible.map((r) => (
              <button key={r.id} type="button" className="ops-row" onClick={() => setOpenId(r.id)}>
                <span className="label ops-row-date">{new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()}</span>
                <span className="ops-row-main">
                  <span className="label ops-row-name">{r.dj_name}</span>
                  <span className="muted">{[r.role, r.location, r.genres?.slice(0, 3).join(', ')].filter(Boolean).join(' · ') || '—'}</span>
                </span>
                <span className="tag">{r.photo_url ? 'Photo' : 'No photo'}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
