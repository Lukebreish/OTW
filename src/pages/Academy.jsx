import { useEffect, useState } from 'react';
import { HalfWorld } from '../components/ui.jsx';
import TierCard from '../components/TierCard.jsx';
import FirstCallForm from '../components/FirstCallForm.jsx';
import ArtistsGrid from '../components/ArtistsGrid.jsx';
import MessageForm from '../components/MessageForm.jsx';
import { formatPrice } from '../lib/payments.js';
import { useLang } from '../lib/i18n.jsx';

const TRACKS = ['dj', 'production'];
const TRACK_KEY = 'otw-academy-track'; // set by Home before it opens Academy on a track
const BROCHURES = { dj: '/brochures/otw-academy-dj.pdf', production: '/brochures/otw-academy-production.pdf' };
const FAQ_COUNT = 7;

function initialTrack() {
  try {
    const saved = window.sessionStorage.getItem(TRACK_KEY);
    window.sessionStorage.removeItem(TRACK_KEY);
    if (TRACKS.includes(saved)) return saved;
  } catch { /* storage blocked */ }
  return 'dj';
}

export default function Academy({ courses, djs, go, goToQuote }) {
  const { t, loc } = useLang();
  const [track, setTrack] = useState(initialTrack);
  const [callCourse, setCallCourse] = useState('');
  const [picked, setPicked] = useState(null);

  const tiers = courses.filter((c) => (c.kind || 'course') === 'course');
  const shown = tiers.filter((c) => c.track === track);
  const addons = courses.filter((c) => c.kind === 'addon' && c.track === track);
  const compareRows = (shown.find((c) => c.featured) || shown[0])?.compare || [];
  // On phones one tier shows at a time, picked from a row of chips; it opens on the recommended one.
  const activeId = shown.some((c) => c.id === picked) ? picked : (shown.find((c) => c.featured) || shown[0])?.id;
  useEffect(() => { setPicked(null); }, [track]);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const openTrack = (key) => { setTrack(key); scrollTo('courses'); };
  const book = (courseId) => { setCallCourse(courseId); scrollTo('book'); };

  const cell = (value) => {
    if (value === true) return <span className="compare-yes" aria-label={t('academy.compare.yes')}><HalfWorld size={16} /></span>;
    if (value === false || value == null) return <span className="muted" aria-label={t('academy.compare.no')}>—</span>;
    return value;
  };

  return (
    <>
      <section className="hero hero-division">
        <div className="hero-rise" aria-hidden="true" />
        <div className="wrap hero-inner">
          <div className="eyebrow label"><HalfWorld size={16} />{t('academy.hero.tag')}</div>
          <h1>{t('academy.hero.title')}</h1>
          <p className="lead">{t('academy.hero.lead')}</p>
          <div className="actions">
            <button className="btn btn-primary" onClick={() => openTrack('dj')}>{t('academy.hero.dj')}</button>
            <button className="btn btn-secondary" onClick={() => openTrack('production')}>{t('academy.hero.production')}</button>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="section" id="courses" style={{ scrollMarginTop: 80 }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2>{t('academy.courses.title')}</h2>
              <p className="lead">{t(`academy.courses.lead.${track}`)}</p>
            </div>
          </div>

          {tiers.length === 0 ? (
            <div className="empty">
              <p style={{ marginBottom: 'var(--space-5)' }}>{t('academy.interest.text')}</p>
              <MessageForm topic="academy_interest" id="ac-int" button={t('academy.interest.button')} done={t('academy.interest.done')} />
            </div>
          ) : (
            <>
              <div className="tabs" role="tablist">
                {TRACKS.map((key) => (
                  <button key={key} role="tab" className="label" aria-selected={track === key} onClick={() => setTrack(key)}>
                    {t(`academy.track.${key}`)}
                  </button>
                ))}
              </div>

              <div className="tier-picker" role="tablist" aria-label={t('academy.courses.title')}>
                {shown.map((c) => (
                  <button key={c.id} role="tab" className="tier-chip" aria-selected={c.id === activeId} onClick={() => setPicked(c.id)}>
                    <span className="label label-xs">{loc(c, 'title')}</span>
                    <span className="tier-chip-price">{formatPrice(c.price)}</span>
                    {c.featured && <span className="hw hw-16" aria-hidden="true" />}
                  </button>
                ))}
              </div>
              <div className="tier-row">
                {shown.map((c) => (
                  <div key={c.id} className={`tier-slot ${c.id === activeId ? 'is-active' : ''}`}>
                    <TierCard course={c} onBook={book} />
                  </div>
                ))}
              </div>

              {compareRows.length > 0 && (
                <div className="faq compare">
                <details>
                  <summary className="label">{t('academy.compare.title')}<span aria-hidden="true" className="faq-mark" /></summary>
                  <div className="compare-scroll">
                    <table className="compare-table">
                      <thead>
                        <tr>
                          <th />
                          {shown.map((c) => <th key={c.id} className={`label label-xs ${c.featured ? 'is-featured' : ''}`}>{loc(c, 'title')}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {compareRows.map(([label]) => (
                          <tr key={label}>
                            <th scope="row">{label}</th>
                            {shown.map((c) => (
                              <td key={c.id} className={c.featured ? 'is-featured' : ''}>
                                {cell((c.compare || []).find((r) => r[0] === label)?.[1])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
                </div>
              )}

              {addons.length > 0 && (
                <div className="addon-list">
                  <div className="label label-xs muted">{t('academy.addons.title')}</div>
                  {addons.map((a) => (
                    <div key={a.id} className="addon-row">
                      <div>
                        <div className="label">{loc(a, 'title')}</div>
                        {a.summary && <p className="muted">{loc(a, 'summary')}</p>}
                      </div>
                      <div className="addon-price">
                        {formatPrice(a.price)}
                        {a.price_note && <span className="label label-xs muted"> {loc(a, 'price_note')}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <a className="btn btn-ghost brochure-link" href={BROCHURES[track]} target="_blank" rel="noreferrer">{t('academy.brochure')}</a>
            </>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="wrap">
          <div className="section-head"><h2>{t('academy.steps.title')}</h2></div>
          <div className="cells cells-3">
            {[
              ['academy.steps.1.title', 'academy.steps.1.body'],
              [`academy.steps.${track}.2.title`, `academy.steps.${track}.2.body`],
              [`academy.steps.${track}.3.title`, `academy.steps.${track}.3.body`],
            ].map(([title, body], i) => (
              <div key={title}>
                <div className="step-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="step-title label">{t(title)}</div>
                <p className="muted">{t(body)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* First call */}
      {tiers.length > 0 && (
        <section className="section" id="book" style={{ scrollMarginTop: 80 }}>
          <div className="wrap split">
            <div>
              <div className="eyebrow label"><HalfWorld size={16} />{t('academy.call.tag')}</div>
              <h2>{t('academy.call.title')}</h2>
              <p className="body" style={{ marginTop: 'var(--space-5)' }}>{t('academy.call.body')}</p>
            </div>
            <FirstCallForm courses={tiers} courseId={callCourse} onCourseChange={setCallCourse} />
          </div>
        </section>
      )}

      {/* Artists spotlight */}
      <section className="section" id="artists" style={{ scrollMarginTop: 80 }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow label"><HalfWorld size={16} />{t('academy.roster.tag')}</div>
              <h2>{t('academy.roster.title')}</h2>
              <p className="lead">{t('academy.roster.lead')}</p>
            </div>
            <div className="actions" style={{ marginTop: 0 }}>
              {djs.length > 8 && <button className="btn btn-ghost" onClick={() => go('artists')}>{t('academy.roster.all', { n: djs.length })}</button>}
              <button className="btn btn-secondary" onClick={() => go('join')}>{t('academy.roster.join')}</button>
            </div>
          </div>
          <ArtistsGrid djs={djs} limit={8} onBook={() => goToQuote(['djs'])} />
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="wrap split">
          <h2>{t('academy.faq.title')}</h2>
          <div className="faq">
            {Array.from({ length: FAQ_COUNT }, (_, i) => i + 1).map((n) => (
              <details key={n}>
                <summary className="label">{t(`academy.faq.${n}.q`)}<span aria-hidden="true" className="faq-mark" /></summary>
                <p className="muted">{t(`academy.faq.${n}.a`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <button className="cta-bar" onClick={() => scrollTo(tiers.length > 0 ? 'book' : 'courses')}>
        <span>{t('academy.bar.left')}</span>
        <span>{t('academy.bar.right')}</span>
      </button>
    </>
  );
}
