import Djs from './Djs.jsx';

export default function Artists({ djs, initialSelected, onDone, goTo }) {
  return (
    <>
      <Djs djs={djs} initialSelected={initialSelected} onDone={onDone} goTo={goTo} />

      <section className="section-tight">
        <div className="section-wide" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, alignItems: 'center' }}>
          <div>
            <h2>More than a roster. A community of artists.</h2>
            <p style={{ marginTop: 12 }}>
              Every DJ on Off The World is reviewed and published by us, not self-listed. If you play
              and want to be part of the network, we'd like to hear what you do.
            </p>
            <button className="btn-outline" onClick={() => goTo('join')}>Join OTW</button>
          </div>
        </div>
      </section>
    </>
  );
}
