'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUp, ChevronRight, Download } from 'lucide-react';
import {
  COST_CENTERS,
  formatEur,
} from '@/lib/finance/costCenters';
import {
  buildCostCenterCsv,
  csvFilename,
  sortRows,
  toRow,
  type CostCenterRow,
  type CostCenterSortKey,
  type SortDirection,
} from '@/lib/finance/csv';
import { UtilisationBar } from './UtilisationBar';

interface ColumnDef {
  key: CostCenterSortKey;
  label: string;
  numeric: boolean;
  className: string;
}

const COLUMNS: ColumnDef[] = [
  { key: 'name', label: 'Cost center', numeric: false, className: 'text-left' },
  { key: 'owner', label: 'Owner', numeric: false, className: 'text-left' },
  { key: 'mtdSpendCents', label: 'MTD spend', numeric: true, className: 'text-right' },
  { key: 'budgetCents', label: 'Budget', numeric: true, className: 'text-right' },
  { key: 'utilisation', label: 'Utilisation', numeric: true, className: 'text-right' },
  { key: 'projectedMonthEndCents', label: 'Projected EOM', numeric: true, className: 'text-right' },
  { key: 'deltaCents', label: 'Δ vs last month', numeric: true, className: 'text-right' },
];

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) return <span className="inline-block w-3" aria-hidden="true" />;
  return direction === 'asc' ? (
    <ArrowUp className="inline-block w-3 h-3" aria-hidden="true" />
  ) : (
    <ArrowDown className="inline-block w-3 h-3" aria-hidden="true" />
  );
}

function DeltaCell({ cents }: { cents: number }) {
  const sign = cents > 0 ? '+' : cents < 0 ? '−' : '';
  const abs = Math.abs(cents);
  const tone = cents > 0 ? 'text-red-300' : cents < 0 ? 'text-emerald-300' : 'text-slate-400';
  return (
    <span className={`font-mono text-xs tabular-nums ${tone}`}>
      {sign}
      {formatEur(abs)}
    </span>
  );
}

function downloadCsv(rows: CostCenterRow[]) {
  const csv = buildCostCenterCsv(rows);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = csvFilename(new Date());
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function CostCenterTable() {
  const [sortKey, setSortKey] = useState<CostCenterSortKey>('utilisation');
  const [direction, setDirection] = useState<SortDirection>('desc');

  const rows = useMemo(() => {
    const base = COST_CENTERS.map(toRow);
    return sortRows(base, sortKey, direction);
  }, [sortKey, direction]);

  function handleSort(key: CostCenterSortKey) {
    if (key === sortKey) {
      setDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setDirection(key === 'name' || key === 'owner' ? 'asc' : 'desc');
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Cost center league table</h2>
          <p className="text-xs text-slate-500">
            Sorted by {COLUMNS.find((c) => c.key === sortKey)?.label} ({direction === 'asc' ? 'ascending' : 'descending'})
          </p>
        </div>
        <button
          type="button"
          onClick={() => downloadCsv(rows)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-700/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-slate-900">
            <tr className="border-b border-slate-800">
              {COLUMNS.map((col) => {
                const active = col.key === sortKey;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 ${col.className}`}
                    aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className={`inline-flex items-center gap-1 hover:text-slate-900 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded ${
                        col.numeric ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <span>{col.label}</span>
                      <SortIcon active={active} direction={direction} />
                    </button>
                  </th>
                );
              })}
              <th scope="col" className="px-3 py-2 w-8">
                <span className="sr-only">Drilldown</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-800/60 hover:bg-slate-800/40">
                <td className="px-3 py-2 text-slate-100">
                  <Link
                    href={`/finance/cost-centers/${row.id}`}
                    className="hover:text-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
                  >
                    {row.name}
                  </Link>
                </td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{row.owner}</td>
                <td className="px-3 py-2 text-right font-mono text-xs tabular-nums text-slate-900 dark:text-slate-100">
                  {formatEur(row.mtdSpendCents)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs tabular-nums text-slate-400">
                  {formatEur(row.budgetCents)}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end">
                    <UtilisationBar percent={row.utilisation} />
                  </div>
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs tabular-nums text-slate-900 dark:text-slate-100">
                  {formatEur(row.projectedMonthEndCents)}
                </td>
                <td className="px-3 py-2 text-right">
                  <DeltaCell cents={row.deltaCents} />
                </td>
                <td className="px-3 py-2 text-right">
                  <Link
                    href={`/finance/cost-centers/${row.id}`}
                    className="inline-flex text-slate-500 hover:text-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
                    aria-label={`Open drilldown for ${row.name}`}
                  >
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
