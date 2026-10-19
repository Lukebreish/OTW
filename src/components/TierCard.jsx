import { HalfWorld } from './ui.jsx';
import { formatPrice } from '../lib/payments.js';
import { useLang } from '../lib/i18n.jsx';

// One course package (Academy tiers). The featured tier gets the accent frame,
// the Recommended tag and the primary button; the others stay ruled.
export default function TierCard({ course, onBook }) {
  const { t, loc } = useLang();
  const includes = loc(course, 'modules') || [];
  const excludes = loc(course, 'excludes') || [];
  const featured = !!course.featured;

  return (
    <article className={`tier ${featured ? 'is-featured' : ''}`} data-tier={course.id}>
      <div className="tier-top">
        {featured && <span className="tag tag-fill">{t('academy.tier.recommended')}</span>}
        <span className="label label-xs muted">
          {[loc(course, 'length'), loc(course, 'tier_label')].filter(Boolean).join(' · ')}
        </span>
      </div>
      <h3 className="tier-title">{loc(course, 'title')}</h3>
      <div className="tier-price">{formatPrice(course.price)}</div>
      {course.price_note && <div className="label label-xs muted">{loc(course, 'price_note')}</div>}
      {course.value_note && <div className="label label-xs accent tier-value">{loc(course, 'value_note')}</div>}
      {course.outcome && <p className="tier-outcome">{loc(course, 'outcome')}</p>}
      {(includes.length > 0 || excludes.length > 0) && (
        <ul className="tier-list">
          {includes.map((m) => <li key={m}><HalfWorld size={16} />{m}</li>)}
          {excludes.map((m) => <li key={m} className="is-out"><span className="tier-dash" aria-hidden="true">—</span>{m}</li>)}
        </ul>
      )}
      {course.audience && <p className="muted tier-audience">{loc(course, 'audience')}</p>}
      <button className={`btn ${featured ? 'btn-primary' : 'btn-secondary'} tier-btn`} onClick={() => onBook(course.id)}>
        {t('academy.tier.book')}
      </button>
    </article>
  );
}
