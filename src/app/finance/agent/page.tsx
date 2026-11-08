'use client';

import React from 'react';
import { AgentDockHost } from '@/components/agent/AgentDockHost';
import { Bot, ShieldCheck, Zap } from 'lucide-react';

export default function FinanceAgentPage() {
  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Bot className="h-6 w-6 text-brand-400" />
            Finance AI Agent &amp; Evaluation Control Plane
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic, read/write finance copilot with verified circuit-breaker guardrails.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-800 bg-emerald-950/60 px-3 py-1 text-xs text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Airgap Guard Active
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-sky-800 bg-sky-950/60 px-3 py-1 text-xs text-sky-300">
            <Zap className="h-3.5 w-3.5 text-sky-400" />
            Local + Cloud Arbitrage
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200">Autonomous Actions &amp; Tool Authorisation</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              The agent has read access to current month-to-date spend, cost centers, active vendor invoices, and runway forecasting.
              Write intents (e.g. modifying budget caps or tagging cost centers) are governed by strict two-factor confirmation cards.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 space-y-1">
                <span className="font-semibold text-slate-300">Read Tools</span>
                <p className="text-slate-500">get_spend, get_budget_status, list_vendor_invoices, get_route_mix</p>
              </div>
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 space-y-1">
                <span className="font-semibold text-slate-300">Guarded Write Tools</span>
                <p className="text-slate-500">set_budget_cap, tag_cost_center, export_close_pack</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[600px] border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
          <AgentDockHost />
        </div>
      </div>
    </main>
  );
}
