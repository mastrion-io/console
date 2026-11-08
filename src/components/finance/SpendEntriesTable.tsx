'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatEur } from '@/lib/finance/costCenters';
import type { CostCenterSpendEntry } from '@/lib/finance/costCenters';

interface SpendEntriesTableProps {
  entries: CostCenterSpendEntry[];
}

const PAGE_SIZE = 10;

export function SpendEntriesTable({ entries }: SpendEntriesTableProps) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * PAGE_SIZE;
  const visible = entries.slice(start, start + PAGE_SIZE);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-slate-100">Recent spend entries</h2>
        <span className="text-xs text-slate-500">
          {entries.length === 0
            ? 'No entries'
            : `${start + 1}–${Math.min(start + PAGE_SIZE, entries.length)} of ${entries.length}`}
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="px-4 py-6 text-xs text-slate-500">No spend entries recorded for this cost center.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th scope="col" className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">Date</th>
                  <th scope="col" className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">Description</th>
                  <th scope="col" className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">Model</th>
                  <th scope="col" className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">User</th>
                  <th scope="col" className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">Amount</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-800/60 hover:bg-slate-800/40">
                    <td className="px-3 py-2 font-mono text-xs tabular-nums text-slate-400">{entry.date}</td>
                    <td className="px-3 py-2 text-slate-900 dark:text-slate-100">{entry.description}</td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{entry.model}</td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{entry.user}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs tabular-nums text-slate-900 dark:text-slate-100">
                      {formatEur(entry.amountCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 hover:bg-slate-700/80 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Previous
            </button>
            <span className="text-xs text-slate-500">
              Page {safePage + 1} of {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 hover:bg-slate-700/80 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
