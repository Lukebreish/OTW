import { HalfWorld } from '../components/ui.jsx';
import { COMPANY } from '../lib/company.js';
import { CONTACT_EMAIL } from '../lib/routes.js';
import { useLang } from '../lib/i18n.jsx';

// Plain-language privacy notice (GDPR). Company name and address come from
// src/lib/company.js — fill them in there. Have it checked before launch.
// Each section is [key, number of bullet points]; the copy lives in i18n.
const SECTIONS = [
  ['collect', 3],
  ['why', 4],
  ['who', 3],
  ['keep', 4],
  ['rights', 2],
  ['cookies', 1],
];

export default function Privacy() {
  const { t } = useLang();
  const controller = [COMPANY.legalName || COMPANY.name || 'Off The World (OTW)', COMPANY.address, COMPANY.vat].filter(Boolean).join(' · ');
  return (
    <section className="section">
      <div className="wrap wrap-narrow">
        <div className="eyebrow label"><HalfWorld size={16} />{t('privacy.tag')}</div>
        <h1>{t('privacy.title')}</h1>
        <p className="lead" style={{ marginTop: 'var(--space-5)' }}>
          {t('privacy.lead')}
        </p>
        <p className="muted" style={{ marginTop: 'var(--space-5)' }}>
          {t('privacy.controller', { who: controller })} · <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
        {SECTIONS.map(([key, count]) => (
          <div key={key} style={{ marginTop: 'var(--space-8)' }}>
            <h2>{t(`privacy.${key}.title`)}</h2>
            <ul className="hw-list" style={{ marginTop: 'var(--space-5)' }}>
              {Array.from({ length: count }).map((_, i) => (
                <li key={i}><HalfWorld size={16} />{t(`privacy.${key}.${i + 1}`, { email: CONTACT_EMAIL })}</li>
              ))}
            </ul>
          </div>
        ))}
        <p className="label label-xs" style={{ marginTop: 'var(--space-8)' }}>
          {t('privacy.updated', { date: t('privacy.updated.date') })}
        </p>
      </div>
    </section>
  );
}
