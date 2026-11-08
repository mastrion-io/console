'use client';

import React from 'react';
import { Database, Cpu, Check, Zap } from 'lucide-react';

export function RadixCacheReclaimMonitor() {
  const models = [
    { name: 'deepseek-chat (V3)', vram: '48 GB', reclaim: '68.4%', status: 'Hot' },
    { name: 'deepseek-reasoner (R1)', vram: '64 GB', reclaim: '62.1%', status: 'Hot' },
    { name: 'qwen3-coder:30b', vram: '20 GB', reclaim: '74.2%', status: 'Local GPU' },
    { name: 'deepseek-coder:6.7b', vram: '8 GB', reclaim: '81.0%', status: 'Local GPU' },
  ];

  return (
    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Radix-Tree KV Prefix Cache FinOps</h3>
        </div>
        <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
          68.4% Aggregate Reclaim
        </span>
      </div>

      <div className="space-y-4">
        {/* Progress Visualizer */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Deduplicated Prompt &amp; AST Schemas</span>
            <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">3,420,180 / 5,000,000 tokens</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div className="bg-brand-500 h-full" style={{ width: '68.4%' }}></div>
            <div className="bg-emerald-500 h-full" style={{ width: '12.6%' }}></div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-500"></span> System Prompt Deduplication (68.4%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Tool Schema Cache (12.6%)
            </span>
          </div>
        </div>

        {/* Model VRAM breakdown table */}
        <div className="pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                <th className="pb-2">MODEL ARCHITECTURE</th>
                <th className="pb-2">VRAM ALLOCATED</th>
                <th className="pb-2">CACHE RECLAIM</th>
                <th className="pb-2">TIER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {models.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    {m.name}
                  </td>
                  <td className="py-2 text-slate-600 dark:text-slate-400">{m.vram}</td>
                  <td className="py-2 text-emerald-600 dark:text-emerald-400 font-semibold">{m.reclaim}</td>
                  <td className="py-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px]">
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
