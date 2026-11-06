import React from 'react';
import { ConsoleShell } from '@/components/ConsoleShell';
import { FinanceOverview } from '@/components/finance/FinanceOverview';

export const metadata = {
  title: 'Finance Overview | Mastrion Enterprise Console',
  description: 'CFO cost overview: headline KPIs and 90 day spend trajectory.',
};

export default function FinancePage() {
  // Full-bleed shell: the finance surface must fill the viewport with a
  // retractable rail. Do not cap this route to a fixed centre column, because
  // that leaves most of a large CFO panel empty.
  return (
    <ConsoleShell>
      <header className="h-14 shrink-0 flex items-center justify-between border-b border-slate-800 px-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-tight text-slate-100">
            Finance Control Plane
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            CONSOLE-EPIC-FIN
          </span>
        </div>
        <span className="text-sm font-semibold tracking-tight text-slate-400">
          Mastrion
        </span>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <section className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-100">Finance overview</h1>
          <p className="text-xs text-slate-500">
            Headline cost KPIs and 90 day spend trajectory for the sovereign runtime fabric.
          </p>
        </section>
        <FinanceOverview />
      </main>
    </ConsoleShell>
  );
}
