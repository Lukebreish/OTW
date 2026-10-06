import { COMPANY, VAT_RATE } from './company.js';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const eur = (n) => `€${Number(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const day = (d) => (d ? new Date(`${String(d).slice(0, 10)}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '');

// Opens a print-ready invoice in a new tab. In the print dialog choose "Save as PDF".
export function openInvoice(b) {
  const amount = b.invoice_amount ?? b.agreed_price;
  if (amount === null || amount === undefined || amount === '') return 'Add an invoice amount (or agreed price) first.';
  const billedTo = [b.invoice_company || b.client_name, b.invoice_address, b.invoice_vat && `VAT ${b.invoice_vat}`, b.invoice_email || b.client_email].filter(Boolean);
  const description = [b.event_name || 'Event', b.event_date && day(b.event_date), b.address || b.location].filter(Boolean).join(' · ');
  const net = Number(amount);
  const vat = VAT_RATE ? net * (VAT_RATE / 100) : 0;
  const total = net + vat;
  const from = [COMPANY.legalName || COMPANY.name, COMPANY.address, COMPANY.vat && `VAT ${COMPANY.vat}`, COMPANY.email, COMPANY.phone].filter(Boolean);
  const number = b.invoice_number || 'DRAFT';

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${esc(number)}</title>
<style>
  *{box-sizing:border-box}body{font:14px/1.5 Arial,Helvetica,sans-serif;color:#111;margin:0;padding:48px;max-width:800px}
  h1{font-size:28px;letter-spacing:.04em;text-transform:uppercase;margin:0 0 32px}
  .row{display:flex;justify-content:space-between;gap:32px;margin-bottom:32px}.label{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#666;margin-bottom:6px}
  table{width:100%;border-collapse:collapse;margin-top:8px}th{text-align:left;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#666;border-bottom:2px solid #111;padding:8px 0}
  td{padding:12px 0;border-bottom:1px solid #ddd;vertical-align:top}td.r,th.r{text-align:right}.tot td{border-bottom:0;padding:6px 0}.tot .big{font-weight:700;font-size:16px;border-top:2px solid #111;padding-top:10px}
  .foot{margin-top:40px;font-size:12px;color:#444}@media print{body{padding:0}}
</style></head><body>
<h1>Invoice</h1>
<div class="row">
  <div><div class="label">From</div>${from.map((l) => `<div>${esc(l)}</div>`).join('')}</div>
  <div><div class="label">Billed to</div>${billedTo.map((l) => `<div>${esc(l)}</div>`).join('')}</div>
  <div><div class="label">Invoice</div><div>No. ${esc(number)}</div><div>Date ${esc(day(new Date().toISOString()))}</div>${b.invoice_due ? `<div>Due ${esc(day(b.invoice_due))}</div>` : ''}</div>
</div>
<table><thead><tr><th>Description</th><th class="r">Amount</th></tr></thead>
<tbody><tr><td>${esc(description)}</td><td class="r">${eur(net)}</td></tr></tbody></table>
<table class="tot"><tbody>
  ${VAT_RATE ? `<tr><td class="r">Subtotal</td><td class="r" style="width:140px">${eur(net)}</td></tr><tr><td class="r">VAT ${VAT_RATE}%</td><td class="r">${eur(vat)}</td></tr>` : ''}
  <tr><td class="r big">Total</td><td class="r big" style="width:140px">${eur(total)}</td></tr>
</tbody></table>
<div class="foot">${COMPANY.iban ? `<div>Pay by bank transfer to ${esc(COMPANY.iban)}, reference ${esc(number)}.</div>` : ''}</div>
<script>window.onload=function(){setTimeout(function(){window.print()},300)}</script>
</body></html>`;

  const w = window.open('', '_blank');
  if (!w) return 'Your browser blocked the invoice window. Allow pop-ups for this site and try again.';
  w.document.open();
  w.document.write(html);
  w.document.close();
  return '';
}
