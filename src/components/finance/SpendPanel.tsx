import React from 'react';
import type { CostCenterSpend } from '@/lib/finance/demo-fixtures';

export function SpendPanel({ costCenters }: { costCenters: CostCenterSpend[] }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-200">Spend by cost center</h2>
      <ul className="space-y-2">
        {costCenters.map((cc) => (
          <li key={cc.id} className="flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-200">{cc.name}</p>
              <p className="text-[11px] text-slate-500">{cc.owner}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-300">
                {cc.spendEur.toLocaleString('en-US')} EUR
              </span>
              <span
                className={
                  cc.tripped
                    ? 'rounded border border-rose-800/70 bg-rose-950/50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300'
                    : 'rounded border border-emerald-800/70 bg-emerald-950/40 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300'
                }
              >
                {cc.utilizationPct}%
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
