const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86_400_000;
export const MAX_RANGE_DAYS = 400;

export interface DateRange {
  from: string;
  to: string;
  days: number;
}

export type DateRangeParse =
  | { ok: true; range: DateRange }
  | { ok: false; error: string; hint: string };

function parseIsoDate(value: string): number | null {
  if (!ISO_DATE.test(value)) return null;
  const ms = Date.parse(`${value}T00:00:00.000Z`);
  if (Number.isNaN(ms)) return null;
  const roundTrip = new Date(ms).toISOString().slice(0, 10);
  if (roundTrip !== value) return null;
  return ms;
}

export function parseDateRange(from: string, to: string): DateRangeParse {
  const fromMs = parseIsoDate(from);
  if (fromMs === null) {
    return {
      ok: false,
      error: `Invalid 'from' date: '${from}'.`,
      hint: 'Use an ISO calendar date in the form YYYY-MM-DD, for example 2025-01-01.',
    };
  }
  const toMs = parseIsoDate(to);
  if (toMs === null) {
    return {
      ok: false,
      error: `Invalid 'to' date: '${to}'.`,
      hint: 'Use an ISO calendar date in the form YYYY-MM-DD, for example 2025-01-31.',
    };
  }
  if (toMs < fromMs) {
    return {
      ok: false,
      error: `Reversed range: 'to' (${to}) is before 'from' (${from}).`,
      hint: 'Swap the dates so that from <= to, then retry.',
    };
  }
  const days = Math.round((toMs - fromMs) / MS_PER_DAY) + 1;
  if (days > MAX_RANGE_DAYS) {
    return {
      ok: false,
      error: `Range too long: ${days} days requested, maximum is ${MAX_RANGE_DAYS}.`,
      hint: `Narrow the range to ${MAX_RANGE_DAYS} days or fewer (for example a single quarter) and retry.`,
    };
  }
  return { ok: true, range: { from, to, days } };
}

export function eachDay(from: string, to: string): string[] {
  const start = Date.parse(`${from}T00:00:00.000Z`);
  const end = Date.parse(`${to}T00:00:00.000Z`);
  const out: string[] = [];
  for (let ms = start; ms <= end; ms += MS_PER_DAY) {
    out.push(new Date(ms).toISOString().slice(0, 10));
  }
  return out;
}
