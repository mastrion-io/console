import React from 'react';

interface SpendSegmentedBarProps {
  ratio: number;
  tripped: boolean;
}

const SEGMENT_COUNT = 20;

export function SpendSegmentedBar({ ratio, tripped }: SpendSegmentedBarProps) {
  const filled = Math.round(Math.min(1, Math.max(0, ratio)) * SEGMENT_COUNT);
  const segments = Array.from({ length: SEGMENT_COUNT }, (_, index) => index);

  return (
    <div
      className="flex items-center gap-0.5"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(ratio * 100)}
      aria-label="Spend against daily cap"
    >
      {segments.map((index) => {
        const isFilled = index < filled;
        const isLast = index === SEGMENT_COUNT - 1;
        const filledClass = tripped
          ? 'bg-rose-500'
          : isLast
            ? 'bg-amber-400'
            : 'bg-emerald-500';
        return (
          <span
            key={index}
            className={
              isFilled
                ? `h-2.5 flex-1 rounded-sm ${filledClass}`
                : 'h-2.5 flex-1 rounded-sm bg-slate-800'
            }
          />
        );
      })}
    </div>
  );
}
