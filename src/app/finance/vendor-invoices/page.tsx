import { VendorInvoiceLedger } from '@/components/finance/VendorInvoiceLedger';
import { COST_CENTERS, VENDOR_INVOICES } from '@/lib/finance/vendorInvoiceData';

/**
 * asOf is resolved on the server so overdue status is stable and does not
 * depend on the browser clock.
 */
export default function VendorInvoicesPage() {
  const asOf = new Date().toISOString().slice(0, 10);

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-100">Vendor Invoice Ledger</h1>
        <p className="text-sm text-slate-400">
          Net, USt and gross in integer cents. Overdue is derived from the ledger date{' '}
          <span className="font-mono text-slate-300">{asOf}</span>, not the browser clock.
        </p>
      </header>
      <VendorInvoiceLedger invoices={VENDOR_INVOICES} costCenters={COST_CENTERS} asOf={asOf} />
    </main>
  );
}
