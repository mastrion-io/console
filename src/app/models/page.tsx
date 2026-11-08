'use client';

import React, { useState, useEffect } from 'react';
import {
  Server,
  Cloud,
  Split,
  Key,
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Lock,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { LocalModelSpec, FrontierProviderConfig, RoutingRule } from '@/lib/models/types';
import { INITIAL_ADMIN_STATE } from '@/lib/models/initial-state';

export default function ModelsAdminPage() {
  const [activeTab, setActiveTab] = useState<'local' | 'frontier' | 'routing'>('local');
  const [localModels, setLocalModels] = useState<LocalModelSpec[]>(INITIAL_ADMIN_STATE.localModels);
  const [providers, setProviders] = useState<FrontierProviderConfig[]>(INITIAL_ADMIN_STATE.frontierProviders);
  const [rules, setRules] = useState<RoutingRule[]>(INITIAL_ADMIN_STATE.routingRules);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New model input
  const [customModelName, setCustomModelName] = useState('');
  const [isPulling, setIsPulling] = useState(false);

  // Provider edit modal / fields
  const [editingProvider, setEditingProvider] = useState<FrontierProviderConfig | null>(null);
  const [providerKeyInput, setProviderKeyInput] = useState('');

  // Rule creation modal / fields
  const [editingRule, setEditingRule] = useState<RoutingRule | null>(null);

  const fetchState = async () => {
    setLoading(true);
    try {
      const [mRes, pRes, rRes] = await Promise.all([
        fetch('/api/models'),
        fetch('/api/providers'),
        fetch('/api/routing'),
      ]);
      if (mRes.ok) {
        const mData = await mRes.json();
        if (mData.models) setLocalModels(mData.models);
      }
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData.providers) setProviders(pData.providers);
      }
      if (rRes.ok) {
        const rData = await rRes.json();
        if (rData.rules) setRules(rData.rules);
      }
    } catch {
      // Keep initial fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleInstallLocal = async (modelId: string) => {
    setIsPulling(true);
    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'install', modelId }),
      });
      if (res.ok) {
        showNotification(`Successfully provisioned weights for ${modelId}`);
        fetchState();
      }
    } finally {
      setIsPulling(false);
    }
  };

  const handleDeleteLocal = async (modelId: string) => {
    const res = await fetch('/api/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', modelId }),
    });
    if (res.ok) {
      showNotification(`Unloaded weights for ${modelId}`);
      fetchState();
    }
  };

  const handleSaveProvider = async () => {
    if (!editingProvider) return;
    const res = await fetch('/api/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerId: editingProvider.id,
        apiKey: providerKeyInput || undefined,
        enabled: editingProvider.enabled,
        baseUrl: editingProvider.baseUrl,
        maxCostCapDailyEur: editingProvider.maxCostCapDailyEur,
      }),
    });
    if (res.ok) {
      showNotification(`Updated ${editingProvider.name} credentials & routing gate`);
      setEditingProvider(null);
      setProviderKeyInput('');
      fetchState();
    }
  };

  const handleToggleRule = async (id: string) => {
    const res = await fetch('/api/routing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle', id }),
    });
    if (res.ok) {
      showNotification(`Toggled route policy status`);
      fetchState();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Model Administration & Gateway Routing
            </h1>
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> FIPS-Compliant Gateway
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Provision any open-weights model locally on sovereign silicon, authenticate with frontier cloud APIs, and govern dynamic routing policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchState}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Hardware & CRD
          </button>
        </div>
      </div>

      {feedback && (
        <div className="rounded-lg bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 px-4 py-2.5 text-xs font-medium text-brand-900 dark:text-brand-200 flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          {feedback}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('local')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
            activeTab === 'local'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Server className="w-4 h-4" />
          Local Sovereign Models ({localModels.filter((m) => m.status === 'installed').length} Ready)
        </button>

        <button
          onClick={() => setActiveTab('frontier')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
            activeTab === 'frontier'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Cloud className="w-4 h-4" />
          Frontier Cloud Providers ({providers.filter((p) => p.enabled).length} Active)
        </button>

        <button
          onClick={() => setActiveTab('routing')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
            activeTab === 'routing'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Split className="w-4 h-4" />
          AIEgressPolicy & Routing Rules ({rules.filter((r) => r.enabled).length} Enforced)
        </button>
      </div>

      {/* TAB 1: LOCAL SOVEREIGN MODELS */}
      {activeTab === 'local' && (
        <div className="space-y-6">
          {/* Pull Custom Local Model Bar */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Download className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Pull & Register Any Sovereign Model
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Enter any HuggingFace or Ollama repository tag (e.g., <code>qwen2.5-coder:7b</code>, <code>mistral-nemo:12b</code>, <code>phi4:14b</code>).
            </p>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="e.g. qwen2.5-coder:7b or llama3.2:3b"
                value={customModelName}
                onChange={(e) => setCustomModelName(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
              <button
                onClick={() => {
                  if (customModelName.trim()) {
                    handleInstallLocal(customModelName.trim());
                    setCustomModelName('');
                  }
                }}
                disabled={isPulling || !customModelName.trim()}
                className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Pull to Silicon
              </button>
            </div>
          </div>

          {/* Installed Models Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localModels.map((model) => {
              const isInstalled = model.status === 'installed';
              return (
                <div
                  key={model.id}
                  className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                    isInstalled
                      ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      : 'border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 opacity-75'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Cpu className={`w-4 h-4 ${isInstalled ? 'text-emerald-500' : 'text-slate-400'}`} />
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{model.name}</h4>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                          isInstalled
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isInstalled ? 'Ready' : 'Available'}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex justify-between">
                        <span>Tag / Identifier:</span>
                        <code className="text-[11px] font-mono text-slate-800 dark:text-slate-200">{model.id}</code>
                      </div>
                      <div className="flex justify-between">
                        <span>Architecture:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {model.family.toUpperCase()} ({model.parameterSize})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantization:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">{model.quantization}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Context Window:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {(model.contextLength / 1024).toFixed(0)}k tokens
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sovereign Airgap:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">100% On-Prem</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {(model.sizeBytes / (1024 * 1024 * 1024)).toFixed(1)} GB VRAM
                    </span>
                    {isInstalled ? (
                      <button
                        onClick={() => handleDeleteLocal(model.id)}
                        title="Unload weights"
                        className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 font-medium transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Offload
                      </button>
                    ) : (
                      <button
                        onClick={() => handleInstallLocal(model.id)}
                        disabled={isPulling}
                        className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1 font-semibold transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Pull Weights
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: FRONTIER CLOUD PROVIDERS */}
      {activeTab === 'frontier' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Governed Frontier Egress Tunnel
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              When routing to frontier cloud providers, prompts are stripped of German tax IDs, IBANs, and API credentials before egress, then re-hydrated locally upon return.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((p) => {
              return (
                <div
                  key={p.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Cloud className={`w-5 h-5 ${p.enabled ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{p.name}</h4>
                          <span className="text-[11px] text-slate-400">{p.baseUrl}</span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                          p.enabled
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {p.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Key className="w-3.5 h-3.5" /> API Key:
                        </span>
                        <code className="text-xs font-mono text-slate-900 dark:text-slate-100">
                          {p.apiKeyMasked || 'None configured'}
                        </code>
                      </div>

                      <div className="flex justify-between">
                        <span>Available Models:</span>
                        <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          {p.availableModels.join(', ')}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>Daily Budget Cap:</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          EUR {p.maxCostCapDailyEur.toFixed(2)} / day
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>Mandatory PII Scrubbing:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Enforced by Waypoint
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingProvider(p);
                        setProviderKeyInput('');
                      }}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Configure & Authenticate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ROUTING RULES & CRD */}
      {activeTab === 'routing' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" /> AIEgressPolicy Route Resolver
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Rules are evaluated in priority order. If no rule matches, the gateway fails closed to the sovereign local model.
              </p>
            </div>
            <button
              onClick={() =>
                setEditingRule({
                  id: `rule-${Date.now()}`,
                  name: 'New Custom Route',
                  description: 'Custom routing match and target rule',
                  matchPattern: 'task:general',
                  action: 'LOCAL_ONLY',
                  primaryTarget: 'local:deepseek-r1:1.5b',
                  fallbackTarget: 'local:qwen3-coder:30b',
                  piiEnforcement: 'STRICT_SCRUB',
                  enabled: true,
                  priority: rules.length + 1,
                })
              }
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Route Rule
            </button>
          </div>

          <div className="space-y-3">
            {rules.map((rule) => {
              return (
                <div
                  key={rule.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    rule.enabled
                      ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                          #{rule.priority}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{rule.name}</h4>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            rule.action === 'LOCAL_ONLY'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : rule.action === 'FRONTIER_WITH_SCRUB'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                          }`}
                        >
                          {rule.action.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{rule.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                          rule.enabled
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {rule.enabled ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400">Match Pattern:</span>
                      <div className="font-mono font-medium text-slate-800 dark:text-slate-200">{rule.matchPattern}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Primary Target:</span>
                      <div className="font-mono font-medium text-slate-800 dark:text-slate-200">{rule.primaryTarget}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Fallback Target:</span>
                      <div className="font-mono font-medium text-slate-800 dark:text-slate-200">{rule.fallbackTarget}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Provider Configuration Modal */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Configure {editingProvider.name}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProvider({ ...editingProvider, enabled: true })}
                    className={`flex-1 py-1.5 rounded-lg font-semibold border ${
                      editingProvider.enabled
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Enabled
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProvider({ ...editingProvider, enabled: false })}
                    className={`flex-1 py-1.5 rounded-lg font-semibold border ${
                      !editingProvider.enabled
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Disabled
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  API Key (Secret Token)
                </label>
                <input
                  type="password"
                  placeholder={editingProvider.apiKeyMasked || 'Enter secret API key'}
                  value={providerKeyInput}
                  onChange={(e) => setProviderKeyInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Base API URL
                </label>
                <input
                  type="text"
                  value={editingProvider.baseUrl || ''}
                  onChange={(e) => setEditingProvider({ ...editingProvider, baseUrl: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Daily Budget Cap (EUR)
                </label>
                <input
                  type="number"
                  value={editingProvider.maxCostCapDailyEur}
                  onChange={(e) =>
                    setEditingProvider({
                      ...editingProvider,
                      maxCostCapDailyEur: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingProvider(null)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProvider}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
              >
                Save Provider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rule Add Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Create AIEgressPolicy Route Rule
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Rule Name</label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Match Pattern / Condition</label>
                <input
                  type="text"
                  placeholder="e.g. pii-detected, cost-center:cc-customer-ops, task:reasoning"
                  value={editingRule.matchPattern}
                  onChange={(e) => setEditingRule({ ...editingRule, matchPattern: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Action</label>
                <select
                  value={editingRule.action}
                  onChange={(e) => setEditingRule({ ...editingRule, action: e.target.value as any })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-slate-100"
                >
                  <option value="LOCAL_ONLY">LOCAL_ONLY (Airgapped Sovereign)</option>
                  <option value="FRONTIER_WITH_SCRUB">FRONTIER_WITH_SCRUB (Governed Egress)</option>
                  <option value="BUDGET_CIRCUIT_BREAKER">BUDGET_CIRCUIT_BREAKER (Cap Failover)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Primary Target</label>
                  <input
                    type="text"
                    value={editingRule.primaryTarget}
                    onChange={(e) => setEditingRule({ ...editingRule, primaryTarget: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Fallback Target</label>
                  <input
                    type="text"
                    value={editingRule.fallbackTarget}
                    onChange={(e) => setEditingRule({ ...editingRule, fallbackTarget: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingRule(null)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const res = await fetch('/api/routing', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'save', rule: editingRule }),
                  });
                  if (res.ok) {
                    showNotification(`Saved routing rule ${editingRule.name}`);
                    setEditingRule(null);
                    fetchState();
                  }
                }}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
              >
                Apply Route Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
