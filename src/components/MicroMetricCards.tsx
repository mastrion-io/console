'use client';

import React from 'react';
import { 
  ShieldAlert, 
  Database, 
  Coins, 
  Network, 
  ArrowUpRight, 
  CheckCircle2, 
  Cpu 
} from 'lucide-react';

export function MicroMetricCards() {
  const metrics = [
    {
      title: 'PII Socket Redaction',
      status: 'p99: 2.12ms',
      sub: 'Sub-2.4ms Guarantee Met',
      accent: 'emerald',
      icon: ShieldAlert,
      tag: 'BaFin Compliant',
      detail: '0 unredacted leaks detected'
    },
    {
      title: 'Radix Prefix Reclaim',
      status: '68.4%',
      sub: '3.42M Tokens Deduplicated',
      accent: 'brand',
      icon: Database,
      tag: 'TTFT -420ms',
      detail: 'GPU VRAM defragmented'
    },
    {
      title: 'Sovereign Cost Delta',
      status: '€14,820 / mo',
      sub: 'Arbitrated Local vs Cloud API',
      accent: 'emerald',
      icon: Coins,
      tag: 'ROI: 8.4x',
      detail: 'Cloud frontier spend avoided'
    },
    {
      title: 'Ambient Mesh Waypoints',
      status: '128 / 128 Active',
      sub: 'ztunnel L4 + Envoy L7 (SPIFFE)',
      accent: 'cyan',
      icon: Network,
      tag: 'Zero-Trust mTLS',
      detail: '8.4 GB/s aggregated throughput'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div 
            key={idx}
            className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-medium flex items-center gap-1.5">
                  <Icon className="w-4 h-4 text-brand-400" />
                  {m.title}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {m.tag}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white tracking-tight">
                {m.status}
              </div>
              <div className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {m.sub}
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>{m.detail}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
