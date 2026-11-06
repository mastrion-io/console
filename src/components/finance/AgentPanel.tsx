'use client';

import React, { useState } from 'react';
import { AGENT_SEED_ANSWERS } from '@/lib/finance/demo-fixtures';

export function AgentPanel({ demo }: { demo: boolean }) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const active = AGENT_SEED_ANSWERS[activeIndex];

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Finance agent</h2>
        {demo && (
          <span className="rounded border border-amber-700/60 bg-amber-950/50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
            Demo mode
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {AGENT_SEED_ANSWERS.map((seed, index) => (
          <button
            key={seed.question}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={
              index === activeIndex
                ? 'rounded-md border border-brand-600 bg-brand-600/20 px-2 py-1 text-[11px] text-slate-100'
                : 'rounded-md border border-slate-700 bg-slate-800/60 px-2 py-1 text-[11px] text-slate-300 hover:border-slate-600'
            }
          >
            {seed.question}
          </button>
        ))}
      </div>
      <p className="mt-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs leading-relaxed text-slate-300">
        {active.answer}
      </p>
    </section>
  );
}
