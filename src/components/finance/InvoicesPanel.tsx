import React from 'react';
import type { VendorInvoice } from '@/lib/finance/demo-fixtures';

function statusClasses(status: VendorInvoice['status']): string {
  switch (status) {
    case 'overdue':
      return 'border-rose-800/70 bg-rose-950/50 text-rose-300';
    case 'disputed':
      return 'border-amber-800/70 bg-amber-950/50 text-amber-300';
    case 'paid':
      return 'border-emerald-800/70 bg-emerald-950/40 text-emerald-300';
    default:
      return 'border-slate-700 bg-slate-800/60 text-slate-300';
  }
}

export function InvoicesPanel({ invoices }: { invoices: VendorInvoice[] }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-200">Vendor invoices</h2>
      <ul className="space-y-2">
        {invoices.map((inv) => (
          <li key={inv.id} className="flex items-start justify-between gap-3 text-xs">
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-200">{inv.vendor}</p>
              <p className="truncate text-[11px] text-slate-500">{inv.note}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="font-mono text-slate-300">
                {inv.amountEur.toLocaleString('en-US')} EUR
              </span>
              <span
                className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${statusClasses(
                  inv.status,
                )}`}
              >
                {inv.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
