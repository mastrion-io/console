export type ModelTier = 'sovereign' | 'hybrid' | 'frontier';

export interface RateConfig {
  /** Frontier cost in EUR per 1k tokens. */
  frontierRatePer1k: number;
  /** Local sovereign marginal cost in EUR per 1k tokens. */
  localRatePer1k: number;
  /** ISO date (YYYY-MM-DD) the figures were last confirmed by finance. */
  asOf: string;
  /** Config path finance edits to correct the figures without a code change. */
  configPath: string;
}

export const RATES: RateConfig = {
  frontierRatePer1k: 0.024,
  localRatePer1k: 0.0,
  asOf: '2025-01-15',
  configPath: 'src/lib/finance/rates.ts',
};

export interface ModelRoute {
  id: string;
  name: string;
  tier: ModelTier;
  tokensIn: number;
  tokensOut: number;
}

export interface RouteLedgerRow {
  id: string;
  name: string;
  tier: ModelTier;
  tokensIn: number;
  tokensOut: number;
  totalTokens: number;
  /** True when the route carried no traffic and must not imply a saving. */
  noTraffic: boolean;
  unitCostPer1k: number;
  costIncurred: number;
  frontierCost: number;
  saving: number;
}

/**
 * Unit cost per 1k tokens for a route, based on its tier.
 * Sovereign routes run at local marginal cost; hybrid and frontier are billed
 * at the frontier rate.
 */
export function unitCostPer1k(tier: ModelTier, rates: RateConfig = RATES): number {
  return tier === 'sovereign' ? rates.localRatePer1k : rates.frontierRatePer1k;
}

/**
 * Builds a ledger row for a route. Savings are tokens * rate difference.
 * A route with zero tokens in carries no traffic and contributes zero saving.
 */
export function buildRouteLedgerRow(
  route: ModelRoute,
  rates: RateConfig = RATES,
): RouteLedgerRow {
  const totalTokens = route.tokensIn + route.tokensOut;
  const noTraffic = route.tokensIn === 0;
  const unit = unitCostPer1k(route.tier, rates);
  const costIncurred = noTraffic ? 0 : (totalTokens / 1000) * unit;
  const frontierCost = noTraffic
    ? 0
    : (totalTokens / 1000) * rates.frontierRatePer1k;
  const saving = noTraffic ? 0 : frontierCost - costIncurred;

  return {
    id: route.id,
    name: route.name,
    tier: route.tier,
    tokensIn: route.tokensIn,
    tokensOut: route.tokensOut,
    totalTokens,
    noTraffic,
    unitCostPer1k: unit,
    costIncurred,
    frontierCost,
    saving,
  };
}

export interface SavingsSummary {
  today: number;
  monthToDate: number;
  annualised: number;
}

/**
 * Annualisation formula: month-to-date saving / elapsed days in month * 365.
 * Named explicitly so the UI tooltip can cite it.
 */
export const ANNUALISATION_FORMULA =
  '(monthToDate / elapsedDaysInMonth) * 365';

export function annualiseSaving(
  monthToDate: number,
  elapsedDaysInMonth: number,
): number {
  if (elapsedDaysInMonth <= 0) {
    return 0;
  }
  return (monthToDate / elapsedDaysInMonth) * 365;
}

export function summariseSavings(
  rows: RouteLedgerRow[],
  todaySaving: number,
  elapsedDaysInMonth: number,
): SavingsSummary {
  const monthToDate = rows.reduce((acc, row) => acc + row.saving, 0);
  return {
    today: todaySaving,
    monthToDate,
    annualised: annualiseSaving(monthToDate, elapsedDaysInMonth),
  };
}

export interface BreakEvenInput {
  /** Tokens per month. */
  tokensPerMonth: number;
  /** Frontier rate in EUR per 1k tokens. */
  frontierRatePer1k: number;
  /** Monthly cost of sovereign capacity (GPU or reserved instance) in EUR. */
  sovereignMonthlyCost: number;
}

export interface BreakEvenResult {
  /** Token volume at which sovereign capacity cost equals frontier spend. */
  crossoverTokens: number;
  /** True when the current volume is at or past the crossover. */
  pastCrossover: boolean;
  /** Frontier spend at the current volume. */
  frontierSpend: number;
  /** Saving (positive) or loss (negative) versus frontier at current volume. */
  netSaving: number;
}

/**
 * Pure break-even calculation.
 * Crossover volume = sovereignMonthlyCost / (frontierRatePer1k / 1000).
 */
export function calculateBreakEven(input: BreakEvenInput): BreakEvenResult {
  const { tokensPerMonth, frontierRatePer1k, sovereignMonthlyCost } = input;
  const perToken = frontierRatePer1k / 1000;
  const crossoverTokens = perToken > 0 ? sovereignMonthlyCost / perToken : 0;
  const frontierSpend = tokensPerMonth * perToken;
  const netSaving = frontierSpend - sovereignMonthlyCost;

  return {
    crossoverTokens,
    pastCrossover: tokensPerMonth >= crossoverTokens,
    frontierSpend,
    netSaving,
  };
}
