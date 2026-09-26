import { useState } from 'react';
import { HalfWorld } from './ui.jsx';
import { formatPrice } from '../lib/payments.js';

const START_FMT = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', timeZone: 'Europe/Brussels' });

export function formatStart(date) {
  return date ? START_FMT.format(new Date(date)).replace('/', '.') : 'Rolling';
}

// CourseCard per the DS brief: ink with coral rule, title in display, a meta
// row of three ruled cells (Starts / Length / Level), price, ENROL →.
export default function CourseCard({ course, onEnrol }) {
  const [open, setOpen] = useState(false);
  const modules = Array.isArray(course.modules) ? course.modules : [];
  const external = !!course.booking_url;

  return (
    <article className="course-card">
      <div className="course-top">
        <span className="label label-xs muted">{course.track === 'dj' ? 'DJ' : 'Production'}{course.format ? ` · ${course.format}` : ''}</span>
        {course.partner && <span className="tag">With {course.partner}</span>}
      </div>
      <h3 className="course-title">{course.title}</h3>
      {course.summary && <p className="muted course-summary">{course.summary}</p>}

      <div className="course-meta">
        <div><span className="label label-xs muted">Starts</span><span className="label">{formatStart(course.starts_on)}</span></div>
        <div><span className="label label-xs muted">Length</span><span className="label">{course.length || '—'}</span></div>
        <div><span className="label label-xs muted">Level</span><span className="label">{course.level}</span></div>
      </div>

      {open && modules.length > 0 && (
        <ul className="hw-list course-modules">
          {modules.map((m) => <li key={m}><HalfWorld size={16} />{m}</li>)}
        </ul>
      )}

      <div className="course-foot">
        <div className="course-price">{formatPrice(course.price)}{course.length === 'Per session' && course.price != null ? <span className="label label-xs muted"> / session</span> : null}</div>
        <div className="course-actions">
          {modules.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
              {open ? 'Less' : 'Details'}
            </button>
          )}
          {external ? (
            <a className="btn btn-primary btn-sm" href={course.booking_url} target="_blank" rel="noreferrer">Enrol →</a>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => onEnrol(course.id)}>Enrol →</button>
          )}
        </div>
      </div>
    </article>
  );
}
