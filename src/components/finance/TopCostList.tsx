import React from 'react';
import { formatEur } from '@/lib/finance/costCenters';

interface TopCostListProps {
  title: string;
  items: { label: string; sublabel?: string; amountCents: number }[];
  emptyLabel: string;
}

export function TopCostList({ title, items, emptyLabel }: TopCostListProps) {
  const max = items.length > 0 ? Math.max(...items.map((i) => i.amountCents), 1) : 1;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="text-sm font-semibold text-slate-100 mb-3">{title}</h2>
      {items.length === 0 ? (
        <p className="text-xs text-slate-500">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const widthPct = Math.max(2, Math.round((item.amountCents / max) * 100));
            return (
              <li key={item.label} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-200 truncate">
                    {item.label}
                    {item.sublabel ? (
                      <span className="text-slate-500"> · {item.sublabel}</span>
                    ) : null}
                  </span>
                  <span className="font-mono tabular-nums text-slate-300 shrink-0">
                    {formatEur(item.amountCents)}
                  </span>
                </div>
                <div className="h-1 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-brand-500/70" style={{ width: `${widthPct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
