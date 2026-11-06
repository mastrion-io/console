export type Currency = 'EUR';

export type FinanceSource = 'fixture' | 'finops' | 'ledger';

export interface FinanceMeta {
  source: FinanceSource;
  asOf: string;
}

export interface CostCenter extends FinanceMeta {
  id: string;
  name: string;
  owner: string;
  monthlyBudgetCents: number;
  monthToDateSpendCents: number;
}

export interface Budget extends FinanceMeta {
  id: string;
  costCenterId: string;
  periodStart: string;
  periodEnd: string;
  limitCents: number;
  spentCents: number;
  breached: boolean;
}

export interface SpendEntry extends FinanceMeta {
  id: string;
  costCenterId: string;
  day: string;
  amountCents: number;
  currency: Currency;
  category: 'compute' | 'inference' | 'storage' | 'network' | 'licenses' | 'personnel';
}

export interface ModelRoute extends FinanceMeta {
  id: string;
  name: string;
  provider: 'local' | 'frontier';
  inputCostCentsPerMillionTokens: number;
  outputCostCentsPerMillionTokens: number;
  monthlyRequests: number;
}

export interface Invoice extends FinanceMeta {
  id: string;
  vendorId: string;
  issuedAt: string;
  dueAt: string;
  netCents: number;
  ustRatePercent: 19;
  ustCents: number;
  grossCents: number;
  currency: Currency;
  status: 'paid' | 'open' | 'overdue';
}

export interface Vendor extends FinanceMeta {
  id: string;
  name: string;
  vatId: string;
  country: string;
}

export interface KpiSnapshot extends FinanceMeta {
  monthToDateSpendCents: number;
  forecastMonthEndCents: number;
  budgetUtilizationPercent: number;
  openInvoiceCents: number;
  breachedBudgetCount: number;
  currency: Currency;
}

export interface FinanceEnvelope<T> {
  data: T;
  source: FinanceSource;
  asOf: string;
  degraded: boolean;
}
