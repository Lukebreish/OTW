// OTW's own details, printed on every invoice. Fill these in before sending real invoices.
// Empty values are left off the invoice. Set VAT_RATE (e.g. 21) if amounts are entered
// excluding VAT; leave it null if the amounts already include VAT or OTW isn't VAT-liable.
export const COMPANY = {
  name: 'Off The World',
  legalName: '',        // e.g. registered company name
  address: '',          // street, postcode, city
  vat: '',              // BE0xxx.xxx.xxx
  iban: '',
  email: 'hello@offtheworld.events',
  phone: '',
};
export const VAT_RATE = null;
