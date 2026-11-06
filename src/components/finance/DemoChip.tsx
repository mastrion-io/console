import React from 'react';

export function DemoChip({ demo }: { demo: boolean }) {
  if (!demo) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-700/60 bg-amber-950/50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      Demo
    </span>
  );
}
