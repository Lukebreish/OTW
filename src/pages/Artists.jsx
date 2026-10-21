import { useEffect } from 'react';
import ArtistsGrid from '../components/ArtistsGrid.jsx';
import { HalfWorld } from '../components/ui.jsx';
import { useLang } from '../lib/i18n.jsx';

export default function Artists({ djs, initialSelected, onDone, go, goToQuote }) {
  const { t } = useLang();
  useEffect(() => { if (initialSelected) onDone(); }, [initialSelected, onDone]);

  return (
    <>
      <section className="section">
        <div className="wrap">
          <div className="eyebrow label"><HalfWorld size={16} />{t('artists.tag')}</div>
          <h1>{t('artists.title')}</h1>
          <p className="lead" style={{ marginTop: 'var(--space-5)', marginBottom: 'var(--space-8)' }}>
            {t('artists.lead')}
          </p>
          <ArtistsGrid djs={djs} initialSelected={initialSelected} onBook={() => goToQuote(['djs'])} />
        </div>
      </section>

      <section className="band" data-entity="academy">
        <div className="wrap band-inner">
          <h2>{t('artists.band.title')}</h2>
          <p>{t('artists.band.body')}</p>
          <div className="actions" style={{ marginTop: 0 }}>
            <button className="btn" onClick={() => go('join')}>{t('artists.band.join')}</button>
            <button className="btn" onClick={() => go('artist-services')}>{t('artists.band.work')}</button>
          </div>
        </div>
      </section>
    </>
  );
}
