export interface FinanceKpiTile {
  id: string;
  label: string;
  value: number;
  unit: 'currency' | 'percent' | 'tokens';
  definition: string;
  source: string;
  asOf: string;
  secondary?: {
    label: string;
    value: number;
    unit: 'currency' | 'percent' | 'tokens';
  };
  projectionMethod?: string;
  worstCostCenter?: string;
  threshold?: number;
}

export interface FinanceTrajectoryPoint {
  date: string;
  spend: number;
  movingAverage7d: number;
  budgetCeiling: number;
}

export interface FinanceKpisResponse {
  asOf: string;
  source: string;
  degraded: boolean;
  tiles: FinanceKpiTile[];
  trajectory: FinanceTrajectoryPoint[];
}

export const FINANCE_KPIS_ENDPOINT = '/api/finance/kpis';

export function isFinanceKpisResponse(value: unknown): value is FinanceKpisResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.asOf === 'string' &&
    typeof candidate.source === 'string' &&
    typeof candidate.degraded === 'boolean' &&
    Array.isArray(candidate.tiles) &&
    Array.isArray(candidate.trajectory)
  );
}

export function formatFinanceValue(value: number, unit: FinanceKpiTile['unit']): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  if (unit === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (unit === 'percent') {
    return `${value.toFixed(1)}%`;
  }
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

export function formatAsOf(asOf: string): string {
  const parsed = new Date(asOf);
  if (Number.isNaN(parsed.getTime())) {
    return asOf;
  }
  return parsed.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
}
