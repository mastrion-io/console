export interface CostCenterFixture {
  id: string;
  label: string;
  monthlyCapEur: number;
  breakerState: 'closed' | 'half-open' | 'open';
  rerouteCount: number;
}

export interface DailySpendFixture {
  date: string;
  costCenter: string;
  route: 'local' | 'frontier';
  model: string;
  tokens: number;
  costEur: number;
}

export interface InvoiceFixture {
  id: string;
  vendor: string;
  status: 'paid' | 'open' | 'overdue';
  issuedOn: string;
  dueOn: string;
  netEur: number;
  ustRate: number;
}

export const COST_CENTERS: CostCenterFixture[] = [
  { id: 'cc-eng-platform', label: 'Engineering Platform', monthlyCapEur: 42000, breakerState: 'closed', rerouteCount: 3 },
  { id: 'cc-risk-ops', label: 'Risk Operations', monthlyCapEur: 18500, breakerState: 'half-open', rerouteCount: 11 },
  { id: 'cc-client-success', label: 'Client Success', monthlyCapEur: 9600, breakerState: 'closed', rerouteCount: 0 },
];

export const DAILY_SPEND: DailySpendFixture[] = [
  { date: '2025-01-02', costCenter: 'cc-eng-platform', route: 'local', model: 'mastrion-sov-8b', tokens: 1_820_000, costEur: 412.5 },
  { date: '2025-01-02', costCenter: 'cc-eng-platform', route: 'frontier', model: 'frontier-large', tokens: 240_000, costEur: 688.0 },
  { date: '2025-01-02', costCenter: 'cc-risk-ops', route: 'local', model: 'mastrion-sov-8b', tokens: 640_000, costEur: 148.2 },
  { date: '2025-01-03', costCenter: 'cc-eng-platform', route: 'local', model: 'mastrion-sov-8b', tokens: 2_010_000, costEur: 455.9 },
  { date: '2025-01-03', costCenter: 'cc-risk-ops', route: 'frontier', model: 'frontier-large', tokens: 180_000, costEur: 512.4 },
  { date: '2025-01-03', costCenter: 'cc-client-success', route: 'local', model: 'mastrion-sov-8b', tokens: 310_000, costEur: 71.8 },
  { date: '2025-01-04', costCenter: 'cc-eng-platform', route: 'frontier', model: 'frontier-large', tokens: 205_000, costEur: 601.3 },
  { date: '2025-01-04', costCenter: 'cc-risk-ops', route: 'local', model: 'mastrion-sov-8b', tokens: 720_000, costEur: 166.4 },
  { date: '2025-01-05', costCenter: 'cc-client-success', route: 'local', model: 'mastrion-sov-8b', tokens: 288_000, costEur: 66.2 },
  { date: '2025-01-05', costCenter: 'cc-eng-platform', route: 'local', model: 'mastrion-sov-8b', tokens: 1_940_000, costEur: 441.1 },
];

export const INVOICES: InvoiceFixture[] = [
  { id: 'INV-2025-0101', vendor: 'Hetzner Cloud GmbH', status: 'paid', issuedOn: '2025-01-01', dueOn: '2025-01-15', netEur: 12400, ustRate: 0.19 },
  { id: 'INV-2025-0107', vendor: 'Frontier Inference AG', status: 'open', issuedOn: '2025-01-07', dueOn: '2025-02-06', netEur: 28750, ustRate: 0.19 },
  { id: 'INV-2025-0112', vendor: 'Deutsche Telekom AG', status: 'overdue', issuedOn: '2024-12-12', dueOn: '2025-01-11', netEur: 3120, ustRate: 0.19 },
  { id: 'INV-2025-0118', vendor: 'Frontier Inference AG', status: 'open', issuedOn: '2025-01-18', dueOn: '2025-02-17', netEur: 19400, ustRate: 0.19 },
];

export function findCostCenter(id: string): CostCenterFixture | undefined {
  return COST_CENTERS.find((c) => c.id === id);
}
