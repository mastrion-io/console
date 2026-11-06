export interface CostCenterSpendEntry {
  id: string;
  date: string;
  description: string;
  model: string;
  user: string;
  role: string;
  amountCents: number;
}

export interface CostCenterModelCost {
  model: string;
  amountCents: number;
}

export interface CostCenterUserCost {
  user: string;
  role: string;
  amountCents: number;
}

export interface CostCenter {
  id: string;
  name: string;
  owner: string;
  mtdSpendCents: number;
  budgetCents: number;
  projectedMonthEndCents: number;
  lastMonthSpendCents: number;
  dailySpendCents: { date: string; amountCents: number }[];
  topModels: CostCenterModelCost[];
  topUsers: CostCenterUserCost[];
  entries: CostCenterSpendEntry[];
}

export const COST_CENTERS: CostCenter[] = [
  {
    id: 'cc-ai-platform',
    name: 'AI Platform',
    owner: 'Dr. Lena Hoffmann',
    mtdSpendCents: 1842500,
    budgetCents: 2000000,
    projectedMonthEndCents: 2211000,
    lastMonthSpendCents: 1712000,
    dailySpendCents: [
      { date: '2025-06-01', amountCents: 58200 },
      { date: '2025-06-02', amountCents: 61400 },
      { date: '2025-06-03', amountCents: 59800 },
      { date: '2025-06-04', amountCents: 63200 },
      { date: '2025-06-05', amountCents: 60100 },
      { date: '2025-06-06', amountCents: 58900 },
      { date: '2025-06-07', amountCents: 62300 },
      { date: '2025-06-08', amountCents: 64700 },
      { date: '2025-06-09', amountCents: 61200 },
      { date: '2025-06-10', amountCents: 63800 },
      { date: '2025-06-11', amountCents: 65400 },
      { date: '2025-06-12', amountCents: 62100 },
      { date: '2025-06-13', amountCents: 60900 },
      { date: '2025-06-14', amountCents: 63500 },
      { date: '2025-06-15', amountCents: 64800 },
    ],
    topModels: [
      { model: 'mastrion-llm-large', amountCents: 812400 },
      { model: 'mastrion-llm-small', amountCents: 421300 },
      { model: 'mastrion-embed-v2', amountCents: 298700 },
      { model: 'mastrion-rerank-v1', amountCents: 184200 },
      { model: 'mastrion-vision-v1', amountCents: 125900 },
    ],
    topUsers: [
      { user: 'a.mueller', role: 'ML Engineer', amountCents: 412300 },
      { user: 's.schmidt', role: 'Data Scientist', amountCents: 356800 },
      { user: 'j.weber', role: 'ML Engineer', amountCents: 298400 },
      { user: 'k.fischer', role: 'Platform Admin', amountCents: 241200 },
      { user: 'm.becker', role: 'Data Scientist', amountCents: 198700 },
    ],
    entries: Array.from({ length: 20 }, (_, i) => ({
      id: `cc-ai-platform-e${i + 1}`,
      date: `2025-06-${String(15 - (i % 15)).padStart(2, '0')}`,
      description: `Inference batch #${1000 + i}`,
      model: i % 2 === 0 ? 'mastrion-llm-large' : 'mastrion-llm-small',
      user: i % 3 === 0 ? 'a.mueller' : i % 3 === 1 ? 's.schmidt' : 'j.weber',
      role: i % 3 === 0 ? 'ML Engineer' : i % 3 === 1 ? 'Data Scientist' : 'ML Engineer',
      amountCents: 12000 + i * 850,
    })),
  },
  {
    id: 'cc-risk-compliance',
    name: 'Risk & Compliance',
    owner: 'Markus Vogel',
    mtdSpendCents: 982400,
    budgetCents: 900000,
    projectedMonthEndCents: 1178900,
    lastMonthSpendCents: 874300,
    dailySpendCents: [
      { date: '2025-06-01', amountCents: 31200 },
      { date: '2025-06-02', amountCents: 32800 },
      { date: '2025-06-03', amountCents: 30100 },
      { date: '2025-06-04', amountCents: 33400 },
      { date: '2025-06-05', amountCents: 31900 },
      { date: '2025-06-06', amountCents: 34200 },
      { date: '2025-06-07', amountCents: 32600 },
      { date: '2025-06-08', amountCents: 33800 },
      { date: '2025-06-09', amountCents: 31500 },
      { date: '2025-06-10', amountCents: 34900 },
      { date: '2025-06-11', amountCents: 33200 },
      { date: '2025-06-12', amountCents: 32100 },
      { date: '2025-06-13', amountCents: 34400 },
      { date: '2025-06-14', amountCents: 33700 },
      { date: '2025-06-15', amountCents: 35100 },
    ],
    topModels: [
      { model: 'mastrion-llm-large', amountCents: 412300 },
      { model: 'mastrion-llm-small', amountCents: 231400 },
      { model: 'mastrion-embed-v2', amountCents: 142800 },
      { model: 'mastrion-rerank-v1', amountCents: 98700 },
      { model: 'mastrion-vision-v1', amountCents: 97200 },
    ],
    topUsers: [
      { user: 'c.wagner', role: 'Compliance Officer', amountCents: 231400 },
      { user: 't.richter', role: 'Risk Analyst', amountCents: 198700 },
      { user: 'p.klein', role: 'Compliance Officer', amountCents: 176200 },
      { user: 'n.wolf', role: 'Risk Analyst', amountCents: 154300 },
      { user: 'b.schroeder', role: 'Auditor', amountCents: 121800 },
    ],
    entries: Array.from({ length: 20 }, (_, i) => ({
      id: `cc-risk-compliance-e${i + 1}`,
      date: `2025-06-${String(15 - (i % 15)).padStart(2, '0')}`,
      description: `Compliance scan #${2000 + i}`,
      model: i % 2 === 0 ? 'mastrion-llm-large' : 'mastrion-embed-v2',
      user: i % 3 === 0 ? 'c.wagner' : i % 3 === 1 ? 't.richter' : 'p.klein',
      role: i % 3 === 0 ? 'Compliance Officer' : i % 3 === 1 ? 'Risk Analyst' : 'Compliance Officer',
      amountCents: 8000 + i * 620,
    })),
  },
  {
    id: 'cc-customer-ops',
    name: 'Customer Operations',
    owner: 'Sabine Krüger',
    mtdSpendCents: 742100,
    budgetCents: 1200000,
    projectedMonthEndCents: 890500,
    lastMonthSpendCents: 698400,
    dailySpendCents: [
      { date: '2025-06-01', amountCents: 24100 },
      { date: '2025-06-02', amountCents: 25800 },
      { date: '2025-06-03', amountCents: 23200 },
      { date: '2025-06-04', amountCents: 26400 },
      { date: '2025-06-05', amountCents: 24900 },
      { date: '2025-06-06', amountCents: 27100 },
      { date: '2025-06-07', amountCents: 25600 },
      { date: '2025-06-08', amountCents: 26800 },
      { date: '2025-06-09', amountCents: 24500 },
      { date: '2025-06-10', amountCents: 27900 },
      { date: '2025-06-11', amountCents: 26200 },
      { date: '2025-06-12', amountCents: 25100 },
      { date: '2025-06-13', amountCents: 27400 },
      { date: '2025-06-14', amountCents: 26700 },
      { date: '2025-06-15', amountCents: 28100 },
    ],
    topModels: [
      { model: 'mastrion-llm-small', amountCents: 312400 },
      { model: 'mastrion-llm-large', amountCents: 198700 },
      { model: 'mastrion-embed-v2', amountCents: 112300 },
      { model: 'mastrion-rerank-v1', amountCents: 68700 },
      { model: 'mastrion-vision-v1', amountCents: 50000 },
    ],
    topUsers: [
      { user: 'l.braun', role: 'Support Lead', amountCents: 198700 },
      { user: 'f.zimmermann', role: 'Support Agent', amountCents: 176200 },
      { user: 'h.koch', role: 'Support Agent', amountCents: 154300 },
      { user: 'r.lehmann', role: 'Support Agent', amountCents: 121800 },
      { user: 'd.neumann', role: 'Support Lead', amountCents: 91100 },
    ],
    entries: Array.from({ length: 20 }, (_, i) => ({
      id: `cc-customer-ops-e${i + 1}`,
      date: `2025-06-${String(15 - (i % 15)).padStart(2, '0')}`,
      description: `Support triage #${3000 + i}`,
      model: i % 2 === 0 ? 'mastrion-llm-small' : 'mastrion-llm-large',
      user: i % 3 === 0 ? 'l.braun' : i % 3 === 1 ? 'f.zimmermann' : 'h.koch',
      role: i % 3 === 0 ? 'Support Lead' : 'Support Agent',
      amountCents: 6000 + i * 410,
    })),
  },
  {
    id: 'cc-research',
    name: 'Research & Development',
    owner: 'Prof. Andreas Berg',
    mtdSpendCents: 512800,
    budgetCents: 1500000,
    projectedMonthEndCents: 615400,
    lastMonthSpendCents: 489200,
    dailySpendCents: [
      { date: '2025-06-01', amountCents: 16800 },
      { date: '2025-06-02', amountCents: 17400 },
      { date: '2025-06-03', amountCents: 16100 },
      { date: '2025-06-04', amountCents: 18200 },
      { date: '2025-06-05', amountCents: 17600 },
      { date: '2025-06-06', amountCents: 18900 },
      { date: '2025-06-07', amountCents: 17200 },
      { date: '2025-06-08', amountCents: 18400 },
      { date: '2025-06-09', amountCents: 16900 },
      { date: '2025-06-10', amountCents: 19100 },
      { date: '2025-06-11', amountCents: 17800 },
      { date: '2025-06-12', amountCents: 17100 },
      { date: '2025-06-13', amountCents: 18600 },
      { date: '2025-06-14', amountCents: 17900 },
      { date: '2025-06-15', amountCents: 19300 },
    ],
    topModels: [
      { model: 'mastrion-llm-large', amountCents: 212400 },
      { model: 'mastrion-llm-small', amountCents: 142300 },
      { model: 'mastrion-embed-v2', amountCents: 88700 },
      { model: 'mastrion-rerank-v1', amountCents: 42300 },
      { model: 'mastrion-vision-v1', amountCents: 27100 },
    ],
    topUsers: [
      { user: 'e.schulz', role: 'Research Scientist', amountCents: 142300 },
      { user: 'g.hoffmann', role: 'Research Scientist', amountCents: 121800 },
      { user: 'i.vogel', role: 'PhD Student', amountCents: 98700 },
      { user: 'o.krause', role: 'Research Scientist', amountCents: 87600 },
      { user: 'u.werner', role: 'PhD Student', amountCents: 62400 },
    ],
    entries: Array.from({ length: 20 }, (_, i) => ({
      id: `cc-research-e${i + 1}`,
      date: `2025-06-${String(15 - (i % 15)).padStart(2, '0')}`,
      description: `Experiment run #${4000 + i}`,
      model: i % 2 === 0 ? 'mastrion-llm-large' : 'mastrion-embed-v2',
      user: i % 3 === 0 ? 'e.schulz' : i % 3 === 1 ? 'g.hoffmann' : 'i.vogel',
      role: i % 3 === 0 ? 'Research Scientist' : i % 3 === 1 ? 'Research Scientist' : 'PhD Student',
      amountCents: 4000 + i * 280,
    })),
  },
  {
    id: 'cc-marketing',
    name: 'Marketing',
    owner: 'Julia Hartmann',
    mtdSpendCents: 398600,
    budgetCents: 800000,
    projectedMonthEndCents: 478300,
    lastMonthSpendCents: 412700,
    dailySpendCents: [
      { date: '2025-06-01', amountCents: 12800 },
      { date: '2025-06-02', amountCents: 13400 },
      { date: '2025-06-03', amountCents: 12100 },
      { date: '2025-06-04', amountCents: 14200 },
      { date: '2025-06-05', amountCents: 13600 },
      { date: '2025-06-06', amountCents: 14900 },
      { date: '2025-06-07', amountCents: 13200 },
      { date: '2025-06-08', amountCents: 14400 },
      { date: '2025-06-09', amountCents: 12900 },
      { date: '2025-06-10', amountCents: 15100 },
      { date: '2025-06-11', amountCents: 13800 },
      { date: '2025-06-12', amountCents: 13100 },
      { date: '2025-06-13', amountCents: 14600 },
      { date: '2025-06-14', amountCents: 13900 },
      { date: '2025-06-15', amountCents: 15300 },
    ],
    topModels: [
      { model: 'mastrion-llm-small', amountCents: 162400 },
      { model: 'mastrion-llm-large', amountCents: 112300 },
      { model: 'mastrion-embed-v2', amountCents: 68700 },
      { model: 'mastrion-rerank-v1', amountCents: 32300 },
      { model: 'mastrion-vision-v1', amountCents: 22900 },
    ],
    topUsers: [
      { user: 'v.lang', role: 'Marketing Manager', amountCents: 112300 },
      { user: 'w.berger', role: 'Content Strategist', amountCents: 98700 },
      { user: 'x.fuchs', role: 'Marketing Analyst', amountCents: 76200 },
      { user: 'y.roth', role: 'Content Strategist', amountCents: 65400 },
      { user: 'z.peters', role: 'Marketing Analyst', amountCents: 46000 },
    ],
    entries: Array.from({ length: 20 }, (_, i) => ({
      id: `cc-marketing-e${i + 1}`,
      date: `2025-06-${String(15 - (i % 15)).padStart(2, '0')}`,
      description: `Campaign generation #${5000 + i}`,
      model: i % 2 === 0 ? 'mastrion-llm-small' : 'mastrion-llm-large',
      user: i % 3 === 0 ? 'v.lang' : i % 3 === 1 ? 'w.berger' : 'x.fuchs',
      role: i % 3 === 0 ? 'Marketing Manager' : i % 3 === 1 ? 'Content Strategist' : 'Marketing Analyst',
      amountCents: 3000 + i * 210,
    })),
  },
  {
    id: 'cc-legal',
    name: 'Legal',
    owner: 'Dr. Katharina Sommer',
    mtdSpendCents: 0,
    budgetCents: 400000,
    projectedMonthEndCents: 0,
    lastMonthSpendCents: 0,
    dailySpendCents: [],
    topModels: [],
    topUsers: [],
    entries: [],
  },
];

export function getCostCenterById(id: string): CostCenter | undefined {
  return COST_CENTERS.find((cc) => cc.id === id);
}

export function utilisationPercent(spendCents: number, budgetCents: number): number {
  if (budgetCents <= 0) return 0;
  return (spendCents / budgetCents) * 100;
}

export function formatEur(cents: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatEurPlain(cents: number): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value) + '\u00a0%';
}

export type UtilisationState = 'ok' | 'warning' | 'over';

export function utilisationState(percent: number): UtilisationState {
  if (percent >= 100) return 'over';
  if (percent >= 80) return 'warning';
  return 'ok';
}

export function utilisationLabel(state: UtilisationState): string {
  if (state === 'over') return 'Over budget';
  if (state === 'warning') return 'Near budget';
  return 'Within budget';
}
