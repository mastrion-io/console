import React from 'react';
import { DemoChip } from './DemoChip';

export function FinanceHeader({
  title,
  subtitle,
  demo,
}: {
  title: string;
  subtitle: string;
  demo: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">{title}</h1>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <DemoChip demo={demo} />
        <span className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm px-2 py-0.5 font-mono text-[11px] text-slate-400">
          {demo ? 'MASTRION_DEMO=true' : 'MASTRION_DEMO=false'}
        </span>
      </div>
    </div>
  );
}
