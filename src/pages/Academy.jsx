import { useState } from 'react';
import { HalfWorld } from '../components/ui.jsx';
import CourseCard from '../components/CourseCard.jsx';
import EnrolForm from '../components/EnrolForm.jsx';
import ArtistsGrid from '../components/ArtistsGrid.jsx';
import { CONTACT_EMAIL } from '../lib/routes.js';

const TRACKS = [['all', 'All'], ['dj', 'DJ'], ['production', 'Production']];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All levels'];
const PLUG_THE_JACK_URL = 'https://www.plugthejack.com/en/dj-lessons';

const PATH = [
  ['Learn', 'DJ or production, in small groups or 1:1, on club-standard gear.'],
  ['Play out', 'Ready graduates get a slot at an OTW night. A real crowd, not a classroom.'],
  ['Join the roster', 'The best go on the OTW artists roster and get booked through OTW Events.'],
];

const FAQ = [
  ['Do I need my own gear?', 'No. Classes run on our decks and studio setup. Bring headphones if you have them.'],
  ['What level do I need?', 'Beginner courses start from zero. Not sure where you fit? Pick 1:1 Mentorship or ask us.'],
  ['How do I pay?', 'Book online, then pay by bank transfer. Card and Bancontact payment are coming soon.'],
  ['Where are classes?', 'Brussels. DJ courses are also bookable through Plug The Jack.'],
  ['Can I book a private lesson?', 'Yes. 1:1 Mentorship is priced per session and planned around you.'],
];

export default function Academy({ courses, sessions, djs, go, goToQuote }) {
  const [track, setTrack] = useState('all');
  const [level, setLevel] = useState(null);
  const [enrolCourse, setEnrolCourse] = useState('');
  const [enrolSession, setEnrolSession] = useState('');

  const shown = courses.filter((c) => (track === 'all' || c.track === track) && (!level || c.level === level));
  const courseById = Object.fromEntries(courses.map((c) => [c.id, c]));
  const schedule = sessions.filter((s) => courseById[s.course_id]);
  const highlightId = schedule.find((s) => s.spaces_left == null || s.spaces_left > 0)?.id;
  const djCount = courses.filter((c) => c.track === 'dj').length;
  const prodCount = courses.filter((c) => c.track === 'production').length;

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const enrol = (courseId, sessionId = '') => {
    setEnrolCourse(courseId);
    setEnrolSession(sessionId);
    scrollTo('enrol');
  };

  return (
    <>
      <section className="hero hero-division">
        <div className="hero-rise" aria-hidden="true" />
        <div className="wrap hero-inner">
          <div className="eyebrow label"><HalfWorld size={16} />OTW Academy · Brussels</div>
          <h1>Learn to DJ. Learn to produce.</h1>
          <p className="lead">Courses taught by the crew that plays out every weekend. Small groups, club gear, and a path onto the OTW roster.</p>
          <div className="actions">
            <button className="btn btn-primary" onClick={() => scrollTo('courses')}>See courses</button>
            <button className="btn btn-secondary" onClick={() => scrollTo('artists')}>Meet the artists</button>
          </div>
        </div>
      </section>

      {/* Two tracks */}
      <section className="section-tight">
        <div className="wrap">
          <div className="cells cells-2">
            <div className="track-cell">
              <div className="label label-xs muted">Track 01{djCount ? ` · ${djCount} courses` : ''}</div>
              <h2>DJ courses</h2>
              <p className="muted">Beatmatching to a full club set. Also bookable on Plug The Jack, Belgium's platform for music lessons and studios.</p>
              <div className="track-actions">
                <button className="btn btn-ghost" onClick={() => { setTrack('dj'); setLevel(null); scrollTo('courses'); }}>DJ courses →</button>
                <a className="btn btn-ghost" href={PLUG_THE_JACK_URL} target="_blank" rel="noreferrer">Plug The Jack →</a>
              </div>
            </div>
            <div className="track-cell">
              <div className="label label-xs muted">Track 02{prodCount ? ` · ${prodCount} courses` : ''}</div>
              <h2>Production courses</h2>
              <p className="muted">Ableton from zero to a finished, release-ready track. The best go out on OTW Records.</p>
              <div className="track-actions">
                <button className="btn btn-ghost" onClick={() => { setTrack('production'); setLevel(null); scrollTo('courses'); }}>Production courses →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="section" id="courses" style={{ scrollMarginTop: 80 }}>
        <div className="wrap">
          <div className="section-head">
            <h2>Courses</h2>
          </div>

          {courses.length === 0 ? (
            <div className="empty">
              First courses open soon.{' '}
              <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('OTW Academy · interested')}`}>Register interest →</a>
            </div>
          ) : (
            <>
              <div className="tabs" role="tablist">
                {TRACKS.map(([key, label]) => (
                  <button key={key} role="tab" className="label" aria-selected={track === key} onClick={() => setTrack(key)}>{label}</button>
                ))}
              </div>
              <div className="tags" style={{ marginBottom: 'var(--space-7)' }}>
                {LEVELS.filter((l) => courses.some((c) => c.level === l)).map((l) => (
                  <button key={l} className="tag" aria-pressed={level === l} onClick={() => setLevel(level === l ? null : l)}>{l}</button>
                ))}
              </div>
              {shown.length > 0 ? (
                <div className="card-grid">
                  {shown.map((c) => <CourseCard key={c.id} course={c} onEnrol={enrol} />)}
                </div>
              ) : (
                <p className="empty">No courses match that filter.</p>
              )}
            </>
          )}
        </div>
      </section>

      {/* Weekly schedule */}
      {schedule.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <div>
                <h2>This term</h2>
                <p className="lead">Weekly classes. Pick a slot to join.</p>
              </div>
            </div>
            <div className="schedule" role="table">
              <div className="schedule-row schedule-head label label-xs" role="row">
                <span role="columnheader">Day</span><span role="columnheader">Time</span><span role="columnheader">Class</span><span role="columnheader">Spaces</span><span />
              </div>
              {schedule.map((s) => {
                const course = courseById[s.course_id];
                const full = s.spaces_left === 0;
                return (
                  <div key={s.id} className={`schedule-row ${s.id === highlightId ? 'is-next' : ''}`} role="row">
                    <span className="schedule-day" role="cell">{s.day}</span>
                    <span role="cell">{s.time_range}</span>
                    <span role="cell"><strong>{course.title}</strong>{s.label ? ` · ${s.label}` : ''}</span>
                    <span role="cell" className="label label-xs">{s.spaces_left == null ? '—' : full ? 'Full' : `${s.spaces_left} left`}</span>
                    <span role="cell" className="schedule-cta">
                      {!full && (course.booking_url
                        ? <a className="btn btn-ghost btn-sm" href={course.booking_url} target="_blank" rel="noreferrer">Join →</a>
                        : <button className="btn btn-ghost btn-sm" onClick={() => enrol(course.id, s.id)}>Join →</button>)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Enrol */}
      {courses.some((c) => !c.booking_url) && (
        <section className="section" id="enrol" style={{ scrollMarginTop: 80 }}>
          <div className="wrap split">
            <div>
              <div className="eyebrow label"><HalfWorld size={16} />Sign up</div>
              <h2>Book your place</h2>
              <p className="body" style={{ marginTop: 'var(--space-5)' }}>
                Pick a course and a class. We confirm by email and send payment details. Your place is locked in once payment clears.
              </p>
            </div>
            <EnrolForm
              courses={courses}
              sessions={sessions}
              courseId={enrolCourse}
              sessionId={enrolSession}
              onCourseChange={(id) => { setEnrolCourse(id); setEnrolSession(''); }}
            />
          </div>
        </section>
      )}

      {/* Path */}
      <section className="section">
        <div className="wrap">
          <div className="section-head"><h2>From class to club</h2></div>
          <div className="cells cells-3">
            {PATH.map(([title, body], i) => (
              <div key={title}>
                <div className="step-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="step-title label">{title}</div>
                <p className="muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Artists spotlight */}
      <section className="section" id="artists" style={{ scrollMarginTop: 80 }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="eyebrow label"><HalfWorld size={16} />The roster</div>
              <h2>OTW artists</h2>
              <p className="lead">DJs, producers and singers we vouch for. The people who teach here, and the ones who came through it.</p>
            </div>
            <div className="actions" style={{ marginTop: 0 }}>
              {djs.length > 8 && <button className="btn btn-ghost" onClick={() => go('artists')}>All {djs.length} artists →</button>}
              <button className="btn btn-secondary" onClick={() => go('join')}>Join the roster</button>
            </div>
          </div>
          <ArtistsGrid djs={djs} limit={8} onBook={() => goToQuote(['djs'])} />
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="wrap split">
          <h2>Questions</h2>
          <div className="faq">
            {FAQ.map(([q, a]) => (
              <details key={q}>
                <summary className="label">{q}<span aria-hidden="true" className="faq-mark" /></summary>
                <p className="muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <button className="cta-bar" onClick={() => (courses.some((c) => !c.booking_url) ? scrollTo('enrol') : scrollTo('courses'))}>
        <span>Enrol now</span>
        <span>Small groups · Brussels →</span>
      </button>
    </>
  );
}
