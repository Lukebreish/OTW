// Simple emoji-as-icon mapping so the bubble field doesn't depend on an
// icon font or image assets while the brand/photography is still being
// worked out. Swap for real iconography once that's settled.
export const CATEGORY_ICONS = {
  djs: '🎧',
  'dj-equipment': '🎛️',
  sound: '🔊',
  lighting: '💡',
  installation: '🔧',
  technicians: '🧰',
  staging: '🏗️',
  'photo-video': '🎥',
};

export function iconFor(slug) {
  return CATEGORY_ICONS[slug] || '✦';
}
