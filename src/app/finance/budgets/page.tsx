import React from 'react';
import type { BudgetsResponse } from '@/lib/finance/budgets';
import { getFixtureBudgets } from '@/lib/finance/budgetFixtures';
import { BudgetBreakerPanel } from '@/components/finance/BudgetBreakerPanel';

export const dynamic = 'force-dynamic';

async function loadBudgets(): Promise<BudgetsResponse> {
  return getFixtureBudgets();
}

export default async function BudgetsPage() {
  const data = await loadBudgets();

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-slate-100">Budget caps &amp; circuit breakers</h1>
        <p className="text-xs text-slate-400">
          Per cost center daily EUR caps enforced by <span className="font-mono">pkg/finops</span>. When a cap is exhausted the breaker trips and requests reroute to local sovereign models.
        </p>
      </header>

      <BudgetBreakerPanel initialData={data} />
    </main>
  );
}
