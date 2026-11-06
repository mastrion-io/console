'use client';

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import type { AgentMessage, StreamState } from '@/lib/agent/types';
import { AssistantProseBlock } from './AssistantProseBlock';
import { ToolCallCardView } from './ToolCallCardView';
import { ToolResultCardView } from './ToolResultCardView';
import { ConfirmationCardView } from './ConfirmationCardView';

interface AgentTranscriptProps {
  messages: AgentMessage[];
  streamState: StreamState;
  gapInfo: string | null;
  onRetry: () => void;
  onConfirm: (cardId: string) => void;
  onCancel: (cardId: string) => void;
}

export function AgentTranscript({
  messages,
  streamState,
  gapInfo,
  onRetry,
  onConfirm,
  onCancel,
}: AgentTranscriptProps) {
  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant');
  const liveText =
    lastAssistant && streamState === 'streaming'
      ? lastAssistant.items
          .filter((item) => item.kind === 'prose')
          .map((item) => (item.kind === 'prose' ? item.text : ''))
          .join(' ')
      : '';

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
      <div aria-live="polite" aria-atomic="false" className="sr-only">
        {liveText}
      </div>

      {messages.length === 0 ? (
        <p className="text-xs text-slate-500 leading-relaxed">
          Ask about the numbers on this screen. The agent reads the finance
          ledger and proposes writes for your confirmation.
        </p>
      ) : null}

      {messages.map((message) => (
        <div key={message.id} className="space-y-2">
          {message.role === 'user' ? (
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-lg bg-brand-600/20 border border-brand-700/50 px-3 py-2 text-xs text-slate-100">
                {message.items.map((item) =>
                  item.kind === 'prose' ? (
                    <p key={item.id} className="whitespace-pre-wrap">
                      {item.text}
                    </p>
                  ) : null,
                )}
              </div>
            </div>
          ) : (
            message.items.map((item) => {
              switch (item.kind) {
                case 'prose':
                  return <AssistantProseBlock key={item.id} item={item} />;
                case 'tool_call':
                  return <ToolCallCardView key={item.id} item={item} />;
                case 'tool_result':
                  return <ToolResultCardView key={item.id} item={item} />;
                case 'confirmation':
                  return (
                    <ConfirmationCardView
                      key={item.id}
                      item={item}
                      onConfirm={onConfirm}
                      onCancel={onCancel}
                    />
                  );
                default:
                  return null;
              }
            })
          )}
        </div>
      ))}

      {streamState === 'interrupted' ? (
        <div
          role="alert"
          className="rounded-lg border border-amber-800/80 bg-amber-950/40 px-3 py-2 text-xs text-amber-200 space-y-2"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle
              className="w-4 h-4 mt-0.5 shrink-0 text-amber-400"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="font-semibold">Stream interrupted</p>
              <p className="text-amber-200/80">
                The answer above is incomplete and must not be treated as
                final.{gapInfo ? ` ${gapInfo}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-md border border-amber-700/70 bg-amber-900/40 px-2.5 py-1 text-[11px] font-medium text-amber-100 hover:bg-amber-900/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : null}
    </div>
  );
}
