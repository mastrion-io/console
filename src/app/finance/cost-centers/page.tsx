import React from 'react';
import { CostCenterTable } from '@/components/finance/CostCenterTable';

export const metadata = {
  title: 'Cost centers | Mastrion Enterprise Console',
  description: 'Cost center league table with utilisation, projections and CSV export.',
};

export default function CostCentersPage() {
  // Shell comes from finance/layout.tsx. Content only, no width cap.
  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
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
