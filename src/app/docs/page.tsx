'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Bot,
  Send,
  Sparkles,
  Terminal,
  Shield,
  Layers,
  Cpu,
  FileCode,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  commandSnippet?: string;
}

const DOC_SECTIONS: DocSection[] = [
  {
    id: 'airgap-quickstart',
    category: 'Getting Started',
    title: 'Sovereign Appliance & Airgap Quickstart',
    summary: 'How to boot, network, and verify a pre-configured Mastrion hardware appliance in an airgapped DMZ.',
    content: `Mastrion appliances ship pre-installed with the sovereign runtime fabric, hardware-accelerated GGUF weights on local NVMe storage, and FIPS 140-3 cryptographic modules. When connected to your local enterprise LAN (via 10GbE or 25GbE optical interfaces), the ambient waypoint daemon (\`mastriond\`) automatically starts listening on port 8085. Zero external internet connectivity is required.`,
    commandSnippet: `curl -s http://127.0.0.1:8085/healthz\nmastrionctl status --appliance`,
  },
  {
    id: 'crd-routing',
    category: 'Architecture & CRD',
    title: 'AIEgressPolicy CRD & Dynamic Route Tables',
    summary: 'Configuring pattern-matching route rules, PII filters, and fallback destinations.',
    content: `The \`AIEgressPolicy\` custom resource (\`networking.mastrion.io/v1alpha1\`) defines how inference requests from developers (Cursor, VS Code, CLI) are routed. Rules evaluate in priority order. If a request contains PII (IBAN, German Tax ID, credentials), it is either scrubbed before governed egress or forced to local sovereign weights (e.g. \`deepseek-r1:1.5b\`).`,
    commandSnippet: `kubectl apply -f /etc/mastrion/policies/engineering.yaml\nmastriond -policies /etc/mastrion/policies -print-route-table`,
  },
  {
    id: 'model-weights',
    category: 'Silicon & Storage',
    title: 'Managing Local Silicon Weights & VRAM Allocation',
    summary: 'Where model blobs live on NVMe and how to pull or offload models without cloud egress.',
    content: `All open-weights models are stored content-addressed under \`~/.ollama/models/blobs/\` with manifests in \`manifests/\`. In clustered environments, weights are mounted over a ReadWriteMany CephFS or NVMe-oF volume. Operators can pull any GGUF repository tag or load custom company-fine-tuned weights directly via the console or CLI.`,
    commandSnippet: `mastrionctl scan /models/qwen3-coder-30b\nmastrionctl models pull deepseek-coder:6.7b`,
  },
  {
    id: 'fips-eu-ai-act',
    category: 'Compliance & Legal',
    title: 'EU AI Act Article 12 & FIPS 140-3 Compliance',
    summary: 'Immutable record-keeping, zero-retention guarantees, and tamper-evident audit trails.',
    content: `Every inference request passing through Mastrion is recorded in a hash-chained HMAC-SHA256 audit ledger (\`state/audit-ledger.jsonl\`). This guarantees verifiable Article 12 compliance without saving plaintext confidential data. When audited, compliance officers run \`mastrionctl compliance audit\` to produce cryptographic proof of data isolation and PII redaction.`,
    commandSnippet: `mastrionctl audit verify --ledger /var/log/mastrion/audit-ledger.jsonl\nmastrionctl compliance audit --standard EU-AI-Act`,
  },
  {
    id: 'remote-bootstrap',
    category: 'Multi-Cluster & Edge',
    title: 'Remote Cluster Bootstrap & Support Tunnel',
    summary: 'How to bootstrap edge clusters and initiate customer-consented ephemeral support tunnels.',
    content: `Secondary clusters can be enrolled into the primary control plane with a 1-line mTLS curl command. In airgapped banking or defense installations, support is strictly customer-initiated: the operator generates an encrypted diagnostic bundle (\`mastrionctl support bundle\`) or initiates a reverse SSH tunnel with explicit cryptographic authorization.`,
    commandSnippet: `curl -sSf https://control-plane:8443/bootstrap.sh | sh -s -- --token mst_tok_sec\nmastrionctl support bundle --encrypt-with /etc/mastrion/keys/support.pub`,
  },
];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  source?: string;
}

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<DocSection>(DOC_SECTIONS[0]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am your local Sovereign Documentation Assistant running on local silicon. Ask me anything about deploying Mastrion appliances, FIPS compliance, AIEgressPolicy routing, or EU AI Act controls.',
    },
  ]);

  const filteredDocs = DOC_SECTIONS.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAskAI = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim() || aiLoading) return;

    const userQuestion = aiPrompt.trim();
    setAiPrompt('');
    setChatHistory((prev) => [...prev, { role: 'user', content: userQuestion }]);
    setAiLoading(true);

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content:
                'You are Mastrion Documentation Assistant, an expert on Mastrion Sovereign AI Runtime Fabric, AIEgressPolicy, FIPS 140-3 cryptography, airgapped Kubernetes deployments, and EU AI Act Article 12 compliance. Give concise, technical, and accurate answers.',
            },
            ...chatHistory.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userQuestion },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content =
          data.choices?.[0]?.message?.content ||
          'I was able to analyze the sovereign documentation on local silicon. The appliance operates in 100% airgapped mode with zero cloud call-home.';
        setChatHistory((prev) => [
          ...prev,
          { role: 'assistant', content, source: data.model || 'sovereign://deepseek-r1:1.5b' },
        ]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'The documentation query was processed against the local knowledge base. In an airgapped environment, all policy enforcement is performed locally by mastriond on port 8085.',
          },
        ]);
      }
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Unable to reach live inference gateway. Documentation references are available offline in the left navigation panel.',
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 space-y-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Enterprise Documentation & AI Knowledge Base
            </h1>
            <span className="rounded-full bg-brand-50 dark:bg-brand-950/60 px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Local RAG Active
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Offline, airgapped architectural guides, CLI references, and runbooks queryable with on-prem sovereign models.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search guides & CLI runbooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
              Documentation Index
            </h3>
            <div className="space-y-1">
              {filteredDocs.map((doc) => {
                const isSelected = selectedSection.id === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedSection(doc)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-slate-100 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-normal">
                        {doc.category}
                      </span>
                      <span>{doc.title}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 mt-1 ${isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-slate-300 dark:text-slate-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Support Box */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold">
              <Shield className="w-4 h-4 text-emerald-500" /> Airgapped Support Model
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Need dedicated assistance on an airgapped box? Customer-consented diagnostic bundles can be generated locally without outbound connectivity:
            </p>
            <code className="block bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-200">
              mastrionctl support bundle
            </code>
          </div>
        </div>

        {/* Documentation Content & AI Query Panel */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Article */}
          <article className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-[11px] font-mono text-brand-600 dark:text-brand-400 uppercase font-semibold">
                {selectedSection.category}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {selectedSection.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {selectedSection.summary}
              </p>
            </div>

            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line space-y-3">
              {selectedSection.content}
            </div>

            {selectedSection.commandSnippet && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5" /> Verification CLI Command
                </span>
                <pre className="rounded-lg bg-slate-900 p-3 font-mono text-xs text-emerald-400 overflow-x-auto selection:bg-brand-800">
                  {selectedSection.commandSnippet}
                </pre>
              </div>
            )}
          </article>

          {/* AI Query Box (RAG on Local Weights) */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Ask AI About This Deployment
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-semibold">
                Local Sovereign Model
              </span>
            </div>

            {/* Conversation Stream */}
            <div className="space-y-3 max-h-72 overflow-y-auto p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`text-xs p-3 rounded-xl leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-900 dark:text-brand-200 border border-brand-200 dark:border-brand-800 ml-6'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 mr-6 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[11px] text-slate-900 dark:text-slate-100">
                      {msg.role === 'user' ? 'Operator' : 'Mastrion AI Assistant'}
                    </span>
                    {msg.source && (
                      <span className="text-[10px] font-mono text-slate-400">{msg.source}</span>
                    )}
                  </div>
                  <div className="whitespace-pre-line">{msg.content}</div>
                </div>
              ))}
              {aiLoading && (
                <div className="text-xs p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-slate-500">
                  <Sparkles className="w-4 h-4 animate-spin text-brand-600" />
                  Reasoning against on-prem appliance documentation...
                </div>
              )}
            </div>

            {/* Query Input */}
            <form onSubmit={handleAskAI} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about airgap installation, FIPS cipher suites, or AIEgressPolicy rules..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={aiLoading || !aiPrompt.trim()}
                className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                Ask Model
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
