'use client';

import React, { useEffect, useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import {
  formatEurFromCents,
  validateCapCents,
  type CostCenterBudget,
} from '@/lib/finance/budgets';

interface CapChangeDialogProps {
  budget: CostCenterBudget;
  readOnly: boolean;
  readOnlyReason: string;
  onClose: () => void;
  onConfirm: (capCents: number) => Promise<void>;
}

export function CapChangeDialog({
  budget,
  readOnly,
  readOnlyReason,
  onClose,
  onConfirm,
}: CapChangeDialogProps) {
  const [input, setInput] = useState<string>((budget.capCents / 100).toFixed(2));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const parsedCents = Math.round(Number.parseFloat(input) * 100);
  const previewValid = Number.isFinite(parsedCents) && validateCapCents(parsedCents).ok;

  const handleConfirm = async () => {
    if (readOnly) {
      return;
    }
    const validation = validateCapCents(parsedCents);
    if (!validation.ok) {
      setError(validation.error.message);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onConfirm(validation.capCents);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Cap change failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cap-change-title"
        className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="cap-change-title" className="text-sm font-semibold text-slate-100">
              Change daily cap
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {budget.department} · <span className="font-mono">{budget.costCenter}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <dt className="text-slate-500">Current cap</dt>
            <dd className="mt-1 font-mono text-sm text-slate-200">
              {formatEurFromCents(budget.capCents)}
            </dd>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <dt className="text-slate-500">New cap</dt>
            <dd className="mt-1 font-mono text-sm text-slate-200">
              {previewValid ? formatEurFromCents(parsedCents) : '—'}
            </dd>
          </div>
        </dl>

        <label className="mt-4 block text-xs text-slate-400" htmlFor="cap-input">
          New cap (EUR per day)
        </label>
        <input
          id="cap-input"
          type="number"
          min={0.01}
          step={0.01}
          value={input}
          disabled={readOnly || submitting}
          onChange={(event) => {
            setInput(event.target.value);
            setError(null);
          }}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100 outline-none focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-800/60 bg-amber-950/30 p-3 text-xs text-amber-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Requests above this cap reroute to local models.</span>
        </div>

        {readOnly && (
          <p className="mt-3 text-xs text-slate-400">
            Read-only: {readOnlyReason}
          </p>
        )}

        {error && (
          <p className="mt-3 text-xs text-rose-300" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={readOnly || submitting || !previewValid}
            title={readOnly ? readOnlyReason : undefined}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? 'Applying…' : 'Confirm change'}
          </button>
        </div>
      </div>
    </div>
  );
}
