'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Server,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  HardDrive,
  Network,
  Cpu,
} from 'lucide-react';
import { SetupConfig } from '@/lib/auth/types';

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<SetupConfig>({
    completed: false,
    clusterName: 'mst-cluster-fra-01',
    adminEmail: 'mofesola@mastrion.eu',
    primarySiliconHost: 'http://127.0.0.1:11434',
    defaultLocalModel: 'deepseek-r1:1.5b',
    auditKeyConfigured: true,
    telemetryMode: 'airgapped',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/setup')
      .then((res) => res.json())
      .then((data) => {
        if (data.setup) setConfig(data.setup);
      })
      .catch(() => {});
  }, []);

  const handleFinish = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        router.push('/');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 transition-colors">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800">
              Initial Cluster Bootstrap
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Mastrion Sovereign Setup Wizard
            </h1>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <span>Step {step} of 3</span>
          </div>
        </div>

        {/* STEP 1: Cluster Identity */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <Network className="w-5 h-5 text-brand-600 dark:text-brand-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Cluster Identity & Control Plane</h4>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Define the primary cluster identifier and administrative root for all edge nodes and telemetry.
                </p>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Cluster Name / Region ID
              </label>
              <input
                type="text"
                value={config.clusterName}
                onChange={(e) => setConfig({ ...config, clusterName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Primary Administrator Email
              </label>
              <input
                type="email"
                value={config.adminEmail}
                onChange={(e) => setConfig({ ...config, adminEmail: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                <span>Continue to Silicon Config</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Silicon & Storage */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <HardDrive className="w-5 h-5 text-brand-600 dark:text-brand-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Silicon Engine & Weight Storage</h4>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure the local inference daemon and default sovereign weights.
                </p>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Primary Inference Silicon Host (Ollama / vLLM)
              </label>
              <input
                type="text"
                value={config.primarySiliconHost}
                onChange={(e) => setConfig({ ...config, primarySiliconHost: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Default Local Sovereign Model
              </label>
              <select
                value={config.defaultLocalModel}
                onChange={(e) => setConfig({ ...config, defaultLocalModel: e.target.value })}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-slate-100"
              >
                <option value="deepseek-r1:1.5b">DeepSeek R1 (1.5B Distill)</option>
                <option value="deepseek-coder:6.7b">DeepSeek Coder (6.7B Base)</option>
                <option value="qwen3-coder:30b">Qwen3 Coder (30B MoE)</option>
                <option value="qwen2.5-coder:3b-base">Qwen 2.5 Coder (3B Base)</option>
              </select>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                <span>Continue to Compliance Gates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Compliance & Verification */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">FIPS & EU AI Act Governance Gate</h4>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Confirm cryptographic ledger hashing and airgap sovereignty.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.auditKeyConfigured}
                  onChange={(e) => setConfig({ ...config, auditKeyConfigured: e.target.checked })}
                  className="rounded text-brand-600"
                />
                <div>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    Enable Cryptographic HMAC-SHA256 Ledger Signing
                  </span>
                  <p className="text-[11px] text-slate-500">Generates immutable Article 12 compliance receipts on each completion.</p>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer">
                <input
                  type="radio"
                  name="telemetryMode"
                  checked={config.telemetryMode === 'airgapped'}
                  onChange={() => setConfig({ ...config, telemetryMode: 'airgapped' })}
                  className="text-brand-600"
                />
                <div>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    Strict Airgapped Mode (Zero Call-Home)
                  </span>
                  <p className="text-[11px] text-slate-500">Disables all remote telemetry; all logs and weights remain on host.</p>
                </div>
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{saving ? 'Finalizing Setup...' : 'Complete Bootstrap & Launch Console'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
