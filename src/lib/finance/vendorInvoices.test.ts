import {
  computeInvoice,
  computeInvoiceTotals,
  computeLineVat,
  isInvoiceOverdue,
  sumOpenAmount,
  sumTotals,
  type VendorInvoice,
} from './vendorInvoices';

function assertEqual(actual: number, expected: number, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`);
  }
}

function assertTrue(value: boolean, label: string): void {
  if (!value) {
    throw new Error(`${label}: expected true`);
  }
}

function assertFalse(value: boolean, label: string): void {
  if (value) {
    throw new Error(`${label}: expected false`);
  }
}

// 19 % standard rate
assertEqual(computeLineVat(10000, 19), 1900, '19% on 100,00 EUR');
assertEqual(computeLineVat(1999, 19), 380, '19% on 19,99 EUR rounds half-up');

// 7 % reduced rate
assertEqual(computeLineVat(10000, 7), 700, '7% on 100,00 EUR');
assertEqual(computeLineVat(1999, 7), 140, '7% on 19,99 EUR rounds half-up');

// 0 % reverse charge
assertEqual(computeLineVat(10000, 0), 0, '0% on 100,00 EUR');

// Mixed rate invoice reconciles to the cent
const mixedTotals = computeInvoiceTotals([
  { id: 'l1', description: 'Consulting', netCents: 125000, vatRate: 19 },
  { id: 'l2', description: 'Books', netCents: 4999, vatRate: 7 },
  { id: 'l3', description: 'EU service (reverse charge)', netCents: 80000, vatRate: 0, vatExemptionReason: 'Reverse charge, Art. 196 VAT Directive' },
]);
assertEqual(mixedTotals.netCents, 209999, 'mixed net');
assertEqual(mixedTotals.vatCents, 23750 + 350 + 0, 'mixed vat');
assertEqual(mixedTotals.grossCents, 209999 + 24100, 'mixed gross');
assertEqual(mixedTotals.netCents + mixedTotals.vatCents, mixedTotals.grossCents, 'mixed reconciles');

// Overdue derives from asOf, not the machine clock
const invoice: VendorInvoice = {
  id: 'inv-1',
  vendor: 'Acme GmbH',
  invoiceNumber: 'ACM-2024-001',
  issueDate: '2024-01-01',
  dueDate: '2024-02-01',
  status: 'open',
  costCenter: 'CC-100',
  lineItems: [{ id: 'l1', description: 'Service', netCents: 10000, vatRate: 19 }],
};
assertFalse(isInvoiceOverdue(invoice, '2024-01-31'), 'not overdue before due date');
assertTrue(isInvoiceOverdue(invoice, '2024-02-02'), 'overdue after due date');
assertFalse(isInvoiceOverdue({ ...invoice, status: 'paid' }, '2024-02-02'), 'paid never overdue');
assertFalse(isInvoiceOverdue({ ...invoice, status: 'disputed' }, '2024-02-02'), 'disputed never overdue');

const computed = computeInvoice(invoice, '2024-02-02');
assertEqual(computed.effectiveStatus === 'overdue' ? 1 : 0, 1, 'effective status overdue');
assertEqual(computed.netCents + computed.vatCents, computed.grossCents, 'invoice reconciles');

// Totals footer matches sum of visible rows
const rows = [
  computeInvoice(invoice, '2024-01-15'),
  computeInvoice({ ...invoice, id: 'inv-2', status: 'paid' }, '2024-01-15'),
];
const totals = sumTotals(rows);
assertEqual(totals.netCents, 20000, 'sum net');
assertEqual(totals.vatCents, 3800, 'sum vat');
assertEqual(totals.grossCents, 23800, 'sum gross');
assertEqual(sumOpenAmount(rows), 11900, 'open amount excludes paid');
