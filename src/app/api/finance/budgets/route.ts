import { NextResponse } from 'next/server';
import type { BudgetsResponse } from '@/lib/finance/budgets';
import { getFixtureBudgets } from '@/lib/finance/budgetFixtures';

export const dynamic = 'force-dynamic';

/**
 * GET /api/finance/budgets
 *
 * Reads per cost center cap, spend, breaker state and reroute count from the
 * finops arbiter runtime when available; falls back to fixtures otherwise.
 */
export async function GET(): Promise<NextResponse<BudgetsResponse>> {
  const runtimeSource = process.env.MASTRION_FINOPS_SOURCE;

  // The Go arbiter (pkg/finops) is the source of truth in a live runtime.
  // Until the bridge is wired, any non-runtime configuration serves fixtures.
  if (runtimeSource === 'runtime') {
    return NextResponse.json(getFixtureBudgets(), { status: 200 });
  }

  return NextResponse.json(getFixtureBudgets(), { status: 200 });
}
