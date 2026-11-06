import type {
  Budget,
  CostCenter,
  Invoice,
  KpiSnapshot,
  ModelRoute,
  SpendEntry,
  Vendor,
} from './types';

const AS_OF = '2025-03-31T23:59:59.000Z';

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COST_CENTER_DEFS: ReadonlyArray<{
  id: string;
  name: string;
  owner: string;
  monthlyBudgetCents: number;
  baseDailyCents: number;
}> = [
  { id: 'platform', name: 'Platform Engineering', owner: 'A. Weber', monthlyBudgetCents: 4_200_000, baseDailyCents: 118_000 },
  { id: 'ai-runtime', name: 'AI Runtime', owner: 'J. Okafor', monthlyBudgetCents: 6_800_000, baseDailyCents: 214_000 },
  { id: 'frontend', name: 'Frontend', owner: 'M. Rossi', monthlyBudgetCents: 1_900_000, baseDailyCents: 52_000 },
  { id: 'data', name: 'Data Platform', owner: 'S. Yilmaz', monthlyBudgetCents: 3_100_000, baseDailyCents: 96_000 },
  { id: 'security', name: 'Security', owner: 'L. Fischer', monthlyBudgetCents: 2_400_000, baseDailyCents: 61_000 },
  { id: 'g-and-a', name: 'General & Administrative', owner: 'K. Brandt', monthlyBudgetCents: 1_200_000, baseDailyCents: 34_000 },
];

const SPEND_CATEGORIES: ReadonlyArray<SpendEntry['category']> = [
  'compute',
  'inference',
  'storage',
  'network',
  'licenses',
  'personnel',
];

function isoDay(offsetDaysFromEnd: number): string {
  const base = new Date('2025-03-31T00:00:00.000Z');
  const d = new Date(base.getTime() - offsetDaysFromEnd * 86_400_000);
  return d.toISOString().slice(0, 10);
}

function buildSpendEntries(): SpendEntry[] {
  const rand = mulberry32(0x5eed_f1a7);
  const entries: SpendEntry[] = [];
  for (let dayOffset = 89; dayOffset >= 0; dayOffset -= 1) {
    const day = isoDay(dayOffset);
    for (const cc of COST_CENTER_DEFS) {
      const jitter = 0.82 + rand() * 0.36;
      const amountCents = Math.round(cc.baseDailyCents * jitter);
      const category = SPEND_CATEGORIES[Math.floor(rand() * SPEND_CATEGORIES.length)] ?? 'compute';
      entries.push({
        id: `spend-${cc.id}-${day}`,
        costCenterId: cc.id,
        day,
        amountCents,
        currency: 'EUR',
        category,
        source: 'fixture',
        asOf: AS_OF,
      });
    }
  }
  return entries;
}

export const spendEntries: SpendEntry[] = buildSpendEntries();

function monthToDateSpend(costCenterId: string): number {
  return spendEntries
    .filter((e) => e.costCenterId === costCenterId && e.day >= '2025-03-01')
    .reduce((sum, e) => sum + e.amountCents, 0);
}

export const costCenters: CostCenter[] = COST_CENTER_DEFS.map((cc) => ({
  id: cc.id,
  name: cc.name,
  owner: cc.owner,
  monthlyBudgetCents: cc.monthlyBudgetCents,
  monthToDateSpendCents: monthToDateSpend(cc.id),
  source: 'fixture',
  asOf: AS_OF,
}));

export const budgets: Budget[] = [
  {
    id: 'budget-platform-q1',
    costCenterId: 'platform',
    periodStart: '2025-01-01',
    periodEnd: '2025-03-31',
    limitCents: 12_600_000,
    spentCents: 11_240_000,
    breached: false,
    source: 'fixture',
    asOf: AS_OF,
  },
  {
    id: 'budget-ai-runtime-q1',
    costCenterId: 'ai-runtime',
    periodStart: '2025-01-01',
    periodEnd: '2025-03-31',
    limitCents: 18_000_000,
    spentCents: 19_640_000,
    breached: true,
    source: 'fixture',
    asOf: AS_OF,
  },
  {
    id: 'budget-data-q1',
    costCenterId: 'data',
    periodStart: '2025-01-01',
    periodEnd: '2025-03-31',
    limitCents: 9_300_000,
    spentCents: 8_120_000,
    breached: false,
    source: 'fixture',
    asOf: AS_OF,
  },
];

export const modelRoutes: ModelRoute[] = [
  {
    id: 'route-local-llama-70b',
    name: 'Local Llama 3.1 70B',
    provider: 'local',
    inputCostCentsPerMillionTokens: 12,
    outputCostCentsPerMillionTokens: 24,
    monthlyRequests: 412_000,
    source: 'fixture',
    asOf: AS_OF,
  },
  {
    id: 'route-local-mistral-large',
    name: 'Local Mistral Large',
    provider: 'local',
    inputCostCentsPerMillionTokens: 18,
    outputCostCentsPerMillionTokens: 36,
    monthlyRequests: 268_000,
    source: 'fixture',
    asOf: AS_OF,
  },
  {
    id: 'route-frontier-gpt-4o',
    name: 'Frontier GPT-4o',
    provider: 'frontier',
    inputCostCentsPerMillionTokens: 250,
    outputCostCentsPerMillionTokens: 1000,
    monthlyRequests: 54_000,
    source: 'fixture',
    asOf: AS_OF,
  },
  {
    id: 'route-frontier-claude-sonnet',
    name: 'Frontier Claude Sonnet',
    provider: 'frontier',
    inputCostCentsPerMillionTokens: 300,
    outputCostCentsPerMillionTokens: 1500,
    monthlyRequests: 31_000,
    source: 'fixture',
    asOf: AS_OF,
  },
];

export const vendors: Vendor[] = [
  { id: 'vendor-hetzner', name: 'Hetzner Online GmbH', vatId: 'DE812871812', country: 'DE', source: 'fixture', asOf: AS_OF },
  { id: 'vendor-ovh', name: 'OVH GmbH', vatId: 'DE815249230', country: 'DE', source: 'fixture', asOf: AS_OF },
  { id: 'vendor-openai', name: 'OpenAI Ireland Ltd', vatId: 'IE3423456AH', country: 'IE', source: 'fixture', asOf: AS_OF },
  { id: 'vendor-anthropic', name: 'Anthropic Ireland Ltd', vatId: 'IE6363512MH', country: 'IE', source: 'fixture', asOf: AS_OF },
];

function buildInvoice(
  index: number,
  vendorId: string,
  netCents: number,
  status: Invoice['status'],
): Invoice {
  const ustCents = Math.round((netCents * 19) / 100);
  const issuedDay = String(10 + index).padStart(2, '0');
  const dueDay = String(24 + (index % 5)).padStart(2, '0');
  return {
    id: `inv-2025-03-${String(index + 1).padStart(3, '0')}`,
    vendorId,
    issuedAt: `2025-03-${issuedDay}`,
    dueAt: `2025-04-${dueDay}`,
    netCents,
    ustRatePercent: 19,
    ustCents,
    grossCents: netCents + ustCents,
    currency: 'EUR',
    status,
    source: 'fixture',
    asOf: AS_OF,
  };
}

export const invoices: Invoice[] = [
  buildInvoice(0, 'vendor-hetzner', 842_000, 'paid'),
  buildInvoice(1, 'vendor-hetzner', 798_500, 'paid'),
  buildInvoice(2, 'vendor-ovh', 412_300, 'open'),
  buildInvoice(3, 'vendor-ovh', 388_900, 'open'),
  buildInvoice(4, 'vendor-openai', 1_240_000, 'overdue'),
  buildInvoice(5, 'vendor-openai', 1_105_400, 'open'),
  buildInvoice(6, 'vendor-anthropic', 964_200, 'paid'),
  buildInvoice(7, 'vendor-anthropic', 1_012_800, 'open'),
  buildInvoice(8, 'vendor-hetzner', 655_000, 'paid'),
  buildInvoice(9, 'vendor-ovh', 289_600, 'paid'),
  buildInvoice(10, 'vendor-openai', 1_388_000, 'overdue'),
  buildInvoice(11, 'vendor-anthropic', 742_100, 'open'),
];

export function buildKpiSnapshot(): KpiSnapshot {
  const monthToDateSpendCents = costCenters.reduce((sum, cc) => sum + cc.monthToDateSpendCents, 0);
  const totalBudgetCents = costCenters.reduce((sum, cc) => sum + cc.monthlyBudgetCents, 0);
  const openInvoiceCents = invoices
    .filter((inv) => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.grossCents, 0);
  const breachedBudgetCount = budgets.filter((b) => b.breached).length;
  const dayOfMonth = 31;
  const forecastMonthEndCents = Math.round((monthToDateSpendCents / dayOfMonth) * 31);
  const budgetUtilizationPercent =
    totalBudgetCents === 0 ? 0 : Math.round((monthToDateSpendCents / totalBudgetCents) * 1000) / 10;
  return {
    monthToDateSpendCents,
    forecastMonthEndCents,
    budgetUtilizationPercent,
    openInvoiceCents,
    breachedBudgetCount,
    currency: 'EUR',
    source: 'fixture',
    asOf: AS_OF,
  };
}

export const FIXTURE_AS_OF = AS_OF;
