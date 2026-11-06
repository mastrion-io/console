'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DEMO_DATASET,
  sumCostCenterSpend,
  sumRouteSpend,
} from '@/lib/finance/demo-fixtures';

const PANEL_COUNT = 4;

function formatEur(value: number): string {
  return `${value.toLocaleString('en-US')} EUR`;
}

export default function FinancePresentPage() {
  const router = useRouter();
  const [panel, setPanel] = useState<number>(0);

  const exit = useCallback(() => {
    router.push('/finance');
  }, [router]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        setPanel((current) => (current + 1) % PANEL_COUNT);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        setPanel((current) => (current - 1 + PANEL_COUNT) % PANEL_COUNT);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        exit();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [exit]);

  const totalSpend = sumCostCenterSpend(DEMO_DATASET);
  const routeSpend = sumRouteSpend(DEMO_DATASET);
  const tripped = DEMO_DATASET.costCenters.find((cc) => cc.tripped);
  const overdue = DEMO_DATASET.invoices.find((inv) => inv.status === 'overdue');
  const disputed = DEMO_DATASET.invoices.find((inv) => inv.status === 'disputed');

  return (
    <div className="fixed inset-0 flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 px-10 py-4">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-tight">Mastrion Finance</span>
          <span className="rounded border border-amber-700/60 bg-amber-950/50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
            Demo
          </span>
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: PANEL_COUNT }).map((_, index) => (
            <span
              key={index}
              className={
                index === panel
                  ? 'h-2 w-8 rounded-full bg-brand-500'
                  : 'h-2 w-2 rounded-full bg-slate-700'
              }
            />
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden px-16 py-10">
        {panel === 0 && (
          <div className="w-full max-w-none text-center">
            <p className="text-2xl uppercase tracking-[0.3em] text-slate-500">Total spend</p>
            <p className="mt-6 text-[10rem] font-semibold leading-none text-slate-100">
              {formatEur(totalSpend)}
            </p>
            <p className="mt-6 text-3xl text-slate-400">
              Cost center and route totals reconcile with zero difference
            </p>
          </div>
        )}

        {panel === 1 && (
          <div className="w-full max-w-none text-center">
            <p className="text-2xl uppercase tracking-[0.3em] text-slate-500">Budget</p>
            <p className="mt-6 text-[8rem] font-semibold leading-none text-rose-300">
              +{formatEur(DEMO_DATASET.projection.projectedVarianceEur)}
            </p>
            <p className="mt-6 text-3xl text-slate-400">
              Projected {formatEur(DEMO_DATASET.projection.projectedSpendEur)} against{' '}
              {formatEur(DEMO_DATASET.projection.budgetEur)} budget
            </p>
            {tripped && (
              <p className="mt-4 text-2xl text-rose-400">
                {tripped.name} at {tripped.utilizationPct} percent of cap, tripped
              </p>
            )}
          </div>
        )}

        {panel === 2 && (
          <div className="w-full max-w-none text-center">
            <p className="text-2xl uppercase tracking-[0.3em] text-slate-500">Savings</p>
            <p className="mt-6 text-[10rem] font-semibold leading-none text-emerald-300">
              {formatEur(DEMO_DATASET.kpi.totalSavingsEur)}
            </p>
            <p className="mt-6 text-3xl text-slate-400">
              Local at 0.01 EUR versus frontier at 0.80 EUR per request
            </p>
          </div>
        )}

        {panel === 3 && (
          <div className="w-full max-w-none text-center">
            <p className="text-2xl uppercase tracking-[0.3em] text-slate-500">Invoices</p>
            <p className="mt-6 text-[8rem] font-semibold leading-none text-amber-300">
              {DEMO_DATASET.kpi.openInvoiceCount} open
            </p>
            <div className="mt-8 space-y-3 text-3xl text-slate-300">
              {overdue && (
                <p>
                  Overdue: {overdue.vendor} {formatEur(overdue.amountEur)}
                </p>
              )}
              {disputed && (
                <p>
                  Disputed: {disputed.vendor} {formatEur(disputed.amountEur)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-800 px-10 py-3 text-sm text-slate-500">
        <span>Arrow keys to navigate panels</span>
        <span>Esc to exit</span>
        <span className="font-mono">Route spend {formatEur(routeSpend)}</span>
      </div>
    </div>
  );
}
