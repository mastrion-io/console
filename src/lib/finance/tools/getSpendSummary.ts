import { parseDateRange } from './dates';
import { DAILY_SPEND, findCostCenter } from './fixtures';
import { errorResult, FIXTURE_SOURCE, nowIso, type ToolResult } from './types';

export interface SpendSummaryArgs {
  from: string;
  to: string;
  costCenter?: string;
}

export interface SpendSummaryData {
  totalEur: number;
  byCostCenter: { costCenter: string; label: string; totalEur: number }[];
  byRoute: { route: 'local' | 'frontier'; totalEur: number }[];
}

export function getSpendSummary(args: SpendSummaryArgs): ToolResult<SpendSummaryData> {
  const parsed = parseDateRange(args.from, args.to);
  if (!parsed.ok) return errorResult(parsed.error, parsed.hint);

  if (args.costCenter !== undefined && findCostCenter(args.costCenter) === undefined) {
    return errorResult(
      `Unknown cost center '${args.costCenter}'.`,
      'Call get_budget_status without a costCenter to list valid cost center ids.',
    );
  }

  const rows = DAILY_SPEND.filter(
    (r) =>
      r.date >= parsed.range.from &&
      r.date <= parsed.range.to &&
      (args.costCenter === undefined || r.costCenter === args.costCenter),
  );

  const ccMap = new Map<string, number>();
  const routeMap = new Map<'local' | 'frontier', number>();
  let totalEur = 0;
  for (const row of rows) {
    totalEur += row.costEur;
    ccMap.set(row.costCenter, (ccMap.get(row.costCenter) ?? 0) + row.costEur);
    routeMap.set(row.route, (routeMap.get(row.route) ?? 0) + row.costEur);
  }

  const byCostCenter = Array.from(ccMap.entries())
    .map(([costCenter, value]) => ({
      costCenter,
      label: findCostCenter(costCenter)?.label ?? costCenter,
      totalEur: round2(value),
    }))
    .sort((a, b) => b.totalEur - a.totalEur);

  const byRoute = (['local', 'frontier'] as const).map((route) => ({
    route,
    totalEur: round2(routeMap.get(route) ?? 0),
  }));

  const scope = args.costCenter ? `cost center ${args.costCenter}` : 'all cost centers';
  const humanSummary =
    rows.length === 0
      ? `No spend recorded for ${scope} between ${parsed.range.from} and ${parsed.range.to}. Data is a fixture.`
      : `Total spend for ${scope} from ${parsed.range.from} to ${parsed.range.to} was EUR ${round2(totalEur).toFixed(2)} across ${rows.length} daily records. Local route EUR ${byRoute[0].totalEur.toFixed(2)}, frontier route EUR ${byRoute[1].totalEur.toFixed(2)}. Data is a fixture.`;

  return {
    data: { totalEur: round2(totalEur), byCostCenter, byRoute },
    humanSummary,
    source: FIXTURE_SOURCE,
    asOf: nowIso(),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
