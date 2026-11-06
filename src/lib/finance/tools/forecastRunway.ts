import { COST_CENTERS, DAILY_SPEND } from './fixtures';
import { errorResult, FIXTURE_SOURCE, nowIso, type ToolResult } from './types';

export interface ForecastRunwayArgs {
  months: number;
}

export interface ForecastRunwayData {
  months: number;
  projectedSpendEur: number;
  monthlyAverageEur: number;
  method: string;
  confidenceNote: string;
}

export function forecastRunway(args: ForecastRunwayArgs): ToolResult<ForecastRunwayData> {
  if (!Number.isInteger(args.months) || args.months < 1 || args.months > 24) {
    return errorResult(
      `Invalid 'months' value: ${String(args.months)}.`,
      'Provide an integer between 1 and 24 inclusive.',
    );
  }

  const totalSpend = DAILY_SPEND.reduce((sum, r) => sum + r.costEur, 0);
  const distinctDays = new Set(DAILY_SPEND.map((r) => r.date)).size;
  const dailyAverage = distinctDays > 0 ? totalSpend / distinctDays : 0;
  const monthlyAverage = round2(dailyAverage * 30);
  const projectedSpendEur = round2(monthlyAverage * args.months);
  const totalCap = COST_CENTERS.reduce((sum, c) => sum + c.monthlyCapEur, 0);

  const method = 'Straight-line projection: mean daily fixture spend over the observed window, multiplied by 30 days per month and by the requested month count.';
  const confidenceNote =
    distinctDays < 14
      ? `Low confidence: only ${distinctDays} distinct days of fixture data are available, so seasonality and weekday effects are not represented.`
      : `Medium confidence: ${distinctDays} distinct days of fixture data, no seasonality modelled.`;

  const humanSummary = `Projected spend over ${args.months} month(s) is EUR ${projectedSpendEur.toFixed(2)} at a monthly average of EUR ${monthlyAverage.toFixed(2)}, against a combined monthly cap of EUR ${totalCap.toFixed(2)}. ${confidenceNote} Data is a fixture.`;

  return {
    data: { months: args.months, projectedSpendEur, monthlyAverageEur: monthlyAverage, method, confidenceNote },
    humanSummary,
    source: FIXTURE_SOURCE,
    asOf: nowIso(),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
