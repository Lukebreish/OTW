import EventCard from '../components/EventCard.jsx';
import { HalfWorld } from '../components/ui.jsx';

const BANDS = [
  {
    entity: 'events',
    name: 'Events',
    body: 'Club nights we run, and events we produce for you. DJs, sound, lighting and the crew to run it.',
    cta: 'See events',
  },
  {
    entity: 'academy',
    name: 'Academy',
    body: 'Learn to mix and produce with the people who play out every weekend. Our artists roster lives here too.',
    cta: 'Go to Academy',
  },
  {
    entity: 'records',
    name: 'Records',
    body: 'Music released under the OTW name. Tracks, EPs and distribution for artists in and around the crew.',
    cta: 'Go to Records',
  },
];

export default function Home({ events, go }) {
  const now = Date.now();
  const next = events.find((e) => new Date(e.starts_at).getTime() >= now);

  return (
    <>
      <section className="hero hero-home">
        <div className="hero-rise" aria-hidden="true" />
        <div className="wrap hero-inner">
          <div className="eyebrow label"><HalfWorld size={16} />Brussels · Events · Academy · Records</div>
          <h1>Off<br />The<br />World</h1>
          <p className="lead">One crew. We throw the nights, teach the craft and release the music.</p>
          <div className="actions">
            <button className="btn btn-primary" onClick={() => go('events')}>See events</button>
            <button className="btn btn-secondary" onClick={() => go('about')}>About OTW</button>
          </div>
        </div>
      </section>

      <section className="section" data-entity="events">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow label"><HalfWorld size={16} />Next up</div>
              <h2>{next ? 'Next event' : 'Planning an event?'}</h2>
            </div>
            <button className="btn btn-ghost" onClick={() => go(next ? 'events' : 'quote')}>
              {next ? 'All events →' : 'Get a quote →'}
            </button>
          </div>
          {next ? (
            <div className="card-grid"><EventCard event={next} /></div>
          ) : (
            <p className="body">
              No public nights on the calendar yet. We also produce private and corporate events.
              Tell us what you have in mind and we'll put a setup together.
            </p>
          )}
        </div>
      </section>

      {BANDS.map((b) => (
        <section key={b.entity} className="band" data-entity={b.entity}>
          <div className="wrap band-inner">
            <h2>{b.name}</h2>
            <p>{b.body}</p>
            <button className="btn" onClick={() => go(b.entity)}>{b.cta} →</button>
          </div>
        </section>
      ))}
    </>
  );
}
