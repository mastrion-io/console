import React from 'react';

export function FinanceKpiBandSkeleton() {
  return (
    <section aria-label="Finance headline KPIs loading" aria-busy="true" className="space-y-3">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex h-full min-h-[9.5rem] flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-4"
          >
            <div className="h-3 w-24 animate-pulse rounded bg-slate-800" />
            <div className="mt-2 h-7 w-32 animate-pulse rounded bg-slate-800" />
            <div className="mt-3 space-y-1 border-t border-slate-800/60 pt-2">
              <div className="h-2.5 w-28 animate-pulse rounded bg-slate-800" />
              <div className="h-2.5 w-24 animate-pulse rounded bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
