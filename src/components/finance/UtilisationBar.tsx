import React from 'react';
import {
  formatPercent,
  utilisationLabel,
  utilisationState,
  type UtilisationState,
} from '@/lib/finance/costCenters';

interface UtilisationBarProps {
  percent: number;
}

const BAR_CLASS: Record<UtilisationState, string> = {
  ok: 'bg-emerald-500',
  warning: 'bg-amber-500',
  over: 'bg-red-500',
};

const TEXT_CLASS: Record<UtilisationState, string> = {
  ok: 'text-emerald-300',
  warning: 'text-amber-300',
  over: 'text-red-300',
};

export function UtilisationBar({ percent }: UtilisationBarProps) {
  const state = utilisationState(percent);
  const clamped = Math.max(0, Math.min(percent, 100));

  return (
    <div className="flex flex-col gap-1 min-w-[9rem]">
      <div className="flex items-center justify-between gap-2">
        <span className={`font-mono text-xs tabular-nums ${TEXT_CLASS[state]}`}>
          {formatPercent(percent)}
        </span>
        <span className={`text-[10px] uppercase tracking-wide ${TEXT_CLASS[state]}`}>
          {utilisationLabel(state)}
        </span>
      </div>
      <div
        className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        aria-valuetext={`${formatPercent(percent)} — ${utilisationLabel(state)}`}
      >
        <div
          className={`h-full rounded-full ${BAR_CLASS[state]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
