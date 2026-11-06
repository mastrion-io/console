export interface GoldenToolCall {
  tool: string;
  args: Record<string, string | number>;
}

export interface GoldenTurn {
  question: string;
  calls: GoldenToolCall[];
  expectedSummaryHint: string;
}

export const GOLDEN_TRANSCRIPT: GoldenTurn[] = [
  {
    question: 'What did we spend in the first week of January 2025?',
    calls: [{ tool: 'get_spend_summary', args: { from: '2025-01-02', to: '2025-01-05' } }],
    expectedSummaryHint: 'Total spend for all cost centers',
  },
  {
    question: 'How much of the Engineering Platform cap have we used?',
    calls: [{ tool: 'get_budget_status', args: { costCenter: 'cc-eng-platform' } }],
    expectedSummaryHint: 'Engineering Platform',
  },
  {
    question: 'Show me the daily spend trend for Risk Operations in early January.',
    calls: [{ tool: 'get_cost_center_detail', args: { costCenter: 'cc-risk-ops', from: '2025-01-02', to: '2025-01-05' } }],
    expectedSummaryHint: 'Risk Operations',
  },
  {
    question: 'Which invoices are overdue?',
    calls: [{ tool: 'list_invoices', args: { status: 'overdue' } }],
    expectedSummaryHint: 'overdue',
  },
  {
    question: 'What is our net and gross payable to Frontier Inference AG?',
    calls: [{ tool: 'list_invoices', args: { vendor: 'Frontier Inference AG' } }],
    expectedSummaryHint: 'Frontier Inference AG',
  },
  {
    question: 'How much cheaper is the local tier than the frontier tier?',
    calls: [{ tool: 'get_route_mix', args: { from: '2025-01-02', to: '2025-01-05' } }],
    expectedSummaryHint: 'Frontier cost exceeds local',
  },
  {
    question: 'If nothing changes, what will we spend over the next six months?',
    calls: [{ tool: 'forecast_runway', args: { months: 6 } }],
    expectedSummaryHint: 'Projected spend over 6 month(s)',
  },
  {
    question: 'Which cost center is closest to its cap?',
    calls: [{ tool: 'get_budget_status', args: {} }],
    expectedSummaryHint: 'remaining',
  },
  {
    question: 'Break down January spend by cost center.',
    calls: [{ tool: 'get_spend_summary', args: { from: '2025-01-02', to: '2025-01-05' } }],
    expectedSummaryHint: 'by cost center',
  },
  {
    question: 'Are any circuit breakers tripped right now?',
    calls: [{ tool: 'get_budget_status', args: {} }],
    expectedSummaryHint: 'breaker',
  },
];
