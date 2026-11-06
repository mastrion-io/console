import React from 'react';
import { loadFinanceData } from '@/lib/finance/demo-mode';
import { FinanceHeader } from '@/components/finance/FinanceHeader';
import { SpendPanel } from '@/components/finance/SpendPanel';
import { BudgetPanel } from '@/components/finance/BudgetPanel';
import { SavingsPanel } from '@/components/finance/SavingsPanel';
import { InvoicesPanel } from '@/components/finance/InvoicesPanel';
import { AgentPanel } from '@/components/finance/AgentPanel';

export default async function FinancePage() {
  const { data, demo } = await loadFinanceData();

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      <FinanceHeader
        title="Finance overview"
        subtitle="Spend, budget, savings and invoices across the sovereign runtime fabric"
        demo={demo}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SpendPanel costCenters={data.costCenters} />
        <BudgetPanel projection={data.projection} />
        <SavingsPanel routes={data.routes} />
        <InvoicesPanel invoices={data.invoices} />
      </div>

      <AgentPanel demo={demo} />
    </main>
  );
}
