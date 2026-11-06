'use client';

import React, { useState } from 'react';
import { MissionControlHeader } from '@/components/MissionControlHeader';
import { MicroMetricCards } from '@/components/MicroMetricCards';
import { LiveLatencyChart } from '@/components/LiveLatencyChart';
import { StreamingPIIRedactionTable } from '@/components/StreamingPIIRedactionTable';
import { RadixCacheReclaimMonitor } from '@/components/RadixCacheReclaimMonitor';
import { TelemetryStatusCard } from '@/components/TelemetryStatusCard';
import { ShieldCheck, Activity, Terminal, ExternalLink } from 'lucide-react';

export default function Home() {
  const [cluster, setCluster] = useState('cluster-fra-01');
  const [namespace, setNamespace] = useState('production');
  const [airgapActive, setAirgapActive] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Mission Control Header */}
      <MissionControlHeader 
        cluster={cluster}
        setCluster={setCluster}
        namespace={namespace}
        setNamespace={setNamespace}
        airgapActive={airgapActive}
        setAirgapActive={setAirgapActive}
      />

      {/* Main Mission Control Cockpit */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Banner Alert if Airgap Active */}
        {airgapActive && (
          <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl text-xs text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="font-semibold">Zero-Trust Airgap Kill-Switch Active:</span>
              <span>All outbound telemetry egress to telemetry.mastrion.eu:8443 is blocked at runtime fabric gateway.</span>
            </div>
            <span className="font-mono text-[11px] bg-amber-900/40 px-2 py-0.5 rounded border border-amber-700/50">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LiveLatencyChart />
          <RadixCacheReclaimMonitor />
        </div>

        {/* Real-time Streaming PII Redaction Audit Ledger */}
        <StreamingPIIRedactionTable />
      </main>

      {/* Enterprise Cockpit Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-400">Mastrion GmbH</span>
            <span>•</span>
            <span>Enterprise Sovereign AI Runtime Fabric</span>
            <span>•</span>
            <span className="font-mono text-[11px] text-slate-400">Build: 1.0.0-PROD (Sprint 1)</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Fabric Active
            </span>
            <span>BaFin &amp; EU AI Act Art. 12 Certified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
