// Small DS primitives: the half-world marker, Lucide icons (inlined, 2px
// stroke, square caps) and the entity logo.

export function HalfWorld({ size = 16, className = '' }) {
  return <span className={`hw hw-${size} ${className}`} aria-hidden="true" />;
}

// Paths from Lucide (ISC licence): menu, x, arrow-right, instagram.
const ICONS = {
  menu: <><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="18" y2="18" /></>,
  x: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
};

export function Icon({ name, label }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {ICONS[name]}
    </svg>
  );
}

const ENTITY_NAME = { main: 'Off The World', events: 'OTW Events', academy: 'OTW Academy', records: 'OTW Records' };

export function Logo({ entity = 'main', layout = 'horizontal', colourway = 'on-dark', className = '' }) {
  return (
    <img
      className={className}
      src={`/logos/otw-${entity}-${layout}-${colourway}.svg`}
      alt={ENTITY_NAME[entity]}
    />
  );
}
