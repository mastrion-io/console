import React from 'react';
import { Wrench } from 'lucide-react';
import type { ToolCallCard, ToolCallStatus } from '@/lib/agent/types';

interface ToolCallCardViewProps {
  item: ToolCallCard;
}

function statusClasses(status: ToolCallStatus): string {
  switch (status) {
    case 'success':
      return 'border-emerald-700/60 bg-emerald-950/40 text-emerald-300';
    case 'error':
      return 'border-rose-700/60 bg-rose-950/40 text-rose-300';
    case 'running':
      return 'border-sky-700/60 bg-sky-950/40 text-sky-300';
    case 'pending':
    default:
      return 'border-slate-700 bg-slate-900 text-slate-300';
  }
}

export function ToolCallCardView({ item }: ToolCallCardViewProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Wrench className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          <span className="font-mono text-[11px] text-slate-200 truncate">
            {item.toolName}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-mono text-[10px] text-slate-500">
            {item.durationMs}ms
          </span>
          <span
            className={`rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${statusClasses(
              item.status,
            )}`}
          >
            {item.status}
          </span>
        </div>
      </div>
      <dl
        aria-label={`Arguments for ${item.toolName}`}
        className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px]"
      >
        {item.arguments.map((arg) => (
          <React.Fragment key={arg.key}>
            <dt className="text-slate-500 font-mono">{arg.key}</dt>
            <dd className="text-slate-300 font-mono truncate">{arg.value}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  );
}
