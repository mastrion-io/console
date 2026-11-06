import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import {
  COST_CENTERS,
  formatEur,
  getCostCenterById,
  utilisationPercent,
} from '@/lib/finance/costCenters';
import { UtilisationBar } from '@/components/finance/UtilisationBar';
import { DailySpendChart } from '@/components/finance/DailySpendChart';
import { TopCostList } from '@/components/finance/TopCostList';
import { SpendEntriesTable } from '@/components/finance/SpendEntriesTable';

interface CostCenterDetailPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return COST_CENTERS.map((cc) => ({ id: cc.id }));
}

export default async function CostCenterDetailPage({ params }: CostCenterDetailPageProps) {
  const { id } = await params;
  const costCenter = getCostCenterById(id);

  if (!costCenter) {
    notFound();
  }

  const utilisation = utilisationPercent(costCenter.mtdSpendCents, costCenter.budgetCents);
  const delta = costCenter.mtdSpendCents - costCenter.lastMonthSpendCents;

  return (
    <main className="max-w-7xl w-full mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/finance/cost-centers"
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          All cost centers
        </Link>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-100">{costCenter.name}</h1>
            <p className="text-xs text-slate-500">Owner: {costCenter.owner}</p>
          </div>
          <div className="w-full sm:w-64">
            <UtilisationBar percent={utilisation} />
          </div>
        </div>

        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">MTD spend</dt>
            <dd className="font-mono text-sm tabular-nums text-slate-100">{formatEur(costCenter.mtdSpendCents)}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">Budget</dt>
            <dd className="font-mono text-sm tabular-nums text-slate-300">{formatEur(costCenter.budgetCents)}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">Projected EOM</dt>
            <dd className="font-mono text-sm tabular-nums text-slate-100">{formatEur(costCenter.projectedMonthEndCents)}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">Δ vs last month</dt>
            <dd className={`font-mono text-sm tabular-nums ${delta > 0 ? 'text-red-300' : delta < 0 ? 'text-emerald-300' : 'text-slate-400'}`}>
              {delta > 0 ? '+' : delta < 0 ? '−' : ''}
              {formatEur(Math.abs(delta))}
            </dd>
          </div>
        </dl>
      </div>

      <DailySpendChart data={costCenter.dailySpendCents} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopCostList
          title="Top models by cost"
          items={costCenter.topModels.map((m) => ({ label: m.model, amountCents: m.amountCents }))}
          emptyLabel="No model spend recorded for this cost center."
        />
        <TopCostList
          title="Top users by cost"
          items={costCenter.topUsers.map((u) => ({
            label: u.user,
            sublabel: u.role,
            amountCents: u.amountCents,
          }))}
          emptyLabel="No user spend recorded for this cost center."
        />
      </div>

      <SpendEntriesTable entries={costCenter.entries} />
    </main>
  );
}
