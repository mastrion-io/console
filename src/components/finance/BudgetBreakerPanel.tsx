'use client';

import React, { useCallback, useState } from 'react';
import { AlertTriangle, Lock, RotateCcw } from 'lucide-react';
import {
  formatEurFromCents,
  spendRatio,
  type BudgetsResponse,
  type CostCenterBudget,
} from '@/lib/finance/budgets';
import { BreakerStateBadge } from './BreakerStateBadge';
import { SpendSegmentedBar } from './SpendSegmentedBar';
import { CapChangeDialog } from './CapChangeDialog';

interface BudgetBreakerPanelProps {
  initialData: BudgetsResponse;
}

function formatTripTime(iso: string | null): string {
  if (!iso) {
    return 'Never';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }
  return date.toLocaleString('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function BudgetBreakerPanel({ initialData }: BudgetBreakerPanelProps) {
  const [budgets, setBudgets] = useState<CostCenterBudget[]>(initialData.budgets);
  const [active, setActive] = useState<CostCenterBudget | null>(null);

  const readOnly = initialData.source !== 'runtime';
  const readOnlyReason =
    'Runtime is serving fixtures; cap changes are disabled until the finops arbiter is connected.';

  const handleConfirm = useCallback(
    async (capCents: number) => {
      if (!active) {
        return;
      }
      const response = await fetch(`/api/finance/budgets/${active.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capCents }),
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? 'Cap change rejected.');
      }
      setBudgets((current) =>
        current.map((budget) =>
          budget.id === active.id
            ? {
                ...budget,
                capCents,
                remainingCents: Math.max(0, capCents - budget.spendTodayCents),
              }
            : budget,
        ),
      );
      setActive(null);
    },
    [active],
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Budget caps &amp; circuit breakers</h2>
          <p className="mt-1 text-xs text-slate-400">
            Daily EUR cap per cost center, enforced by the finops arbiter. Tripped breakers reroute to local sovereign models.
          </p>
        </div>
        {readOnly && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300"
            title={readOnlyReason}
          >
            <Lock className="h-3 w-3" />
            Read-only (fixture)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {budgets.map((budget) => {
          const ratio = spendRatio(budget);
          const tripped = budget.breakerState === 'tripped';
          return (
            <article
              key={budget.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">{budget.department}</h3>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-500">{budget.costCenter}</p>
                </div>
                <BreakerStateBadge state={budget.breakerState} />
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-400">
                    <span className="font-mono text-slate-900 dark:text-slate-100">{formatEurFromCents(budget.spendTodayCents)}</span>
                    {' '}of{' '}
                    <span className="font-mono text-slate-900 dark:text-slate-100">{formatEurFromCents(budget.capCents)}</span>
                  </span>
                  <span className="text-slate-500">
                    {formatEurFromCents(budget.remainingCents)} left
                  </span>
                </div>
                <SpendSegmentedBar ratio={ratio} tripped={tripped} />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="text-slate-500">Last trip</dt>
                  <dd className="mt-0.5 text-slate-700 dark:text-slate-300">{formatTripTime(budget.lastTripAt)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Rerouted requests</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 font-mono text-slate-700 dark:text-slate-300">
                    <RotateCcw className="h-3 w-3 text-slate-500" />
                    {budget.reroutedRequests.toLocaleString('de-DE')}
                  </dd>
                </div>
              </dl>

              {tripped && (
                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-rose-300">
                  <AlertTriangle className="h-3 w-3" />
                  Cap exhausted — traffic is being served by local models.
                </p>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActive(budget)}
                  disabled={readOnly}
                  title={readOnly ? readOnlyReason : undefined}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Change cap
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {active && (
        <CapChangeDialog
          budget={active}
          readOnly={readOnly}
          readOnlyReason={readOnlyReason}
          onClose={() => setActive(null)}
          onConfirm={handleConfirm}
        />
      )}
    </section>
  );
}
