import React from 'react';
import type { RouteSpend } from '@/lib/finance/demo-fixtures';

export function SavingsPanel({ routes }: { routes: RouteSpend[] }) {
  const local = routes.filter((r) => r.tier === 'local');
  const frontier = routes.filter((r) => r.tier === 'frontier');

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Local versus frontier</h2>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-emerald-800/60 bg-emerald-950/30 p-3">
          <p className="text-[11px] uppercase tracking-wider text-emerald-400">Local</p>
          <p className="mt-1 font-mono text-lg text-emerald-200">0.01 EUR</p>
          <p className="text-[11px] text-slate-400">per request</p>
          <p className="mt-2 text-[11px] text-slate-400">
            {local.reduce((acc, r) => acc + r.requests, 0).toLocaleString('en-US')} requests
          </p>
        </div>
        <div className="rounded-lg border border-rose-800/60 bg-rose-950/30 p-3">
          <p className="text-[11px] uppercase tracking-wider text-rose-400">Frontier</p>
          <p className="mt-1 font-mono text-lg text-rose-200">0.80 EUR</p>
          <p className="text-[11px] text-slate-400">per request</p>
          <p className="mt-2 text-[11px] text-slate-400">
            {frontier.reduce((acc, r) => acc + r.requests, 0).toLocaleString('en-US')} requests
          </p>
        </div>
      </div>
    </section>
  );
}
