import React from 'react';
import { ConsoleShell } from '@/components/ConsoleShell';

export default function FinancePage() {
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

      <main className="flex-1 overflow-y-auto p-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
          <h1 className="text-lg font-semibold text-slate-100">
            Finance Control Plane
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            The finance dashboard is loading. Live cost, budget and invoice
            telemetry will appear here once MST-FIN-103 lands.
          </p>
        </div>
      </main>
    </ConsoleShell>
  );
}
