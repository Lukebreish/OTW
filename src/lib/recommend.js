// Turns questionnaire answers into a suggested starting package.
// This is deliberately simple and readable — not a black box — because
// OTW reviews and can override every recommendation before a quote goes
// out. Extend the ranks/weights below as real bookings show what
// actually predicts the right setup.

const SIZE_RANK = { 'lt30': 0, '30-100': 1, '100-300': 2, '300+': 3 };
const DURATION_RANK = { '2-4': 0, '4-6': 1, '6-8': 2, '8+': 3 };
const HEAVY_SERVICES = ['staging', 'technician', 'installation'];

export function recommendPackageId({ eventSize, duration, servicesWanted = [] }) {
  const sizeScore = SIZE_RANK[eventSize] ?? 1;
  const durationScore = DURATION_RANK[duration] ?? 1;
  const heavyCount = servicesWanted.filter((s) => HEAVY_SERVICES.includes(s)).length;
  const extraServices = Math.max(0, servicesWanted.length - 2);

  const score = sizeScore + durationScore + heavyCount * 2 + extraServices;

  if (score <= 1) return 'the-party';
  if (score <= 4) return 'the-experience';
  return 'full-production';
}
