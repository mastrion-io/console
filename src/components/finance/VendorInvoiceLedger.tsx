'use client';

import React, { useMemo, useState } from 'react';
import { Download, Printer, X } from 'lucide-react';
import {
  computeInvoice,
  formatCents,
  formatVatRate,
  sumOpenAmount,
  sumTotals,
  type InvoiceComputed,
  type InvoiceStatus,
  type VendorInvoice,
} from '@/lib/finance/vendorInvoices';

interface VendorInvoiceLedgerProps {
  invoices: readonly VendorInvoice[];
  costCenters: readonly string[];
  asOf: string;
}

const STATUS_OPTIONS: readonly InvoiceStatus[] = ['open', 'paid', 'overdue', 'disputed'];

const STATUS_BADGE: Record<InvoiceStatus, string> = {
  open: 'bg-sky-950/60 text-sky-300 border-sky-800/70',
  paid: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/70',
  overdue: 'bg-rose-950/60 text-rose-300 border-rose-800/70',
  disputed: 'bg-amber-950/60 text-amber-300 border-amber-800/70',
};

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsv(rows: readonly InvoiceComputed[]): string {
  const header = [
    'vendor',
    'invoice_number',
    'issue_date',
    'due_date',
    'status',
    'cost_center',
    'net_cents',
    'vat_rate',
    'vat_cents',
    'gross_cents',
  ];
  const lines: string[] = [header.join(',')];
  for (const row of rows) {
    for (const line of row.lines) {
      lines.push(
        [
          csvEscape(row.invoice.vendor),
          csvEscape(row.invoice.invoiceNumber),
          row.invoice.issueDate,
          row.invoice.dueDate,
          row.effectiveStatus,
          csvEscape(row.invoice.costCenter),
          String(line.netCents),
          String(line.vatRate),
          String(line.vatCents),
          String(line.grossCents),
        ].join(','),
      );
    }
  }
  return lines.join('\n');
}

export function VendorInvoiceLedger({ invoices, costCenters, asOf }: VendorInvoiceLedgerProps) {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [costCenterFilter, setCostCenterFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const computed = useMemo<InvoiceComputed[]>(
    () => invoices.map((invoice) => computeInvoice(invoice, asOf)),
    [invoices, asOf],
  );

  const visible = useMemo<InvoiceComputed[]>(() => {
    return computed.filter((row) => {
      if (statusFilter !== 'all' && row.effectiveStatus !== statusFilter) {
        return false;
      }
      if (costCenterFilter !== 'all' && row.invoice.costCenter !== costCenterFilter) {
        return false;
      }
      if (fromDate !== '' && row.invoice.issueDate < fromDate) {
        return false;
      }
      if (toDate !== '' && row.invoice.issueDate > toDate) {
        return false;
      }
      return true;
    });
  }, [computed, statusFilter, costCenterFilter, fromDate, toDate]);

  const totals = useMemo(() => sumTotals(visible), [visible]);
  const openAmount = useMemo(() => sumOpenAmount(visible), [visible]);

  const hasActiveFilters =
    statusFilter !== 'all' || costCenterFilter !== 'all' || fromDate !== '' || toDate !== '';

  const resetFilters = () => {
    setStatusFilter('all');
    setCostCenterFilter('all');
    setFromDate('');
    setToDate('');
  };

  const handleExport = () => {
    const csv = buildCsv(visible);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `vendor-invoices-${asOf}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-4 space-y-4 print:hidden">
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1 text-xs text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as InvoiceStatus | 'all')}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">Cost center</span>
            <select
              value={costCenterFilter}
              onChange={(event) => setCostCenterFilter(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
            >
              <option value="all">All cost centers</option>
              {costCenters.map((cc) => (
                <option key={cc} value={cc}>
                  {cc}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">Issued from</span>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">Issued to</span>
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
            />
          </label>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-700/80"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-700/80"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">Active filters:</span>
            {statusFilter !== 'all' && (
              <FilterChip label={`Status: ${statusFilter}`} onClear={() => setStatusFilter('all')} />
            )}
            {costCenterFilter !== 'all' && (
              <FilterChip label={`Cost center: ${costCenterFilter}`} onClear={() => setCostCenterFilter('all')} />
            )}
            {fromDate !== '' && (
              <FilterChip label={`From: ${fromDate}`} onClear={() => setFromDate('')} />
            )}
            {toDate !== '' && (
              <FilterChip label={`To: ${toDate}`} onClear={() => setToDate('')} />
            )}
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-slate-400 underline-offset-2 hover:text-slate-900 dark:text-slate-100 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </section>

      <section className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Vendor</th>
              <th className="px-4 py-3 text-left font-medium">Invoice no.</th>
              <th className="px-4 py-3 text-left font-medium">Issued</th>
              <th className="px-4 py-3 text-left font-medium">Due</th>
              <th className="px-4 py-3 text-right font-medium">Net</th>
              <th className="px-4 py-3 text-right font-medium">USt rate</th>
              <th className="px-4 py-3 text-right font-medium">USt</th>
              <th className="px-4 py-3 text-right font-medium">Gross</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Cost center</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {visible.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                  No invoices match the active filters.
                </td>
              </tr>
            )}
            {visible.map((row) => (
              <tr key={row.invoice.id} className="align-top hover:bg-slate-800/30">
                <td className="px-4 py-3 text-slate-100">{row.invoice.vendor}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{row.invoice.invoiceNumber}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.invoice.issueDate}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.invoice.dueDate}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-900 dark:text-slate-100">{formatCents(row.netCents)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-col items-end gap-1">
                    {row.lines.map((line) => (
                      <span key={line.id} className="font-mono text-xs text-slate-700 dark:text-slate-300">
                        {formatVatRate(line.vatRate)}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-900 dark:text-slate-100">{formatCents(row.vatCents)}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-slate-100">{formatCents(row.grossCents)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[row.effectiveStatus]}`}
                  >
                    {row.effectiveStatus}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.invoice.costCenter}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-900/90 text-slate-100">
            <tr className="border-t border-slate-700">
              <td colSpan={4} className="px-4 py-3 text-xs uppercase tracking-wide text-slate-400">
                Totals ({visible.length} invoices)
              </td>
              <td className="px-4 py-3 text-right font-mono">{formatCents(totals.netCents)}</td>
              <td className="px-4 py-3" />
              <td className="px-4 py-3 text-right font-mono">{formatCents(totals.vatCents)}</td>
              <td className="px-4 py-3 text-right font-mono font-semibold">{formatCents(totals.grossCents)}</td>
              <td colSpan={2} className="px-4 py-3 text-xs text-slate-400">
                Open amount:{' '}
                <span className="font-mono text-slate-100">{formatCents(openAmount)}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-4 space-y-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">USt notes</h2>
        <ul className="space-y-1 text-xs text-slate-400">
          {visible.flatMap((row) =>
            row.lines
              .filter((line) => line.vatRate === 0)
              .map((line) => (
                <li key={`${row.invoice.id}-${line.id}`} className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-slate-700 dark:text-slate-300">{row.invoice.invoiceNumber}</span>
                  <span className="rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    0 %
                  </span>
                  <span>{line.description}</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {line.vatExemptionReason ?? 'No reason recorded'}
                  </span>
                </li>
              )),
          )}
          {visible.every((row) => row.lines.every((line) => line.vatRate !== 0)) && (
            <li className="text-slate-500">No zero-rated lines in the current selection.</li>
          )}
        </ul>
      </section>
    </div>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/70 px-2.5 py-0.5 text-xs text-slate-900 dark:text-slate-100">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={`Remove filter ${label}`}
        className="text-slate-400 hover:text-slate-100"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
