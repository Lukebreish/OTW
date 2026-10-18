import { HalfWorld } from '../components/ui.jsx';
import { COMPANY } from '../lib/company.js';
import { CONTACT_EMAIL } from '../lib/routes.js';

// Plain-language privacy notice (GDPR). Company name and address come from
// src/lib/company.js — fill them in there. Have it checked before launch.
const UPDATED = '18 October 2026';

const SECTIONS = [
  ['What we collect', [
    'What you type into our forms: name, email, phone, event details, messages, and for artists your DJ name, Instagram, genres, location and photo.',
    'Course bookings: the course you picked and how you want to pay.',
    'Nothing else. No tracking or advertising cookies, no analytics profiles.',
  ]],
  ['Why we use it', [
    'To reply to you, send a quote, book a DJ, run an event, a course or a release, and to invoice the work (contract and our legitimate interest in running OTW).',
    'Newsletter: only if you signed up. One click or one email to unsubscribe (consent).',
    'Artist profiles: your name, photo, role, years and genres appear on the site only after you send them and we publish them. Your email, phone and location are never public.',
    'Accounting: invoices are kept as Belgian law requires.',
  ]],
  ['Who sees it', [
    'The OTW team only.',
    'Supabase stores our database in the EU (Ireland). Our site is hosted by Vercel. Both process data only for us.',
    'We never sell your data or share it for marketing.',
  ]],
  ['How long we keep it', [
    'Enquiries and contacts: up to 24 months after our last contact, then deleted.',
    'Newsletter: until you unsubscribe.',
    'Artist profiles: until you ask us to remove them.',
    'Invoices and booking records: 7 years (Belgian accounting rules).',
  ]],
  ['Your rights', [
    `Ask to see, correct, export or delete your data, or object to how we use it: email ${CONTACT_EMAIL}. We reply within one month.`,
    'You can also complain to the Belgian Data Protection Authority (dataprotectionauthority.be).',
  ]],
  ['Cookies', [
    'The public site sets no cookies. Our internal team login stores a session in your browser only when a team member signs in.',
  ]],
];

export default function Privacy() {
  const controller = [COMPANY.legalName || COMPANY.name || 'Off The World (OTW)', COMPANY.address, COMPANY.vat].filter(Boolean).join(' · ');
  return (
    <section className="section">
      <div className="wrap wrap-narrow">
        <div className="eyebrow label"><HalfWorld size={16} />Privacy</div>
        <h1>Privacy</h1>
        <p className="lead" style={{ marginTop: 'var(--space-5)' }}>
          What we keep about you, why, and how to get rid of it. Short version: only what you send us, only to work with you.
        </p>
        <p className="muted" style={{ marginTop: 'var(--space-5)' }}>
          Responsible for your data: {controller}, Brussels, Belgium · <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
        {SECTIONS.map(([title, items]) => (
          <div key={title} style={{ marginTop: 'var(--space-8)' }}>
            <h2>{title}</h2>
            <ul className="hw-list" style={{ marginTop: 'var(--space-5)' }}>
              {items.map((t) => <li key={t}><HalfWorld size={16} />{t}</li>)}
            </ul>
          </div>
        ))}
        <p className="label label-xs" style={{ marginTop: 'var(--space-8)' }}>Last updated {UPDATED}</p>
      </div>
    </section>
  );
}
