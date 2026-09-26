// EventCard per the DS brief: grayscale 4:3 photo, date in display 40px,
// venue in body, lineup in label style, 2px top rule, TICKETS →.

const DATE_FMT = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Brussels' });
const TIME_FMT = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Brussels' });

export function formatEventDate(iso) {
  const d = new Date(iso);
  const parts = Object.fromEntries(DATE_FMT.formatToParts(d).map((p) => [p.type, p.value]));
  return `${parts.weekday} ${parts.day} ${parts.month}`.toUpperCase();
}

export function formatEventTime(iso) {
  return TIME_FMT.format(new Date(iso));
}

export default function EventCard({ event, past = false }) {
  const lineup = Array.isArray(event.lineup) ? event.lineup : [];
  const place = [event.venue, event.city].filter(Boolean).join(', ');
  return (
    <article className={`card event-card ${event.sold_out ? 'sold-out' : ''}`}>
      <div className="event-photo">
        {event.image_url && <img src={event.image_url} alt="" loading="lazy" />}
      </div>
      <div className="event-date">{formatEventDate(event.starts_at)}</div>
      <div className="event-venue">
        {event.title}{place ? ` · ${place}` : ''} · {formatEventTime(event.starts_at)}
      </div>
      {lineup.length > 0 && <div className="event-lineup label label-xs">{lineup.join(' · ')}</div>}
      {!past && (event.sold_out ? (
        <span className="tag" style={{ marginTop: 'var(--space-5)', alignSelf: 'flex-start' }}>Sold out</span>
      ) : event.ticket_url ? (
        <a className="btn btn-ghost" href={event.ticket_url} target="_blank" rel="noreferrer">Tickets →</a>
      ) : null)}
    </article>
  );
}
