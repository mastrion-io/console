import React from 'react';
import { formatAsOf, formatFinanceValue, type FinanceKpiTile as FinanceKpiTileModel } from '@/lib/finance';

export interface FinanceKpiTileProps {
  tile: FinanceKpiTileModel;
  asOf: string;
  source: string;
}

export function FinanceKpiTile({ tile, asOf, source }: FinanceKpiTileProps) {
  const isOverBudget =
    tile.unit === 'percent' && typeof tile.threshold === 'number' && tile.value > tile.threshold;

  const tooltip = `${tile.definition} Source: ${source} (${tile.id}).`;

  return (
    <div
      tabIndex={0}
      role="group"
      aria-label={`${tile.label}: ${formatFinanceValue(tile.value, tile.unit)}`}
      title={tooltip}
      className="flex h-full min-h-[9.5rem] flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-4 outline-none transition-colors focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/60"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {tile.label}
        </span>
        {isOverBudget && (
          <span className="rounded border border-rose-700/60 bg-rose-950/50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-rose-300">
            Over budget
          </span>
        )}
      </div>

      <div className="mt-2">
        <span
          className={
            isOverBudget
              ? 'font-mono text-2xl font-semibold text-rose-400'
              : 'font-mono text-2xl font-semibold text-slate-100'
          }
        >
          {formatFinanceValue(tile.value, tile.unit)}
        </span>
        {tile.secondary && (
          <div className="mt-1 text-xs text-slate-400">
            <span className="text-slate-500">{tile.secondary.label}: </span>
            <span className="font-mono text-slate-300">
              {formatFinanceValue(tile.secondary.value, tile.secondary.unit)}
            </span>
          </div>
        )}
        {tile.projectionMethod && (
          <div className="mt-1 text-[11px] text-slate-500">
            Method: <span className="text-slate-400">{tile.projectionMethod}</span>
          </div>
        )}
        {tile.worstCostCenter && (
          <div className="mt-1 text-[11px] text-slate-500">
            Worst cost center: <span className="text-slate-400">{tile.worstCostCenter}</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-0.5 border-t border-slate-800/60 pt-2 text-[10px] text-slate-500">
        <span className="truncate">
          asOf <span className="font-mono text-slate-400">{formatAsOf(asOf)}</span>
        </span>
        <span className="truncate">
          source <span className="font-mono text-slate-400">{source}</span>
        </span>
      </div>
    </div>
  );
}
