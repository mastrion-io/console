'use client';

import React from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatFinanceValue, type FinanceTrajectoryPoint } from '@/lib/finance';

export interface FinanceTrajectoryChartProps {
  trajectory: FinanceTrajectoryPoint[];
}

export function FinanceTrajectoryChart({ trajectory }: FinanceTrajectoryChartProps) {
  const summary = buildSummary(trajectory);

  return (
    <section
      aria-label="Spend trajectory"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Spend trajectory (90 days)</h2>
        <span className="text-[11px] text-slate-500">Daily spend · 7d moving average · budget ceiling</span>
      </div>

      <p className="sr-only">{summary}</p>

      <div className="h-72 w-full" role="img" aria-label={summary}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={trajectory} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
              minTickGap={24}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
              tickFormatter={(value: number) => formatFinanceValue(value, 'currency')}
              width={72}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '0.5rem',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#cbd5e1' }}
              formatter={(value: number, name: string) => [formatFinanceValue(value, 'currency'), name]}
            />
            <Bar dataKey="spend" name="Daily spend" fill="#1d4ed8" radius={[2, 2, 0, 0]} />
            <Line
              type="monotone"
              dataKey="movingAverage7d"
              name="7d moving average"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="budgetCeiling"
              name="Budget ceiling"
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function buildSummary(trajectory: FinanceTrajectoryPoint[]): string {
  if (trajectory.length === 0) {
    return 'Spend trajectory chart. No data available.';
  }
  const total = trajectory.reduce((sum, point) => sum + point.spend, 0);
  const ceiling = trajectory[trajectory.length - 1]?.budgetCeiling ?? 0;
  const overDays = trajectory.filter((point) => point.spend > point.budgetCeiling).length;
  return `Spend trajectory chart over ${trajectory.length} days. Total spend ${formatFinanceValue(
    total,
    'currency',
  )}. Budget ceiling ${formatFinanceValue(ceiling, 'currency')}. ${overDays} day(s) above ceiling.`;
}
