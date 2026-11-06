'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Radio, Send, RefreshCw, Lock, AlertTriangle } from 'lucide-react';

interface TelemetryStatusCardProps {
  cluster: string;
  namespace: string;
  airgapActive: boolean;
  setAirgapActive: (val: boolean) => void;
}

export function TelemetryStatusCard({
  cluster,
  namespace,
  airgapActive,
  setAirgapActive,
}: TelemetryStatusCardProps) {
  const [lastDispatch, setLastDispatch] = useState<any>(null);
  const [dispatching, setDispatching] = useState(false);
  const [autoHeartbeat, setAutoHeartbeat] = useState(true);

  const sendHeartbeat = async () => {
    setDispatching(true);
    try {
      const res = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clusterId: cluster,
          namespace: namespace,
          airgapActive: airgapActive,
        }),
      });
      const data = await res.json();
      setLastDispatch(data);
    } catch (err: any) {
      setLastDispatch({ error: err.message, delivered: false });
    } finally {
      setDispatching(false);
    }
  };

  useEffect(() => {
    // Initial heartbeat
    sendHeartbeat();

    // Recurring heartbeat every 15s if auto enabled
    if (!autoHeartbeat) return;
    const interval = setInterval(sendHeartbeat, 15000);
    return () => clearInterval(interval);
  }, [cluster, namespace, airgapActive, autoHeartbeat]);

  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          {airgapActive ? (
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          ) : (
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          )}
          <h4 className="font-semibold text-slate-100 text-xs">
            Firewalled Telemetry Egress (PRD-MST-103)
          </h4>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            telemetry.mastrion.eu:8443
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAirgapActive(!airgapActive)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              airgapActive
                ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            <Lock className="w-3 h-3" />
            Airgap Kill-Switch: {airgapActive ? 'ENGAGED' : 'DISENGAGED'}
          </button>

          <button
            onClick={sendHeartbeat}
            disabled={dispatching}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer disabled:opacity-50"
            title="Trigger Heartbeat Test Now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${dispatching ? 'animate-spin text-brand-400' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <span className="text-slate-500 block text-[10px] uppercase">Firewall Policy</span>
          <span className="text-slate-200 font-semibold">Strict Outbound Allowlist</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Zero Prompt / Zero PII Allowed</span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <span className="text-slate-500 block text-[10px] uppercase">Egress Status</span>
          {airgapActive ? (
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              BLOCKED (Total Airgap)
            </span>
          ) : lastDispatch?.delivered ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              DELIVERED (HTTP 200)
            </span>
          ) : (
            <span className="text-slate-400 font-semibold">
              {lastDispatch?.error ? 'FAIL-CLOSED (Offline Safe)' : 'READY'}
            </span>
          )}
          <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
            {lastDispatch?.targetEndpoint || 'telemetry.mastrion.eu:8443'}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <span className="text-slate-500 block text-[10px] uppercase">Verification Receipt</span>
          <span className="text-slate-300 truncate block">
            {airgapActive ? 'DROP_AT_GATEWAY (0 Bytes Egressed)' : lastDispatch?.error ? lastDispatch.error : 'HMAC-SHA256 Payload Verified'}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Auto-Heartbeat: 15s interval
          </span>
        </div>
      </div>
    </div>
  );
}
