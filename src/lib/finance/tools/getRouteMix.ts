import { parseDateRange } from './dates';
import { DAILY_SPEND } from './fixtures';
import { errorResult, FIXTURE_SOURCE, nowIso, type ToolResult } from './types';

export interface RouteMixArgs {
  from: string;
  to: string;
}

export interface RouteMixTier {
  route: 'local' | 'frontier';
  tokens: number;
  costEur: number;
  costPerMillionTokensEur: number;
}

export interface RouteMixData {
  tiers: RouteMixTier[];
  localVersusFrontierDeltaEur: number;
  localVersusFrontierDeltaPct: number;
}

export function getRouteMix(args: RouteMixArgs): ToolResult<RouteMixData> {
  const parsed = parseDateRange(args.from, args.to);
  if (!parsed.ok) return errorResult(parsed.error, parsed.hint);

  const rows = DAILY_SPEND.filter((r) => r.date >= parsed.range.from && r.date <= parsed.range.to);

  const tiers: RouteMixTier[] = (['local', 'frontier'] as const).map((route) => {
    const subset = rows.filter((r) => r.route === route);
    const tokens = subset.reduce((sum, r) => sum + r.tokens, 0);
    const costEur = round2(subset.reduce((sum, r) => sum + r.costEur, 0));
    const costPerMillionTokensEur = tokens > 0 ? round2((costEur / tokens) * 1_000_000) : 0;
    return { route, tokens, costEur, costPerMillionTokensEur };
  });

  const local = tiers[0];
  const frontier = tiers[1];
  const deltaEur = round2(frontier.costEur - local.costEur);
  const deltaPct = local.costEur > 0 ? round2((deltaEur / local.costEur) * 100) : 0;

  const humanSummary =
    rows.length === 0
      ? `No route mix data between ${parsed.range.from} and ${parsed.range.to}. Data is a fixture.`
      : `Between ${parsed.range.from} and ${parsed.range.to}, local tier served ${local.tokens.toLocaleString('en-US')} tokens for EUR ${local.costEur.toFixed(2)} (EUR ${local.costPerMillionTokensEur.toFixed(2)} per million tokens) and frontier tier served ${frontier.tokens.toLocaleString('en-US')} tokens for EUR ${frontier.costEur.toFixed(2)} (EUR ${frontier.costPerMillionTokensEur.toFixed(2)} per million tokens). Frontier cost exceeds local by EUR ${deltaEur.toFixed(2)} (${deltaPct.toFixed(1)}%). Data is a fixture.`;

  return {
    data: { tiers, localVersusFrontierDeltaEur: deltaEur, localVersusFrontierDeltaPct: deltaPct },
    humanSummary,
    source: FIXTURE_SOURCE,
    asOf: nowIso(),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
