'use client';

import React, { useState } from 'react';
import { AGENT_SEED_ANSWERS } from '@/lib/finance/demo-fixtures';
import { Bot, Sparkles, Send } from 'lucide-react';

export function AgentPanel({ demo }: { demo: boolean }) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [customQuestion, setCustomQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<{ q: string; a: string; time: string; model?: string }[]>([
    {
      q: AGENT_SEED_ANSWERS[0].question,
      a: AGENT_SEED_ANSWERS[0].answer,
      time: '12:00',
      model: 'deepseek-reasoner'
    }
  ]);

  const active = AGENT_SEED_ANSWERS[activeIndex];

  const handleSelectSeed = (idx: number) => {
    setActiveIndex(idx);
    const seed = AGENT_SEED_ANSWERS[idx];
    setConversation(prev => [
      ...prev,
      {
        q: seed.question,
        a: seed.answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'deepseek-reasoner'
      }
    ]);
  };

  const handleAskCustom = async () => {
    if (!customQuestion.trim()) return;
    const q = customQuestion;
    setCustomQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are the Mastrion Sovereign Finance AI Copilot. Answer concisely based on enterprise runtime telemetry and FinOps budget metrics.'
            },
            { role: 'user', content: q }
          ]
        })
      });
      const data = await res.json();
      const answer = data?.choices?.[0]?.message?.content || data?.error || 'No response from model waypoint.';

      setConversation(prev => [
        ...prev,
        {
          q,
          a: answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: data?.model || 'deepseek-chat'
        }
      ]);
    } catch (err: any) {
      setConversation(prev => [
        ...prev,
        {
          q,
          a: `Error calling agent waypoint: ${err?.message}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-5 space-y-4 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Sovereign Finance AI Agent
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive ledger queries with live tool execution &amp; DeepSeek arbitration.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            Waypoints Live
          </span>
          {demo && (
            <span className="rounded border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Demo Fixtures Active
            </span>
          )}
        </div>
      </div>

      {/* Preset Questions Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Quick Prompts:</span>
        <div className="flex flex-wrap gap-2">
          {AGENT_SEED_ANSWERS.map((seed, index) => (
            <button
              key={seed.question}
              type="button"
              onClick={() => handleSelectSeed(index)}
              className={
                index === activeIndex
                  ? 'rounded-lg border border-brand-500 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 text-xs font-medium text-brand-700 dark:text-brand-300 shadow-xs cursor-pointer'
                  : 'rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer'
              }
            >
              {seed.question}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Conversation Transcript */}
      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {conversation.map((entry, idx) => (
          <div key={idx} className="space-y-2 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs">
            <div className="flex items-center justify-between text-slate-500 font-mono text-[10px]">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Q: {entry.q}</span>
              <span>{entry.time}</span>
            </div>
            <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
              {entry.a}
            </div>
            {entry.model && (
              <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Model: {entry.model}</span>
                <span className="text-emerald-600 dark:text-emerald-400">Audit verified</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Live Ask Bar */}
      <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <input
          type="text"
          value={customQuestion}
          onChange={(e) => setCustomQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAskCustom()}
          placeholder="Ask finance agent a custom question (e.g. what is our Hetzner invoice balance?)..."
          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
        />
        <button
          onClick={handleAskCustom}
          disabled={loading || !customQuestion.trim()}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {loading ? 'Asking...' : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
