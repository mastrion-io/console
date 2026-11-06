'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Database, Sparkles, Cpu, Layers } from 'lucide-react';

const cacheBreakdown = [
  { category: 'System Prompts (Deduplicated)', tokens: 1820000, reclaimRate: '94%', color: '#3b82f6' },
  { category: 'Git Diff & AST Schemas', tokens: 940000, reclaimRate: '78%', color: '#60a5fa' },
  { category: 'RAG Knowledge Chunks', tokens: 460000, reclaimRate: '52%', color: '#93c5fd' },
  { category: 'User Context History', tokens: 200000, reclaimRate: '31%', color: '#bfdbfe' },
];

export function RadixCacheReclaimMonitor() {
  const totalTokensReclaimed = "3,420,000";
  const overallReclaimRatio = "68.4%";

  return (
    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-400" />
            <h3 className="font-semibold text-slate-100 text-sm">Radix-Tree Prefix Cache FinOps</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
              GPU VRAM Defragmented
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Deduplicating KV-cache attention tensors across shared system prompts and multi-tenant turns.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
          <span className="text-slate-400">Reclaim Ratio:</span>
          <span className="text-emerald-400 font-bold text-sm">{overallReclaimRatio}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Tokens Deduplicated
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">{totalTokensReclaimed}</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">Zero redundant KV computation</div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-brand-400" />
            Time-to-First-Token (TTFT)
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">-420 ms</div>
          <div className="text-[11px] text-sky-400 mt-0.5">Instant attention graph hit</div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            VRAM Headroom Released
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">42.8 GB</div>
          <div className="text-[11px] text-indigo-300 mt-0.5">Enabling 4x concurrent streams</div>
        </div>
      </div>

      {/* Breakdown Bar Visualization */}
      <div className="mt-3">
        <div className="text-xs font-semibold text-slate-300 mb-2">Prefix Cache Allocation Hierarchy</div>
        <div className="space-y-2.5">
          {cacheBreakdown.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">{item.category}</span>
                <span className="font-mono text-slate-400">
                  {(item.tokens / 1000000).toFixed(2)}M tokens ({item.reclaimRate} hit)
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full rounded-full bg-brand-500 transition-all duration-500" 
                  style={{ width: `${(item.tokens / 2000000) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
