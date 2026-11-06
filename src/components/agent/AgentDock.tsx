'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bot, PanelRightClose, PanelRightOpen, X } from 'lucide-react';
import type {
  AgentContextChip,
  AgentMessage,
  ConfirmationCard,
  StreamFrame,
  StreamState,
  SuggestedQuestion,
  TranscriptItem,
} from '@/lib/agent/types';
import { detectGap } from '@/lib/agent/stream';
import { AgentTranscript } from './AgentTranscript';
import { AgentComposer } from './AgentComposer';

interface AgentDockProps {
  contextChip: AgentContextChip | null;
  onRemoveContext: () => void;
  suggestions: SuggestedQuestion[];
  seedFrames: StreamFrame[];
}

const DOCK_EXPANDED_WIDTH = 400;
const DOCK_COLLAPSED_WIDTH = 48;

function appendItem(
  messages: AgentMessage[],
  messageId: string,
  seq: number,
  item: TranscriptItem,
): AgentMessage[] {
  const existing = messages.find((m) => m.id === messageId);
  if (!existing) {
    return [
      ...messages,
      { id: messageId, role: 'assistant', seq, items: [item] },
    ];
  }
  return messages.map((m) =>
    m.id === messageId ? { ...m, seq, items: [...m.items, item] } : m,
  );
}

export function AgentDock({
  contextChip,
  onRemoveContext,
  suggestions,
  seedFrames,
}: AgentDockProps) {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [streamState, setStreamState] = useState<StreamState>('idle');
  const [gapInfo, setGapInfo] = useState<string | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const lastSeqRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isToggle =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (isToggle) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const runStream = useCallback(
    (frames: StreamFrame[], startIndex: number) => {
      if (startIndex >= frames.length) {
        setStreamState('complete');
        return;
      }
      const frame = frames[startIndex];
      const gap = detectGap(lastSeqRef.current, frame);
      if (!gap.ok) {
        setStreamState('interrupted');
        setGapInfo(
          `Expected frame ${gap.expectedSeq}, received ${gap.receivedSeq}.`,
        );
        return;
      }
      lastSeqRef.current = frame.seq;
      setMessages((prev) =>
        appendItem(prev, frame.messageId, frame.seq, frame.item),
      );
      timerRef.current = setTimeout(() => {
        runStream(frames, startIndex + 1);
      }, 420);
    },
    [],
  );

  const startStream = useCallback(
    (question: string) => {
      clearTimer();
      lastSeqRef.current = 0;
      setGapInfo(null);
      setPendingQuestion(question);
      setMessages([
        {
          id: 'msg-user',
          role: 'user',
          seq: 0,
          items: [{ kind: 'prose', id: 'p-user', text: question }],
        },
      ]);
      setStreamState('streaming');
      runStream(seedFrames, 0);
    },
    [clearTimer, runStream, seedFrames],
  );

  const retry = useCallback(() => {
    if (pendingQuestion === null) {
      return;
    }
    startStream(pendingQuestion);
  }, [pendingQuestion, startStream]);

  const onConfirm = useCallback((cardId: string) => {
    setMessages((prev) =>
      prev.map((m) => ({
        ...m,
        items: m.items.map((item) =>
          item.kind === 'confirmation' && item.id === cardId
            ? ({ ...item, status: 'confirmed' } as ConfirmationCard)
            : item,
        ),
      })),
    );
  }, []);

  const onCancel = useCallback((cardId: string) => {
    setMessages((prev) =>
      prev.map((m) => ({
        ...m,
        items: m.items.map((item) =>
          item.kind === 'confirmation' && item.id === cardId
            ? ({ ...item, status: 'cancelled' } as ConfirmationCard)
            : item,
        ),
      })),
    );
  }, []);

  const width = open ? DOCK_EXPANDED_WIDTH : DOCK_COLLAPSED_WIDTH;
  const widthStyle = useMemo<React.CSSProperties>(
    () => ({ width: `${width}px` }),
    [width],
  );

  return (
    <aside
      aria-label="Finance agent"
      style={widthStyle}
      className="shrink-0 border-l border-slate-800/80 bg-slate-950/95 flex flex-col transition-[width] duration-200 ease-out"
    >
      <div className="flex items-center justify-between h-12 px-2 border-b border-slate-800/80">
        {open ? (
          <div className="flex items-center gap-2 px-1 text-slate-200">
            <Bot className="w-4 h-4 text-brand-400" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-wide uppercase">
              Finance Agent
            </span>
          </div>
        ) : (
          <span className="sr-only">Finance agent collapsed</span>
        )}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label={open ? 'Collapse agent dock' : 'Expand agent dock'}
          title={open ? 'Collapse (Cmd+K)' : 'Expand (Cmd+K)'}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          {open ? (
            <PanelRightClose className="w-4 h-4" aria-hidden="true" />
          ) : (
            <PanelRightOpen className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {open ? (
        <div className="flex-1 flex flex-col min-h-0">
          {contextChip ? (
            <div className="px-3 py-2 border-b border-slate-800/60">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300">
                <span className="text-slate-500">{contextChip.label}:</span>
                <span className="font-mono text-slate-200">
                  {contextChip.value}
                </span>
                <button
                  type="button"
                  onClick={onRemoveContext}
                  aria-label={`Remove context ${contextChip.label} ${contextChip.value}`}
                  className="ml-0.5 rounded-full p-0.5 text-slate-500 hover:text-slate-100 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : null}

          <AgentTranscript
            messages={messages}
            streamState={streamState}
            gapInfo={gapInfo}
            onRetry={retry}
            onConfirm={onConfirm}
            onCancel={onCancel}
          />

          <AgentComposer
            suggestions={suggestions}
            disabled={streamState === 'streaming'}
            onSubmit={startStream}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center pt-3 gap-2">
          <span className="sr-only">Agent dock is collapsed</span>
        </div>
      )}
    </aside>
  );
}
