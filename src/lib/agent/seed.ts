import type {
  AgentContextChip,
  StreamFrame,
  SuggestedQuestion,
} from './types';

/**
 * Literal seeded questions. These are known-good prompts that the finance
 * agent has been evaluated against. Never generate suggestions at runtime.
 */
export const SEEDED_QUESTIONS: SuggestedQuestion[] = [
  {
    id: 'q-over-budget',
    text: 'Why is ai-runtime over budget this month?',
  },
  {
    id: 'q-compare-month',
    text: 'Compare this month to last month for this cost center.',
  },
  {
    id: 'q-top-drivers',
    text: 'What are the top three cost drivers in this cost center?',
  },
  {
    id: 'q-forecast',
    text: 'What is the projected spend at month end at the current run rate?',
  },
  {
    id: 'q-anomaly',
    text: 'Were there any anomalous spend spikes in the last seven days?',
  },
];

export const DEFAULT_CONTEXT_CHIP: AgentContextChip = {
  id: 'ctx-cost-center',
  label: 'cost center',
  value: 'ai-runtime',
};

/**
 * Deterministic seeded stream used by the dock. Sequence numbers are
 * contiguous except for the deliberate gap at seq 5, which exercises the
 * interrupted-stream state.
 */
export const SEEDED_STREAM: StreamFrame[] = [
  {
    seq: 1,
    messageId: 'msg-1',
    item: {
      kind: 'prose',
      id: 'p-1',
      text: 'ai-runtime is 18.4% over its monthly budget envelope. The overrun is concentrated in GPU inference hours rather than storage or egress.',
    },
  },
  {
    seq: 2,
    messageId: 'msg-1',
    item: {
      kind: 'tool_call',
      id: 'tc-1',
      toolName: 'finance.query_cost_center',
      toolKind: 'read',
      arguments: [
        { key: 'cost_center', value: 'ai-runtime' },
        { key: 'period', value: '2025-06' },
        { key: 'granularity', value: 'day' },
      ],
      durationMs: 412,
      status: 'success',
    },
  },
  {
    seq: 3,
    messageId: 'msg-1',
    item: {
      kind: 'tool_result',
      id: 'tr-1',
      toolName: 'finance.query_cost_center',
      summary: '30 daily rows returned, 3 above the daily budget line.',
      columns: [
        { key: 'day', label: 'Day', type: 'mono' },
        { key: 'spend_eur', label: 'Spend (EUR)', type: 'number' },
        { key: 'budget_eur', label: 'Budget (EUR)', type: 'number' },
        { key: 'variance', label: 'Variance', type: 'text' },
      ],
      rows: [
        { day: '2025-06-03', spend_eur: 4820, budget_eur: 4100, variance: '+17.6%' },
        { day: '2025-06-11', spend_eur: 5310, budget_eur: 4100, variance: '+29.5%' },
        { day: '2025-06-19', spend_eur: 4980, budget_eur: 4100, variance: '+21.5%' },
      ],
      truncated: true,
    },
  },
  {
    seq: 4,
    messageId: 'msg-1',
    item: {
      kind: 'prose',
      id: 'p-2',
      text: 'Three days breached the daily budget line, all driven by batch re-embedding jobs. I can raise a budget adjustment for review if you want it recorded.',
    },
  },
  {
    seq: 6,
    messageId: 'msg-1',
    item: {
      kind: 'confirmation',
      id: 'cf-1',
      toolName: 'finance.adjust_budget',
      humanSentence:
        'Raise the monthly budget for cost center ai-runtime from 120,000 EUR to 145,000 EUR effective 2025-07-01.',
      arguments: [
        { key: 'cost_center', value: 'ai-runtime' },
        { key: 'current_budget_eur', value: '120000' },
        { key: 'proposed_budget_eur', value: '145000' },
        { key: 'effective_from', value: '2025-07-01' },
      ],
      status: 'awaiting',
    },
  },
];
