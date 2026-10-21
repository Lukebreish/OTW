// EventCard per the DS brief: grayscale 4:3 photo, date in display 40px,
// venue in body, lineup in label style, 2px top rule, TICKETS →.
import { useLang } from '../lib/i18n.jsx';

const DATE_OPTS = { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Brussels' };
const TIME_OPTS = { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Brussels' };

// Formatters are cached per locale: Intl.DateTimeFormat is slow to build.
const cache = new Map();
const fmt = (locale, tag, opts) => {
  const key = `${locale}|${tag}`;
  if (!cache.has(key)) cache.set(key, new Intl.DateTimeFormat(locale, opts));
  return cache.get(key);
};

export function formatEventDate(iso, locale = 'en-GB') {
  const parts = Object.fromEntries(fmt(locale, 'date', DATE_OPTS).formatToParts(new Date(iso)).map((p) => [p.type, p.value]));
  return `${parts.weekday} ${parts.day} ${parts.month}`.toUpperCase();
}

export function formatEventTime(iso, locale = 'en-GB') {
  return fmt(locale, 'time', TIME_OPTS).format(new Date(iso));
}

export default function EventCard({ event, past = false }) {
  const { t, loc, locale } = useLang();
  const lineup = Array.isArray(event.lineup) ? event.lineup : [];
  const place = [event.venue, event.city].filter(Boolean).join(', ');
  return (
    <article className={`card event-card ${event.sold_out ? 'sold-out' : ''}`}>
      <div className="event-photo">
        {event.image_url && <img src={event.image_url} alt="" loading="lazy" />}
      </div>
      <div className="event-date">{formatEventDate(event.starts_at, locale)}</div>
      <div className="event-venue">
        {loc(event, 'title')}{place ? ` · ${place}` : ''} · {formatEventTime(event.starts_at, locale)}
      </div>
      {lineup.length > 0 && <div className="event-lineup label label-xs">{lineup.join(' · ')}</div>}
      {!past && (event.sold_out ? (
        <span className="tag" style={{ marginTop: 'var(--space-5)', alignSelf: 'flex-start' }}>{t('event.soldout')}</span>
      ) : event.ticket_url ? (
        <a className="btn btn-ghost" href={event.ticket_url} target="_blank" rel="noreferrer">{t('event.tickets')}</a>
      ) : null)}
    </article>
  );
}
