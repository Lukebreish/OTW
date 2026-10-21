import { useState } from 'react';
import { HalfWorld } from './ui.jsx';
import { formatPrice } from '../lib/payments.js';
import { useLang } from '../lib/i18n.jsx';

const START_OPTS = { day: '2-digit', month: '2-digit', timeZone: 'Europe/Brussels' };
const cache = new Map();

// formatStart(date, fallback) — the caller passes the translated "Rolling".
export function formatStart(date, fallback = 'Rolling', locale = 'en-GB') {
  if (!date) return fallback;
  if (!cache.has(locale)) cache.set(locale, new Intl.DateTimeFormat(locale, START_OPTS));
  return cache.get(locale).format(new Date(date)).replace('/', '.');
}

// CourseCard per the DS brief: ink with coral rule, title in display, a meta
// row of three ruled cells (Starts / Length / Level), price, ENROL →.
export default function CourseCard({ course, onEnrol }) {
  const [open, setOpen] = useState(false);
  const { t, loc, locale } = useLang();
  const modules = Array.isArray(course.modules) ? course.modules : [];
  const external = !!course.booking_url;

  return (
    <article className="course-card">
      <div className="course-top">
        <span className="label label-xs muted">{course.track === 'dj' ? t('course.dj') : t('course.production')}{course.format ? ` · ${loc(course, 'format')}` : ''}</span>
        {course.partner && <span className="tag">{t('course.partner', { name: course.partner })}</span>}
      </div>
      <h3 className="course-title">{loc(course, 'title')}</h3>
      {course.summary && <p className="muted course-summary">{loc(course, 'summary')}</p>}

      <div className="course-meta">
        <div><span className="label label-xs muted">{t('course.starts')}</span><span className="label">{formatStart(course.starts_on, t('course.rolling'), locale)}</span></div>
        <div><span className="label label-xs muted">{t('course.length')}</span><span className="label">{course.length ? loc(course, 'length') : '—'}</span></div>
        <div><span className="label label-xs muted">{t('course.level')}</span><span className="label">{loc(course, 'level')}</span></div>
      </div>

      {open && modules.length > 0 && (
        <ul className="hw-list course-modules">
          {modules.map((m) => <li key={m}><HalfWorld size={16} />{m}</li>)}
        </ul>
      )}

      <div className="course-foot">
        <div className="course-price">{formatPrice(course.price)}{course.length === 'Per session' && course.price != null ? <span className="label label-xs muted"> {t('course.per.session')}</span> : null}</div>
        <div className="course-actions">
          {modules.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
              {open ? t('course.less') : t('course.details')}
            </button>
          )}
          {external ? (
            <a className="btn btn-primary btn-sm" href={course.booking_url} target="_blank" rel="noreferrer">{t('course.enrol')}</a>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => onEnrol(course.id)}>{t('course.enrol')}</button>
          )}
        </div>
      </div>
    </article>
  );
}
