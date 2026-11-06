import type { VendorInvoice } from './vendorInvoices';

/**
 * Deterministic demo ledger. Dates are fixed so overdue derivation against
 * a supplied asOf is reproducible across machines.
 */
export const VENDOR_INVOICES: readonly VendorInvoice[] = [
  {
    id: 'inv-1001',
    vendor: 'Siemens AG',
    invoiceNumber: 'SIE-2024-04412',
    issueDate: '2024-03-01',
    dueDate: '2024-03-31',
    status: 'open',
    costCenter: 'CC-100',
    lineItems: [
      { id: 'l1', description: 'Industrial edge gateway hardware', netCents: 1240000, vatRate: 19 },
      { id: 'l2', description: 'On-site commissioning', netCents: 185000, vatRate: 19 },
    ],
  },
  {
    id: 'inv-1002',
    vendor: 'AWS EMEA SARL',
    invoiceNumber: 'AWS-EMEA-88213',
    issueDate: '2024-03-05',
    dueDate: '2024-04-04',
    status: 'open',
    costCenter: 'CC-200',
    lineItems: [
      {
        id: 'l1',
        description: 'Cloud compute (EU service, reverse charge)',
        netCents: 412500,
        vatRate: 0,
        vatExemptionReason: 'Reverse charge \u2013 Art. 196 VAT Directive (EU service)',
      },
    ],
  },
  {
    id: 'inv-1003',
    vendor: 'Thalia B\u00fccher GmbH',
    invoiceNumber: 'THA-2024-0091',
    issueDate: '2024-02-10',
    dueDate: '2024-02-24',
    status: 'open',
    costCenter: 'CC-300',
    lineItems: [
      { id: 'l1', description: 'Technical reference books', netCents: 4999, vatRate: 7 },
      { id: 'l2', description: 'Conference passes', netCents: 32000, vatRate: 19 },
    ],
  },
  {
    id: 'inv-1004',
    vendor: 'Mastrion Legal Partners',
    invoiceNumber: 'MLP-2024-0017',
    issueDate: '2024-01-15',
    dueDate: '2024-02-14',
    status: 'paid',
    costCenter: 'CC-100',
    lineItems: [
      { id: 'l1', description: 'Contract review', netCents: 250000, vatRate: 19 },
    ],
  },
  {
    id: 'inv-1005',
    vendor: 'Fraunhofer FOKUS',
    invoiceNumber: 'FOK-2024-0302',
    issueDate: '2024-03-12',
    dueDate: '2024-04-11',
    status: 'disputed',
    costCenter: 'CC-400',
    lineItems: [
      { id: 'l1', description: 'Research engagement (milestone 2)', netCents: 980000, vatRate: 19 },
    ],
  },
  {
    id: 'inv-1006',
    vendor: 'Deutsche Telekom AG',
    invoiceNumber: 'DTAG-2024-77120',
    issueDate: '2024-02-01',
    dueDate: '2024-02-29',
    status: 'open',
    costCenter: 'CC-200',
    lineItems: [
      { id: 'l1', description: 'Dedicated fibre line', netCents: 89000, vatRate: 19 },
    ],
  },
];

export const COST_CENTERS: readonly string[] = Array.from(
  new Set(VENDOR_INVOICES.map((invoice) => invoice.costCenter)),
).sort();
