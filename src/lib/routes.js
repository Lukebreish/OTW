// Every route belongs to one DS entity. The entity sets data-entity on the
// page wrapper (switching --accent), picks the header logo and decides which
// nav item carries the half-world marker.
export const ENTITY_OF = {
  home: 'main',
  about: 'main',
  events: 'events',
  services: 'events',
  packages: 'events',
  quote: 'events',
  academy: 'academy',
  artists: 'academy',
  join: 'academy',
  records: 'records',
};

// Old hashes from the previous site keep working.
export const ALIASES = { label: 'records' };

export const NAV = [
  ['events', 'Events'],
  ['academy', 'Academy'],
  ['records', 'Records'],
  ['about', 'About'],
];

export const CONTACT_EMAIL = 'hello@offtheworld.events';

export function resolveRoute(hash) {
  const key = (hash || '').replace('#', '') || 'home';
  const resolved = ALIASES[key] || key;
  return ENTITY_OF[resolved] ? resolved : 'home';
}
