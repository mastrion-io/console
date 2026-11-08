'use client';

import { useMemo, useState } from 'react';
import {
  ANNUALISATION_FORMULA,
  calculateBreakEven,
  type RateConfig,
  type RouteLedgerRow,
  type SavingsSummary,
} from '@/lib/finance/rates';

interface ArbitrageLedgerProps {
  rows: RouteLedgerRow[];
  summary: SavingsSummary;
  rates: RateConfig;
  elapsedDaysInMonth: number;
}

const TIER_STYLES: Record<RouteLedgerRow['tier'], string> = {
  sovereign: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/70',
  hybrid: 'bg-sky-950/60 text-sky-300 border-sky-800/70',
  frontier: 'bg-amber-950/60 text-amber-300 border-amber-800/70',
};

function formatEur(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatTokens(value: number): string {
  return new Intl.NumberFormat('de-DE').format(value);
}

export function ArbitrageLedger({
  rows,
  summary,
  rates,
  elapsedDaysInMonth,
}: ArbitrageLedgerProps) {
  const [tokensPerMonth, setTokensPerMonth] = useState(120_000_000);
  const [frontierRate, setFrontierRate] = useState(rates.frontierRatePer1k);
  const [sovereignCost, setSovereignCost] = useState(2400);

  const breakEven = useMemo(
    () =>
      calculateBreakEven({
        tokensPerMonth,
        frontierRatePer1k: frontierRate,
        sovereignMonthlyCost: sovereignCost,
      }),
    [tokensPerMonth, frontierRate, sovereignCost],
  );

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Saving today
          </p>
          <p className="mt-1 text-2xl font-semibold text-emerald-300">
            {formatEur(summary.today)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Month to date
          </p>
          <p className="mt-1 text-2xl font-semibold text-emerald-300">
            {formatEur(summary.monthToDate)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Annualised
            <span
              className="ml-1 cursor-help text-slate-500"
              title={`Annualisation formula: ${ANNUALISATION_FORMULA} (elapsed days: ${elapsedDaysInMonth})`}
            >
              ⓘ
            </span>
          </p>
          <p className="mt-1 text-2xl font-semibold text-emerald-300">
            {formatEur(summary.annualised)}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Route comparison
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-950/60 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Route</th>
                <th className="px-4 py-2 text-left font-medium">Tier</th>
                <th className="px-4 py-2 text-right font-medium">Tokens in</th>
                <th className="px-4 py-2 text-right font-medium">Tokens out</th>
                <th className="px-4 py-2 text-right font-medium">Unit / 1k</th>
                <th className="px-4 py-2 text-right font-medium">Cost</th>
                <th className="px-4 py-2 text-right font-medium">Frontier</th>
                <th className="px-4 py-2 text-right font-medium">Saving</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-2 text-slate-900 dark:text-slate-100">{row.name}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium ${TIER_STYLES[row.tier]}`}
                    >
                      {row.tier}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-slate-700 dark:text-slate-300">
                    {formatTokens(row.tokensIn)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-slate-700 dark:text-slate-300">
                    {formatTokens(row.tokensOut)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-slate-700 dark:text-slate-300">
                    {row.unitCostPer1k.toFixed(3)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-slate-700 dark:text-slate-300">
                    {formatEur(row.costIncurred)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-slate-700 dark:text-slate-300">
                    {formatEur(row.frontierCost)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    {row.noTraffic ? (
                      <span className="text-slate-500">no traffic</span>
                    ) : (
                      <span className="text-emerald-300">
                        {formatEur(row.saving)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-4 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Break-even calculator
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block text-xs text-slate-400">
            Tokens per month
            <input
              type="number"
              min={0}
              value={tokensPerMonth}
              onChange={(event) =>
                setTokensPerMonth(Number(event.target.value) || 0)
              }
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
            />
          </label>
          <label className="block text-xs text-slate-400">
            Frontier rate per 1k (EUR)
            <input
              type="number"
              min={0}
              step={0.001}
              value={frontierRate}
              onChange={(event) =>
                setFrontierRate(Number(event.target.value) || 0)
              }
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
            />
          </label>
          <label className="block text-xs text-slate-400">
            Sovereign monthly cost (EUR)
            <input
              type="number"
              min={0}
              value={sovereignCost}
              onChange={(event) =>
                setSovereignCost(Number(event.target.value) || 0)
              }
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
            />
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="rounded border border-slate-800 bg-slate-950/60 p-3">
            <p className="text-xs text-slate-500">Crossover volume</p>
            <p className="mt-1 font-mono text-slate-100">
              {formatTokens(Math.round(breakEven.crossoverTokens))} tokens
            </p>
          </div>
          <div className="rounded border border-slate-800 bg-slate-950/60 p-3">
            <p className="text-xs text-slate-500">Current volume</p>
            <p
              className={`mt-1 font-mono ${breakEven.pastCrossover ? 'text-emerald-300' : 'text-amber-300'}`}
            >
              {breakEven.pastCrossover ? 'past crossover' : 'below crossover'}
            </p>
          </div>
          <div className="rounded border border-slate-800 bg-slate-950/60 p-3">
            <p className="text-xs text-slate-500">Net saving vs frontier</p>
            <p
              className={`mt-1 font-mono ${breakEven.netSaving >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}
            >
              {formatEur(breakEven.netSaving)}
            </p>
          </div>
        </div>
      </section>

      <p className="text-xs text-slate-500">
        Rates pinned from the CFO deck: frontier{' '}
        {rates.frontierRatePer1k.toFixed(3)} EUR per 1k tokens, local{' '}
        {rates.localRatePer1k.toFixed(2)} EUR per 1k tokens. Rates as of{' '}
        {rates.asOf}. Finance can correct these in{' '}
        <code className="ml-1 rounded bg-slate-800 px-1 py-0.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
          {rates.configPath}
        </code>{' '}
        without a code change.
      </p>
    </div>
  );
}
