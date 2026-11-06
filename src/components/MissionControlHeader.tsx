'use client';

import React from 'react';
import Image from 'next/image';
import { 
  Server, 
  ShieldCheck, 
  Activity, 
  Radio, 
  Layers, 
  Terminal,
  Cpu
} from 'lucide-react';

interface HeaderProps {
  cluster: string;
  setCluster: (c: string) => void;
  namespace: string;
  setNamespace: (n: string) => void;
  airgapActive: boolean;
  setAirgapActive: (v: boolean) => void;
}

export function MissionControlHeader({
  cluster,
  setCluster,
  namespace,
  setNamespace,
  airgapActive,
  setAirgapActive,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Fabric Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Image 
              src="/brand/mastrion-mark-white.svg" 
              alt="Mastrion Mark" 
              width={34} 
              height={34} 
              className="drop-shadow-sm" 
              priority
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white tracking-wide text-lg">MASTRION</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-950 border border-brand-700/60 text-brand-300">
                  Mission Control
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  v1.0.0-PROD
                </span>
              </div>
              <span className="text-xs text-slate-400">Sovereign AI Runtime Fabric Control Plane</span>
            </div>
          </div>
        </div>

        {/* Global Cluster & Namespace Selector + Egress Status */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Cluster Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <Server className="w-3.5 h-3.5 mr-2 text-brand-400" />
            <span className="text-slate-500 mr-1.5">Cluster:</span>
            <select
              value={cluster}
              onChange={(e) => setCluster(e.target.value)}
              className="bg-transparent border-none text-slate-200 font-mono text-xs focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="cluster-fra-01" className="bg-slate-900 text-slate-200">cluster-fra-01 (Frankfurt VPC)</option>
              <option value="cluster-ber-02" className="bg-slate-900 text-slate-200">cluster-ber-02 (Berlin On-Prem)</option>
              <option value="cluster-ams-01" className="bg-slate-900 text-slate-200">cluster-ams-01 (Amsterdam Edge)</option>
            </select>
          </div>

          {/* Namespace Filter */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <Layers className="w-3.5 h-3.5 mr-2 text-slate-400" />
            <span className="text-slate-500 mr-1.5">Namespace:</span>
            <select
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
              className="bg-transparent border-none text-slate-200 font-mono text-xs focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="production" className="bg-slate-900 text-slate-200">production</option>
              <option value="finance-core" className="bg-slate-900 text-slate-200">finance-core</option>
              <option value="healthcare-ephi" className="bg-slate-900 text-slate-200">healthcare-ephi</option>
              <option value="all-namespaces" className="bg-slate-900 text-slate-200">all namespaces (*)</option>
            </select>
          </div>

          {/* Telemetry Egress Status / Kill-Switch Toggle */}
          <button
            onClick={() => setAirgapActive(!airgapActive)}
            title={airgapActive ? "Airgap Mode: Egress Telemetry Kill-Switch Enabled" : "Telemetry Connected to telemetry.mastrion.eu:8443"}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              airgapActive
                ? 'bg-amber-950/40 border-amber-800/80 text-amber-300 hover:bg-amber-900/50'
                : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/50'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${airgapActive ? 'text-amber-400' : 'text-emerald-400 animate-pulse'}`} />
            <span>{airgapActive ? 'Airgap (Zero Egress)' : 'Egress: 8443 (Pinned)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
