'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { Zap, Clock, ShieldCheck } from 'lucide-react';

interface LatencyPoint {
  time: string;
  p50: number;
  p95: number;
  p99: number;
}

export function LiveLatencyChart() {
  const [data, setData] = useState<LatencyPoint[]>([
    { time: '12:00:10', p50: 1.42, p95: 1.84, p99: 2.11 },
    { time: '12:00:15', p50: 1.38, p95: 1.79, p99: 2.08 },
    { time: '12:00:20', p50: 1.45, p95: 1.91, p99: 2.18 },
    { time: '12:00:25', p50: 1.51, p95: 1.88, p99: 2.15 },
    { time: '12:00:30', p50: 1.39, p95: 1.76, p99: 2.05 },
    { time: '12:00:35', p50: 1.41, p95: 1.82, p99: 2.12 },
    { time: '12:00:40', p50: 1.48, p95: 1.89, p99: 2.22 },
    { time: '12:00:45', p50: 1.36, p95: 1.75, p99: 2.09 },
  ]);

  // Simulate real-time streaming updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        const nextP50 = +(1.35 + Math.random() * 0.18).toFixed(2);
        const nextP95 = +(1.72 + Math.random() * 0.22).toFixed(2);
        const nextP99 = +(2.02 + Math.random() * 0.24).toFixed(2);
        const updated = [...prev.slice(1), { time: timeStr, p50: nextP50, p95: nextP95, p99: nextP99 }];
        return updated;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const latest = data[data.length - 1];

  return (
    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-400" />
            <h3 className="font-semibold text-slate-100 text-sm">Live Streaming Socket Latency</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800/80 text-emerald-400">
              SLA Guarantee: p99 &lt; 2.40ms
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time inline token scrubbing &amp; parsing latency measured at the ambient waypoint proxy.
          </p>
        </div>

        {/* Current percentile badges */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400">p50:</span>
            <span className="text-brand-300 font-bold">{latest?.p50}ms</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400">p95:</span>
            <span className="text-sky-300 font-bold">{latest?.p95}ms</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400">p99:</span>
            <span className="text-emerald-300 font-bold">{latest?.p99}ms</span>
          </div>
        </div>
      </div>

      {/* Latency Chart */}
      <div className="h-60 mt-4 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false}
              axisLine={{ stroke: '#334155' }} 
            />
            <YAxis 
              domain={[0.8, 3.0]} 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false}
              axisLine={{ stroke: '#334155' }} 
              unit="ms" 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                borderColor: '#1e293b', 
                borderRadius: '8px', 
                color: '#f8fafc',
                fontSize: '12px' 
              }} 
            />
            {/* 2.4ms Hard SLA Guarantee Line */}
            <ReferenceLine 
              y={2.4} 
              stroke="#ef4444" 
              strokeDasharray="4 4" 
              label={{ value: 'SLA Threshold (2.40ms)', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} 
            />
            <Line 
              type="monotone" 
              dataKey="p50" 
              stroke="#60a5fa" 
              strokeWidth={2} 
              dot={false} 
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="p95" 
              stroke="#38bdf8" 
              strokeWidth={2} 
              dot={false} 
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="p99" 
              stroke="#10b981" 
              strokeWidth={2.5} 
              dot={false} 
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> p50 (Median)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span> p95</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> p99 (Critical SLA)</span>
        </div>
        <span>Sampling Rate: 500ms sliding window</span>
      </div>
    </div>
  );
}
