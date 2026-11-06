import React from 'react';
import { formatEur } from '@/lib/finance/costCenters';

interface DailySpendChartProps {
  data: { date: string; amountCents: number }[];
}

export function DailySpendChart({ data }: DailySpendChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="text-sm font-semibold text-slate-100 mb-2">Daily spend</h2>
        <p className="text-xs text-slate-500">No spend recorded for this cost center.</p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.amountCents), 1);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="text-sm font-semibold text-slate-100 mb-3">Daily spend</h2>
      <div className="flex items-end gap-1 h-40" role="img" aria-label="Daily spend bar chart">
        {data.map((d) => {
          const heightPct = Math.max(2, Math.round((d.amountCents / max) * 100));
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group">
              <div
                className="w-full rounded-t bg-brand-500/70 group-hover:bg-brand-400"
                style={{ height: `${heightPct}%` }}
                title={`${d.date}: ${formatEur(d.amountCents)}`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-slate-500 font-mono">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}
