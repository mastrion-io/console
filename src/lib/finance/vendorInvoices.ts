export type VatRate = 0 | 7 | 19;

export type InvoiceStatus = 'open' | 'paid' | 'overdue' | 'disputed';

export interface InvoiceLineItem {
  id: string;
  description: string;
  netCents: number;
  vatRate: VatRate;
  /** Required when vatRate is 0 (e.g. reverse charge on an EU service). */
  vatExemptionReason?: string;
}

export interface VendorInvoice {
  id: string;
  vendor: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: Exclude<InvoiceStatus, 'overdue'>;
  costCenter: string;
  lineItems: InvoiceLineItem[];
}

export interface InvoiceTotals {
  netCents: number;
  vatCents: number;
  grossCents: number;
}

export interface InvoiceLineComputed extends InvoiceLineItem {
  vatCents: number;
  grossCents: number;
}

export interface InvoiceComputed extends InvoiceTotals {
  invoice: VendorInvoice;
  lines: InvoiceLineComputed[];
  effectiveStatus: InvoiceStatus;
  isOverdue: boolean;
}

/**
 * Single authoritative VAT computation path. All amounts are integer cents.
 * VAT is rounded half-up per line item, then summed, so the invoice total
 * always reconciles: net + vat === gross.
 */
export function computeLineVat(netCents: number, vatRate: VatRate): number {
  if (!Number.isInteger(netCents)) {
    throw new Error(`netCents must be an integer, received ${netCents}`);
  }
  if (vatRate !== 0 && vatRate !== 7 && vatRate !== 19) {
    throw new Error(`Unsupported VAT rate: ${vatRate}`);
  }
  // netCents * rate / 100 with half-up rounding on integer cents.
  const numerator = netCents * vatRate;
  return Math.floor((numerator + 50) / 100);
}

export function computeLine(line: InvoiceLineItem): InvoiceLineComputed {
  const vatCents = computeLineVat(line.netCents, line.vatRate);
  return {
    ...line,
    vatCents,
    grossCents: line.netCents + vatCents,
  };
}

export function computeInvoiceTotals(lines: readonly InvoiceLineItem[]): InvoiceTotals {
  let netCents = 0;
  let vatCents = 0;
  for (const line of lines) {
    const computed = computeLine(line);
    netCents += computed.netCents;
    vatCents += computed.vatCents;
  }
  return { netCents, vatCents, grossCents: netCents + vatCents };
}

/**
 * Overdue is derived from the supplied asOf date, never the machine clock,
 * so the result is stable when the system time changes.
 */
export function isInvoiceOverdue(invoice: VendorInvoice, asOf: string): boolean {
  if (invoice.status === 'paid' || invoice.status === 'disputed') {
    return false;
  }
  return invoice.dueDate < asOf;
}

export function computeInvoice(invoice: VendorInvoice, asOf: string): InvoiceComputed {
  const lines = invoice.lineItems.map(computeLine);
  const totals = computeInvoiceTotals(invoice.lineItems);
  const overdue = isInvoiceOverdue(invoice, asOf);
  return {
    invoice,
    lines,
    netCents: totals.netCents,
    vatCents: totals.vatCents,
    grossCents: totals.grossCents,
    isOverdue: overdue,
    effectiveStatus: overdue ? 'overdue' : invoice.status,
  };
}

export function sumTotals(rows: readonly InvoiceComputed[]): InvoiceTotals {
  let netCents = 0;
  let vatCents = 0;
  let grossCents = 0;
  for (const row of rows) {
    netCents += row.netCents;
    vatCents += row.vatCents;
    grossCents += row.grossCents;
  }
  return { netCents, vatCents, grossCents };
}

export function sumOpenAmount(rows: readonly InvoiceComputed[]): number {
  let openCents = 0;
  for (const row of rows) {
    if (row.effectiveStatus === 'open' || row.effectiveStatus === 'overdue') {
      openCents += row.grossCents;
    }
  }
  return openCents;
}

export function formatCents(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const euros = Math.floor(abs / 100);
  const remainder = abs % 100;
  const eurosStr = euros.toLocaleString('de-DE');
  const centsStr = remainder.toString().padStart(2, '0');
  return `${sign}${eurosStr},${centsStr} \u20AC`;
}

export function formatVatRate(rate: VatRate): string {
  return `${rate} %`;
}
