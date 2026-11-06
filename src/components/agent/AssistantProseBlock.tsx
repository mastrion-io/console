import React from 'react';
import type { AssistantProse } from '@/lib/agent/types';

interface AssistantProseBlockProps {
  item: AssistantProse;
}

export function AssistantProseBlock({ item }: AssistantProseBlockProps) {
  return (
    <p className="text-xs leading-relaxed text-slate-200 whitespace-pre-wrap">
      {item.text}
    </p>
  );
}
