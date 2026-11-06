'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import type { ConfirmationCard } from '@/lib/agent/types';

interface ConfirmationCardViewProps {
  item: ConfirmationCard;
  onConfirm: (cardId: string) => void;
  onCancel: (cardId: string) => void;
}

export function ConfirmationCardView({
  item,
  onConfirm,
  onCancel,
}: ConfirmationCardViewProps) {
  const resolved = item.status !== 'awaiting';

  return (
    <div className="rounded-lg border border-amber-800/80 bg-amber-950/30 px-3 py-2 space-y-2">
      <div className="flex items-start gap-2">
        <ShieldAlert
          className="w-4 h-4 mt-0.5 shrink-0 text-amber-400"
          aria-hidden="true"
        />
        <div className="space-y-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-300">
            Confirmation required
          </p>
          <p className="text-xs text-slate-100 leading-relaxed">
            {item.humanSentence}
          </p>
        </div>
      </div>

      <dl
        aria-label={`Structured arguments for ${item.toolName}`}
        className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px] rounded-md border border-slate-800 bg-slate-950/60 px-2 py-1.5"
      >
        {item.arguments.map((arg) => (
          <React.Fragment key={arg.key}>
            <dt className="text-slate-500 font-mono">{arg.key}</dt>
            <dd className="text-slate-200 font-mono truncate">{arg.value}</dd>
          </React.Fragment>
        ))}
      </dl>

      <p className="text-[10px] text-slate-400">
        Confirming writes this action to the audit ledger. Cancelling executes
        nothing.
      </p>

      {resolved ? (
        <p
          className={
            item.status === 'confirmed'
              ? 'text-[11px] font-medium text-emerald-300'
              : 'text-[11px] font-medium text-slate-400'
          }
        >
          {item.status === 'confirmed'
            ? 'Confirmed and written to the audit ledger.'
            : 'Cancelled. Nothing was executed.'}
        </p>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onConfirm(item.id)}
            className="rounded-md border border-emerald-700/70 bg-emerald-900/40 px-2.5 py-1 text-[11px] font-medium text-emerald-100 hover:bg-emerald-900/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={() => onCancel(item.id)}
            autoFocus
            className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
