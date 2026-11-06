import { COST_CENTERS, DAILY_SPEND, findCostCenter } from './fixtures';
import { errorResult, FIXTURE_SOURCE, nowIso, type ToolResult } from './types';

export interface BudgetStatusArgs {
  costCenter?: string;
}

export interface BudgetStatusEntry {
  costCenter: string;
  label: string;
  capEur: number;
  spendEur: number;
  remainingEur: number;
  breakerState: 'closed' | 'half-open' | 'open';
  rerouteCount: number;
}

export interface BudgetStatusData {
  entries: BudgetStatusEntry[];
}

export function getBudgetStatus(args: BudgetStatusArgs): ToolResult<BudgetStatusData> {
  if (args.costCenter !== undefined && findCostCenter(args.costCenter) === undefined) {
    return errorResult(
      `Unknown cost center '${args.costCenter}'.`,
      'Call get_budget_status without a costCenter to list valid cost center ids.',
    );
  }

  const targets = args.costCenter
    ? COST_CENTERS.filter((c) => c.id === args.costCenter)
    : COST_CENTERS;

  const entries: BudgetStatusEntry[] = targets.map((cc) => {
    const spendEur = round2(
      DAILY_SPEND.filter((r) => r.costCenter === cc.id).reduce((sum, r) => sum + r.costEur, 0),
    );
    return {
      costCenter: cc.id,
      label: cc.label,
      capEur: cc.monthlyCapEur,
      spendEur,
      remainingEur: round2(cc.monthlyCapEur - spendEur),
      breakerState: cc.breakerState,
      rerouteCount: cc.rerouteCount,
    };
  });

  const humanSummary =
    entries.length === 0
      ? 'No budget records available. Data is a fixture.'
      : entries
          .map(
            (e) =>
              `${e.label} (${e.costCenter}): EUR ${e.spendEur.toFixed(2)} of EUR ${e.capEur.toFixed(2)} cap, EUR ${e.remainingEur.toFixed(2)} remaining, breaker ${e.breakerState}, ${e.rerouteCount} reroutes.`,
          )
          .join(' ') + ' Data is a fixture.';

  return {
    data: { entries },
    humanSummary,
    source: FIXTURE_SOURCE,
    asOf: nowIso(),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
