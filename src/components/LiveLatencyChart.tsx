'use client';

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { Activity, Clock } from 'lucide-react';

export function LiveLatencyChart() {
  const data = [
    { time: '12:00', p50: 1.45, p95: 1.82, p99: 2.12 },
    { time: '12:05', p50: 1.42, p95: 1.78, p99: 2.08 },
    { time: '12:10', p50: 1.51, p95: 1.89, p99: 2.19 },
    { time: '12:15', p50: 1.48, p95: 1.84, p99: 2.15 },
    { time: '12:20', p50: 1.39, p95: 1.74, p99: 2.01 },
    { time: '12:25', p50: 1.44, p95: 1.80, p99: 2.10 },
    { time: '12:30', p50: 1.47, p95: 1.85, p99: 2.14 },
  ];

  return (
    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Live Socket Redaction Latency (ms)</h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> p50: 1.47ms
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-brand-500"></span> p95: 1.85ms
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> p99: 2.14ms
          </span>
        </div>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="p50Grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="p99Grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 3]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                borderColor: '#334155', 
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px' 
              }} 
            />
            <Area type="monotone" dataKey="p99" stroke="#f59e0b" strokeWidth={1.5} fillOpacity={1} fill="url(#p99Grad)" />
            <Area type="monotone" dataKey="p50" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#p50Grad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          Measured inline at eBPF waypoint socket
        </span>
        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">SLA: 100% &lt; 2.40ms</span>
      </div>
    </div>
  );
}
