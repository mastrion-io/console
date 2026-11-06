import type { BudgetsResponse, CostCenterBudget } from './budgets';
import { HARD_CEILING_CENTS } from './budgets';

const FIXTURE_BUDGETS: CostCenterBudget[] = [
  {
    id: 'cc-risk-fra',
    costCenter: 'CC-1001',
    department: 'Risk & Compliance',
    capCents: 250000,
    spendTodayCents: 187450,
    remainingCents: 62550,
    breakerState: 'closed',
    lastTripAt: null,
    reroutedRequests: 0,
  },
  {
    id: 'cc-trading-fra',
    costCenter: 'CC-1002',
    department: 'Algorithmic Trading',
    capCents: 500000,
    spendTodayCents: 500000,
    remainingCents: 0,
    breakerState: 'tripped',
    lastTripAt: '2025-02-11T09:42:17.000Z',
    reroutedRequests: 1284,
  },
  {
    id: 'cc-legal-ber',
    costCenter: 'CC-2001',
    department: 'Legal & Contracts',
    capCents: 120000,
    spendTodayCents: 41200,
    remainingCents: 78800,
    breakerState: 'closed',
    lastTripAt: null,
    reroutedRequests: 0,
  },
  {
    id: 'cc-support-ber',
    costCenter: 'CC-2002',
    department: 'Client Support',
    capCents: 80000,
    spendTodayCents: 79310,
    remainingCents: 690,
    breakerState: 'tripped',
    lastTripAt: '2025-02-11T11:05:53.000Z',
    reroutedRequests: 317,
  },
  {
    id: 'cc-research-muc',
    costCenter: 'CC-3001',
    department: 'Quant Research',
    capCents: 350000,
    spendTodayCents: 96400,
    remainingCents: 253600,
    breakerState: 'closed',
    lastTripAt: null,
    reroutedRequests: 0,
  },
];

export function getFixtureBudgets(): BudgetsResponse {
  return {
    source: 'fixture',
    generatedAt: new Date().toISOString(),
    hardCeilingCents: HARD_CEILING_CENTS,
    budgets: FIXTURE_BUDGETS.map((budget) => ({ ...budget })),
  };
}
