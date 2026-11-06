import React from 'react';
import type { MonthEndProjection } from '@/lib/finance/demo-fixtures';

export function BudgetPanel({ projection }: { projection: MonthEndProjection }) {
  const overBudget = projection.projectedVarianceEur > 0;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-200">Month end projection</h2>
      <dl className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <dt className="text-slate-400">Month to date</dt>
          <dd className="font-mono text-slate-200">
            {projection.mtdSpendEur.toLocaleString('en-US')} EUR
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-400">Projected</dt>
          <dd className="font-mono text-slate-200">
            {projection.projectedSpendEur.toLocaleString('en-US')} EUR
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-400">Budget</dt>
          <dd className="font-mono text-slate-200">
            {projection.budgetEur.toLocaleString('en-US')} EUR
          </dd>
        </div>
        <div className="flex items-center justify-between border-t border-slate-800 pt-2">
          <dt className="text-slate-400">Variance</dt>
          <dd
            className={
              overBudget ? 'font-mono font-semibold text-rose-300' : 'font-mono font-semibold text-emerald-300'
            }
          >
            {overBudget ? '+' : ''}
            {projection.projectedVarianceEur.toLocaleString('en-US')} EUR
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-[11px] text-slate-500">
        Day {projection.daysElapsed} of {projection.daysInMonth}
      </p>
    </section>
  );
}
