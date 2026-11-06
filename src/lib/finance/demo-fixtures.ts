export interface CostCenterSpend {
  id: string;
  name: string;
  owner: string;
  spendEur: number;
  capEur: number;
  utilizationPct: number;
  tripped: boolean;
}

export interface RouteSpend {
  id: string;
  label: string;
  tier: 'local' | 'frontier';
  requests: number;
  spendEur: number;
  avgCostPerRequestEur: number;
}

export interface VendorInvoice {
  id: string;
  vendor: string;
  amountEur: number;
  dueDate: string;
  status: 'paid' | 'overdue' | 'disputed' | 'open';
  note: string;
}

export interface MonthEndProjection {
  mtdSpendEur: number;
  projectedSpendEur: number;
  budgetEur: number;
  projectedVarianceEur: number;
  daysElapsed: number;
  daysInMonth: number;
}

export interface FinanceKpiTotals {
  totalSpendEur: number;
  totalBudgetEur: number;
  totalSavingsEur: number;
  openInvoiceCount: number;
}

export interface FinanceDemoDataset {
  generatedAt: string;
  costCenters: CostCenterSpend[];
  routes: RouteSpend[];
  invoices: VendorInvoice[];
  projection: MonthEndProjection;
  kpi: FinanceKpiTotals;
}

export interface AgentSeedAnswer {
  question: string;
  answer: string;
}

export const DEMO_COST_CENTERS: CostCenterSpend[] = [
  {
    id: 'cc-platform',
    name: 'Platform Engineering',
    owner: 'A. Weber',
    spendEur: 118000,
    capEur: 100000,
    utilizationPct: 118,
    tripped: true,
  },
  {
    id: 'cc-support',
    name: 'Customer Support',
    owner: 'M. Fischer',
    spendEur: 42000,
    capEur: 60000,
    utilizationPct: 70,
    tripped: false,
  },
  {
    id: 'cc-legal',
    name: 'Legal & Compliance',
    owner: 'S. Braun',
    spendEur: 18000,
    capEur: 30000,
    utilizationPct: 60,
    tripped: false,
  },
  {
    id: 'cc-sales',
    name: 'Revenue Operations',
    owner: 'T. Klein',
    spendEur: 22000,
    capEur: 40000,
    utilizationPct: 55,
    tripped: false,
  },
];

export const DEMO_ROUTES: RouteSpend[] = [
  {
    id: 'route-local-embed',
    label: 'Local embedding (sovereign)',
    tier: 'local',
    requests: 1840000,
    spendEur: 18400,
    avgCostPerRequestEur: 0.01,
  },
  {
    id: 'route-local-classify',
    label: 'Local classification (sovereign)',
    tier: 'local',
    requests: 920000,
    spendEur: 9200,
    avgCostPerRequestEur: 0.01,
  },
  {
    id: 'route-frontier-reason',
    label: 'Frontier reasoning (DeepSeek)',
    tier: 'frontier',
    requests: 120000,
    spendEur: 96000,
    avgCostPerRequestEur: 0.8,
  },
  {
    id: 'route-frontier-draft',
    label: 'Frontier drafting (DeepSeek)',
    tier: 'frontier',
    requests: 88000,
    spendEur: 70400,
    avgCostPerRequestEur: 0.8,
  },
];

export const DEMO_INVOICES: VendorInvoice[] = [
  {
    id: 'inv-2024-0912',
    vendor: 'Hetzner Online GmbH',
    amountEur: 24800,
    dueDate: '2024-09-02',
    status: 'overdue',
    note: 'GPU cluster reservation, 14 days past due',
  },
  {
    id: 'inv-2024-0931',
    vendor: 'DeepSeek AI Pte. Ltd.',
    amountEur: 41200,
    dueDate: '2024-09-18',
    status: 'disputed',
    note: 'Token count mismatch of 6.2 percent, under review',
  },
  {
    id: 'inv-2024-0944',
    vendor: 'Deutsche Telekom AG',
    amountEur: 6400,
    dueDate: '2024-09-25',
    status: 'open',
    note: 'Dedicated interconnect, net 30',
  },
  {
    id: 'inv-2024-0950',
    vendor: 'Mastrion Internal Chargeback',
    amountEur: 12000,
    dueDate: '2024-09-10',
    status: 'paid',
    note: 'Settled 2024-09-09',
  },
];

export const DEMO_PROJECTION: MonthEndProjection = {
  mtdSpendEur: 200000,
  projectedSpendEur: 310000,
  budgetEur: 230000,
  projectedVarianceEur: 80000,
  daysElapsed: 20,
  daysInMonth: 31,
};

export const DEMO_KPI: FinanceKpiTotals = {
  totalSpendEur: 200000,
  totalBudgetEur: 230000,
  totalSavingsEur: 104000,
  openInvoiceCount: 3,
};

export const DEMO_DATASET: FinanceDemoDataset = {
  generatedAt: '2024-09-20T08:00:00.000Z',
  costCenters: DEMO_COST_CENTERS,
  routes: DEMO_ROUTES,
  invoices: DEMO_INVOICES,
  projection: DEMO_PROJECTION,
  kpi: DEMO_KPI,
};

export const AGENT_SEED_ANSWERS: AgentSeedAnswer[] = [
  {
    question: 'Which cost center is over cap and by how much?',
    answer:
      'Platform Engineering is at 118 percent of its 100,000 EUR cap, 18,000 EUR over. It is the only tripped cost center this month.',
  },
  {
    question: 'What would we save by moving reasoning to the local model?',
    answer:
      'Frontier reasoning costs 0.80 EUR per request against 0.01 EUR locally. Moving the 120,000 reasoning requests to the sovereign local route saves 94,800 EUR this month.',
  },
  {
    question: 'Which invoices need my attention today?',
    answer:
      'Two. Hetzner at 24,800 EUR is 14 days overdue. DeepSeek at 41,200 EUR is disputed over a 6.2 percent token count mismatch.',
  },
  {
    question: 'Where will we land at month end against budget?',
    answer:
      'At 200,000 EUR month to date over 20 of 31 days, the run rate projects 310,000 EUR against a 230,000 EUR budget, an 80,000 EUR overrun.',
  },
  {
    question: 'Do the totals reconcile across spend, routes and KPI?',
    answer:
      'Yes. Cost center spend, route spend and the KPI total all equal 200,000 EUR with zero difference.',
  },
];

export function sumCostCenterSpend(dataset: FinanceDemoDataset): number {
  return dataset.costCenters.reduce((acc, cc) => acc + cc.spendEur, 0);
}

export function sumRouteSpend(dataset: FinanceDemoDataset): number {
  return dataset.routes.reduce((acc, route) => acc + route.spendEur, 0);
}

export function isDemoMode(): boolean {
  return process.env.MASTRION_DEMO === 'true';
}
