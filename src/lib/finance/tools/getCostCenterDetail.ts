import { eachDay, parseDateRange } from './dates';
import { DAILY_SPEND, findCostCenter } from './fixtures';
import { errorResult, FIXTURE_SOURCE, nowIso, type ToolResult } from './types';

export interface CostCenterDetailArgs {
  costCenter: string;
  from: string;
  to: string;
}

export interface CostCenterDetailData {
  costCenter: string;
  label: string;
  dailySeries: { date: string; totalEur: number }[];
  topModels: { model: string; totalEur: number; tokens: number }[];
  capEur: number;
  spendEur: number;
  utilisationPct: number;
}

export function getCostCenterDetail(args: CostCenterDetailArgs): ToolResult<CostCenterDetailData> {
  const parsed = parseDateRange(args.from, args.to);
  if (!parsed.ok) return errorResult(parsed.error, parsed.hint);

  const cc = findCostCenter(args.costCenter);
  if (cc === undefined) {
    return errorResult(
      `Unknown cost center '${args.costCenter}'.`,
      'Call get_budget_status without a costCenter to list valid cost center ids.',
    );
  }

  const rows = DAILY_SPEND.filter(
    (r) => r.costCenter === cc.id && r.date >= parsed.range.from && r.date <= parsed.range.to,
  );

  const dayMap = new Map<string, number>();
  const modelMap = new Map<string, { costEur: number; tokens: number }>();
  let spendEur = 0;
  for (const row of rows) {
    spendEur += row.costEur;
    dayMap.set(row.date, (dayMap.get(row.date) ?? 0) + row.costEur);
    const prev = modelMap.get(row.model) ?? { costEur: 0, tokens: 0 };
    modelMap.set(row.model, { costEur: prev.costEur + row.costEur, tokens: prev.tokens + row.tokens });
  }

  const dailySeries = eachDay(parsed.range.from, parsed.range.to).map((date) => ({
    date,
    totalEur: round2(dayMap.get(date) ?? 0),
  }));

  const topModels = Array.from(modelMap.entries())
    .map(([model, v]) => ({ model, totalEur: round2(v.costEur), tokens: v.tokens }))
    .sort((a, b) => b.totalEur - a.totalEur)
    .slice(0, 5);

  const utilisationPct = cc.monthlyCapEur > 0 ? round2((spendEur / cc.monthlyCapEur) * 100) : 0;

  const humanSummary =
    rows.length === 0
      ? `No spend recorded for cost center ${cc.label} (${cc.id}) between ${parsed.range.from} and ${parsed.range.to}. Data is a fixture.`
      : `Cost center ${cc.label} (${cc.id}) spent EUR ${round2(spendEur).toFixed(2)} between ${parsed.range.from} and ${parsed.range.to}, which is ${utilisationPct.toFixed(1)}% of its EUR ${cc.monthlyCapEur.toFixed(2)} monthly cap. Spend is aggregated per cost center, not per individual. Data is a fixture.`;

  return {
    data: {
      costCenter: cc.id,
      label: cc.label,
      dailySeries,
      topModels,
      capEur: cc.monthlyCapEur,
      spendEur: round2(spendEur),
      utilisationPct,
    },
    humanSummary,
    source: FIXTURE_SOURCE,
    asOf: nowIso(),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
