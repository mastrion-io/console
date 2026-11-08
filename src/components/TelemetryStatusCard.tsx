'use client';

import React from 'react';
import { Radio, Lock, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface TelemetryCardProps {
  cluster: string;
  namespace: string;
  airgapActive: boolean;
  setAirgapActive: (v: boolean) => void;
}

export function TelemetryStatusCard({
  cluster,
  namespace,
  airgapActive,
  setAirgapActive,
}: TelemetryCardProps) {
  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm transition-colors space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${
            airgapActive 
              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400' 
              : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
          }`}>
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Dedicated Telemetry Egress Channel</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                airgapActive
                  ? 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                  : 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              }`}>
                {airgapActive ? 'Airgap Active (Zero Egress)' : 'Heartbeat Active'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Outbound-only TLS pinned heartbeat to <span className="font-mono text-slate-700 dark:text-slate-300">telemetry.mastrion.eu:8443</span>. Zero customer prompts or PII ever cross the wire.
            </p>
          </div>
        </div>

        <button
          onClick={() => setAirgapActive(!airgapActive)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
            airgapActive
              ? 'bg-amber-50 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 hover:bg-amber-100'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {airgapActive ? 'Disable Airgap (Enable Egress)' : 'Engage Airgap Kill-Switch'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs font-mono">
        <div>
          <span className="text-slate-400 text-[10px]">CLUSTER:</span>
          <div className="font-medium text-slate-800 dark:text-slate-200">{cluster}</div>
        </div>
        <div>
          <span className="text-slate-400 text-[10px]">SCOPE:</span>
          <div className="font-medium text-slate-800 dark:text-slate-200">{namespace}</div>
        </div>
        <div>
          <span className="text-slate-400 text-[10px]">ENCRYPTION:</span>
          <div className="font-medium text-emerald-600 dark:text-emerald-400">mTLS + SPIFFE</div>
        </div>
        <div>
          <span className="text-slate-400 text-[10px]">INBOUND PORTS:</span>
          <div className="font-medium text-slate-800 dark:text-slate-200">0 (Strictly Blocked)</div>
        </div>
      </div>
    </div>
  );
}
