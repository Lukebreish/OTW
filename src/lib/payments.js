// Payment placeholder. Online card payment isn't live yet: bookings are saved
// with status 'pending_payment' and OTW sends a payment link or bank details
// by email. When a provider (e.g. Stripe Checkout or Mollie) is set up, make
// startCheckout() create a session server-side and redirect to it, then set
// ONLINE_PAYMENTS_LIVE = true.

export const ONLINE_PAYMENTS_LIVE = false;

export async function startCheckout(/* { bookingId, amount, description, email } */) {
  throw new Error('Online payments are not live yet.');
}

export function formatPrice(price) {
  if (price == null) return 'On request';
  return `€${Number(price).toLocaleString('en-GB')}`;
}
