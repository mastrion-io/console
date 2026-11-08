'use client';

import React, { useState } from 'react';
import { MissionControlHeader } from '@/components/MissionControlHeader';
import { MicroMetricCards } from '@/components/MicroMetricCards';
import { LiveLatencyChart } from '@/components/LiveLatencyChart';
import { StreamingPIIRedactionTable } from '@/components/StreamingPIIRedactionTable';
import { RadixCacheReclaimMonitor } from '@/components/RadixCacheReclaimMonitor';
import { TelemetryStatusCard } from '@/components/TelemetryStatusCard';

export default function Home() {
  const [cluster, setCluster] = useState('cluster-fra-01');
  const [namespace, setNamespace] = useState('production');
  const [airgapActive, setAirgapActive] = useState(false);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Mission Control Header */}
      <MissionControlHeader 
        cluster={cluster}
        setCluster={setCluster}
        namespace={namespace}
        setNamespace={setNamespace}
        airgapActive={airgapActive}
        setAirgapActive={setAirgapActive}
      />

      {/* Main Full-Bleed Mission Control Cockpit */}
      <main className="flex-1 w-full p-6 space-y-6">
        {/* Banner Alert if Airgap Active */}
        {airgapActive && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="font-semibold">Zero-Trust Airgap Kill-Switch Active:</span>
              <span>All outbound telemetry egress to telemetry.mastrion.eu:8443 is blocked at runtime fabric gateway.</span>
            </div>
            <span className="font-mono text-[11px] bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700/50">
              MASTRION_REMOTE_TELEMETRY=false
            </span>
          </div>
        )}

        {/* Telemetry Egress & Airgap Card (PRD-MST-103) */}
        <TelemetryStatusCard 
          cluster={cluster}
          namespace={namespace}
          airgapActive={airgapActive}
          setAirgapActive={setAirgapActive}
        />

        {/* Micro-metric telemetry cards */}
        <MicroMetricCards />

        {/* Charts & Monitoring Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <LiveLatencyChart />
          <RadixCacheReclaimMonitor />
        </div>

        {/* Real-time Streaming PII Redaction Audit Ledger */}
        <StreamingPIIRedactionTable />
      </main>

      {/* Enterprise Cockpit Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 py-4 px-6 text-xs text-slate-500">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700 dark:text-slate-400">Mastrion GmbH</span>
            <span>•</span>
            <span>Enterprise Sovereign AI Runtime Fabric</span>
            <span>•</span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">Build: 1.0.0-PROD</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Fabric Active
            </span>
            <span>BaFin &amp; EU AI Act Art. 12 Certified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
