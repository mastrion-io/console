export type BreakerState = 'closed' | 'tripped';

export type BudgetSource = 'runtime' | 'fixture';

export interface CostCenterBudget {
  id: string;
  costCenter: string;
  department: string;
  capCents: number;
  spendTodayCents: number;
  remainingCents: number;
  breakerState: BreakerState;
  lastTripAt: string | null;
  reroutedRequests: number;
}

export interface BudgetsResponse {
  source: BudgetSource;
  generatedAt: string;
  hardCeilingCents: number;
  budgets: CostCenterBudget[];
}

export const HARD_CEILING_CENTS = 500000;

export interface CapValidationError {
  field: 'capCents';
  message: string;
}

export type CapValidationResult =
  | { ok: true; capCents: number }
  | { ok: false; error: CapValidationError };

/**
 * Validates a proposed daily cap for a cost center.
 * Rules (MST-FIN-105): integer cents, greater than zero, below the EUR 5000/day ceiling.
 */
export function validateCapCents(raw: unknown): CapValidationResult {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) {
    return {
      ok: false,
      error: { field: 'capCents', message: 'Cap must be a number expressed in integer cents.' },
    };
  }
  if (!Number.isInteger(raw)) {
    return {
      ok: false,
      error: { field: 'capCents', message: 'Cap must be an integer number of cents (no fractional cents).' },
    };
  }
  if (raw <= 0) {
    return {
      ok: false,
      error: { field: 'capCents', message: 'Cap must be greater than zero.' },
    };
  }
  if (raw >= HARD_CEILING_CENTS) {
    return {
      ok: false,
      error: {
        field: 'capCents',
        message: 'Cap must be below the hard ceiling of EUR 5000.00 per day per cost center.',
      },
    };
  }
  return { ok: true, capCents: raw };
}

export function formatEurFromCents(cents: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function spendRatio(budget: CostCenterBudget): number {
  if (budget.capCents <= 0) {
    return 0;
  }
  const ratio = budget.spendTodayCents / budget.capCents;
  return Math.min(1, Math.max(0, ratio));
}
