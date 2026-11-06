'use client';

import React, { useState } from 'react';
import type { AgentContextChip } from '@/lib/agent/types';
import { DEFAULT_CONTEXT_CHIP, SEEDED_QUESTIONS, SEEDED_STREAM } from '@/lib/agent/seed';
import { AgentDock } from './AgentDock';

interface AgentDockHostProps {
  initialContext?: AgentContextChip | null;
}

export function AgentDockHost({ initialContext }: AgentDockHostProps) {
  const [contextChip, setContextChip] = useState<AgentContextChip | null>(
    initialContext === undefined ? DEFAULT_CONTEXT_CHIP : initialContext,
  );

  return (
    <AgentDock
      contextChip={contextChip}
      onRemoveContext={() => setContextChip(null)}
      suggestions={SEEDED_QUESTIONS}
      seedFrames={SEEDED_STREAM}
    />
  );
}
