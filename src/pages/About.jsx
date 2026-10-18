import { HalfWorld } from '../components/ui.jsx';
import { CONTACT_EMAIL } from '../lib/routes.js';
import MessageForm from '../components/MessageForm.jsx';
import { useLang } from '../lib/i18n.jsx';

const SIDES = ['events', 'academy', 'records'];

export default function About({ go }) {
  const { t } = useLang();
  return (
    <>
      <section className="hero hero-division">
        <div className="hero-rise" aria-hidden="true" />
        <div className="wrap hero-inner">
          <div className="eyebrow label"><HalfWorld size={16} />{t('about.tag')}</div>
          <h1>{t('about.title')}</h1>
          <p className="lead">{t('about.lead')}</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="cells cells-3">
            {SIDES.map((entity) => (
              <div key={entity} data-entity={entity}>
                <HalfWorld size={48} />
                <h3 style={{ marginTop: 'var(--space-5)' }}>{t(`nav.${entity}`)}</h3>
                <p className="muted" style={{ margin: 'var(--space-4) 0 var(--space-5)' }}>{t(`about.side.${entity}`)}</p>
                <button className="btn btn-ghost" onClick={() => go(entity)}>{t('about.go')}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap split">
          <div>
            <h2>{t('about.contact.title')}</h2>
            <p className="body" style={{ marginTop: 'var(--space-5)' }}>
              {t('about.contact.body')}
            </p>
          </div>
          <div>
            <MessageForm topic="contact" variant="full" id="contact" button={t('about.contact.button')} done={t('about.contact.done')} />
            <ul className="hw-list" style={{ marginTop: 'var(--space-6)' }}>
              <li><HalfWorld size={16} /><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
              <li><HalfWorld size={16} />{t('about.contact.city')}</li>
            </ul>
            <div className="actions" data-entity="events">
              <button className="btn btn-secondary" onClick={() => go('quote')}>{t('about.contact.quote')}</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
