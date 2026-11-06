import React from 'react';
import { FinanceOverview } from '@/components/finance/FinanceOverview';

export const metadata = {
  title: 'Finance Overview | Mastrion Enterprise Console',
  description: 'CFO cost overview: headline KPIs and 90 day spend trajectory.',
};

export default function FinancePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-100">Finance overview</h1>
          <p className="text-xs text-slate-500">
            Headline cost KPIs and 90 day spend trajectory for the sovereign runtime fabric.
          </p>
        </header>
        <FinanceOverview />
      </main>
    </div>
  );
}
