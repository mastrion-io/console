import React from 'react';

export function FinanceTrajectoryChartSkeleton() {
  return (
    <section
      aria-label="Spend trajectory loading"
      aria-busy="true"
      className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="h-4 w-48 animate-pulse rounded bg-slate-800" />
        <div className="h-3 w-56 animate-pulse rounded bg-slate-800" />
      </div>
      <div className="h-72 w-full animate-pulse rounded bg-slate-800/60" />
    </section>
  );
}
