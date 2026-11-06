import React from 'react';
import type { BreakerState } from '@/lib/finance/budgets';

interface BreakerStateBadgeProps {
  state: BreakerState;
}

export function BreakerStateBadge({ state }: BreakerStateBadgeProps) {
  const isTripped = state === 'tripped';

  return (
    <span
      className={
        isTripped
          ? 'inline-flex items-center gap-1.5 rounded-full border border-rose-700/60 bg-rose-950/50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-rose-300'
          : 'inline-flex items-center gap-1.5 rounded-full border border-emerald-700/60 bg-emerald-950/50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-300'
      }
    >
      <span
        className={
          isTripped
            ? 'h-1.5 w-1.5 rounded-full bg-rose-400'
            : 'h-1.5 w-1.5 rounded-full bg-emerald-400'
        }
      />
      {isTripped ? 'Tripped' : 'Closed'}
    </span>
  );
}
