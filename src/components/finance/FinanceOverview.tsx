'use client';

import React, { useEffect, useState } from 'react';
import { FinanceKpiBand } from '@/components/finance/FinanceKpiBand';
import { FinanceKpiBandSkeleton } from '@/components/finance/FinanceKpiBandSkeleton';
import { FinanceTrajectoryChart } from '@/components/finance/FinanceTrajectoryChart';
import { FinanceTrajectoryChartSkeleton } from '@/components/finance/FinanceTrajectoryChartSkeleton';
import {
  FINANCE_KPIS_ENDPOINT,
  isFinanceKpisResponse,
  type FinanceKpisResponse,
} from '@/lib/finance';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: FinanceKpisResponse };

export function FinanceOverview() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(FINANCE_KPIS_ENDPOINT, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const payload: unknown = await response.json();
        if (!isFinanceKpisResponse(payload)) {
          throw new Error('Malformed finance KPI payload');
        }
        if (!cancelled) {
          setState({ status: 'ready', data: payload });
        }
      } catch (error) {
        if (cancelled || controller.signal.aborted) {
          return;
        }
        const message = error instanceof Error ? error.message : 'Unknown error';
        setState({ status: 'error', message });
      }
    }

    void load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <FinanceKpiBandSkeleton />
        <FinanceTrajectoryChartSkeleton />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-6">
        <div
          role="alert"
          className="rounded-xl border border-rose-800/70 bg-rose-950/40 p-4 text-sm text-rose-200"
        >
          <p className="font-semibold">Unable to load finance KPIs</p>
          <p className="mt-1 text-xs text-rose-300/80">{state.message}</p>
          <p className="mt-1 text-xs text-rose-300/60">Endpoint: {FINANCE_KPIS_ENDPOINT}</p>
        </div>
        <FinanceKpiBandSkeleton />
        <FinanceTrajectoryChartSkeleton />
      </div>
    );
  }

  const { data } = state;

  if (data.tiles.length === 0 && data.trajectory.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-6 text-sm text-slate-400">
        No finance data available for the current period.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FinanceKpiBand data={data} />
      {data.trajectory.length > 0 ? (
        <FinanceTrajectoryChart trajectory={data.trajectory} />
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-6 text-sm text-slate-400">
          No spend trajectory data available.
        </div>
      )}
    </div>
  );
}
