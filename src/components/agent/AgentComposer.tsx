'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import type { SuggestedQuestion } from '@/lib/agent/types';

interface AgentComposerProps {
  suggestions: SuggestedQuestion[];
  disabled: boolean;
  onSubmit: (question: string) => void;
}

export function AgentComposer({
  suggestions,
  disabled,
  onSubmit,
}: AgentComposerProps) {
  const [value, setValue] = useState('');

  const submit = (question: string) => {
    const trimmed = question.trim();
    if (trimmed.length === 0 || disabled) {
      return;
    }
    onSubmit(trimmed);
    setValue('');
  };

  return (
    <div className="border-t border-slate-800/80 px-3 py-2 space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            type="button"
            disabled={disabled}
            onClick={() => submit(suggestion.text)}
            className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300 hover:border-slate-600 hover:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {suggestion.text}
          </button>
        ))}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(value);
        }}
        className="flex items-end gap-2"
      >
        <label htmlFor="agent-composer-input" className="sr-only">
          Ask the finance agent
        </label>
        <textarea
          id="agent-composer-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          rows={2}
          placeholder="Ask about this screen…"
          className="flex-1 resize-none rounded-md border border-slate-800 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        />
        <button
          type="submit"
          disabled={disabled || value.trim().length === 0}
          aria-label="Send question"
          className="rounded-md border border-brand-700/70 bg-brand-600/20 p-1.5 text-brand-200 hover:bg-brand-600/30 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Send className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
