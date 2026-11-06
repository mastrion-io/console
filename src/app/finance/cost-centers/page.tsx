import React from 'react';
import { CostCenterTable } from '@/components/finance/CostCenterTable';

export const metadata = {
  title: 'Cost centers | Mastrion Enterprise Console',
  description: 'Cost center league table with utilisation, projections and CSV export.',
};

export default function CostCentersPage() {
  return (
    <main className="max-w-7xl w-full mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">Finance · Cost centers</h1>
        <p className="text-xs text-slate-500">
          Month-to-date spend, budget utilisation and projected month end across all cost centers.
        </p>
      </div>
      <CostCenterTable />
    </main>
  );
}
