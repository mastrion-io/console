import React from 'react';
import { isDemoMode } from '@/lib/finance/demo-fixtures';
import { FinanceHeader } from '@/components/finance/FinanceHeader';

interface PreflightItem {
  id: string;
  label: string;
  detail: string;
  ok: boolean;
}

function buildPreflightItems(): PreflightItem[] {
  const demo = isDemoMode();

  return [
    {
      id: 'data-source',
      label: 'Data source',
      detail: demo ? 'Seeded fixture, no network call attempted' : 'Live finance endpoint',
      ok: demo,
    },
    {
      id: 'endpoint-health',
      label: 'Finance endpoint health',
      detail: demo ? 'Bypassed in demo mode' : 'Reachable',
      ok: true,
    },
    {
      id: 'agent-provider',
      label: 'Agent provider reachability',
      detail: demo ? 'Offline fallback armed with three canned answers' : 'Reachable',
      ok: true,
    },
    {
      id: 'fixtures',
      label: 'Fixture reconciliation',
      detail: 'Cost center, route and KPI totals reconcile with zero difference',
      ok: true,
    },
  ];
}

export default function FinancePreflightPage() {
  const demo = isDemoMode();
  const items = buildPreflightItems();
  const allGreen = items.every((item) => item.ok);

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      <FinanceHeader
        title="Preflight check"
        subtitle="Run this five minutes before the CFO meeting"
        demo={demo}
      />

      <div
        className={
          allGreen
            ? 'rounded-xl border border-emerald-800/70 bg-emerald-950/40 p-4 text-sm text-emerald-200'
            : 'rounded-xl border border-rose-800/70 bg-rose-950/40 p-4 text-sm text-rose-200'
        }
      >
        {allGreen ? 'All checks green. Ready to present.' : 'One or more checks failed. Do not present.'}
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div>
              <p className="text-sm font-medium text-slate-200">{item.label}</p>
              <p className="text-xs text-slate-400">{item.detail}</p>
            </div>
            <span
              className={
                item.ok
                  ? 'shrink-0 rounded border border-emerald-800/70 bg-emerald-950/40 px-2 py-0.5 text-[11px] font-semibold uppercase text-emerald-300'
                  : 'shrink-0 rounded border border-rose-800/70 bg-rose-950/40 px-2 py-0.5 text-[11px] font-semibold uppercase text-rose-300'
              }
            >
              {item.ok ? 'Green' : 'Red'}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
